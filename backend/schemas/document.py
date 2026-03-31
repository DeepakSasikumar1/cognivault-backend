from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class DocumentResponse(BaseModel):
    id: int
    title: str
    file_path: str
    user_id: Optional[int]
    upload_date: datetime

    class Config:
        from_attributes = True
