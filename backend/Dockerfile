FROM python:3.12-slim

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Configure uv to create the virtual environment inside /app
ENV UV_PROJECT_ENVIRONMENT=/app/.venv \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Install dependencies first for better build caching
COPY pyproject.toml uv.lock ./

RUN uv sync --frozen --no-dev

# Copy backend source code
COPY . .

# Add installed packages to PATH
ENV PATH="/app/.venv/bin:$PATH"

EXPOSE 8000

# Run FastAPI with Gunicorn and Uvicorn workers
CMD ["gunicorn", "app.main:app", \
     "--worker-class", "uvicorn_worker.UvicornWorker", \
     "--workers", "2", \
     "--bind", "0.0.0.0:8000", \
     "--access-logfile", "-", \
     "--error-logfile", "-"]
