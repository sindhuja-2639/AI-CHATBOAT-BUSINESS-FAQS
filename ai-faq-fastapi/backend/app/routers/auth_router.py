from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import BusinessUser
from app.schemas import UserRegister, UserLogin, TokenResponse, UserResponse
from app.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/register", response_model=TokenResponse)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    clean_email = payload.email.strip().lower()
    clean_business = payload.business_name.strip()

    if not clean_email or "@" not in clean_email:
        raise HTTPException(status_code=400, detail="Please provide a valid email address.")

    if not clean_business:
        raise HTTPException(status_code=400, detail="Business name is required.")

    if len(payload.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")

    existing = db.query(BusinessUser).filter(func.lower(BusinessUser.email) == clean_email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email address already exists. Please log in instead.")

    user = BusinessUser(
        email=clean_email,
        hashed_password=hash_password(payload.password),
        business_name=clean_business
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"id": user.id, "email": user.email})
    return {
        "success": True,
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
    clean_email = payload.email.strip().lower()

    if not clean_email or "@" not in clean_email:
        raise HTTPException(status_code=400, detail="Please provide a valid email address.")

    user = db.query(BusinessUser).filter(func.lower(BusinessUser.email) == clean_email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password. Please check your credentials.")

    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password. Please check your credentials.")

    token = create_access_token({"id": user.id, "email": user.email})
    return {
        "success": True,
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
    user_data = {
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
    return {
        "success": True,
        "user": user_data
    }
