import os
import uuid
import logging

from fastapi import FastAPI, APIRouter, Depends, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse
import httpx

from db import db, now_utc, iso, slugify, temporal, parse_dt
from models import (
    RegisterIn, LoginIn, SessionIn, CircleIn, MeetingIn, MeetingUpdateIn,
    ResourceIn, ModerateIn,
)
from security import (
    hash_password, verify_password, new_user_id, create_session,
    set_session_cookie, get_current_user, get_optional_user, require_moderator,
)
from services import (
    notify, build_ics, google_calendar_url, payments_status,
)
from seed import seed, FORMAT_LABELS

logging.basicConfig(level=logging.INFO)
app = FastAPI(title="Cultivate API")
api = APIRouter(prefix="/api")

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


# ----------------------- lifecycle -----------------------
@app.on_event("startup")
async def _startup():
    await db.circles.create_index("slug", unique=True)
    await db.meetings.create_index("circle_id")
    await db.rsvps.create_index([("meeting_id", 1), ("user_id", 1)], unique=True)
    await db.notifications.create_index([("user_id", 1), ("created_at", -1)])
    await seed()


# ----------------------- config / health -----------------------
@api.get("/")
async def root():
    return {"ok": True, "service": "cultivate"}


@api.get("/config")
async def get_config():
    return site_config()


# ----------------------- auth -----------------------
@api.post("/auth/register")
async def register(body: RegisterIn):
    email = body.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=409, detail="An account with this email already exists.")
    uid = new_user_id()
    await db.users.insert_one({
        "user_id": uid, "email": email, "name": body.name, "picture": "",
        "roles": ["member"], "auth_provider": "password",
        "password_hash": hash_password(body.password), "created_at": iso(now_utc()),
    })
    token = await create_session(uid)
    user = await db.users.find_one({"user_id": uid}, {"_id": 0, "password_hash": 0})
    resp = JSONResponse({"user": public_user(user), "session_token": token})
    set_session_cookie(resp, token)
    return resp


@api.post("/auth/login")
async def login(body: LoginIn):
    user = await db.users.find_one({"email": body.email.lower()})
    if not user or not user.get("password_hash") or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")
    token = await create_session(user["user_id"])
    resp = JSONResponse({"user": public_user(user), "session_token": token})
    set_session_cookie(resp, token)
    return resp


@api.post("/auth/session")
async def google_session(body: SessionIn):
    # REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    async with httpx.AsyncClient(timeout=15) as c:
        r = await c.get(EMERGENT_AUTH_SESSION_URL, headers={"X-Session-ID": body.session_id})
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid session")
    data = r.json()
    email = data["email"].lower()
    user = await db.users.find_one({"email": email})
    if not user:
        uid = new_user_id()
        await db.users.insert_one({
            "user_id": uid, "email": email, "name": data.get("name", email),
            "picture": data.get("picture", ""), "roles": ["member"],
            "auth_provider": "google", "created_at": iso(now_utc()),
        })
        user = await db.users.find_one({"user_id": uid})
    else:
        await db.users.update_one({"email": email}, {"$set": {"picture": data.get("picture", user.get("picture", ""))}})
    token = data.get("session_token") or await create_session(user["user_id"])
    await db.user_sessions.update_one(
        {"session_token": token},
        {"$set": {"user_id": user["user_id"], "session_token": token,
                  "expires_at": now_utc() + __import__("datetime").timedelta(days=7),
                  "created_at": now_utc()}},
        upsert=True,
    )
    resp = JSONResponse({"user": public_user(user), "session_token": token})
    set_session_cookie(resp, token)
    return resp


@api.get("/auth/me")
async def me(user=Depends(get_current_user)):
    return public_user(user)


@api.post("/auth/logout")
async def logout(request: Request):
    token = request.cookies.get("session_token")
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    resp = JSONResponse({"ok": True})
    resp.delete_cookie("session_token", path="/")
    return resp


# ----------------------- serializers -----------------------
async def next_meeting_for(circle_id: str):
    cur = db.meetings.find({"circle_id": circle_id}, {"_id": 0}).sort("start_at", 1)
    async for m in cur:
        if temporal(m["start_at"]):
            return m
    return None


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


