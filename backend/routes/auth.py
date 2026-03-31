from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import timedelta
from database import get_db
from models.user import User
from schemas.user import UserCreate, UserResponse, Token
from utils.security import get_password_hash, verify_password, create_access_token
from config import settings
import logging

logger = logging.getLogger("Cognivault.Auth")
router = APIRouter(tags=["Authentication"])

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate, db: AsyncSession = Depends(get_db)):
    """Async account registration with SaaS role-based defaults."""
    stmt = select(User).filter(User.email == user.email)
    result = await db.execute(stmt)
    db_user = result.scalars().first()
    
    if db_user:
        logger.warning(f"Registration Blocked: Email {user.email} already exists.")
        raise HTTPException(status_code=400, detail="Account Logic: Email already registered.")
        
    hashed_password = get_password_hash(user.password)
    new_user = User(
        name=user.name,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    logger.info(f"New Tenant Registered: {new_user.id} ({new_user.role})")
    return new_user

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    """High-throughput async login with JWT secure issuance."""
    stmt = select(User).filter(User.email == form_data.username)
    result = await db.execute(stmt)
    user = result.scalars().first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Security Fault: Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role}, expires_delta=access_token_expires
    )
    logger.info(f"Session Issued: User {user.id} connected.")
    return {"access_token": access_token, "token_type": "bearer"}
