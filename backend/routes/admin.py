from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func
from database import get_db
from models.user import User
from models.chat import Chat
from schemas.user import UserResponse
from services.auth_service import require_admin
from typing import List
import logging

logger = logging.getLogger("Cognivault.Admin")
router = APIRouter(tags=["Admin Panel"])

@router.get("/users", response_model=List[UserResponse])
async def get_all_users(db: AsyncSession = Depends(get_db), current_user: User = Depends(require_admin)):
    """Admin oversight: list all tenants."""
    stmt = select(User)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.delete("/user/{user_id}")
async def delete_user(user_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_admin)):
    """Admin cleanup: purge a tenant manually."""
    stmt = select(User).filter(User.id == user_id)
    result = await db.execute(stmt)
    target_user = result.scalars().first()
    
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if target_user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Authorization Fault: Cannot purge self.")
        
    await db.delete(target_user)
    await db.commit()
    logger.info(f"Tenant Purge: Admin purged User {user_id}.")
    return {"message": "User deleted successfully"}

@router.get("/analytics")
async def get_analytics(db: AsyncSession = Depends(get_db), current_user: User = Depends(require_admin)):
    """Core platform metrics for CTO oversight."""
    # Count queries in async
    u_stmt = select(func.count(User.id))
    u_res = await db.execute(u_stmt)
    total_users = u_res.scalar()
    
    c_stmt = select(func.count(Chat.id))
    c_res = await db.execute(c_stmt)
    total_queries = c_res.scalar()
    
    return {
        "total_users": total_users,
        "total_queries": total_queries,
        "system_version": "2.2.0-SaaS",
        "load_profile": "Stable"
    }
