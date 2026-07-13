"""End-to-end backend tests for Cultivate app.

Covers:
- config/health, field/locations/circles/meetings
- auth: register/login/me/logout
- RSVP flow: request -> notify -> approve -> reveal exact location
- Organizer: circle create + schedule meeting + list w/ pending_count
- Calendar: ICS + Google URL, exact location reveal gating
- Resources: list/filter/submit/moderate
- Notifications: list/read/read-all
- Payments status stub
"""
import os
import uuid
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL") or open("/app/frontend/.env").read().split("REACT_APP_BACKEND_URL=")[1].split("\n")[0].strip()
BASE_URL = BASE_URL.rstrip("/")
API = f"{BASE_URL}/api"

PASSWORD = "Cultivate123!"
ORG_EMAIL = "organizer@cultivatesf.org"
MEMBER_EMAIL = "member@cultivatesf.org"
ADMIN_EMAIL = "admin@cultivatesf.org"


# ---------- fixtures ----------
@pytest.fixture(scope="session")
def s():
    return requests.Session()


def _login(email, password=PASSWORD):
    r = requests.post(f"{API}/auth/login", json={"email": email, "password": password}, timeout=15)
    assert r.status_code == 200, f"login failed for {email}: {r.status_code} {r.text}"
    return r.json()["session_token"]


@pytest.fixture(scope="session")
def org_token():
    return _login(ORG_EMAIL)


@pytest.fixture(scope="session")
def member_token():
    return _login(MEMBER_EMAIL)


@pytest.fixture(scope="session")
def admin_token():
    return _login(ADMIN_EMAIL)


