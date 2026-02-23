from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
import random

from . import models, schemas
from .database import get_db
from .utils import get_current_user
from .email_service import send_email_otp

router = APIRouter(
    prefix="/patients",
    tags=["Patients"]
)

# ======================================================
# CREATE PATIENT
# ======================================================
@router.post("/", response_model=schemas.PatientOut)
def create_patient(
    patient: schemas.PatientCreate,
    db: Session = Depends(get_db),
    token: models.User = Depends(get_current_user)
):
    new_patient = models.Patient(
        name=patient.name,
        dob=patient.dob,
        notes=patient.notes,
        owner_id=token.id,
        created_at=datetime.utcnow()
    )

    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)

    return new_patient


# ======================================================
# GET ALL PATIENTS
# ======================================================
@router.get("/", response_model=List[schemas.PatientOut])
def get_all_patients(
    db: Session = Depends(get_db),
    token: models.User = Depends(get_current_user)
):
    return db.query(models.Patient).filter(
        models.Patient.owner_id == token.id
    ).order_by(
        models.Patient.created_at.desc()
    ).all()


# ======================================================
# GET SINGLE PATIENT
# ======================================================
@router.get("/{patient_id}", response_model=schemas.PatientOut)
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    token: models.User = Depends(get_current_user)
):
    patient = db.query(models.Patient).filter(
        models.Patient.id == patient_id,
        models.Patient.owner_id == token.id
    ).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    return patient


# ======================================================
# UPDATE PATIENT
# ======================================================
@router.put("/{patient_id}", response_model=schemas.PatientOut)
def update_patient(
    patient_id: int,
    updated_data: schemas.PatientUpdate,
    db: Session = Depends(get_db),
    token: models.User = Depends(get_current_user)
):
    patient = db.query(models.Patient).filter(
        models.Patient.id == patient_id,
        models.Patient.owner_id == token.id
    ).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    if updated_data.name is not None:
        patient.name = updated_data.name

    if updated_data.dob is not None:
        patient.dob = updated_data.dob

    if updated_data.notes is not None:
        patient.notes = updated_data.notes

    db.commit()
    db.refresh(patient)

    return patient


# ======================================================
# SEND DELETE OTP (FINAL FIXED VERSION)
# ======================================================
@router.post("/{patient_id}/send-delete-code")
def send_delete_code(
    patient_id: int,
    db: Session = Depends(get_db),
    token: models.User = Depends(get_current_user)
):
    patient = db.query(models.Patient).filter(
        models.Patient.id == patient_id,
        models.Patient.owner_id == token.id
    ).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Generate OTP
    code = str(random.randint(100000, 999999))

    patient.delete_code = code
    patient.delete_code_expiry = datetime.utcnow() + timedelta(minutes=10)
    patient.delete_requested = True

    db.commit()

    # Username is email
    send_email_otp(token.username, code)

    return {"message": "Verification code sent to your email"}


# ======================================================
# VERIFY & DELETE PATIENT
# ======================================================
@router.delete("/{patient_id}")
def delete_patient(
    patient_id: int,
    code: str,
    db: Session = Depends(get_db),
    token: models.User = Depends(get_current_user)
):
    patient = db.query(models.Patient).filter(
        models.Patient.id == patient_id,
        models.Patient.owner_id == token.id
    ).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    if not patient.delete_requested:
        raise HTTPException(status_code=400, detail="Delete not requested")

    if patient.delete_code != code:
        raise HTTPException(status_code=400, detail="Invalid verification code")

    if datetime.utcnow() > patient.delete_code_expiry:
        raise HTTPException(status_code=400, detail="Verification code expired")

    db.delete(patient)
    db.commit()

    return {"message": "Patient deleted successfully"}