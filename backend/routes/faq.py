from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from models.user import User
from models.faq import FAQ
from schemas.faq import FAQCreate, FAQResponse
from services.auth_service import get_current_user, require_admin
from typing import List

router = APIRouter(tags=["FAQs"])

@router.get("", response_model=List[FAQResponse])
async def get_faqs(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Retrieve global FAQ knowledge base."""
    stmt = select(FAQ)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("", response_model=FAQResponse)
async def create_faq(faq: FAQCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_admin)):
    """Admin: manually append to global knowledge base."""
    new_faq = FAQ(question=faq.question, answer=faq.answer)
    db.add(new_faq)
    await db.commit()
    await db.refresh(new_faq)
    return new_faq

@router.post("/generate-faq")
async def generate_faqs(db: AsyncSession = Depends(get_db), current_user: User = Depends(require_admin)):
    """Future capability for bulk FAQ synthesis from indexed documents."""
    return {"message": "SaaS Batch Analysis: Generating FAQs from library trends (Requires target Doc IDs)."}
