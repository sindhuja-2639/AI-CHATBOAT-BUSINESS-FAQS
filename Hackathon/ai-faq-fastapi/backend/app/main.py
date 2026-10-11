from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.models import BusinessUser, ManualFAQ
from app.auth import hash_password
from app.routers import auth_router, docs_router, faq_router, chat_router, lead_router, analytics_router, settings_router

# Auto-create SQLite database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-Powered Business FAQ Chatbot with Lead Capture & RAG Vector Search",
    version="1.0.0"
)

# CORS Middleware Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router Registrations
app.include_router(auth_router.router)
app.include_router(docs_router.router)
app.include_router(faq_router.router)
app.include_router(chat_router.router)
app.include_router(lead_router.router)
app.include_router(analytics_router.router)
app.include_router(settings_router.router)

@app.on_event("startup")
def seed_demo_data():
    """Seed initial demo business user and FAQs if database is empty"""
    db = SessionLocal()
    try:
        demo_user = db.query(BusinessUser).filter(BusinessUser.email == "admin@business.com").first()
        if not demo_user:
            demo_user = BusinessUser(
                id="demo-user-id-101",
                email="admin@business.com",
                hashed_password=hash_password("password123"),
                business_name="Apex Innovations",
                bot_name="Apex Assistant",
                welcome_message="Hello! Welcome to Apex Innovations. How can I assist you today?",
                fallback_message="I am not sure about that. Would you like to connect with our support team?"
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)

            # Add initial demo FAQs
            sample_faqs = [
                ManualFAQ(
                    business_id=demo_user.id,
                    question="What are your business operating hours?",
                    answer="Our support team is available Monday through Friday from 9:00 AM to 6:00 PM EST.",
                    category="General"
                ),
                ManualFAQ(
                    business_id=demo_user.id,
                    question="Do you offer custom enterprise pricing?",
                    answer="Yes, we offer tailored enterprise plans with custom RAG integrations, dedicated support, and SLA guarantees.",
                    category="Pricing"
                )
            ]
            db.add_all(sample_faqs)
            db.commit()
    finally:
        db.close()

@app.get("/")
def root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "FastAPI AI FAQ Server is healthy and running"}
