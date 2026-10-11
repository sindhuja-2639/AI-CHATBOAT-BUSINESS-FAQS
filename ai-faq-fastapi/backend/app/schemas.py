from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime

# Auth Schemas
class UserRegister(BaseModel):
    email: str
    password: str
    business_name: str

class UserLogin(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    token: str
    user: dict

class UserResponse(BaseModel):
    id: str
    email: str
    business_name: str
    bot_name: str
    welcome_message: str
    fallback_message: str
    primary_color: str
    support_email: str
    support_phone: str
    enable_lead_capture: bool

# FAQ Schemas
class FAQCreate(BaseModel):
    question: str
    answer: str
    category: Optional[str] = "General"

class FAQUpdate(BaseModel):
    question: Optional[str] = None
    answer: Optional[str] = None
    category: Optional[str] = None

class FAQResponse(BaseModel):
    id: str
    business_id: str
    question: str
    answer: str
    category: str
    created_at: datetime

# Lead Schemas
class LeadCreate(BaseModel):
    business_id: str
    name: str
    email: str
    phone: Optional[str] = ""
    notes: Optional[str] = ""
    source: Optional[str] = "Chat Widget"

class LeadStatusUpdate(BaseModel):
    status: str

class LeadResponse(BaseModel):
    id: str
    business_id: str
    name: str
    email: str
    phone: str
    notes: str
    status: str
    source: str
    created_at: datetime

# Settings Schema
class SettingsUpdate(BaseModel):
    bot_name: Optional[str] = None
    welcome_message: Optional[str] = None
    fallback_message: Optional[str] = None
    primary_color: Optional[str] = None
    support_email: Optional[str] = None
    support_phone: Optional[str] = None
    enable_lead_capture: Optional[bool] = None

# Chat Schemas
class ChatQueryRequest(BaseModel):
    business_id: str
    message: str
    session_id: Optional[str] = None

class ChatQueryResponse(BaseModel):
    answer: str
    is_unanswered: bool
    session_id: str
    sources: List[dict] = []