def h(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# ---------- config / discovery ----------
class TestConfig:
    def test_root(self):
        r = requests.get(f"{API}/")
        assert r.status_code == 200
        assert r.json().get("ok") is True

    def test_config(self):
        r = requests.get(f"{API}/config")
        assert r.status_code == 200
        d = r.json()
        assert "brand" in d and "region" in d and "formats" in d and "payments" in d
        assert d["payments"]["enabled"] is False

    def test_payments_status(self):
        r = requests.get(f"{API}/payments/status")
        assert r.status_code == 200
        assert r.json()["enabled"] is False


class TestField:
    def test_field(self):
        r = requests.get(f"{API}/field")
        assert r.status_code == 200
        data = r.json()
        assert "locations" in data
        labels = {l["label"] for l in data["locations"]}
        # Seeded circles cover these
        for expected in ["Santa Fe", "Albuquerque", "Taos", "Online"]:
            assert expected in labels, f"missing location {expected}"
        santa = next(l for l in data["locations"] if l["label"] == "Santa Fe")
        assert santa["group_count"] >= 3

    def test_location_santa_fe(self):
        r = requests.get(f"{API}/locations/Santa%20Fe")
        assert r.status_code == 200
        d = r.json()
        assert d["label"] == "Santa Fe"
        assert len(d["circles"]) >= 3
        assert isinstance(d["resources"], list)

    def test_list_circles(self):
        r = requests.get(f"{API}/circles")
        assert r.status_code == 200
        circles = r.json()["circles"]
        slugs = {c["slug"] for c in circles}
        assert "riverbed-circle" in slugs

    def test_circle_detail_public(self):
        r = requests.get(f"{API}/circles/riverbed-circle")
        assert r.status_code == 200
        d = r.json()
        assert d["slug"] == "riverbed-circle"
        assert d["name"] == "Riverbed Circle"
        # public shouldn't see exact location
        for m in d["meetings"]:
            assert m["exact_location"] is None
            assert m["my_rsvp"] is None

    def test_meetings_upcoming(self):
        r = requests.get(f"{API}/meetings/upcoming")
        assert r.status_code == 200
        ms = r.json()["meetings"]
        assert len(ms) >= 1
        assert "circle_slug" in ms[0]


# ---------- auth ----------
class TestAuth:
    def test_login_organizer(self, org_token):
        assert isinstance(org_token, str) and len(org_token) > 10

    def test_login_bad_password(self):
        r = requests.post(f"{API}/auth/login", json={"email": ORG_EMAIL, "password": "wrongpass"})
        assert r.status_code == 401

    def test_me(self, member_token):
        r = requests.get(f"{API}/auth/me", headers=h(member_token))
        assert r.status_code == 200
        u = r.json()
        assert u["email"] == MEMBER_EMAIL
        assert "member" in u["roles"]

    def test_me_unauth(self):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_register_and_logout(self):
        email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        r = requests.post(f"{API}/auth/register", json={"name": "Test User", "email": email, "password": PASSWORD})
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["user"]["email"] == email
        tok = d["session_token"]
        # me check
        r = requests.get(f"{API}/auth/me", headers=h(tok))
        assert r.status_code == 200
        # duplicate register
        r2 = requests.post(f"{API}/auth/register", json={"name": "Test User", "email": email, "password": PASSWORD})
        assert r2.status_code == 409

    def test_admin_moderator_role(self, admin_token):
        r = requests.get(f"{API}/auth/me", headers=h(admin_token))
        assert r.status_code == 200
        u = r.json()
        assert "moderator" in u["roles"]


# ---------- RSVP full flow ----------
@pytest.fixture(scope="session")
def riverbed_meeting_id():
    r = requests.get(f"{API}/circles/riverbed-circle")
    assert r.status_code == 200
    ms = r.json()["meetings"]
    assert len(ms) >= 1
    return ms[0]["id"]


class TestRsvpFlow:
    _rsvp_id = None

    def test_00_pre_state_public(self, riverbed_meeting_id):
        r = requests.get(f"{API}/circles/riverbed-circle")
        assert r.status_code == 200
        m = next(m for m in r.json()["meetings"] if m["id"] == riverbed_meeting_id)
        assert m["exact_location"] is None

    def test_01_member_rsvp_pending(self, member_token, riverbed_meeting_id):
        r = requests.post(f"{API}/meetings/{riverbed_meeting_id}/rsvp", headers=h(member_token))
        assert r.status_code == 200
        assert r.json()["status"] == "pending"
        # member's circle view still hides exact location
        r2 = requests.get(f"{API}/circles/riverbed-circle", headers=h(member_token))
        assert r2.status_code == 200
        m = next(m for m in r2.json()["meetings"] if m["id"] == riverbed_meeting_id)
        assert m["my_rsvp"] == "pending"
        assert m["exact_location"] is None

    def test_02_organizer_sees_pending_notification(self, org_token):
        r = requests.get(f"{API}/notifications", headers=h(org_token))
        assert r.status_code == 200
        types = [n["type"] for n in r.json()["notifications"]]
        assert "new_rsvp" in types

    def test_03_organizer_lists_rsvps(self, org_token):
        r = requests.get(f"{API}/circles/riverbed-circle/rsvps", headers=h(org_token))
        assert r.status_code == 200
        reqs = r.json()["requests"]
        pending = [x for x in reqs if x["status"] == "pending" and x["user_email"] == MEMBER_EMAIL]
        assert len(pending) >= 1
        TestRsvpFlow._rsvp_id = pending[0]["id"]

    def test_04_approve_rsvp(self, org_token):
        assert TestRsvpFlow._rsvp_id
        # capture seats before
        r0 = requests.get(f"{API}/organize/circles", headers=h(org_token))
        assert r0.status_code == 200
        riverbed = next(c for c in r0.json()["circles"] if c["slug"] == "riverbed-circle")
        before_seats = None
        for m in riverbed["meetings"]:
            before_seats = m["seats_left"]
            break

        r = requests.post(f"{API}/rsvps/{TestRsvpFlow._rsvp_id}/approve", headers=h(org_token))
        assert r.status_code == 200, r.text
        assert r.json()["status"] == "approved"

        # member notification
        r2 = requests.get(f"{API}/notifications", headers=h(_login(MEMBER_EMAIL)))
        assert r2.status_code == 200
        types = [n["type"] for n in r2.json()["notifications"]]
        assert "rsvp_status" in types

    def test_05_member_sees_exact_location(self, member_token, riverbed_meeting_id):
        r = requests.get(f"{API}/circles/riverbed-circle", headers=h(member_token))
        assert r.status_code == 200
        m = next(m for m in r.json()["meetings"] if m["id"] == riverbed_meeting_id)
        assert m["my_rsvp"] == "approved"
        assert m["exact_location"] is not None and len(m["exact_location"]) > 0

    def test_06_duplicate_rsvp_is_idempotent(self, member_token, riverbed_meeting_id):
        r = requests.post(f"{API}/meetings/{riverbed_meeting_id}/rsvp", headers=h(member_token))
        assert r.status_code == 200
        assert r.json()["status"] == "approved"


# ---------- Organizer create circle + schedule meeting ----------
class TestOrganizer:
    _slug = None
    _meeting_id = None

    def test_create_circle(self, org_token):
        name = f"TEST Integration Hub {uuid.uuid4().hex[:6]}"
        payload = {
            "name": name, "city": "Santa Fe", "state": "NM", "kind": "local",
            "format": "sharing-circle", "cadence": "Monthly", "capacity": 10,
            "summary": "test", "description": ["a"], "agreements": ["b"],
            "host_name": "Marisol V.", "host_note": "note",
        }
        r = requests.post(f"{API}/circles", json=payload, headers=h(org_token))
        assert r.status_code == 200, r.text
        d = r.json()
        assert "slug" in d
        TestOrganizer._slug = d["slug"]

    def test_schedule_meeting(self, org_token):
        assert TestOrganizer._slug
        # 3 days from now
        from datetime import datetime, timezone, timedelta
        start = (datetime.now(timezone.utc) + timedelta(days=4)).replace(microsecond=0).isoformat()
        payload = {
            "start_at": start, "date_label": "Test date", "time_label": "7pm",
            "general_location": "Santa Fe", "exact_location": "314 Read St", "capacity": 8,
        }
        r = requests.post(f"{API}/circles/{TestOrganizer._slug}/meetings", json=payload, headers=h(org_token))
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["exact_location"] == "314 Read St"  # organizer reveal
        TestOrganizer._meeting_id = d["id"]

    def test_organize_list(self, org_token):
        r = requests.get(f"{API}/organize/circles", headers=h(org_token))
        assert r.status_code == 200
        circles = r.json()["circles"]
        assert any(c["slug"] == TestOrganizer._slug for c in circles)
        # ensure pending_count is present
        for c in circles:
            assert "pending_count" in c

    def test_non_organizer_cannot_schedule(self, member_token):
        assert TestOrganizer._slug
        from datetime import datetime, timezone, timedelta
        start = (datetime.now(timezone.utc) + timedelta(days=5)).isoformat()
        r = requests.post(f"{API}/circles/{TestOrganizer._slug}/meetings",
                          json={"start_at": start, "general_location": "x", "exact_location": "y", "capacity": 5},
                          headers=h(member_token))
        assert r.status_code == 403


# ---------- Calendar ----------
class TestCalendar:
    def test_ics_public_hides_exact(self, riverbed_meeting_id):
        r = requests.get(f"{API}/meetings/{riverbed_meeting_id}/ics")
        assert r.status_code == 200
        assert "text/calendar" in r.headers.get("content-type", "")
        text = r.text
        assert "BEGIN:VCALENDAR" in text
        assert "314 Read St" not in text  # exact hidden

    def test_ics_reveal_for_approved(self, member_token, riverbed_meeting_id):
        r = requests.get(f"{API}/meetings/{riverbed_meeting_id}/ics", headers=h(member_token))
        assert r.status_code == 200
        assert "314 Read St" in r.text

    def test_google_url(self, riverbed_meeting_id):
        r = requests.get(f"{API}/meetings/{riverbed_meeting_id}/google")
        assert r.status_code == 200
        assert "calendar.google.com" in r.json()["url"]


# ---------- Resources ----------
class TestResources:
    _pending_id = None

    def test_list_resources(self):
        r = requests.get(f"{API}/resources")
        assert r.status_code == 200
        assert len(r.json()["resources"]) >= 1

    def test_filter_national(self):
        r = requests.get(f"{API}/resources", params={"tag": "national"})
        assert r.status_code == 200
        for res in r.json()["resources"]:
            assert res["tag"] == "national"

    def test_submit_resource(self, member_token):
        payload = {"name": f"TEST resource {uuid.uuid4().hex[:6]}", "category": "resource",
                   "summary": "hello", "url": "https://ex.com", "tag": "national", "city": "", "state": ""}
        r = requests.post(f"{API}/resources", json=payload, headers=h(member_token))
        assert r.status_code == 200
        assert r.json()["status"] == "pending"

    def test_pending_requires_moderator(self, member_token):
        r = requests.get(f"{API}/resources/pending", headers=h(member_token))
        assert r.status_code == 403

    def test_moderator_lists_and_approves(self, admin_token):
        r = requests.get(f"{API}/resources/pending", headers=h(admin_token))
        assert r.status_code == 200
        items = r.json()["resources"]
        assert len(items) >= 1
        rid = items[0]["id"]
        r2 = requests.post(f"{API}/resources/{rid}/moderate", json={"action": "approve"}, headers=h(admin_token))
        assert r2.status_code == 200
        assert r2.json()["status"] == "approved"


# ---------- Notifications ----------
class TestNotifications:
    def test_list_notifications(self, member_token):
        r = requests.get(f"{API}/notifications", headers=h(member_token))
        assert r.status_code == 200
        d = r.json()
        assert "notifications" in d
        assert "unread" in d

    def test_read_all(self, member_token):
        r = requests.post(f"{API}/notifications/read-all", headers=h(member_token))
        assert r.status_code == 200
        r2 = requests.get(f"{API}/notifications", headers=h(member_token))
        assert r2.json()["unread"] == 0
