from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime


# ==================================================
# AUTH SCHEMAS
# ==================================================

class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None
    id: Optional[int] = None
    is_approved: Optional[bool] = True

class UserCreate(BaseModel):
    username: str   # ← must exist
    password: str
    role: Optional[str] = "doctor"
class UserLogin(BaseModel):
    username: str
    password: str

class PasswordResetRequest(BaseModel):
    email: str

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str


class UserOut(BaseModel):
    id: int
    username: str
    role: str
    is_approved: bool
    is_active: bool
    is_profile_complete: bool

    class Config:
        from_attributes = True


# ==================================================
# PATIENT SCHEMAS
# ==================================================

class PatientCreate(BaseModel):
    name: str
    dob: Optional[str] = None
    notes: Optional[str] = None


class PatientUpdate(BaseModel):
    name: Optional[str] = None
    dob: Optional[str] = None
    notes: Optional[str] = None


class PatientOut(BaseModel):
    id: int
    name: str
    dob: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ==================================================
# EMAIL OTP SCHEMAS
# ==================================================

class EmailOTPRequest(BaseModel):
    patient_id: int


class EmailOTPVerify(BaseModel):
    patient_id: int
    code: str


# ==================================================
# LANDMARK SCHEMA
# ==================================================

class LandmarkOut(BaseModel):
    name: str
    x: float
    y: float


# ==================================================
# ANGLES SCHEMA
# ==================================================

class AnglesOut(BaseModel):

    SNA: Optional[float] = None
    SNB: Optional[float] = None
    ANB: Optional[float] = None
    FMA: Optional[float] = None
    SN_GoGn: Optional[float] = None
    U1_SN: Optional[float] = None
    L1_MP: Optional[float] = None
    Interincisal: Optional[float] = None


# ==================================================
# AIRWAY SCHEMA
# ==================================================

class AirwayOut(BaseModel):

    upper_airway_width: Optional[float] = None
    lower_airway_width: Optional[float] = None
    airway_area: Optional[float] = None
    airway_class: Optional[str] = None


# ==================================================
# PREDICTION OUTPUT SCHEMA (FULLY MATCHES YOUR BACKEND)
# ==================================================

class PredictionOut(BaseModel):

    # Core info
    id: int
    patient_id: int

    model_name: str
    model_version: Optional[str] = "v1.0"
    mode_used: Optional[str] = None

    created_at: datetime

    # Status info
    status: str = "completed"
    processing_time: Optional[float] = None

    # Landmark info
    num_landmarks: int
    landmarks: List[LandmarkOut]

    # Clinical info
    angles: Dict[str, float]

    skeletal_class: Optional[str] = None
    maxilla_status: Optional[str] = None
    mandible_status: Optional[str] = None
    divergence_status: Optional[str] = None

    airway: Optional[Dict] = None
    airway_class: Optional[str] = None
    # File outputs
    output_image: str
    excel_file: str
    pdf_report: Optional[str] = None

    class Config:
        from_attributes = True


# ==================================================
# ML FINALIZE INPUT (Manual landmark adjustment)
# ==================================================

class ManualLandmarkInput(BaseModel):

    landmarks: List[LandmarkOut]


# ==================================================
# DOCTOR DASHBOARD SCHEMA
# ==================================================

class DoctorPredictionOut(BaseModel):

    id: int
    patient_id: int

    model_name: str
    mode_used: str

    created_at: datetime

    skeletal_class: Optional[str]

    output_image: str
    excel_file: str
    pdf_report: Optional[str]

    class Config:
        from_attributes = True


# ==================================================
# APPOINTMENT SCHEMAS
# ==================================================

class AppointmentBase(BaseModel):
    patient_name: str
    patient_email: Optional[str] = None
    patient_phone: Optional[str] = None
    appointment_date: datetime
    reason: Optional[str] = None

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentUpdate(BaseModel):
    status: Optional[str] = None
    suggested_date: Optional[datetime] = None

class AppointmentOut(AppointmentBase):
    id: int
    doctor_id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# ==================================================
# CHAT SCHEMAS
# ==================================================

class MessageCreate(BaseModel):
    recipient_id: int
    content: str

class MessageOut(BaseModel):
    id: int
    sender_id: int
    recipient_id: int
    content: str
    timestamp: datetime
    is_read: bool

    class Config:
        from_attributes = True

class ChatContactOut(UserOut):
    unread_count: int = 0
    last_message_at: Optional[datetime] = None
    last_message_content: Optional[str] = None
    full_name: Optional[str] = None