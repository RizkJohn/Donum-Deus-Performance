#!/usr/bin/env bash
# Import all Donum Dei Performance workflows into the running self-hosted n8n.
#
# Prereq: the n8n container is up (docker compose --profile automation up -d).
# The compose file mounts ./automation/n8n into the container at /workflows.
#
# Usage:
#   ./automation/import-workflows.sh            # uses compose service "n8n"
#   ./automation/import-workflows.sh <service>  # custom compose service name
#
# Idempotent: re-running re-imports the same workflows (by id) rather than
# creating duplicates.
set -euo pipefail

SERVICE="${1:-n8n}"
COMPOSE="docker compose"

# Run from the repo root regardless of where the script is invoked.
cd "$(dirname "$0")/.."

if ! $COMPOSE ps --services --status running 2>/dev/null | grep -qx "$SERVICE"; then
  echo "n8n service '$SERVICE' is not running."
  echo "Start it first:  docker compose --profile automation up -d"
  exit 1
fi

echo "→ Importing Donum Dei Performance workflows into n8n ('$SERVICE')…"
$COMPOSE exec -T "$SERVICE" n8n import:workflow --separate --input=/workflows

echo
echo "→ Workflows now in n8n:"
$COMPOSE exec -T "$SERVICE" n8n list:workflow

cat <<'NEXT'

Done. All workflows import INACTIVE. Next steps (automation/SETUP.md):
  1. Open n8n (http://localhost:5678 or your domain) and create the owner login.
  2. Credentials → add: Notion API, Anthropic (x-api-key), Resend (Bearer),
     Stripe API. Names must match exactly.
  3. Open each workflow, map its credential(s), then toggle Active.
  4. Copy the webhook URLs (ddp-lead, ddp-generate, ddp-checkin, ddp-question)
     into the website, and point a Stripe webhook at the Stripe Trigger.
NEXT
