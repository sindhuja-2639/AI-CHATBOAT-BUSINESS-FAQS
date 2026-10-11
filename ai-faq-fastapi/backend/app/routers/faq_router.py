from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import ManualFAQ, BusinessUser
from app.schemas import FAQCreate, FAQUpdate
from app.auth import get_current_user

router = APIRouter(prefix="/api/faqs", tags=["FAQs"])

@router.get("")
def get_faqs(user: BusinessUser = Depends(get_current_user), db: Session = Depends(get_db)):
    faqs = db.query(ManualFAQ).filter(ManualFAQ.business_id == user.id).order_by(ManualFAQ.created_at.desc()).all()
    return {
        "success": True,
        "faqs": [
            {
                "_id": f.id,
                "question": f.question,
                "answer": f.answer,
                "category": f.category,
                "createdAt": f.created_at.isoformat()
            } for f in faqs
        ]
    }

@router.post("")
def create_faq(payload: FAQCreate, user: BusinessUser = Depends(get_current_user), db: Session = Depends(get_db)):
    faq = ManualFAQ(
        business_id=user.id,
        question=payload.question,
        answer=payload.answer,
        category=payload.category or "General"
    )
    db.add(faq)
    db.commit()
    db.refresh(faq)
    return {
        "success": True,
        "faq": {
            "_id": faq.id,
            "question": faq.question,
            "answer": faq.answer,
            "category": faq.category,
            "createdAt": faq.created_at.isoformat()
        }
    }

@router.put("/{faq_id}")
def update_faq(faq_id: str, payload: FAQUpdate, user: BusinessUser = Depends(get_current_user), db: Session = Depends(get_db)):
    faq = db.query(ManualFAQ).filter(ManualFAQ.id == faq_id, ManualFAQ.business_id == user.id).first()
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found")

    if payload.question is not None:
        faq.question = payload.question
    if payload.answer is not None:
        faq.answer = payload.answer
    if payload.category is not None:
        faq.category = payload.category

    db.commit()
    db.refresh(faq)
    return {
        "success": True,
        "faq": {
            "_id": faq.id,
            "question": faq.question,
            "answer": faq.answer,
            "category": faq.category,
            "createdAt": faq.created_at.isoformat()
        }
    }

@router.delete("/{faq_id}")
def delete_faq(faq_id: str, user: BusinessUser = Depends(get_current_user), db: Session = Depends(get_db)):
    faq = db.query(ManualFAQ).filter(ManualFAQ.id == faq_id, ManualFAQ.business_id == user.id).first()
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found")

    db.delete(faq)
    db.commit()
    return {"success": True, "message": "FAQ deleted"}
