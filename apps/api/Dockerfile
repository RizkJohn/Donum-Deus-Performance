FROM python:3.11-slim

WORKDIR /app/apps/api

# engine specs are read from the repo root at runtime (ENGINE_SPEC_DIR)
COPY apps/api/pyproject.toml ./
COPY apps/api/deus_api ./deus_api
COPY apps/api/data ./data
COPY apps/api/scripts ./scripts
COPY apps/api/alembic ./alembic
COPY apps/api/alembic.ini ./
COPY apps/api/entrypoint.sh ./
COPY engine /app/engine

RUN pip install --no-cache-dir . && chmod +x entrypoint.sh

ENV ENGINE_SPEC_DIR=/app/engine
EXPOSE 8000
# Runs `alembic upgrade head` then starts uvicorn.
# On Fly.io the [deploy] release_command handles migrations before traffic;
# the entrypoint migration is a safety net for docker compose and other runtimes.
CMD ["./entrypoint.sh"]
