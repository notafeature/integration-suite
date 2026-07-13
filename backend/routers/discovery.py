import uuid

from fastapi import APIRouter, Depends, HTTPException

from db import db, now_utc, iso, slugify, temporal, parse_dt
from models import CircleIn
from security import get_current_user, get_optional_user
from seed import FORMAT_LABELS
from common import site_config, next_meeting_for, circle_brief, meeting_brief

router = APIRouter(prefix="/api")


@router.get("/field")
async def field():
    locations: dict[str, dict] = {}
    async for c in db.circles.find({}, {"_id": 0}):
        key = "Online" if c.get("kind") == "online" else c["city"]
        loc = locations.setdefault(key, {
            "id": slugify(key), "label": key,
            "kind": "online" if c.get("kind") == "online" else "local",
            "group_count": 0, "upcoming_count": 0, "next_meeting_at": None, "temporal": None,
        })
        loc["group_count"] += 1
        nm = await next_meeting_for(c["id"])
        if nm:
            loc["upcoming_count"] += 1
            if loc["next_meeting_at"] is None or parse_dt(nm["start_at"]) < parse_dt(loc["next_meeting_at"]):
                loc["next_meeting_at"] = nm["start_at"]
    for loc in locations.values():
        loc["temporal"] = temporal(loc["next_meeting_at"]) if loc["next_meeting_at"] else None
    order = {"local": 0, "online": 1}
    result = sorted(locations.values(), key=lambda x: (order.get(x["kind"], 2), -x["group_count"]))
    return {"locations": result, "config": site_config()}


@router.get("/locations/{label}")
async def location_detail(label: str):
    is_online = label.lower() == "online"
    q = {"kind": "online"} if is_online else {"city": {"$regex": f"^{label}$", "$options": "i"}}
    circles = []
    async for c in db.circles.find(q, {"_id": 0}):
        nm = await next_meeting_for(c["id"])
        circles.append(circle_brief(c, nm))
    circles.sort(key=lambda x: (x["next_meeting"] is None, x["next_meeting"]["start_at"] if x["next_meeting"] else ""))
    res_q = {"status": "approved", "$or": [{"tag": "online"}]}
    if not is_online:
        res_q["$or"].append({"tag": "local", "city": {"$regex": f"^{label}$", "$options": "i"}})
    resources = await db.resources.find(res_q, {"_id": 0}).to_list(50)
    return {"label": label, "kind": "online" if is_online else "local", "circles": circles, "resources": resources}


@router.get("/circles")
async def list_circles(q: str | None = None, city: str | None = None, format: str | None = None):
    query: dict = {}
    if city:
        query["city"] = {"$regex": f"^{city}$", "$options": "i"}
    if format:
        query["format"] = format
    if q:
        query["$or"] = [{"name": {"$regex": q, "$options": "i"}},
                        {"summary": {"$regex": q, "$options": "i"}},
                        {"city": {"$regex": q, "$options": "i"}}]
    circles = []
    async for c in db.circles.find(query, {"_id": 0}):
        nm = await next_meeting_for(c["id"])
        circles.append(circle_brief(c, nm))
    circles.sort(key=lambda x: (x["next_meeting"] is None, x["next_meeting"]["start_at"] if x["next_meeting"] else ""))
    return {"circles": circles}


@router.get("/circles/{slug}")
async def circle_detail(slug: str, user=Depends(get_optional_user)):
    c = await db.circles.find_one({"slug": slug}, {"_id": 0})
    if not c:
        raise HTTPException(status_code=404, detail="Circle not found")
    is_organizer = bool(user and user["user_id"] == c.get("organizer_user_id"))
    meetings = await db.meetings.find({"circle_id": c["id"]}, {"_id": 0}).sort("start_at", 1).to_list(50)
    upcoming = [m for m in meetings if temporal(m["start_at"])]

    my_rsvps = {}
    if user:
        async for rv in db.rsvps.find({"user_id": user["user_id"], "circle_id": c["id"]}, {"_id": 0}):
            my_rsvps[rv["meeting_id"]] = rv["status"]

    def serialize_meeting(m):
        status = my_rsvps.get(m["id"])
        reveal = is_organizer or status == "approved"
        d = meeting_brief(m, reveal=reveal)
        d["my_rsvp"] = status
        return d

    organizer = await db.users.find_one({"user_id": c.get("organizer_user_id")}, {"_id": 0, "name": 1, "picture": 1})
    resources = await db.resources.find(
        {"status": "approved", "$or": [{"tag": "online"}, {"tag": "national"},
                                       {"tag": "local", "city": {"$regex": f"^{c['city']}$", "$options": "i"}}]},
        {"_id": 0}).to_list(20)

    return {
        **{k: c[k] for k in ("id", "slug", "name", "city", "state", "kind", "format", "cadence",
                             "capacity", "summary", "description", "agreements", "host_name", "host_note")
           if k in c},
        "established": c.get("established", ""),
        "format_label": FORMAT_LABELS.get(c["format"], c["format"]),
        "organizer": {"name": c.get("host_name") or (organizer or {}).get("name", "Organizer"),
                      "note": c.get("host_note", ""), "picture": (organizer or {}).get("picture", "")},
        "is_organizer": is_organizer,
        "meetings": [serialize_meeting(m) for m in upcoming],
        "resources": resources,
    }


@router.post("/circles")
async def create_circle(body: CircleIn, user=Depends(get_current_user)):
    slug = slugify(body.name)
    if await db.circles.find_one({"slug": slug}):
        slug = f"{slug}-{uuid.uuid4().hex[:4]}"
    doc = {
        "id": uuid.uuid4().hex, "slug": slug, "organizer_user_id": user["user_id"],
        "established": str(now_utc().year), "created_at": iso(now_utc()), **body.model_dump(),
    }
    await db.circles.insert_one(doc)
    if "organizer" not in user.get("roles", []):
        await db.users.update_one({"user_id": user["user_id"]}, {"$addToSet": {"roles": "organizer"}})
    return {"slug": slug, "id": doc["id"]}
