from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import BusinessUser
from app.schemas import UserRegister, UserLogin, TokenResponse, UserResponse
from app.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/register", response_model=TokenResponse)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(BusinessUser).filter(BusinessUser.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    user = BusinessUser(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        business_name=payload.business_name
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"id": user.id, "email": user.email})
    return {
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "businessName": user.business_name,
            "botName": user.bot_name,
            "welcomeMessage": user.welcome_message,
            "fallbackMessage": user.fallback_message,
            "primaryColor": user.primary_color,
            "supportEmail": user.support_email,
            "supportPhone": user.support_phone,
            "enableLeadCapture": user.enable_lead_capture
        }
    }

@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(BusinessUser).filter(BusinessUser.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"id": user.id, "email": user.email})
    return {
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "businessName": user.business_name,
            "botName": user.bot_name,
            "welcomeMessage": user.welcome_message,
            "fallbackMessage": user.fallback_message,
            "primaryColor": user.primary_color,
            "supportEmail": user.support_email,
            "supportPhone": user.support_phone,
            "enableLeadCapture": user.enable_lead_capture
        }
    }

@router.get("/me")
def get_me(user: BusinessUser = Depends(get_current_user)):
    return {
        "id": user.id,
        "email": user.email,
        "businessName": user.business_name,
        "botName": user.bot_name,
        "welcomeMessage": user.welcome_message,
        "fallbackMessage": user.fallback_message,
        "primaryColor": user.primary_color,
        "supportEmail": user.support_email,
        "supportPhone": user.support_phone,
        "enableLeadCapture": user.enable_lead_capture
    }
