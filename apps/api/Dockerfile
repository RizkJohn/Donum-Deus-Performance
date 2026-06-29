FROM python:3.11-slim

WORKDIR /app/apps/api

# engine specs are read from the repo root at runtime (ENGINE_SPEC_DIR)
COPY apps/api/pyproject.toml ./
COPY apps/api/deus_api ./deus_api
COPY apps/api/data ./data
COPY apps/api/scripts ./scripts
COPY engine /app/engine

RUN pip install --no-cache-dir . \
    && addgroup --system --gid 1001 appgroup \
    && adduser --system --uid 1001 --gid 1001 --no-create-home appuser \
    && chown -R appuser:appgroup /app

ENV ENGINE_SPEC_DIR=/app/engine
USER appuser
EXPOSE 8000
CMD ["uvicorn", "deus_api.main:app", "--host", "0.0.0.0", "--port", "8000"]
