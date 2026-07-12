from fastapi import APIRouter, Depends

from db import db
from security import get_current_user

router = APIRouter(prefix="/api")


@router.get("/notifications")
async def list_notifications(user=Depends(get_current_user)):
    items = await db.notifications.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    unread = sum(1 for i in items if not i["read"])
    return {"notifications": items, "unread": unread}


@router.post("/notifications/{nid}/read")
async def read_notification(nid: str, user=Depends(get_current_user)):
    await db.notifications.update_one({"id": nid, "user_id": user["user_id"]}, {"$set": {"read": True}})
    return {"ok": True}


@router.post("/notifications/read-all")
async def read_all(user=Depends(get_current_user)):
    await db.notifications.update_many({"user_id": user["user_id"]}, {"$set": {"read": True}})
    return {"ok": True}
