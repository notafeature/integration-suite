import uuid

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse

from db import db, now_utc, iso, temporal, parse_dt
from models import MeetingIn, MeetingUpdateIn
from security import get_current_user, get_optional_user
from services import notify, build_ics, google_calendar_url
from common import meeting_brief, get_circle_for_meeting

router = APIRouter(prefix="/api")


@router.get("/meetings/upcoming")
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


@router.post("/circles/{slug}/meetings")
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


@router.patch("/meetings/{meeting_id}")
async def update_meeting(meeting_id: str, body: MeetingUpdateIn, user=Depends(get_current_user)):
    m = await db.meetings.find_one({"id": meeting_id}, {"_id": 0})
    if not m:
        raise HTTPException(status_code=404, detail="Meeting not found")
    c = await get_circle_for_meeting(m)
    if not c or c.get("organizer_user_id") != user["user_id"]:
        raise HTTPException(status_code=403, detail="Only the organizer can edit this meeting.")
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if updates:
        await db.meetings.update_one({"id": meeting_id}, {"$set": updates})
    async for rv in db.rsvps.find({"meeting_id": meeting_id, "status": "approved"}, {"_id": 0}):
        await notify(rv["user_id"], "schedule_change", f"Schedule changed — {c['name']}",
                     "The organizer updated the details for a meeting you're attending.",
                     link=f"/circle/{c['slug']}")
    return {"ok": True}


async def _reveal_for(meeting_id, m, c, user) -> bool:
    if not user:
        return False
    rv = await db.rsvps.find_one({"meeting_id": meeting_id, "user_id": user["user_id"]}, {"_id": 0})
    return (rv and rv["status"] == "approved") or c.get("organizer_user_id") == user["user_id"]


@router.get("/meetings/{meeting_id}/ics")
async def meeting_ics(meeting_id: str, user=Depends(get_optional_user)):
    m = await db.meetings.find_one({"id": meeting_id}, {"_id": 0})
    if not m:
        raise HTTPException(status_code=404, detail="Meeting not found")
    c = await get_circle_for_meeting(m)
    reveal = await _reveal_for(meeting_id, m, c, user)
    ics = build_ics(m, c, reveal)
    return PlainTextResponse(ics, media_type="text/calendar",
                             headers={"Content-Disposition": f'attachment; filename="{c["slug"]}.ics"'})


@router.get("/meetings/{meeting_id}/google")
async def meeting_google(meeting_id: str, user=Depends(get_optional_user)):
    m = await db.meetings.find_one({"id": meeting_id}, {"_id": 0})
    if not m:
        raise HTTPException(status_code=404, detail="Meeting not found")
    c = await get_circle_for_meeting(m)
    reveal = await _reveal_for(meeting_id, m, c, user)
    return {"url": google_calendar_url(m, c, reveal)}
