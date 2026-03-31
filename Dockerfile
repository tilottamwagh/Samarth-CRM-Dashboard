FROM python:3.11-slim

# Prevent Python from writing pyc files & buffering stdout
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn uvicorn daphne

# Copy application code
COPY . /app/

# Collect static files
RUN python manage.py collectstatic --noinput || true

# Expose ports for web and websocket
EXPOSE 8000
EXPOSE 8001
