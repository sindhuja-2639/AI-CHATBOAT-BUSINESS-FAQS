from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import BusinessUser, Document, ManualFAQ, CapturedLead, ChatSession, ChatMessage
from app.auth import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/overview")
def get_analytics_overview(user: BusinessUser = Depends(get_current_user), db: Session = Depends(get_db)):
    total_conversations = db.query(ChatSession).filter(ChatSession.business_id == user.id).count()
    unanswered_queries = db.query(ChatMessage).join(ChatSession).filter(
        ChatSession.business_id == user.id,
        ChatMessage.is_unanswered == True
    ).count()

    total_leads = db.query(CapturedLead).filter(CapturedLead.business_id == user.id).count()
    converted_leads = db.query(CapturedLead).filter(
        CapturedLead.business_id == user.id,
        CapturedLead.status == "Converted"
    ).count()

    conversion_rate = round((converted_leads / total_leads * 100), 1) if total_leads > 0 else 0.0

    manual_faqs_count = db.query(ManualFAQ).filter(ManualFAQ.business_id == user.id).count()
    docs_count = db.query(Document).filter(Document.business_id == user.id).count()

    # Recent Sessions
    recent_sessions = db.query(ChatSession).filter(ChatSession.business_id == user.id).order_by(ChatSession.created_at.desc()).limit(10).all()
    sessions_data = []
    for s in recent_sessions:
        msg_count = len(s.messages or [])
        last_msg = s.messages[-1].text if s.messages else "No messages"
        sessions_data.append({
            "_id": s.id,
            "visitorId": s.visitor_id,
            "messageCount": msg_count,
            "lastMessage": last_msg,
            "isUnanswered": s.is_unanswered,
            "createdAt": s.created_at.isoformat()
        })

    return {
        "success": True,
        "metrics": {
            "totalConversations": total_conversations,
            "unansweredQueries": unanswered_queries,
            "capturedLeads": total_leads,
            "conversionRate": conversion_rate,
            "knowledgeCoverage": {
                "manualFaqs": manual_faqs_count,
                "indexedDocuments": docs_count
            },
            "leadPipeline": {
                "new": db.query(CapturedLead).filter(CapturedLead.business_id == user.id, CapturedLead.status == "New").count(),
                "contacted": db.query(CapturedLead).filter(CapturedLead.business_id == user.id, CapturedLead.status == "Contacted").count(),
                "converted": converted_leads
            },
            "recentSessions": sessions_data
        }
    }
