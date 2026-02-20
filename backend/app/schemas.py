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


class UserCreate(BaseModel):
    username: str
    password: str
    role: Optional[str] = "doctor"


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


class PatientOut(BaseModel):
    id: int
    name: str
    dob: Optional[str]
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ==================================================
# LANDMARK SCHEMA
# ==================================================
class LandmarkOut(BaseModel):
    name: str
    x: float
    y: float


# ==================================================
# PREDICTION SCHEMA (UPDATED)
# ==================================================
class PredictionOut(BaseModel):
    id: int
    patient_id: int

    model_name: str
    model_version: Optional[str] = "v1.0"
    mode_used: Optional[str] = None

    created_at: datetime
    status: str = "completed"
    processing_time: Optional[float] = None

    num_landmarks: int

    # Core outputs
    landmarks: List[LandmarkOut]
    angles: Dict[str, float]

    skeletal_class: Optional[str] = None
    maxilla_status: Optional[str] = None
    mandible_status: Optional[str] = None
    divergence_status: Optional[str] = None

    airway: Optional[Dict] = None

    # Files
    output_image: str
    excel_file: str
    pdf_report: Optional[str] = None

    class Config:
        from_attributes = True
# ==================================================
# ML MANUAL LANDMARK INPUT
# ==================================================
class ManualLandmarkInput(BaseModel):
    landmarks: List[LandmarkOut]