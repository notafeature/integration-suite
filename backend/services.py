"""Swappable notification + payment layer.

Email has a provider interface so a real provider (Resend) can replace the
mock logger by setting EMAIL_PROVIDER=resend and RESEND_API_KEY.
Payments are architected as a provider registry that is intentionally empty:
a provider can be registered later without touching call sites.
"""
import os
import uuid
import logging

import httpx

from db import db, now_utc, iso, parse_dt

logger = logging.getLogger("cultivate.notify")

EMAIL_PROVIDER = os.environ.get("EMAIL_PROVIDER", "mock")
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
EMAIL_FROM = os.environ.get("EMAIL_FROM", "Cultivate <onboarding@resend.dev>")


async def send_email(to: str, subject: str, html: str) -> bool:
    if EMAIL_PROVIDER == "resend" and RESEND_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=15) as c:
                r = await c.post(
                    "https://api.resend.com/emails",
                    headers={"Authorization": f"Bearer {RESEND_API_KEY}"},
                    json={"from": EMAIL_FROM, "to": [to], "subject": subject, "html": html},
                )
                r.raise_for_status()
                return True
        except Exception as exc:  # noqa: BLE001
            logger.warning("resend send failed: %s", exc)
            return False
    logger.info("[email:mock] to=%s | %s", to, subject)
    return True


async def notify(user_id: str, ntype: str, title: str, body: str, link: str | None = None, meta: dict | None = None):
    """Create an in-app notification and dispatch an email."""
    doc = {
        "id": uuid.uuid4().hex,
        "user_id": user_id,
        "type": ntype,
        "title": title,
        "body": body,
        "link": link,
        "meta": meta or {},
        "read": False,
        "created_at": iso(now_utc()),
    }
    await db.notifications.insert_one(doc)
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "email": 1})
    if user and user.get("email"):
        html = f"<h2 style='font-family:Georgia,serif'>{title}</h2><p style='font-family:sans-serif'>{body}</p>"
        await send_email(user["email"], title, html)
    doc.pop("_id", None)
    return doc


# ---------- Payments (architectural stub) ----------
class PaymentProvider:
    name = "base"

    async def create_checkout(self, **kwargs):
        raise NotImplementedError


_PAYMENT_PROVIDERS: dict[str, PaymentProvider] = {}


def register_payment_provider(name: str, provider: PaymentProvider):
    _PAYMENT_PROVIDERS[name] = provider


def get_payment_provider() -> PaymentProvider | None:
    name = os.environ.get("PAYMENT_PROVIDER", "").strip()
    return _PAYMENT_PROVIDERS.get(name) if name else None


def payments_status() -> dict:
    provider = os.environ.get("PAYMENT_PROVIDER", "").strip() or None
    return {"enabled": bool(get_payment_provider()), "provider": provider}


# ---------- Calendar ----------
def _ics_dt(value) -> str:
    return parse_dt(value).strftime("%Y%m%dT%H%M%SZ")


def build_ics(meeting: dict, circle: dict, reveal: bool) -> str:
    location = meeting.get("exact_location") if reveal else meeting.get("general_location", "")
    location = location or meeting.get("general_location", "")
    summary = f"{circle.get('name', 'Integration circle')}"
    desc = circle.get("summary", "")
    if not reveal:
        desc += " — Exact location shared with approved members."
    uid = f"{meeting['id']}@cultivate"
    end = meeting.get("end_at") or meeting["start_at"]
    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Cultivate//Integration Circles//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        f"UID:{uid}",
        f"DTSTAMP:{_ics_dt(now_utc())}",
        f"DTSTART:{_ics_dt(meeting['start_at'])}",
        f"DTEND:{_ics_dt(end)}",
        f"SUMMARY:{summary}",
        f"DESCRIPTION:{desc}",
        f"LOCATION:{location}",
        "END:VEVENT",
        "END:VCALENDAR",
    ]
    return "\r\n".join(lines)


def google_calendar_url(meeting: dict, circle: dict, reveal: bool) -> str:
    from urllib.parse import urlencode
    location = (meeting.get("exact_location") if reveal else meeting.get("general_location")) or ""
    end = meeting.get("end_at") or meeting["start_at"]
    dates = f"{_ics_dt(meeting['start_at'])}/{_ics_dt(end)}"
    params = {
        "action": "TEMPLATE",
        "text": circle.get("name", "Integration circle"),
        "dates": dates,
        "details": circle.get("summary", ""),
        "location": location,
    }
    return "https://calendar.google.com/calendar/render?" + urlencode(params)
