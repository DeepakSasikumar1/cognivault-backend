import uuid
import time
import logging
from fastapi import FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware
from services.rag_service import logger

class RequestMonitoringMiddleware(BaseHTTPMiddleware):
    """
    Middleware for end-to-end request tracking.
    Injects a unique X-Request-ID and logs processing latency.
    """
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        start_time = time.time()
        
        # Add request ID to logger context if needed (simplified here)
        logger.info(f"[{request_id}] START: {request.method} {request.url.path}")
        
        try:
            response = await call_next(request)
            
            process_time = (time.time() - start_time) * 1000
            response.headers["X-Process-Time"] = f"{process_time:.2f}ms"
            response.headers["X-Request-ID"] = request_id
            
            logger.info(f"[{request_id}] END: {request.method} {request.url.path} | Status: {response.status_code} | Latency: {process_time:.2f}ms")
            return response
        except Exception as e:
            process_time = (time.time() - start_time) * 1000
            logger.error(f"[{request_id}] FAILED: {request.method} {request.url.path} | Error: {str(e)} | Latency: {process_time:.2f}ms")
            raise e
