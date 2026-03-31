import logging
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker
from config import settings

# --- DATABASE ARCHITECTURE (v2.4.0-PG) ---

# Enterprise Async Engine (PostgreSQL-Native: Requirement 3)
# Principal Driver: asyncpg (v0.31.0)
try:
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=False, # CTO Policy: No noise in Production
        future=True,
        pool_size=10, 
        max_overflow=20
    )
except Exception as e:
    logging.critical(f"Critical Database Infrastructure Fault: {e}")
    raise e

# Transactional Integrity (v2.4.0-PG: Requirement 4)
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False # Principal rule: No session loss during async waits
)

Base = declarative_base()

# Principal Data-Access Pattern: Async Injection
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception as e:
            logging.error(f"SaaS Database Session Pulse Loss: {e}")
            await session.rollback()
            raise e
        finally:
            await session.close()
