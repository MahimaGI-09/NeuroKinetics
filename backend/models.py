from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class Role(str, enum.Enum):
    patient   = "patient"
    therapist = "therapist"

class User(Base):
    __tablename__ = "users"

    id             = Column(Integer, primary_key=True, index=True)
    email          = Column(String, unique=True, index=True, nullable=False)
    full_name      = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role           = Column(Enum(Role), default=Role.patient, nullable=False)
    is_active      = Column(Boolean, default=True)
    created_at     = Column(DateTime(timezone=True), server_default=func.now())

    # Gamification
    xp_total       = Column(Integer, default=0)
    level          = Column(Integer, default=1)
    streak_days    = Column(Integer, default=0)
    last_session_date = Column(String, nullable=True)  # stored as ISO date string

    # If therapist: list of patients; if patient: assigned therapist
    therapist_id   = Column(Integer, ForeignKey("users.id"), nullable=True)

    sessions       = relationship("ExerciseSession", back_populates="patient", foreign_keys="ExerciseSession.patient_id")
    patients       = relationship("User", foreign_keys=[therapist_id])

    def __repr__(self):
        return f"<User {self.email} ({self.role})>"


class ExerciseSession(Base):
    __tablename__ = "exercise_sessions"

    id              = Column(Integer, primary_key=True, index=True)
    patient_id      = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())

    # Exercise info
    level           = Column(Integer, nullable=False)           # 1–4
    exercise_name   = Column(String, nullable=False)
    duration_secs   = Column(Integer, nullable=False)
    score_pct       = Column(Float, nullable=False)             # 0–100

    # XP awarded this session
    xp_earned       = Column(Integer, default=0)

    # Sensor readings — stored as JSON arrays
    # e.g. {"thumb": [45,46,48,...], "index": [...], ...}
    finger_angles   = Column(JSON, nullable=True)

    # Vitals snapshot at end of session
    heart_rate      = Column(Float, nullable=True)
    spo2            = Column(Float, nullable=True)

    # Therapist note (optional)
    therapist_note  = Column(String, nullable=True)

    patient         = relationship("User", back_populates="sessions", foreign_keys=[patient_id])
