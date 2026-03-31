import logging
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from database import engine, Base, get_db, AsyncSessionLocal
from routes import auth, chat as chat_route, documents, faq as faq_route, admin
from middleware.monitoring import RequestMonitoringMiddleware
from config import settings

# --- DATABASE INERTIA CONTROL ---
async def create_db_tables():
    """Requirement 5: Table initialization for PostgreSQL-Native."""
    async with engine.begin() as conn:
        try:
            await conn.run_sync(Base.metadata.create_all)
            logging.info("PostgreSQL Schema: Synchronization complete.")
        except Exception as e:
            logging.critical(f"PostgreSQL Synchronization Failure: {e}")
            raise e

# --- PRINCIPAL AI ENGINE (v2.4.0) ---
app = FastAPI(
    title="Cognivault Enterprise (v2.4.0-PG)",
    description="Scalable Multi-Tenant PostgreSQL RAG SaaS.",
    version="2.4.0"
)

# Startup Policy
@app.on_event("startup")
async def startup_event():
    await create_db_tables()
    logging.info("SaaS Engine: Database initialization complete.")

# Global Middleware
app.add_middleware(RequestMonitoringMiddleware)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Strategic Router Grid (v2.4.0)
app.include_router(auth.router, prefix="/auth")
app.include_router(chat_route.router, prefix="/chat")
app.include_router(documents.router, prefix="/documents")
app.include_router(faq_route.router, prefix="/faqs")
app.include_router(admin.router, prefix="/admin")

@app.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    """Requirement 7: Diagnostic Health Endpoint for PostgreSQL."""
    try:
        # Diagnostic Ping (Requirement 7)
        await db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        logging.error(f"PostgreSQL Connection Loss: {e}")
        return {"status": "error", "database": "disconnected", "reason": str(e)}

@app.get("/")
def read_root(): return {"message": "Cognivault PostgreSQL Engine v2.4.0 Active."}
