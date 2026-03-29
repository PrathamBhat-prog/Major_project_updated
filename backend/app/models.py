from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


# =========================================================
# 👤 USER TABLE
# =========================================================
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String, unique=True, index=True, nullable=False)

    # Optional email (REQUIRED for delete verification)
    email = Column(String, unique=True, index=True, nullable=True)

    hashed_password = Column(String, nullable=False)

    role = Column(String, default="doctor")

    created_at = Column(DateTime, default=datetime.utcnow)

    # 🔥 ACTIVE / INACTIVE
    is_active = Column(Boolean, default=True)

    # 🔥 NEW PROFILE FIELDS
    full_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    profile_image = Column(String, nullable=True)
    is_profile_complete = Column(Boolean, default=False)

    # 🔥 RESET PASSWORD FIELDS
    reset_token = Column(String, nullable=True)
    reset_token_expiry = Column(DateTime, nullable=True)

    # 🔥 ADMIN APPROVAL FLAG
    is_approved = Column(Boolean, default=True) # Default all to True, will intercept in auth for role='admin'

    # relationships
    patients = relationship(
        "Patient",
        back_populates="owner",
        cascade="all, delete"
    )

    appointments = relationship(
        "Appointment",
        back_populates="doctor",
        cascade="all, delete"
    )


# =========================================================
# 🧍 PATIENT TABLE
# =========================================================
class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)

    dob = Column(String, nullable=True)

    notes = Column(Text, nullable=True)

    # ownership (IMPORTANT)
    owner_id = Column(Integer, ForeignKey("users.id"))

    created_at = Column(DateTime, default=datetime.utcnow)

    # delete verification fields
    delete_code = Column(String, nullable=True)
    delete_code_expiry = Column(DateTime, nullable=True)
    delete_requested = Column(Boolean, default=False)

    # relationships
    owner = relationship(
        "User",
        back_populates="patients"
    )

    predictions = relationship(
        "Prediction",
        back_populates="patient",
        cascade="all, delete"
    )


# =========================================================
# 🧠 PREDICTION TABLE
# =========================================================
class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False
    )

    # Model info
    model_name = Column(String)
    model_version = Column(String, default="v1.0")

    # Mode used
    mode_used = Column(String)

    # Landmark coordinates
    result = Column(JSON)

    # Calculated angles
    angles = Column(JSON)

    # Clinical outputs
    skeletal_class = Column(String)
    maxilla_status = Column(String)
    mandible_status = Column(String)
    divergence_status = Column(String)

    # Airway measurements
    airway = Column(JSON)
    airway_class = Column(String, nullable=True)

    # File paths
    image_path = Column(String)
    excel_path = Column(String)
    pdf_path = Column(String)

    # Performance tracking
    processing_time = Column(String, nullable=True)

    # Status tracking
    status = Column(String, default="completed")

    created_at = Column(DateTime, default=datetime.utcnow)

    # relationship
    patient = relationship(
        "Patient",
        back_populates="predictions"
    )


# =========================================================
# 📅 APPOINTMENT TABLE
# =========================================================
class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)

    patient_name = Column(String, nullable=False)
    patient_email = Column(String, nullable=True)
    patient_phone = Column(String, nullable=True)

    appointment_date = Column(DateTime, nullable=False)
    reason = Column(Text, nullable=True)

    # Status: pending, confirmed, completed, cancelled
    status = Column(String, default="pending")

    doctor_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    # relationship
    doctor = relationship(
        "User",
        back_populates="appointments"
    )

# =========================================================
# 💬 CHAT MESSAGE TABLE
# =========================================================
class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    is_read = Column(Boolean, default=False)

    sender = relationship("User", foreign_keys=[sender_id])
    recipient = relationship("User", foreign_keys=[recipient_id])