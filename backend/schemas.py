from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, List
from datetime import datetime
from models import Role


# ── Auth ──────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    email:     EmailStr
    full_name: str
    password:  str
    role:      Role = Role.patient

class LoginRequest(BaseModel):
    email:    EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type:   str = "bearer"


# ── User ──────────────────────────────────────────────────────────
class UserOut(BaseModel):
    id:               int
    email:            str
    full_name:        str
    role:             Role
    xp_total:         int
    level:            int
    streak_days:      int
    therapist_id:     Optional[int]
    created_at:       datetime

    class Config:
        from_attributes = True

class AssignTherapistRequest(BaseModel):
    patient_id:   int
    therapist_id: int


# ── Sessions ──────────────────────────────────────────────────────
class SessionCreate(BaseModel):
    level:         int
    exercise_name: str
    duration_secs: int
    score_pct:     float              # 0–100
    finger_angles: Optional[Dict[str, List[float]]] = None
    heart_rate:    Optional[float]    = None
    spo2:          Optional[float]    = None

class TherapistNote(BaseModel):
    note: str

class SessionOut(BaseModel):
    id:             int
    patient_id:     int
    level:          int
    exercise_name:  str
    duration_secs:  int
    score_pct:      float
    xp_earned:      int
    finger_angles:  Optional[Dict[str, List[float]]]
    heart_rate:     Optional[float]
    spo2:           Optional[float]
    therapist_note: Optional[str]
    created_at:     datetime

    class Config:
        from_attributes = True
