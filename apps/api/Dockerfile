FROM python:3.11-slim

WORKDIR /app/apps/api

# engine specs are read from the repo root at runtime (ENGINE_SPEC_DIR)
COPY apps/api/pyproject.toml ./
COPY apps/api/deus_api ./deus_api
COPY apps/api/data ./data
COPY apps/api/scripts ./scripts
COPY apps/api/alembic ./alembic
COPY apps/api/alembic.ini ./alembic.ini
COPY engine /app/engine

RUN pip install --no-cache-dir .

ENV ENGINE_SPEC_DIR=/app/engine
EXPOSE 8000
CMD ["sh", "-c", "alembic upgrade head && uvicorn deus_api.main:app --host 0.0.0.0 --port 8000"]
