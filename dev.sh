#!/usr/bin/env bash
# One command to run the whole app locally — no MongoDB required.
#
#   ./dev.sh
#
# Backend runs on http://localhost:8001 against an IN-MEMORY database
# (seeded fresh on every start; nothing persists between runs).
# Frontend runs on http://localhost:3000.
#
# Sign in with (password for all: Cultivate123!):
#   organizer@cultivatesf.org   — owns circles, approves RSVPs
#   member@cultivatesf.org      — regular member, can RSVP
#   admin@cultivatesf.org       — moderator (directory queue)
#
# To use a real MongoDB instead, put MONGO_URL and DB_NAME in backend/.env
# and run the backend with:  cd backend && uvicorn server:app --port 8001
set -euo pipefail
cd "$(dirname "$0")"

echo "== backend deps =="
python3 -m venv backend/.venv 2>/dev/null || true
backend/.venv/bin/pip -q install -r backend/requirements.txt mongomock-motor uvicorn

echo "== frontend deps =="
[ -f frontend/.env ] || echo "REACT_APP_BACKEND_URL=http://localhost:8001" > frontend/.env
(cd frontend && npm install --legacy-peer-deps --no-audit --no-fund)

echo "== starting backend on :8001 (in-memory DB, seeded) =="
backend/.venv/bin/python - <<'PY' &
import os, sys
sys.path.insert(0, "backend")
import motor.motor_asyncio
from mongomock_motor import AsyncMongoMockClient
motor.motor_asyncio.AsyncIOMotorClient = AsyncMongoMockClient
os.environ.setdefault("MONGO_URL", "mongodb://localhost:27017")
os.environ.setdefault("DB_NAME", "cultivate")
os.environ.setdefault("CORS_ORIGINS", "http://localhost:3000")
import uvicorn
from server import app
uvicorn.run(app, host="127.0.0.1", port=8001)
PY
BACKEND_PID=$!
trap 'kill $BACKEND_PID 2>/dev/null' EXIT

echo "== starting frontend on :3000 =="
cd frontend && BROWSER=none npm start
