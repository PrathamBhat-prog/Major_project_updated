from fastapi import FastAPI, Depends, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import io
import time
import os
import json
from dotenv import load_dotenv

from . import models, schemas, database, utils, auth, ml_inference
from .report_generator import generate_ceph_report
from .storage import upload_bytes
from .patients import router as patients_router
from .master_excel import append_to_master_excel

load_dotenv()

# ==================================================
# CONFIG
# ==================================================
STORAGE_MODE = os.getenv("STORAGE_MODE", "local")

# ==================================================
# INIT
# ==================================================
models.Base.metadata.create_all(bind=database.engine)
app = FastAPI(title="CephAI Backend")

# ==================================================
# STATIC FILE SERVING
# ==================================================
if STORAGE_MODE == "local":
    os.makedirs("local_storage", exist_ok=True)
    app.mount(
        "/local_storage",
        StaticFiles(directory="local_storage"),
        name="local_storage"
    )

# ==================================================
# CORS
# ==================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================================================
# DB DEPENDENCY
# ==================================================
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ==================================================
# INCLUDE ROUTERS
# ==================================================
app.include_router(auth.router)
app.include_router(patients_router)

# ==================================================
# GET CEPHALOGRAM
# ==================================================
@app.get("/cephalogram/{pred_id}")
def get_cephalogram(
    pred_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(utils.get_current_user)
):
    pred = db.query(models.Prediction).filter(
        models.Prediction.id == pred_id
    ).first()

    if not pred:
        raise HTTPException(404, "Cephalogram not found")

    return {
        "id": pred.id,
        "patient_id": pred.patient_id,
        "model_name": pred.model_name,
        "mode_used": pred.mode_used,
        "landmarks": pred.result,
        "angles": pred.angles,
        "skeletal_class": pred.skeletal_class,
        "maxilla_status": pred.maxilla_status,
        "mandible_status": pred.mandible_status,
        "divergence_status": pred.divergence_status,
        "airway": pred.airway,
        "image_url": pred.image_path,
        "excel_file": pred.excel_path,
        "pdf_report": pred.pdf_path,
        "created_at": pred.created_at
    }

# ==================================================
# ================= CLINICAL ======================
# ==================================================

# ---------------- STAGE 1 (Preview Only) ----------------
@app.post("/clinical-preview/{patient_id}")
async def clinical_preview(
    patient_id: int,
    file: UploadFile = File(...),
    user: models.User = Depends(utils.get_current_user)
):
    image_bytes = await file.read()

    return ml_inference.predict_clinical_landmarks_only(
        image_bytes=image_bytes,
        ceph_id=patient_id
    )

# ---------------- STAGE 2 (Finalize After Edit) ----------------
@app.post("/clinical-finalize/{patient_id}", response_model=schemas.PredictionOut)
async def clinical_finalize(
    patient_id: int,
    landmarks: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: models.User = Depends(utils.get_current_user)
):
    start = time.time()
    image_bytes = await file.read()

    try:
        parsed_landmarks = json.loads(landmarks)
    except:
        raise HTTPException(400, "Invalid landmarks")

    result = ml_inference.process_clinical_finalize(
        image_bytes=image_bytes,
        ceph_id=patient_id,
        edited_landmarks=parsed_landmarks
    )

    return await finalize_prediction(
        result,
        file,
        patient_id,
        db,
        start,
        user.id
    )

# ==================================================
# ================= ML ============================
# ==================================================

@app.post("/ml-predict/{patient_id}")
async def ml_predict(
    patient_id: int,
    file: UploadFile = File(...),
    user: models.User = Depends(utils.get_current_user)
):
    image_bytes = await file.read()

    return ml_inference.predict_landmarks_only(
        image_bytes=image_bytes,
        ceph_id=patient_id
    )

@app.post("/ml-finalize/{patient_id}", response_model=schemas.PredictionOut)
async def ml_finalize(
    patient_id: int,
    landmarks: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: models.User = Depends(utils.get_current_user)
):
    start = time.time()
    image_bytes = await file.read()

    try:
        parsed_landmarks = json.loads(landmarks)
    except:
        raise HTTPException(400, "Invalid landmarks")

    result = ml_inference.process_ml_finalize(
        image_bytes=image_bytes,
        ceph_id=patient_id,
        landmarks=parsed_landmarks
    )

    return await finalize_prediction(
        result,
        file,
        patient_id,
        db,
        start,
        user.id
    )

# ==================================================
# FINALIZE FUNCTION (UNCHANGED)
# ==================================================
async def finalize_prediction(
    result,
    file,
    patient_id,
    db,
    start,
    doctor_id
):
    if not result:
        raise HTTPException(500, "ML result is None")

    try:
        with open(result["output_image"], "rb") as f:
            image_url = upload_bytes(
                f.read(),
                folder="images",
                ext="jpg",
                content_type="image/jpeg",
                original_name=file.filename
            )

        with open(result["excel_file"], "rb") as f:
            excel_url = upload_bytes(
                f.read(),
                folder="excels",
                ext="xlsx",
                content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                original_name=file.filename
            )

        pdf_buffer = io.BytesIO()

        generate_ceph_report(
            patient_id,
            result["angles"],
            result["skeletal_class"],
            result["output_image"],
            pdf_buffer,
            result.get("maxilla_status"),
            result.get("mandible_status"),
            result.get("divergence_status"),
            result.get("airway")
        )

        pdf_buffer.seek(0)

        pdf_url = upload_bytes(
            pdf_buffer.getvalue(),
            folder="reports",
            ext="pdf",
            content_type="application/pdf",
            original_name=file.filename
        )

        append_to_master_excel(file.filename, result)

        prediction_data = dict(
            patient_id=patient_id,
            mode_used=result["mode_used"],
            model_name=f"ceph_model_{result['mode_used']}",
            result=result["landmarks"],
            angles=result["angles"],
            skeletal_class=result["skeletal_class"],
            maxilla_status=result.get("maxilla_status"),
            mandible_status=result.get("mandible_status"),
            divergence_status=result.get("divergence_status"),
            airway=result["airway"],
            image_path=image_url,
            excel_path=excel_url,
            pdf_path=pdf_url
        )

        if hasattr(models.Prediction, "doctor_id"):
            prediction_data["doctor_id"] = doctor_id

        pred = models.Prediction(**prediction_data)

        db.add(pred)
        db.commit()
        db.refresh(pred)

        return {
            "id": pred.id,
            "patient_id": patient_id,
            "model_name": pred.model_name,
            "mode_used": pred.mode_used,
            "created_at": pred.created_at,
            "status": "completed",
            "processing_time": round(time.time() - start, 3),
            "num_landmarks": len(result["landmarks"]),
            "landmarks": result["landmarks"],
            "angles": result["angles"],
            "skeletal_class": result["skeletal_class"],
            "maxilla_status": result.get("maxilla_status"),
            "mandible_status": result.get("mandible_status"),
            "divergence_status": result.get("divergence_status"),
            "airway": result["airway"],
            "output_image": image_url,
            "excel_file": excel_url,
            "pdf_report": pdf_url
        }

    except Exception as e:
        print("Finalize prediction error:", str(e))
        raise HTTPException(500, "Prediction processing failed")

# ==================================================
# DOCTOR DASHBOARD
# ==================================================
@app.get("/doctor/predictions")
def doctor_predictions(
    db: Session = Depends(get_db),
    user: models.User = Depends(utils.get_current_user)
):
    predictions = (
        db.query(models.Prediction)
        .join(models.Patient)
        .filter(models.Patient.owner_id == user.id)
        .order_by(models.Prediction.created_at.desc())
        .all()
    )

    return predictions