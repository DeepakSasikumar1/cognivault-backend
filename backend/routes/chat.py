from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_db
from models.user import User
from models.chat import Chat
from models.document import Document
from schemas.chat import ChatRequest, ChatResponse
from services.auth_service import get_current_user
from services.rag_service import query_rag, stream_query_rag, ChunkContext
import logging
import json
import anyio
from typing import List, AsyncGenerator, Optional

logger = logging.getLogger("Cognivault.Chat")
router = APIRouter(tags=["Chat IQ System"])

async def get_document_context_for_user(user: User, db: AsyncSession, doc_id: Optional[int] = None) -> List[Document]:
    """Helper for RBAC Isolation: Employee (self) | TeamLead (Org)"""
    stmt = select(Document)
    if user.role == "Employee":
        stmt = stmt.filter(Document.user_id == user.id)
    else:
        stmt = stmt.filter(Document.organization_id == user.organization_id)
    if doc_id:
        stmt = stmt.filter(Document.id == doc_id)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("", response_model=ChatResponse)
async def create_chat_sync_enterprise(request: ChatRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Async Synchronous Enterprise Chat (Requirement 6) with RAG grounding."""
    docs = await get_document_context_for_user(current_user, db, request.document_id)
    if request.document_id and not docs:
        raise HTTPException(status_code=403, detail="Security violation: Document restricted.")
    all_chunk_items = []
    for doc in docs:
        if doc.chunks:
            all_chunk_items.extend([ChunkContext(c, doc.title, i) for i, c in enumerate(doc.chunks)])
    hist_stmt = select(Chat).filter(Chat.user_id == current_user.id).order_by(Chat.timestamp.desc()).limit(request.history_limit)
    hist_res = await db.execute(hist_stmt)
    history_objs = list(reversed(hist_res.scalars().all()))
    interleaved_history = []
    for h in history_objs:
        interleaved_history.extend([{"role": "user", "content": h.query}, {"role": "model", "content": h.response}])
    try:
        answer, usage = query_rag(request.query, all_chunk_items, interleaved_history if request.use_history else None)
    except Exception as e:
        logger.error(f"AI IQ Engine Fault: {e}")
        raise HTTPException(status_code=500, detail="The AI IQ engine encountered a logic fault.")
    new_chat = Chat(
        user_id=current_user.id, query=request.query, response=answer,
        prompt_tokens=usage.get("prompt", 0), completion_tokens=usage.get("completion", 0), total_tokens=usage.get("total", 0)
    )
    db.add(new_chat)
    await db.commit()
    await db.refresh(new_chat)
    return new_chat

@router.post("/stream")
async def create_chat_stream_enterprise(
    fastapi_request: Request, 
    chat_request: ChatRequest, 
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Real-time Streaming RAG (Requirement 7) with SaaS Disconnect Awareness."""
    docs = await get_document_context_for_user(current_user, db, chat_request.document_id)
    all_chunk_items = []
    for doc in docs:
        if doc.chunks:
            all_chunk_items.extend([ChunkContext(c, doc.title, i) for i, c in enumerate(doc.chunks)])
    hist_stmt = select(Chat).filter(Chat.user_id == current_user.id).order_by(Chat.timestamp.desc()).limit(chat_request.history_limit)
    hist_res = await db.execute(hist_stmt)
    history = []
    for h in reversed(hist_res.scalars().all()):
        history.extend([{"role": "user", "content": h.query}, {"role": "model", "content": h.response}])

    async def event_generator():
        full_response, usage = "", {"prompt": 0, "completion": 0, "total": 0}
        try:
            for chunk in stream_query_rag(chat_request.query, all_chunk_items, history if chat_request.use_history else None):
                if await fastapi_request.is_disconnected():
                    logger.warning(f"SaaS Signal Loss: User {current_user.id} disconnected mid-stream.")
                    break
                if isinstance(chunk, dict):
                    usage = chunk
                    continue
                full_response += chunk
                yield f"data: {json.dumps({'text': chunk})}\n\n"
            if full_response:
                from database import AsyncSessionLocal
                async with AsyncSessionLocal() as final_db:
                    final_chat = Chat(
                        user_id=current_user.id, query=chat_request.query, response=full_response,
                        prompt_tokens=usage.get("prompt", 0), completion_tokens=usage.get("completion", 0), total_tokens=usage.get("total", 0)
                    )
                    final_db.add(final_chat)
                    await final_db.commit()
            yield "data: [DONE]\n\n"
        except Exception as e:
            logger.error(f"SaaS Pulse Failure: {e}")
            yield f"data: {json.dumps({'error': 'Stream Termination'})}\n\n"
    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.get("/history", response_model=List[ChatResponse])
async def get_chat_history(
    limit: int = 20, 
    offset: int = 0, 
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Retrieve isolated chat history (Requirement 6) via async select."""
    stmt = select(Chat).filter(Chat.user_id == current_user.id).order_by(Chat.timestamp.desc()).limit(limit).offset(offset)
    result = await db.execute(stmt)
    return result.scalars().all()
