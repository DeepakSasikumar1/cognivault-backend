from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    file_path = Column(String)
    content = Column(Text, nullable=True) # Full text
    chunks = Column(JSON, nullable=True) # List of text chunks
    tags = Column(JSON, nullable=True) # List of categorization tags
    upload_date = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Ownership & Teams
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    
    owner = relationship("User", back_populates="documents")
    organization = relationship("Organization", back_populates="documents")
