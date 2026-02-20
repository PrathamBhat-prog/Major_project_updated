from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


# --------------------------
# 👤 USER TABLE
# --------------------------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="doctor")
    created_at = Column(DateTime, default=datetime.utcnow)

    patients = relationship("Patient", back_populates="owner")


# --------------------------
# 🧍 PATIENT TABLE
# --------------------------
class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    dob = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="patients")
    predictions = relationship("Prediction", back_populates="patient")


# --------------------------
# 🧠 PREDICTION TABLE
# --------------------------
class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))

    # Track which mode was used (ml or clinical)
    mode_used = Column(String)  # NEW

    # Model info
    model_name = Column(String)

    # Landmark coordinates
    result = Column(JSON)

    # Calculated angles
    angles = Column(JSON)

    # Classification outputs
    skeletal_class = Column(String)
    maxilla_status = Column(String)        # NEW
    mandible_status = Column(String)       # NEW
    divergence_status = Column(String)     # NEW

    # Airway measurements
    airway = Column(JSON)

    # File paths (AWS URLs)
    image_path = Column(String)
    excel_path = Column(String)
    pdf_path = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="predictions")
