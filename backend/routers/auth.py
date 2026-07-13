from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
import httpx

from db import db, now_utc, iso
from models import RegisterIn, LoginIn, SessionIn
from security import (
    hash_password, verify_password, new_user_id, create_session,
    set_session_cookie, get_current_user,
)
from common import public_user, EMERGENT_AUTH_SESSION_URL

router = APIRouter(prefix="/api")


@router.post("/auth/register")
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


@router.post("/auth/login")
async def login(body: LoginIn):
    user = await db.users.find_one({"email": body.email.lower()})
    if not user or not user.get("password_hash") or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")
    token = await create_session(user["user_id"])
    resp = JSONResponse({"user": public_user(user), "session_token": token})
    set_session_cookie(resp, token)
    return resp


@router.post("/auth/session")
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
                  "expires_at": now_utc() + timedelta(days=7), "created_at": now_utc()}},
        upsert=True,
    )
    resp = JSONResponse({"user": public_user(user), "session_token": token})
    set_session_cookie(resp, token)
    return resp


@router.get("/auth/me")
async def me(user=Depends(get_current_user)):
    return public_user(user)


@router.post("/auth/logout")
async def logout(request: Request):
    token = request.cookies.get("session_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:].strip()
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    resp = JSONResponse({"ok": True})
    resp.delete_cookie("session_token", path="/")
    return resp
