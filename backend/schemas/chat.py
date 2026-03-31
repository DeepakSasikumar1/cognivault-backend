from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ChatRequest(BaseModel):
    query: str
    document_id: Optional[int] = None
    use_history: bool = True
    history_limit: int = 5

class ChatResponse(BaseModel):
    id: int
    query: str
    response: str
    timestamp: datetime
    
    # Analytics & Usage
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0

    class Config:
        from_attributes = True
