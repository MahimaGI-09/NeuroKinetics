from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from auth_utils import hash_password, verify_password, create_access_token

router = APIRouter()


@router.post("/register", response_model=schemas.UserOut, status_code=201)
def register(payload: schemas.RegisterRequest, db: Session = Depends(get_db)):
    """Register a new patient or therapist."""
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = models.User(
        email           = payload.email,
        full_name       = payload.full_name,
        hashed_password = hash_password(payload.password),
        role            = payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=schemas.Token)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    """Login and get a JWT access token."""
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {"access_token": token}
