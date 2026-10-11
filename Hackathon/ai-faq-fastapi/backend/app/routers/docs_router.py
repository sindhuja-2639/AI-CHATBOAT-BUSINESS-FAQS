import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Document, BusinessUser
from app.auth import get_current_user
from app.config import settings
from app.rag_engine import extract_text_from_pdf, extract_text_from_txt

router = APIRouter(prefix="/api/documents", tags=["Documents"])

@router.get("")
def get_documents(user: BusinessUser = Depends(get_current_user), db: Session = Depends(get_db)):
    docs = db.query(Document).filter(Document.business_id == user.id).order_by(Document.created_at.desc()).all()
    return {
        "success": True,
        "documents": [
            {
                "_id": d.id,
                "originalName": d.original_name,
                "filename": d.filename,
                "fileType": d.file_type,
                "fileSize": d.file_size,
                "chunksCount": len(d.chunks or []),
                "createdAt": d.created_at.isoformat()
            } for d in docs
        ]
    }

@router.post("/upload")
async def upload_document(file: UploadFile = File(...), user: BusinessUser = Depends(get_current_user), db: Session = Depends(get_db)):
    filename = file.filename
    ext = os.path.splitext(filename)[1].lower()
    
    if ext not in [".pdf", ".txt", ".csv"]:
        raise HTTPException(status_code=400, detail="Only PDF, TXT, or CSV files are supported")

    unique_filename = f"{uuid.uuid4().hex}_{filename}"
    filepath = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    contents = await file.read()
    with open(filepath, "wb") as f:
        f.write(contents)

    # Extract text chunks using PyMuPDF (fitz) or TXT parser
    if ext == ".pdf":
        chunks = extract_text_from_pdf(filepath)
    else:
        chunks = extract_text_from_txt(filepath)

    doc = Document(
        business_id=user.id,
        original_name=filename,
        filename=unique_filename,
        file_type=ext.replace(".", "").upper(),
        file_size=len(contents),
        chunks=chunks
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    return {
        "success": True,
        "message": f"Document '{filename}' indexed into RAG knowledge base ({len(chunks)} chunks)",
        "document": {
            "_id": doc.id,
            "originalName": doc.original_name,
            "fileType": doc.file_type,
            "chunksCount": len(chunks)
        }
    }

@router.delete("/{doc_id}")
def delete_document(doc_id: str, user: BusinessUser = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id, Document.business_id == user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    filepath = os.path.join(settings.UPLOAD_DIR, doc.filename)
    if os.path.exists(filepath):
        try:
            os.remove(filepath)
        except Exception:
            pass

    db.delete(doc)
    db.commit()
    return {"success": True, "message": "Document removed"}
