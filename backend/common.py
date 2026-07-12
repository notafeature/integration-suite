import os

from db import db, temporal, parse_dt
from seed import FORMAT_LABELS
from services import payments_status

EMERGENT_AUTH_SESSION_URL = os.environ.get(
    "EMERGENT_AUTH_SESSION_URL",
    "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
)


def site_config() -> dict:
    return {
        "brand": {
            "name": os.environ.get("BRAND_NAME", "Cultivate Santa Fe"),
            "short": os.environ.get("BRAND_SHORT", "Cultivate"),
            "tagline": os.environ.get("BRAND_TAGLINE", "Community for the road back down."),
        },
        "region": {
            "label": os.environ.get("REGION_LABEL", "Northern New Mexico"),
            "defaultCity": os.environ.get("REGION_DEFAULT_CITY", "Santa Fe"),
        },
        "entity": {
            "name": os.environ.get("ENTITY_NAME", "Cultivate Platform, LLC"),
            "email": os.environ.get("ENTITY_EMAIL", "hello@example.com"),
        },
        "formats": FORMAT_LABELS,
        "payments": payments_status(),
    }


def public_user(user: dict) -> dict:
    return {k: user.get(k) for k in ("user_id", "email", "name", "picture", "roles")}


async def next_meeting_for(circle_id: str):
    cur = db.meetings.find({"circle_id": circle_id}, {"_id": 0}).sort("start_at", 1)
    async for m in cur:
        if temporal(m["start_at"]):
            return m
    return None


def meeting_brief(m: dict, reveal: bool = False) -> dict:
    return {
        "id": m["id"], "circle_slug": m.get("circle_slug"),
        "start_at": m["start_at"], "end_at": m.get("end_at"),
        "date_label": m.get("date_label", ""), "time_label": m.get("time_label", ""),
        "general_location": m.get("general_location", ""),
        "exact_location": m.get("exact_location") if reveal else None,
        "seats_left": m.get("seats_left"), "capacity": m.get("capacity"),
        "temporal": temporal(m["start_at"]),
    }


def circle_brief(c: dict, nm: dict | None) -> dict:
    return {
        "id": c["id"], "slug": c["slug"], "name": c["name"], "city": c["city"],
        "state": c.get("state", ""), "kind": c.get("kind", "local"),
        "format": c["format"], "format_label": FORMAT_LABELS.get(c["format"], c["format"]),
        "cadence": c.get("cadence", ""), "summary": c.get("summary", ""),
        "host_name": c.get("host_name", ""),
        "next_meeting": meeting_brief(nm) if nm else None,
        "temporal": temporal(nm["start_at"]) if nm else None,
    }


async def get_circle_for_meeting(m: dict):
    return await db.circles.find_one({"id": m["circle_id"]}, {"_id": 0})
