from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas
from auth_utils import get_current_user, require_therapist

router = APIRouter()


@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(get_current_user)):
    """Get the logged-in user's profile."""
    return current_user


@router.get("/patients", response_model=List[schemas.UserOut])
def list_my_patients(
    db:           Session      = Depends(get_db),
    current_user: models.User  = Depends(require_therapist),
):
    """Therapist: get all patients assigned to you."""
    return db.query(models.User).filter(
        models.User.therapist_id == current_user.id
    ).all()


@router.get("/all-patients", response_model=List[schemas.UserOut])
def list_all_patients(
    db:           Session      = Depends(get_db),
    _:            models.User  = Depends(require_therapist),
):
    """Therapist: get all patients (unassigned included)."""
    return db.query(models.User).filter(
        models.User.role == models.Role.patient
    ).all()


@router.post("/assign-therapist", response_model=schemas.UserOut)
def assign_therapist(
    payload:      schemas.AssignTherapistRequest,
    db:           Session     = Depends(get_db),
    _:            models.User = Depends(require_therapist),
):
    """Therapist: assign yourself (or another therapist) to a patient."""
    patient = db.query(models.User).filter(
        models.User.id == payload.patient_id,
        models.User.role == models.Role.patient,
    ).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    therapist = db.query(models.User).filter(
        models.User.id == payload.therapist_id,
        models.User.role == models.Role.therapist,
    ).first()
    if not therapist:
        raise HTTPException(status_code=404, detail="Therapist not found")

    patient.therapist_id = payload.therapist_id
    db.commit()
    db.refresh(patient)
    return patient


@router.get("/{user_id}", response_model=schemas.UserOut)
def get_user(
    user_id:      int,
    db:           Session     = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get any user's profile (patients can only view their own)."""
    if current_user.role == models.Role.patient and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
