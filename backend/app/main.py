from fastapi import FastAPI, Depends, File, UploadFile, HTTPException, Query, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List
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
    token: dict = Depends(utils.get_current_user)
):
    pred = db.query(models.Prediction).filter(
        models.Prediction.id == pred_id
    ).first()

    if not pred:
        raise HTTPException(status_code=404, detail="Cephalogram not found")

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
# CLINICAL FULL PIPELINE
# ==================================================
@app.post("/predict/{patient_id}", response_model=schemas.PredictionOut)
async def predict_clinical(
    patient_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    token: dict = Depends(utils.get_current_user)
):
    start = time.time()
    image_bytes = await file.read()

    result = ml_inference.process_clinical(
        image_bytes=image_bytes,
        ceph_id=patient_id
    )

    return await finalize_prediction(
        result=result,
        file=file,
        patient_id=patient_id,
        db=db,
        start=start
    )

# ==================================================
# ML STAGE 1 – LANDMARK PREVIEW
# ==================================================
@app.post("/ml-predict/{patient_id}")
async def ml_predict_landmarks(
    patient_id: int,
    file: UploadFile = File(...),
    token: dict = Depends(utils.get_current_user)
):
    image_bytes = await file.read()

    return ml_inference.predict_landmarks_only(
        image_bytes=image_bytes,
        ceph_id=patient_id
    )

# ==================================================
# ML STAGE 2 – FINALIZE AFTER MANUAL ADJUST
# ==================================================
@app.post("/ml-finalize/{patient_id}", response_model=schemas.PredictionOut)
async def ml_finalize(
    patient_id: int,
    landmarks: str = Form(...),   # 🔥 FIXED HERE
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    token: dict = Depends(utils.get_current_user)
):
    start = time.time()

    image_bytes = await file.read()

    # Parse landmarks JSON string
    try:
        parsed_landmarks = json.loads(landmarks)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid landmarks format")

    result = ml_inference.process_ml_finalize(
        image_bytes=image_bytes,
        ceph_id=patient_id,
        landmarks=parsed_landmarks
    )

    return await finalize_prediction(
        result=result,
        file=file,
        patient_id=patient_id,
        db=db,
        start=start
    )

# ==================================================
# COMMON FINALIZATION LOGIC
# ==================================================
async def finalize_prediction(result, file, patient_id, db, start):

    # ===============================
    # SAVE IMAGE
    # ===============================
    with open(result["output_image"], "rb") as f:
        image_url = upload_bytes(
            f.read(),
            folder="images",
            ext="jpg",
            content_type="image/jpeg",
            original_name=file.filename
        )

    # ===============================
    # SAVE EXCEL
    # ===============================
    with open(result["excel_file"], "rb") as f:
        excel_url = upload_bytes(
            f.read(),
            folder="excels",
            ext="xlsx",
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            original_name=file.filename
        )

    # ===============================
    # GENERATE PDF
    # ===============================
    pdf_buffer = io.BytesIO()

    generate_ceph_report(
        patient_id=patient_id,
        angles=result["angles"],
        skeletal_class=result["skeletal_class"],
        image_path=result["output_image"],
        save_path=pdf_buffer,
        maxilla_status=result.get("maxilla_status"),
        mandible_status=result.get("mandible_status"),
        divergence_status=result.get("divergence_status"),
        airway=result.get("airway")
    )

    pdf_buffer.seek(0)

    pdf_url = upload_bytes(
        pdf_buffer.getvalue(),
        folder="reports",
        ext="pdf",
        content_type="application/pdf",
        original_name=file.filename
    )

    # ===============================
    # UPDATE MASTER EXCEL
    # ===============================
    append_to_master_excel(
        filename=file.filename,
        result=result
    )

    # ===============================
    # SAVE TO DATABASE
    # ===============================
    pred = models.Prediction(
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