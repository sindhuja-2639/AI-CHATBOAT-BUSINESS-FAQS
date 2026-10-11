from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import BusinessUser
from app.schemas import SettingsUpdate
from app.auth import get_current_user

router = APIRouter(prefix="/api/settings", tags=["Settings"])

@router.get("")
def get_settings(user: BusinessUser = Depends(get_current_user)):
    return {
        "success": True,
        "settings": {
            "botName": user.bot_name,
            "welcomeMessage": user.welcome_message,
            "fallbackMessage": user.fallback_message,
            "primaryColor": user.primary_color,
            "supportEmail": user.support_email,
            "supportPhone": user.support_phone,
            "enableLeadCapturePrompt": user.enable_lead_capture
        }
    }

@router.put("")
def update_settings(payload: SettingsUpdate, user: BusinessUser = Depends(get_current_user), db: Session = Depends(get_db)):
    if payload.bot_name is not None:
        user.bot_name = payload.bot_name
    if payload.welcome_message is not None:
        user.welcome_message = payload.welcome_message
    if payload.fallback_message is not None:
        user.fallback_message = payload.fallback_message
    if payload.primary_color is not None:
        user.primary_color = payload.primary_color
    if payload.support_email is not None:
        user.support_email = payload.support_email
    if payload.support_phone is not None:
        user.support_phone = payload.support_phone
    if payload.enable_lead_capture is not None:
        user.enable_lead_capture = payload.enable_lead_capture

    db.commit()
    db.refresh(user)

    return {
        "success": True,
        "message": "Settings saved successfully",
        "settings": {
            "botName": user.bot_name,
            "welcomeMessage": user.welcome_message,
            "fallbackMessage": user.fallback_message,
            "primaryColor": user.primary_color,
            "supportEmail": user.support_email,
            "supportPhone": user.support_phone,
            "enableLeadCapturePrompt": user.enable_lead_capture
        }
    }
