import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import BusinessUser, Document, ManualFAQ, ChatSession, ChatMessage
from app.schemas import ChatQueryRequest, ChatQueryResponse
from app.rag_engine import RAGEngine
from app.ai_service import generate_ai_answer

router = APIRouter(prefix="/api/chat", tags=["Chat"])

@router.post("/ask", response_model=ChatQueryResponse)
def ask_question(payload: ChatQueryRequest, db: Session = Depends(get_db)):
    # 1. Resolve Business Entity
    business = db.query(BusinessUser).filter(BusinessUser.id == payload.business_id).first()
    if not business:
        # Fallback to first business user if demo id
        business = db.query(BusinessUser).first()
        if not business:
            raise HTTPException(status_code=404, detail="Business not found")

    # 2. Retrieve or create ChatSession
    session_id = payload.session_id
    session = None
    if session_id:
        session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    
    if not session:
        session = ChatSession(business_id=business.id)
        db.add(session)
        db.commit()
        db.refresh(session)

    # 3. Store User Message
    user_msg = ChatMessage(
        session_id=session.id,
        sender="user",
        text=payload.message
    )
    db.add(user_msg)
    db.commit()

    # 4. Fetch Manual FAQs & Document Chunks for RAG Vector Search
    docs = db.query(Document).filter(Document.business_id == business.id).all()
    all_chunks = []
    for d in docs:
        for chunk in (d.chunks or []):
            all_chunks.append({
                "chunk": chunk,
                "doc_name": d.original_name,
                "file_type": d.file_type
            })

    faqs = db.query(ManualFAQ).filter(ManualFAQ.business_id == business.id).all()
    faq_dicts = [{"question": f.question, "answer": f.answer, "category": f.category} for f in faqs]

    # Perform TF-IDF / Semantic similarity search over chunks
    retrieved_results = RAGEngine.search_similar_chunks(
        query=payload.message,
        chunks=[item["chunk"] for item in all_chunks],
        top_k=3
    )
    
    # Map retrieved chunks back to doc metadata
    retrieved_matches = []
    for r in retrieved_results:
        matched_chunk = r["chunk"]
        # find matching doc
        for item in all_chunks:
            if item["chunk"].get("id") == matched_chunk.get("id"):
                retrieved_matches.append({
                    "chunk": matched_chunk,
                    "doc_name": item["doc_name"],
                    "score": r["score"]
                })
                break

    # 5. Synthesize AI Grounded Answer
    bot_config = {
        "bot_name": business.bot_name,
        "welcome_message": business.welcome_message,
        "fallback_message": business.fallback_message
    }

    answer, is_unanswered, sources = generate_ai_answer(
        question=payload.message,
        retrieved_chunks=retrieved_matches,
        manual_faqs=faq_dicts,
        bot_config=bot_config
    )

    # 6. Store Bot Message
    if is_unanswered:
        session.is_unanswered = True
        db.commit()

    bot_msg = ChatMessage(
        session_id=session.id,
        sender="bot",
        text=answer,
        is_unanswered=is_unanswered,
        sources=sources
    )
    db.add(bot_msg)
    db.commit()

    return {
        "answer": answer,
        "is_unanswered": is_unanswered,
        "session_id": session.id,
        "sources": sources
    }

@router.get("/config/{business_id}")
def get_bot_config(business_id: str, db: Session = Depends(get_db)):
    business = db.query(BusinessUser).filter(BusinessUser.id == business_id).first()
    if not business:
        business = db.query(BusinessUser).first()
        if not business:
            return {
                "success": True,
                "settings": {
                    "botName": "Support Assistant",
                    "welcomeMessage": "Hello! How can I help you today?",
                    "fallbackMessage": "I am not sure about that. Would you like to leave your details for human support?",
                    "primaryColor": "#6366f1"
                }
            }

    return {
        "success": True,
        "settings": {
            "botName": business.bot_name,
            "welcomeMessage": business.welcome_message,
            "fallbackMessage": business.fallback_message,
            "primaryColor": business.primary_color,
            "supportEmail": business.support_email,
            "supportPhone": business.support_phone,
            "enableLeadCapture": business.enable_lead_capture
        }
    }
