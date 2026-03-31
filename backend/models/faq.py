from sqlalchemy import Column, Integer, String, Text, DateTime
from database import Base
import datetime

class FAQ(Base):
    __tablename__ = "faqs"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(String, index=True)
    answer = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
