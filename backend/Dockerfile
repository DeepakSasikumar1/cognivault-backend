# Use official Python 3.11 Slim for Enterprise stability
FROM python:3.11-slim

# CTO Policy: Minimize image size
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Core Dependencies Layer
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Application Layer
COPY . .

# Secure Runtime Deployment
EXPOSE 8000

# Principal Entrypoint
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
