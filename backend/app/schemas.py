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

class UserCreate(BaseModel):
    username: str   # ← must exist
    password: str
    role: Optional[str] = "doctor"
class UserLogin(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    role: str

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