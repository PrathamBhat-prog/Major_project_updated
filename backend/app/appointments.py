from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from . import models, schemas
from .database import get_db
from .utils import get_current_user

router = APIRouter(
    prefix="/appointments",
    tags=["Appointments"]
)

# ======================================================
# PUBLIC: REGISTER APPOINTMENT
# ======================================================
@router.post("/register/{doctor_id}", response_model=schemas.AppointmentOut)
def register_appointment(
    doctor_id: int,
    appointment: schemas.AppointmentCreate,
    db: Session = Depends(get_db)
):
    # Verify doctor exists
    doctor = db.query(models.User).filter(
        models.User.id == doctor_id, 
        models.User.role == "doctor"
    ).first()
    
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found"
        )

    new_appointment = models.Appointment(
        patient_name=appointment.patient_name,
        patient_email=appointment.patient_email,
        patient_phone=appointment.patient_phone,
        appointment_date=appointment.appointment_date,
        reason=appointment.reason,
        doctor_id=doctor_id,
        status="pending"
    )

    db.add(new_appointment)
    db.commit()
    db.refresh(new_appointment)

    # 📧 SEND CONFIRMATION EMAIL
    try:
        from .email_service import send_appointment_confirmation
        send_appointment_confirmation(
            new_appointment.patient_email, 
            new_appointment.patient_name, 
            new_appointment.appointment_date
        )
    except Exception as e:
        print(f"Failed to send confirmation email: {e}")

    return new_appointment


# ======================================================
# DOCTOR: GET ALL APPOINTMENTS
# ======================================================
@router.get("/", response_model=List[schemas.AppointmentOut])
def get_doctor_appointments(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Only doctors can see their appointments
    if current_user.role not in ["doctor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )

    query = db.query(models.Appointment)
    
    if current_user.role == "doctor":
        query = query.filter(models.Appointment.doctor_id == current_user.id)
    
    return query.order_by(models.Appointment.appointment_date.asc()).all()


# ======================================================
# DOCTOR: UPDATE APPOINTMENT STATUS
# ======================================================
@router.patch("/{appointment_id}", response_model=schemas.AppointmentOut)
def update_appointment_status(
    appointment_id: int,
    update: schemas.AppointmentUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    appointment = db.query(models.Appointment).filter(
        models.Appointment.id == appointment_id
    ).first()

    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )

    # Check ownership
    if current_user.role != "admin" and appointment.doctor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )

    if update.status:
        # validate status
        if update.status not in ["pending", "confirmed", "completed", "cancelled"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid status"
            )
        appointment.status = update.status

    # 📧 SEND STATUS UPDATE EMAIL
    try:
        from .email_service import send_appointment_status_update
        send_appointment_status_update(
            appointment.patient_email,
            appointment.patient_name,
            update.status or appointment.status,
            update.suggested_date
        )
    except Exception as e:
        print(f"Failed to send status update email: {e}")

    db.commit()
    db.refresh(appointment)

    return appointment
