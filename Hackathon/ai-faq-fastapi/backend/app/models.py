import datetime
import uuid
from sqlalchemy import Column, String, Integer, Text, Boolean, DateTime, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class BusinessUser(Base):
    __tablename__ = "business_users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    business_name = Column(String, nullable=False)
    bot_name = Column(String, default="Support Assistant")
    welcome_message = Column(String, default="Hello! How can I help you today?")
    fallback_message = Column(String, default="I am not sure about that. Would you like to leave your details for human support?")
    primary_color = Column(String, default="#6366f1")
    support_email = Column(String, default="support@example.com")
    support_phone = Column(String, default="+1 (800) 555-0199")
    enable_lead_capture = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    documents = relationship("Document", back_populates="business", cascade="all, delete-orphan")
    faqs = relationship("ManualFAQ", back_populates="business", cascade="all, delete-orphan")
    leads = relationship("CapturedLead", back_populates="business", cascade="all, delete-orphan")
    chat_sessions = relationship("ChatSession", back_populates="business", cascade="all, delete-orphan")

class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, default=generate_uuid)
    business_id = Column(String, ForeignKey("business_users.id"), nullable=False)
    original_name = Column(String, nullable=False)
    filename = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    file_size = Column(Integer, default=0)
    chunks = Column(JSON, default=list) # [{id, text, page}]
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    business = relationship("BusinessUser", back_populates="documents")

class ManualFAQ(Base):
    __tablename__ = "manual_faqs"

    id = Column(String, primary_key=True, default=generate_uuid)
    business_id = Column(String, ForeignKey("business_users.id"), nullable=False)
    question = Column(String, nullable=False)
    answer = Column(Text, nullable=False)
    category = Column(String, default="General")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    business = relationship("BusinessUser", back_populates="faqs")

class CapturedLead(Base):
    __tablename__ = "captured_leads"

    id = Column(String, primary_key=True, default=generate_uuid)
    business_id = Column(String, ForeignKey("business_users.id"), nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, default="")
    notes = Column(Text, default="")
    status = Column(String, default="New") # New, Contacted, Converted
    source = Column(String, default="Chat Widget")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    business = relationship("BusinessUser", back_populates="leads")

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(String, primary_key=True, default=generate_uuid)
    business_id = Column(String, ForeignKey("business_users.id"), nullable=False)
    visitor_id = Column(String, default=generate_uuid)
    is_unanswered = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    business = relationship("BusinessUser", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String, primary_key=True, default=generate_uuid)
    session_id = Column(String, ForeignKey("chat_sessions.id"), nullable=False)
    sender = Column(String, nullable=False) # user, bot
    text = Column(Text, nullable=False)
    is_unanswered = Column(Boolean, default=False)
    sources = Column(JSON, default=list) # [{type, name, page}]
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    session = relationship("ChatSession", back_populates="messages")
