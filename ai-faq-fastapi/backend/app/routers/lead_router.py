from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import CapturedLead, BusinessUser
from app.schemas import LeadCreate, LeadStatusUpdate
from app.auth import get_current_user

router = APIRouter(prefix="/api/leads", tags=["Leads"])

@router.get("")
def get_leads(user: BusinessUser = Depends(get_current_user), db: Session = Depends(get_db)):
    leads = db.query(CapturedLead).filter(CapturedLead.business_id == user.id).order_by(CapturedLead.created_at.desc()).all()
    return {
        "success": True,
        "leads": [
            {
                "_id": l.id,
                "name": l.name,
                "email": l.email,
                "phone": l.phone,
                "notes": l.notes,
                "status": l.status,
                "source": l.source,
                "createdAt": l.created_at.isoformat()
            } for l in leads
        ]
    }

@router.post("/capture")
def capture_lead(payload: LeadCreate, db: Session = Depends(get_db)):
    business = db.query(BusinessUser).filter(BusinessUser.id == payload.business_id).first()
    if not business:
        # Fallback to demo business if not found
        business = db.query(BusinessUser).first()
        if not business:
            raise HTTPException(status_code=404, detail="Business entity not found")

    lead = CapturedLead(
        business_id=business.id,
        name=payload.name,
        email=payload.email,
        phone=payload.phone or "",
        notes=payload.notes or "",
        source=payload.source or "Chat Widget",
        status="New"
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)

    return {
        "success": True,
        "message": "Lead captured successfully",
        "lead": {
            "_id": lead.id,
            "name": lead.name,
            "email": lead.email,
            "status": lead.status
        }
    }

@router.put("/{lead_id}/status")
def update_lead_status(lead_id: str, payload: LeadStatusUpdate, user: BusinessUser = Depends(get_current_user), db: Session = Depends(get_db)):
    lead = db.query(CapturedLead).filter(CapturedLead.id == lead_id, CapturedLead.business_id == user.id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    lead.status = payload.status
    db.commit()
    return {"success": True, "message": "Lead status updated"}

@router.delete("/{lead_id}")
def delete_lead(lead_id: str, user: BusinessUser = Depends(get_current_user), db: Session = Depends(get_db)):
    lead = db.query(CapturedLead).filter(CapturedLead.id == lead_id, CapturedLead.business_id == user.id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    db.delete(lead)
    db.commit()
    return {"success": True, "message": "Lead deleted"}