# ----------------------- field / discovery -----------------------
@api.get("/field")
async def field():
    locations: dict[str, dict] = {}
    async for c in db.circles.find({}, {"_id": 0}):
        key = "Online" if c.get("kind") == "online" else c["city"]
        loc = locations.setdefault(key, {
            "id": slugify(key), "label": key,
            "kind": "online" if c.get("kind") == "online" else "local",
            "group_count": 0, "upcoming_count": 0,
            "next_meeting_at": None, "temporal": None,
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


@api.get("/locations/{label}")
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
    return {"label": label, "kind": "online" if is_online else "local",
            "circles": circles, "resources": resources}


@api.get("/circles")
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


@api.get("/circles/{slug}")
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


@api.post("/circles")
async def create_circle(body: CircleIn, user=Depends(get_current_user)):
    slug = slugify(body.name)
    if await db.circles.find_one({"slug": slug}):
        slug = f"{slug}-{uuid.uuid4().hex[:4]}"
    doc = {
        "id": uuid.uuid4().hex, "slug": slug, "organizer_user_id": user["user_id"],
        "established": str(now_utc().year), "created_at": iso(now_utc()),
        **body.model_dump(),
    }
    await db.circles.insert_one(doc)
    if "organizer" not in user.get("roles", []):
        await db.users.update_one({"user_id": user["user_id"]}, {"$addToSet": {"roles": "organizer"}})
    return {"slug": slug, "id": doc["id"]}


# ----------------------- meetings -----------------------
@api.get("/meetings/upcoming")
async def upcoming_meetings():
    out = []
    async for m in db.meetings.find({}, {"_id": 0}).sort("start_at", 1):
        if not temporal(m["start_at"]):
            continue
        c = await db.circles.find_one({"id": m["circle_id"]}, {"_id": 0, "name": 1, "city": 1, "slug": 1, "kind": 1})
        if not c:
            continue
        d = meeting_brief(m)
        d.update({"circle_name": c["name"], "circle_city": c["city"], "circle_slug": c["slug"], "circle_kind": c.get("kind")})
        out.append(d)
    return {"meetings": out[:25]}


async def _get_circle_for_meeting(m):
    return await db.circles.find_one({"id": m["circle_id"]}, {"_id": 0})


@api.post("/circles/{slug}/meetings")
async def schedule_meeting(slug: str, body: MeetingIn, user=Depends(get_current_user)):
    c = await db.circles.find_one({"slug": slug}, {"_id": 0})
    if not c:
        raise HTTPException(status_code=404, detail="Circle not found")
    if c.get("organizer_user_id") != user["user_id"]:
        raise HTTPException(status_code=403, detail="Only the organizer can schedule meetings.")
    start = parse_dt(body.start_at)
    doc = {
        "id": uuid.uuid4().hex, "circle_id": c["id"], "circle_slug": slug,
        "start_at": iso(start), "end_at": body.end_at or iso(start),
        "date_label": body.date_label or start.strftime("%A, %B %d"),
        "time_label": body.time_label or start.strftime("%I:%M %p MT"),
        "general_location": body.general_location, "exact_location": body.exact_location,
        "capacity": body.capacity, "seats_left": body.capacity, "created_at": iso(now_utc()),
    }
    await db.meetings.insert_one(doc)
    return meeting_brief(doc, reveal=True)


@api.patch("/meetings/{meeting_id}")
async def update_meeting(meeting_id: str, body: MeetingUpdateIn, user=Depends(get_current_user)):
    m = await db.meetings.find_one({"id": meeting_id}, {"_id": 0})
    if not m:
        raise HTTPException(status_code=404, detail="Meeting not found")
    c = await _get_circle_for_meeting(m)
    if not c or c.get("organizer_user_id") != user["user_id"]:
        raise HTTPException(status_code=403, detail="Only the organizer can edit this meeting.")
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if updates:
        await db.meetings.update_one({"id": meeting_id}, {"$set": updates})
    # notify approved attendees of the schedule change
    async for rv in db.rsvps.find({"meeting_id": meeting_id, "status": "approved"}, {"_id": 0}):
        await notify(rv["user_id"], "schedule_change",
                     f"Schedule changed — {c['name']}",
                     "The organizer updated the details for a meeting you're attending.",
                     link=f"/circle/{c['slug']}")
    return {"ok": True}


@api.get("/meetings/{meeting_id}/ics")
async def meeting_ics(meeting_id: str, user=Depends(get_optional_user)):
    m = await db.meetings.find_one({"id": meeting_id}, {"_id": 0})
    if not m:
        raise HTTPException(status_code=404, detail="Meeting not found")
    c = await _get_circle_for_meeting(m)
    reveal = False
    if user:
        rv = await db.rsvps.find_one({"meeting_id": meeting_id, "user_id": user["user_id"]}, {"_id": 0})
        reveal = (rv and rv["status"] == "approved") or c.get("organizer_user_id") == user["user_id"]
    ics = build_ics(m, c, reveal)
    return PlainTextResponse(ics, media_type="text/calendar",
                             headers={"Content-Disposition": f'attachment; filename="{c["slug"]}.ics"'})


@api.get("/meetings/{meeting_id}/google")
async def meeting_google(meeting_id: str, user=Depends(get_optional_user)):
    m = await db.meetings.find_one({"id": meeting_id}, {"_id": 0})
    if not m:
        raise HTTPException(status_code=404, detail="Meeting not found")
    c = await _get_circle_for_meeting(m)
    reveal = False
    if user:
        rv = await db.rsvps.find_one({"meeting_id": meeting_id, "user_id": user["user_id"]}, {"_id": 0})
        reveal = (rv and rv["status"] == "approved") or c.get("organizer_user_id") == user["user_id"]
    return {"url": google_calendar_url(m, c, reveal)}


# ----------------------- RSVP -----------------------
@api.post("/meetings/{meeting_id}/rsvp")
async def rsvp(meeting_id: str, user=Depends(get_current_user)):
    m = await db.meetings.find_one({"id": meeting_id}, {"_id": 0})
    if not m:
        raise HTTPException(status_code=404, detail="Meeting not found")
    c = await _get_circle_for_meeting(m)
    existing = await db.rsvps.find_one({"meeting_id": meeting_id, "user_id": user["user_id"]}, {"_id": 0})
    if existing:
        return {"status": existing["status"]}
    doc = {
        "id": uuid.uuid4().hex, "meeting_id": meeting_id, "circle_id": c["id"],
        "circle_slug": c["slug"], "user_id": user["user_id"], "user_name": user["name"],
        "user_email": user["email"], "status": "pending",
        "created_at": iso(now_utc()), "decided_at": None,
    }
    await db.rsvps.insert_one(doc)
    await notify(c["organizer_user_id"], "new_rsvp",
                 f"New request to join — {c['name']}",
                 f"{user['name']} asked to join your meeting. Approve to share the details.",
                 link=f"/organize")
    return {"status": "pending"}


@api.get("/rsvps/mine")
async def my_rsvps(user=Depends(get_current_user)):
    out = []
    async for rv in db.rsvps.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1):
        m = await db.meetings.find_one({"id": rv["meeting_id"]}, {"_id": 0})
        if not m:
            continue
        c = await db.circles.find_one({"id": rv["circle_id"]}, {"_id": 0, "name": 1, "slug": 1})
        reveal = rv["status"] == "approved"
        out.append({"status": rv["status"], "circle_name": c["name"] if c else "",
                    "circle_slug": c["slug"] if c else "", "meeting": meeting_brief(m, reveal=reveal)})
    return {"connections": out}


@api.get("/circles/{slug}/rsvps")
async def circle_rsvps(slug: str, user=Depends(get_current_user)):
    c = await db.circles.find_one({"slug": slug}, {"_id": 0})
    if not c:
        raise HTTPException(status_code=404, detail="Circle not found")
    if c.get("organizer_user_id") != user["user_id"]:
        raise HTTPException(status_code=403, detail="Only the organizer can view requests.")
    out = []
    async for rv in db.rsvps.find({"circle_id": c["id"]}, {"_id": 0}).sort("created_at", -1):
        m = await db.meetings.find_one({"id": rv["meeting_id"]}, {"_id": 0})
        out.append({"id": rv["id"], "status": rv["status"], "user_name": rv["user_name"],
                    "user_email": rv["user_email"], "created_at": rv["created_at"],
                    "meeting": meeting_brief(m, reveal=True) if m else None})
    return {"requests": out}


async def _decide_rsvp(rsvp_id: str, user: dict, approve: bool):
    rv = await db.rsvps.find_one({"id": rsvp_id}, {"_id": 0})
    if not rv:
        raise HTTPException(status_code=404, detail="Request not found")
    c = await db.circles.find_one({"id": rv["circle_id"]}, {"_id": 0})
    if not c or c.get("organizer_user_id") != user["user_id"]:
        raise HTTPException(status_code=403, detail="Only the organizer can decide requests.")
    status = "approved" if approve else "declined"
    await db.rsvps.update_one({"id": rsvp_id}, {"$set": {"status": status, "decided_at": iso(now_utc())}})
    if approve:
        await db.meetings.update_one({"id": rv["meeting_id"], "seats_left": {"$gt": 0}}, {"$inc": {"seats_left": -1}})
        await notify(rv["user_id"], "rsvp_status", f"You're in — {c['name']}",
                     "Your request was approved. The meeting details are now available to you.",
                     link=f"/circle/{c['slug']}")
    else:
        await notify(rv["user_id"], "rsvp_status", f"Update on your request — {c['name']}",
                     "The organizer couldn't confirm your seat this time. You're welcome to request another meeting.",
                     link=f"/circle/{c['slug']}")
    return {"status": status}


@api.post("/rsvps/{rsvp_id}/approve")
async def approve_rsvp(rsvp_id: str, user=Depends(get_current_user)):
    return await _decide_rsvp(rsvp_id, user, True)


@api.post("/rsvps/{rsvp_id}/decline")
async def decline_rsvp(rsvp_id: str, user=Depends(get_current_user)):
    return await _decide_rsvp(rsvp_id, user, False)


@api.get("/organize/circles")
async def my_circles(user=Depends(get_current_user)):
    out = []
    async for c in db.circles.find({"organizer_user_id": user["user_id"]}, {"_id": 0}):
        nm = await next_meeting_for(c["id"])
        pending = await db.rsvps.count_documents({"circle_id": c["id"], "status": "pending"})
        meetings = await db.meetings.find({"circle_id": c["id"]}, {"_id": 0}).sort("start_at", 1).to_list(50)
        brief = circle_brief(c, nm)
        brief["pending_count"] = pending
        brief["meetings"] = [meeting_brief(m, reveal=True) for m in meetings if temporal(m["start_at"])]
        out.append(brief)
    return {"circles": out}


# ----------------------- resources -----------------------
@api.get("/resources")
async def list_resources(tag: str | None = None, q: str | None = None, city: str | None = None):
    query: dict = {"status": "approved"}
    if tag:
        query["tag"] = tag
    if city:
        query["city"] = {"$regex": f"^{city}$", "$options": "i"}
    if q:
        query["$or"] = [{"name": {"$regex": q, "$options": "i"}}, {"summary": {"$regex": q, "$options": "i"}}]
    resources = await db.resources.find(query, {"_id": 0}).sort("name", 1).to_list(200)
    return {"resources": resources}


@api.post("/resources")
async def submit_resource(body: ResourceIn, user=Depends(get_current_user)):
    doc = {"id": uuid.uuid4().hex, "status": "pending", "submitted_by": user["user_id"],
           "created_at": iso(now_utc()), **body.model_dump()}
    await db.resources.insert_one(doc)
    return {"ok": True, "status": "pending"}


@api.get("/resources/pending")
async def pending_resources(user=Depends(require_moderator)):
    resources = await db.resources.find({"status": "pending"}, {"_id": 0}).to_list(200)
    return {"resources": resources}


@api.post("/resources/{resource_id}/moderate")
async def moderate_resource(resource_id: str, body: ModerateIn, user=Depends(require_moderator)):
    status = "approved" if body.action == "approve" else "rejected"
    r = await db.resources.update_one({"id": resource_id}, {"$set": {"status": status}})
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail="Resource not found")
    return {"status": status}


# ----------------------- notifications -----------------------
@api.get("/notifications")
async def list_notifications(user=Depends(get_current_user)):
    items = await db.notifications.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    unread = sum(1 for i in items if not i["read"])
    return {"notifications": items, "unread": unread}


@api.post("/notifications/{nid}/read")
async def read_notification(nid: str, user=Depends(get_current_user)):
    await db.notifications.update_one({"id": nid, "user_id": user["user_id"]}, {"$set": {"read": True}})
    return {"ok": True}


@api.post("/notifications/read-all")
async def read_all(user=Depends(get_current_user)):
    await db.notifications.update_many({"user_id": user["user_id"]}, {"$set": {"read": True}})
    return {"ok": True}


# ----------------------- payments (status only) -----------------------
@api.get("/payments/status")
async def payments():
    return payments_status()


app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
