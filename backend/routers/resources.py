import uuid

from fastapi import APIRouter, Depends, HTTPException

from db import db, now_utc, iso
from models import ResourceIn, ModerateIn
from security import get_current_user, require_moderator

router = APIRouter(prefix="/api")


@router.get("/resources")
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


@router.post("/resources")
async def submit_resource(body: ResourceIn, user=Depends(get_current_user)):
    doc = {"id": uuid.uuid4().hex, "status": "pending", "submitted_by": user["user_id"],
           "created_at": iso(now_utc()), **body.model_dump()}
    await db.resources.insert_one(doc)
    return {"ok": True, "status": "pending"}


@router.get("/resources/pending")
async def pending_resources(user=Depends(require_moderator)):
    resources = await db.resources.find({"status": "pending"}, {"_id": 0}).to_list(200)
    return {"resources": resources}


@router.post("/resources/{resource_id}/moderate")
async def moderate_resource(resource_id: str, body: ModerateIn, user=Depends(require_moderator)):
    status = "approved" if body.action == "approve" else "rejected"
    r = await db.resources.update_one({"id": resource_id}, {"$set": {"status": status}})
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail="Resource not found")
    return {"status": status}
