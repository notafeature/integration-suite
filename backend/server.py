import os
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db import db
from seed import seed
from routers import meta, auth, discovery, meetings, rsvps, resources, notifications

logging.basicConfig(level=logging.INFO)
app = FastAPI(title="Cultivate API")


@app.on_event("startup")
async def _startup():
    await db.circles.create_index("slug", unique=True)
    await db.meetings.create_index("circle_id")
    await db.rsvps.create_index([("meeting_id", 1), ("user_id", 1)], unique=True)
    await db.notifications.create_index([("user_id", 1), ("created_at", -1)])
    await seed()


for _mod in (meta, auth, discovery, meetings, rsvps, resources, notifications):
    app.include_router(_mod.router)

_origins = [o.strip() for o in os.environ.get("CORS_ORIGINS", "*").split(",") if o.strip()]
_cors = {"allow_credentials": True, "allow_methods": ["*"], "allow_headers": ["*"]}
if _origins == ["*"]:
    _cors["allow_origin_regex"] = ".*"  # dev fallback only
else:
    _cors["allow_origins"] = _origins
app.add_middleware(CORSMiddleware, **_cors)
