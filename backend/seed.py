import uuid
from datetime import timedelta

from db import db, now_utc, iso, slugify
from security import hash_password, new_user_id

FORMAT_LABELS = {
    "sharing-circle": "Sharing circle",
    "peer-support": "Peer support",
    "somatic": "Somatic practice",
    "art-making": "Art-making",
    "walking": "Walking group",
    "dialogue": "Dialogue circle",
}


async def _user(email, name, roles, password="Cultivate123!"):
    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        return existing["user_id"]
    uid = new_user_id()
    await db.users.insert_one({
        "user_id": uid,
        "email": email,
        "name": name,
        "picture": "",
        "roles": roles,
        "auth_provider": "password",
        "password_hash": hash_password(password),
        "created_at": iso(now_utc()),
    })
    return uid


async def seed():
    if await db.circles.count_documents({}) > 0:
        return

    organizer = await _user("organizer@cultivatesf.org", "Marisol V.", ["organizer", "member"])
    await _user("member@cultivatesf.org", "Sam R.", ["member"])
    await _user("admin@cultivatesf.org", "Directory Steward", ["moderator", "member"])

    now = now_utc()

    def meeting(circle_id, slug, days, hour, dur, gloc, exact, cap, seats):
        start = (now + timedelta(days=days)).replace(hour=hour, minute=0, second=0, microsecond=0)
        end = start + timedelta(hours=dur)
        return {
            "id": uuid.uuid4().hex,
            "circle_id": circle_id,
            "circle_slug": slug,
            "start_at": iso(start),
            "end_at": iso(end),
            "date_label": start.strftime("%A, %B %-d"),
            "time_label": f"{start.strftime('%-I:%M %p')} – {end.strftime('%-I:%M %p')} MT",
            "general_location": gloc,
            "exact_location": exact,
            "capacity": cap,
            "seats_left": seats,
            "created_at": iso(now),
        }

    circles = [
        {
            "name": "Riverbed Circle", "city": "Santa Fe", "state": "NM", "kind": "local",
            "format": "sharing-circle", "cadence": "Twice monthly · Tuesday evenings", "capacity": 12,
            "established": "2024",
            "summary": "A candlelit sharing circle for people making sense of recent journeys. Structured rounds, no crosstalk, strong confidentiality culture.",
            "description": [
                "Riverbed is the longest-running circle on the platform. Each meeting opens with ten minutes of quiet, then two structured rounds of speaking — one for what happened, one for what it's asking of you now.",
                "The circle is format-strict on purpose: no advice, no interpretation of anyone else's experience, no crosstalk.",
            ],
            "agreements": [
                "What's shared in the circle stays in the circle.",
                "Speak from your own experience; no advising or interpreting for others.",
                "Arrive sober. This is integration space, not journey space.",
                "No sourcing, referrals, or facilitation talk — ever.",
            ],
            "host_name": "Marisol V.", "host_note": "Hospice worker and longtime circle-keeper. Trained in restorative-justice facilitation.",
            "_meetings": [(2, 19, 2, "Railyard district, Santa Fe", "The Common, 314 Read St, Santa Fe", 12, 3),
                          (16, 19, 2, "Railyard district, Santa Fe", "The Common, 314 Read St, Santa Fe", 12, 9)],
        },
        {
            "name": "High Desert Walkers", "city": "Santa Fe", "state": "NM", "kind": "local",
            "format": "walking", "cadence": "Weekly · Saturday mornings", "capacity": 10, "established": "2025",
            "summary": "Integration on foot. A slow shared walk in the foothills, paired conversation, and coffee after for anyone who wants to keep talking.",
            "description": [
                "Some things are easier to say shoulder-to-shoulder than face-to-face. The Walkers meet at a trailhead, walk slowly for about ninety minutes in rotating pairs, and finish with optional coffee in town.",
                "Good fit for people who find seated circles intense, or who process better in motion.",
            ],
            "agreements": [
                "Your walking partner's story is theirs, not yours to retell.",
                "Anyone can walk in silence — just say so at the trailhead.",
                "Stay with the group; this is a social walk, not a hike.",
            ],
            "host_name": "Deshawn R.", "host_note": "Former wilderness-therapy guide. Keeps the pace gentle and the pairs rotating.",
            "_meetings": [(5, 8, 2, "Dale Ball trails, Santa Fe foothills", "Dale Ball north trailhead parking", 10, 4)],
        },
        {
            "name": "Clay & Ash", "city": "Santa Fe", "state": "NM", "kind": "local",
            "format": "art-making", "cadence": "Monthly · First Sunday", "capacity": 8, "established": "2025",
            "summary": "A studio session for working with what words can't reach — clay, ink, charcoal. No art experience needed, no critique, ever.",
            "description": [
                "Clay & Ash meets in a working ceramics studio. Each session starts with a short prompt drawn from the group, then two hours of quiet making. Sharing at the end is invited, never required.",
                "The point isn't the object. It's giving the experience a shape your hands can hold.",
            ],
            "agreements": ["No critique — of your own work included.", "Silence during making time.", "Take your piece home or leave it for the kiln; both are fine."],
            "host_name": "June K.", "host_note": "Studio potter. Runs the space, fires anything you want to keep.",
            "_meetings": [(12, 13, 3, "Baca Street studios, Santa Fe", "Baca Street Studios, 1512 Pacheco St", 8, 2)],
        },
        {
            "name": "Sandia Peer Circle", "city": "Albuquerque", "state": "NM", "kind": "local",
            "format": "peer-support", "cadence": "Weekly · Thursday evenings", "capacity": 14, "established": "2025",
            "summary": "A drop-in-friendly peer support group with a rotating facilitator bench. Practical, plain-spoken, and consistent — same room every week.",
            "description": [
                "Sandia runs on consistency: same room, same time, every week. The facilitation rotates among four trained peers so the group never depends on one person.",
                "Discussion is topical — sleep, relationships, meaning, the fade of insights over time — with open floor in the second hour.",
            ],
            "agreements": ["Confidentiality, always.", "Peer support is not therapy; we say so out loud at every meeting.", "Crisis needs go to professionals — facilitators keep a referral list."],
            "host_name": "The Sandia bench", "host_note": "Four rotating peer facilitators, each with 50+ hours of peer-support training.",
            "_meetings": [(3, 18, 2, "Nob Hill, Albuquerque", "First Unitarian, 3701 Carlisle Blvd NE", 14, 6)],
        },
        {
            "name": "Rio Grande Somatics", "city": "Taos", "state": "NM", "kind": "local",
            "format": "somatic", "cadence": "Twice monthly · Sunday mornings", "capacity": 10, "established": "2026",
            "summary": "Body-first integration: breath, grounding, and slow movement for experiences that live below language.",
            "description": [
                "Some experiences settle in the body long before the mind catches up. This group works with breath, orientation, and slow movement practices drawn from trauma-aware somatic work.",
                "Sessions end with tea and unstructured time — many people say that's where the real conversation happens.",
            ],
            "agreements": ["Everything is invitational — opt out of any practice, no explanation needed.", "No touch without explicit, per-session consent.", "This is community practice, not treatment."],
            "host_name": "Ana Lucia P.", "host_note": "Somatic practitioner, 500-hour certification. Clear about the line between this work and therapy.",
            "_meetings": [(6, 9, 2, "Near Taos Plaza", "Taos Community Room, 120 Civic Plaza Dr", 10, 5)],
        },
        {
            "name": "Open Threshold (Online)", "city": "Online", "state": "", "kind": "online",
            "format": "dialogue", "cadence": "Weekly · Wednesday evenings", "capacity": 20, "established": "2025",
            "summary": "A video dialogue circle for people without a local group yet — reflective, quiet, and welcoming of all paths.",
            "description": [
                "Open Threshold exists so that geography isn't a barrier to integration. It keeps the same structure as an in-person circle: opening silence, rounds, closing.",
                "A good bridge while you look for — or start — a circle in your own city.",
            ],
            "agreements": ["Cameras on when you speak; confidentiality holds online too.", "One voice at a time.", "Peer support, not therapy."],
            "host_name": "Priya N.", "host_note": "Facilitates the online room and helps people find local circles.",
            "_meetings": [(1, 19, 1, "Video call", "Link shared with approved members", 20, 11)],
        },
    ]

    for c in circles:
        meetings = c.pop("_meetings")
        cid = uuid.uuid4().hex
        slug = slugify(c["name"])
        doc = {
            "id": cid, "slug": slug, "organizer_user_id": organizer,
            "created_at": iso(now), **c,
        }
        await db.circles.insert_one(doc)
        for (days, hour, dur, gloc, exact, cap, seats) in meetings:
            await db.meetings.insert_one(meeting(cid, slug, days, hour, dur, gloc, exact, cap, seats))

    resources = [
        {"name": "Elena Ruiz, LCSW", "category": "practitioner", "summary": "Integration therapy & trauma-informed care.", "url": "", "tag": "local", "city": "Santa Fe", "state": "NM"},
        {"name": "Heartwise Counseling", "category": "organization", "summary": "Peer support and referral network in Albuquerque.", "url": "", "tag": "local", "city": "Albuquerque", "state": "NM"},
        {"name": "Integration Guide", "category": "resource", "summary": "A practical, free guide for post-experience integration.", "url": "https://example.org/guide", "tag": "online", "city": "", "state": ""},
        {"name": "Chacruna Institute", "category": "organization", "summary": "Plant medicines education & community.", "url": "https://chacruna.net", "tag": "national", "city": "", "state": ""},
        {"name": "Fireside Project", "category": "organization", "summary": "Peer support line for difficult experiences and integration.", "url": "https://firesideproject.org", "tag": "national", "city": "", "state": ""},
    ]
    for r in resources:
        await db.resources.insert_one({
            "id": uuid.uuid4().hex, "status": "approved", "submitted_by": None,
            "created_at": iso(now), **r,
        })
    # one pending example for the moderation queue
    await db.resources.insert_one({
        "id": uuid.uuid4().hex, "status": "pending", "submitted_by": None, "created_at": iso(now),
        "name": "Northside Integration Collective", "category": "organization",
        "summary": "Community-run integration meetups (submitted for review).", "url": "",
        "tag": "local", "city": "Santa Fe", "state": "NM",
    })
