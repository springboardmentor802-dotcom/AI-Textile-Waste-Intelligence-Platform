# ==========================================================
# AI TEXTILE WASTE INTELLIGENCE PLATFORM
# BACKEND DOCKERFILE
# ==========================================================

FROM python:3.11-slim


# ==========================================================
# PYTHON SETTINGS
# ==========================================================

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1


# ==========================================================
# WORKING DIRECTORY
# ==========================================================

WORKDIR /app


# ==========================================================
# SYSTEM DEPENDENCIES
# ==========================================================

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        libgl1 \
        libglib2.0-0 \
        libgomp1 && \
    rm -rf /var/lib/apt/lists/*


# ==========================================================
# PYTHON DEPENDENCIES
# ==========================================================

COPY backend/requirements-docker.txt ./requirements.txt

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt


# ==========================================================
# BACKEND APPLICATION
# ==========================================================

COPY backend/ ./


# ==========================================================
# CNN MODEL + CONFIG FILES
# ==========================================================

COPY models/ /models/


# ==========================================================
# APPLICATION PORT
# ==========================================================

EXPOSE 8000


# ==========================================================
# START FASTAPI SERVER
# ==========================================================

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]