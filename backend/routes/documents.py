from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks, HTTPException
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from models.user import User
from models.document import Document
from schemas.document import DocumentResponse
from services.auth_service import get_current_user
from services.rag_service import background_indexer, generate_saas_summary
import os
import shutil
import logging
import anyio
from typing import List, Optional

logger = logging.getLogger("Cognivault.Documents")
router = APIRouter(tags=["Documents"])
UPLOAD_DIR = "uploads"

# --- CORE ASYNC DOCUMENT MANAGEMENT ---

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...), 
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """SaaS Safe PDF Upload: Multi-tenant isolated (v2.3.0-ENT)."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Requirement Error: Only PDF files are supported.")
        
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)
        
    # Multi-tenant Isolation: Prefix filename with user_id
    file_path = os.path.join(UPLOAD_DIR, f"u{current_user.id}_{file.filename}")
    
    # Security: Path-traversal protection (Requirement 3)
    abs_path = os.path.abspath(file_path)
    if not abs_path.startswith(os.path.abspath(UPLOAD_DIR)):
        logger.warning(f"Security Alert: Illegal path traversal detected from user {current_user.id}")
        raise HTTPException(status_code=403, detail="Principal Security Violation: Access Denied.")
        
    try:
        # Atomic Async Write (Requirement 3)
        async with await anyio.open_file(file_path, "wb") as f:
            while content := await file.read(1024 * 64): # 64KB blocks
                await f.write(content)
    except Exception as e:
        logger.error(f"IO Resilience Failure: {e}")
        raise HTTPException(status_code=500, detail="IO Failure: Failed to secure storage.")
        
    # Database Transaction: Atomic persist (Requirement 2 & 3)
    db_doc = Document(
        title=file.filename, 
        file_path=file_path, 
        user_id=current_user.id,
        organization_id=current_user.organization_id # Team linkage
    )
    db.add(db_doc)
    await db.commit()
    await db.refresh(db_doc)
    
    # Background worker: (Requirement 12)
    background_tasks.add_task(background_indexer, db_doc.id, file_path)
    
    return db_doc

@router.get("", response_model=List[DocumentResponse])
async def get_documents_paginated(
    skip: int = 0, 
    limit: int = 20, 
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Enterprise Document Access: Isolated by User and Team (RBAC)."""
    # Base Isolation (Requirement 2)
    stmt = select(Document)
    
    if current_user.role == "Employee":
        # Narrow Isolation: Individual ownership
        stmt = stmt.filter(Document.user_id == current_user.id)
    else:
        # Team Isolation: TeamLead/Admin can see Org docs
        stmt = stmt.filter(Document.organization_id == current_user.organization_id)
    
    if search:
        # Paginating Search Logic (Requirement 8)
        stmt = stmt.filter(Document.title.ilike(f"%{search}%"))
        
    result = await db.execute(stmt.order_by(Document.upload_date.desc()).offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/{doc_id}/summary")
async def get_document_summary(
    doc_id: int, 
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Gemini-powered Enterprise Executive Summary (Requirement 8)."""
    doc = await db.get(Document, doc_id)
    
    # Access Enforcement Logic (Requirement 2 & 13)
    if not doc or (current_user.role == "Employee" and doc.user_id != current_user.id) or \
       (current_user.role != "Employee" and doc.organization_id != current_user.organization_id):
        raise HTTPException(status_code=403, detail="Security Exception: Access Denied.")
        
    if not doc.content:
        return {"overview": "Document processing is currently in the worker pipeline. Check back in T-15s."}
        
    # Structured JSON Generation
    summary = generate_saas_summary(doc.content)
    return {"id": doc_id, **summary}

@router.delete("/{doc_id}")
async def delete_document(
    doc_id: int, 
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Atomic Secure Document Purge (Requirement 8 & 13)."""
    doc = await db.get(Document, doc_id)
    
    # Permission Hierarchy Check
    if not doc or (current_user.role == "Employee" and doc.user_id != current_user.id) or \
       (current_user.role != "Employee" and doc.organization_id != current_user.organization_id):
        raise HTTPException(status_code=403, detail="Security Exception: Access Denied.")
        
    if os.path.exists(doc.file_path):
        os.remove(doc.file_path)
        
    await db.delete(doc)
    await db.commit()
    logger.info(f"System Purge: Document {doc_id} by User {current_user.id} ({current_user.role})")
    return {"message": "Document purged successfully."}
