#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

if [[ "${APP_ENV:-local}" == "demo" ]]; then
    python vehicle-parking-app/manage.py init-demo --if-empty --profile "${DEMO_PROFILE:-large}"
fi

exec gunicorn --chdir vehicle-parking-app app:app \
    --bind "0.0.0.0:${PORT:-5001}" --workers 1 --threads 4 \
    --timeout 120 --access-logfile - --error-logfile -
