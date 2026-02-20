from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from . import models, schemas, database, utils

router = APIRouter(
    prefix="/patients",
    tags=["Patients"]
)

# ======================================================
# DB Dependency
# ======================================================
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ======================================================
# CREATE PATIENT
# ======================================================
@router.post("/", response_model=schemas.PatientOut)
def create_patient(
    patient: schemas.PatientCreate,
    db: Session = Depends(get_db),
    token: dict = Depends(utils.get_current_user)
):
    new_patient = models.Patient(
        name=patient.name,
        dob=patient.dob,
        notes=patient.notes,
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
    token: dict = Depends(utils.get_current_user)
):
    return db.query(models.Patient).order_by(
        models.Patient.created_at.desc()
    ).all()


# ======================================================
# GET SINGLE PATIENT
# ======================================================
@router.get("/{patient_id}", response_model=schemas.PatientOut)
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    token: dict = Depends(utils.get_current_user)
):
    patient = db.query(models.Patient).filter(
        models.Patient.id == patient_id
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
    updated_data: schemas.PatientCreate,
    db: Session = Depends(get_db),
    token: dict = Depends(utils.get_current_user)
):
    patient = db.query(models.Patient).filter(
        models.Patient.id == patient_id
    ).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    patient.name = updated_data.name
    patient.dob = updated_data.dob
    patient.notes = updated_data.notes

    db.commit()
    db.refresh(patient)

    return patient


# ======================================================
# DELETE PATIENT
# ======================================================
@router.delete("/{patient_id}")
def delete_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    token: dict = Depends(utils.get_current_user)
):
    patient = db.query(models.Patient).filter(
        models.Patient.id == patient_id
    ).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    db.delete(patient)
    db.commit()

    return {"message": "Patient deleted successfully"}