import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # Principal SaaS Logic: Gemini AI Configuration
    GEMINI_API_KEY: str = "API_KEY_HERE"
    
    # Economics Logic: Security & Auth Configuration
    SECRET_KEY: str = os.urandom(32).hex()
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # 24 Hours
    
    # --- RENDER/PRODUCTION ADAPTIVE DB URL ---
    _raw_db_url: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/cognivault")
    
    # Standardize Render's 'postgresql://' to SQLAlchemy 2.0 Async format
    @property
    def DATABASE_URL(self) -> str:
        url = self._raw_db_url
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url
    
    # Enterprise Thresholds
    MAX_FILE_SIZE_MB: int = 25
    ALLOWED_EXTENSIONS: list = ["pdf"]
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
# Note: DATABASE_URL is now a dynamic property to ensure Render compatibility
