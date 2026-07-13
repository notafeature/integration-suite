import uuid

from fastapi import APIRouter, Depends, HTTPException

from db import db, now_utc, iso, temporal
from security import get_current_user
from services import notify
from common import meeting_brief, circle_brief, next_meeting_for, get_circle_for_meeting

router = APIRouter(prefix="/api")


@router.post("/meetings/{meeting_id}/rsvp")
async def rsvp(meeting_id: str, user=Depends(get_current_user)):
    m = await db.meetings.find_one({"id": meeting_id}, {"_id": 0})
    if not m:
        raise HTTPException(status_code=404, detail="Meeting not found")
    c = await get_circle_for_meeting(m)
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
    await notify(c["organizer_user_id"], "new_rsvp", f"New request to join — {c['name']}",
                 f"{user['name']} asked to join your meeting. Approve to share the details.", link="/organize")
    return {"status": "pending"}


@router.get("/rsvps/mine")
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


@router.get("/circles/{slug}/rsvps")
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
                     link=f"/circle/{c['slug']}", meta={"decision": "approved"})
    else:
        await notify(rv["user_id"], "rsvp_status", f"Update on your request — {c['name']}",
                     "The organizer couldn't confirm your seat this time. You're welcome to request another meeting.",
                     link=f"/circle/{c['slug']}", meta={"decision": "declined"})
    return {"status": status}


@router.post("/rsvps/{rsvp_id}/approve")
async def approve_rsvp(rsvp_id: str, user=Depends(get_current_user)):
    return await _decide_rsvp(rsvp_id, user, True)


@router.post("/rsvps/{rsvp_id}/decline")
async def decline_rsvp(rsvp_id: str, user=Depends(get_current_user)):
    return await _decide_rsvp(rsvp_id, user, False)


@router.get("/organize/circles")
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
