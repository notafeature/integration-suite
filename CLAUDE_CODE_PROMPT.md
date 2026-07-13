# Claude Code — Startup Prompt for "Cultivate Santa Fe"

> Paste this whole file as your opening context in Claude Code. It contains the
> product intent, the full design brief, the current build state, and the
> prioritized work that remains. The codebase already exists and runs.

---

## ⭐ DO THIS FIRST (owner's explicit, top-priority directions)
First tasks. Apply to the **rotating wordmark on BOTH sign-in and register**
(`frontend/src/components/RotatingBrand.jsx`):
1. **Slow down and PAUSE on each word**, then **continue** cycling (readable dwell
   on every word — not a one-shot blur that just lands).
2. Add **MORE words** (expand the C-word list).
3. On **hover + mouse-move, react to the SPEED of pointer movement** (faster move →
   faster cycling; slow/stop → settle).
4. **Mobile deferred** ("a different day's issue") — don't block on it.
5. **Owner is handling the hero personally** — coordinate, don't overwrite it.
Detail in §8A. Ordering is unambiguous: **wordmark behavior first.**

## 0) Your role
You are continuing an existing, working full-stack app. **Do not rebuild from
scratch and do not regress decisions marked APPROVED.** The scaffolding,
data model, auth, and core flows are done and tested. The remaining work is
mostly **design depth and a few features** (see §8). Read `HANDOFF.md`,
`PRD.md`, and `FUTURE_IDEAS.md` in the repo root first.

---

## 1) Product
A web app for organizing **in-person peer psychedelic-integration circles** —
community for making sense of an experience *after* it ends. First instance is
Santa Fe, NM (placeholder brand "Cultivate Santa Fe"; the brand may change, so
it must stay swappable). One codebase, **region-as-configuration**, open-source,
self-hostable, minimal ops.

### Hard boundaries (non-negotiable, enforce in product + copy)
- **Integration only.** Never provides, sources, or facilitates access to any
  substance. No exceptions. Groups that drift toward facilitation get removed.
- **Independent.** Operated by its own entity; deliberately unaffiliated with
  any psychedelic society/organization whose members use it.
- **In-person first.** Online circles exist only as a bridge for people without
  a local group.
- **Peer, not clinical.** Circles are community, not treatment; crisis → pros.

---

## 2) Functional requirements
1. **Groups ("circles").** Organizers create: name, city, meeting format,
   cadence, description, agreements, host. Visitors browse/search by location.
2. **Meetings & RSVP.** Organizers schedule (date/time/location). Members RSVP;
   organizer approves; **approved members receive the exact meeting details**
   (exact location hidden until approved).
3. **Notifications.** Email + in-app for RSVP status, meeting reminders,
   schedule changes.
4. **Calendar.** Meetings exportable as ICS and addable to Google Calendar.
5. **Resource directory.** Practitioners/orgs/resources tagged
   **local / national / online**, with **moderated submission** (vetting
   workflow to be specified later — build to support it, don't over-invent).
6. **Payments.** Required capability, currently unscoped. **Architect so a
   provider (e.g., Stripe) can be added without rework. Do NOT build checkout.**

### Architecture constraints
- One codebase; region/branding via config so anyone can deploy their own city.
- Public (logged-out) surface is minimal but exists: **find circles + view the
  resource directory**. Everything else behind accounts.
- Minimal ops — no infra that needs babysitting.
- Auth: **Google OAuth + email/password**, both supported. Social is the common path.
- "Needs a mobile app": build responsive web + PWA now; wrap native (Capacitor)
  later from the SAME codebase — do not fork into two codebases.

---

## 3) THE DESIGN PHILOSOPHY (this is the heart — treat as spec, not decoration)

This must NOT feel like a website decorated for psychedelic integration. It
should feel like a **living place people enter, orient within, and gradually
become connected to.** Central interaction model:

> **locate yourself → approach → enter a circle → become connected**

Communicate relationship through **space, proximity, line, scale, emergence,
movement, and restrained, meaningful color.** Do NOT default to a conventional
dashboard, card grid, map-pin interface, or SaaS component library. Calm,
human, spatial, quietly alive.

### Base environment
- Canvas **#FAFAF8** — dominant, close to neutral, almost empty at rest. **APPROVED — do not change.**
- Very dark charcoal primary text. Editorial serif for important language +
  restrained clean sans for functional info.

### Color must have behavior (phenomenological — APPROVED direction)
Color appears because something has **meaning or activity**, never assigned to
sections ("groups are blue"). Most of a screen may stay neutral.
- **Blue-grey (slate)** → orientation, proximity, navigation, info becoming visible.
- **Ochre / warm amber** → temporal presence; a meeting is approaching/soon.
- **Muted clay** → human action: hosting, joining, RSVP, contribution.
- **Restrained violet-grey** → reflection, dialogue, info emerging from a circle.
Color should guide attention subtly — the user should notice the *place* before
the design system. (User feedback: an earlier all-warm/terracotta+cream+soft-serif
pass looked like a common regurgitated site and was rejected; the current cooler
palette with color-as-meaning is APPROVED. Also rejected: stripping color to zero.)

### Homepage behaves like a FIELD (not feature cards)
Sparse spatial environment at rest. A few anchors visible (e.g. **Santa Fe,
Albuquerque, Taos, Online**) — not map pins, but areas of activity / points in a
larger living network. Sense that more exists than is shown; the system waits
for you to orient. A location search or "share location" may help, but it must
NOT feel like Google Maps.

### Proximity interaction
As the cursor approaches something, the field begins responding **before** a
direct hover: boundaries become legible, faint relationships surface, 2–3
circles emerge from neutral, connection lines appear near relevant points,
labels transition barely-present → readable. Effect: *the place notices your
attention.* No bouncing, no neon glow, nothing continuously moving. Calm at
rest; interaction awakens the relevant part of the field.

### Temporal behavior
Meetings create subtle evidence of time: a circle with a meeting soon carries a
restrained warm (ochre) signal near its boundary — a slight edge, a slowly
changing ring, a faint atmosphere. A meeting tomorrow should *feel* different
from a group with nothing scheduled, without a "UPCOMING" badge. Time lives in
the visual system.

### Entering a location
Don't route to a page of cards. The field **reorganizes**: the location becomes
the visual center, the wider network recedes, its circles become legible around
it. Distance/relationship communicate nearby vs active groups, cadence, upcoming
gatherings, online alternatives, local resources. Progressive disclosure — don't
expose every field/button at once.

### Entering a circle
The interface **reorganizes around the circle**: it becomes the center, the
field contracts, relevant info emerges in relationship to it — next meeting
(closest, immediate), cadence, format, organizer (as a human relationship, not a
user-management widget), description, availability, associated resources
(farther out until explored). Spatial hierarchy, NOT six equal dashboard
widgets. Communicate: *you are now inside this circle's context.*

### RSVP interaction (not a button + green toast)
The user is asking to become connected to a real gathering. A line extends from
the visitor toward the meeting; a gap closes; a mark joins the circle's edge.
While awaiting organizer approval the connection stays **visually incomplete**;
on approval it **completes** and private details unlock. Reinforce the real
logic: **request → pending relationship → accepted connection.** Keep plain,
accessible status language alongside the metaphor.

### Notifications
Feel connected to the user's participation, not a generic center. Prioritize
RSVP decision, meeting reminder, schedule change. Changes may appear as changes
in relationships already formed (e.g., a meeting line carrying a change signal
when its time changes). Still provide a readable notification history.

### Calendar
Google Calendar + ICS are functional actions — keep them extremely
understandable, do not over-design. Appear naturally after entering a meeting's
context or being approved.

### Resource directory
Part of the same world, not a separate database product. Resources may emerge
based on current location, circle context, and local/national/online relevance.
Full directory stays searchable/filterable. Support moderated submission in the
data model; don't invent a complex vetting process yet.

### Motion philosophy
Motion communicates proximity, emergence, relationship, time, and transitions
between context levels. **Nothing moves without a reason.** Prefer slow opacity
changes, slight spatial shifts, line emergence, density changes, subtle
re-centering. Responsive, not hyperactive. Think "a quiet environment revealing
itself as you pay attention," not "animated website."

### DO NOT create
generic wellness design · obvious psychedelic branding · rainbow gradients ·
glowing mushrooms · mystical sacred geometry · sage-and-lavender template ·
nonprofit/community-garden template · standard SaaS dashboard · feature-card
homepage · a hub with six equal boxes · excessive pills/rounded cards ·
fake AI features · gamification · engagement/time-on-site mechanics.
**Be confident enough to be quiet.**

---

## 4) Color & type — current APPROVED values
CSS-variable channels in `frontend/src/index.css` (mapped in `tailwind.config.js`
with `<alpha-value>`). Two presets, toggle persists in localStorage; canvas #FAFAF8.

Default preset `field` (approved — user said "these are great colors, stay in that"):
```
--c-canvas 250 250 248 | --c-ink 23 24 26 | --c-ink-soft 96 97 104 | --c-line 227 226 221
--c-orient 104 122 148 | --c-orient-deep 66 82 106     (slate — orientation)
--c-amber 197 137 66  | --c-amber-deep 158 104 40      (ochre — temporal)
--c-clay 173 74 40    | --c-clay-deep 128 52 26        (clay — human action)
--c-violet 132 124 152| --c-violet-deep 100 92 120     (violet — reflection)
```
`warm` preset exists as an A/B (warmer paper/ink). Type: **Newsreader** (display
serif) + **Instrument Sans** (UI). User likes the current colors and the
"slightly differing" word colors effect — keep that.

---

## 5) Aesthetic reference the owner loves (build toward this)
A **high-desert watercolor** band: soft dawn/dusk watercolor horizon in warm
neutrals, fine hand-drawn **botanical line art** (dried seed-heads / chamisa /
dandelion-like sprigs), a centered **italic serif quote** e.g.
*"Healing happens in relationship. Integration happens in community."* with a
small **chevron/arrow divider (»»»)**. Low-contrast, must not fight #FAFAF8, text
fully legible. Intended as a full-width band above the footer (and possibly a
hero atmosphere). This is the emotional register to expand across the site.

---

## 6) Current build state (what EXISTS and works)
Stack: **React (CRA) `/app/frontend` :3000** + **FastAPI `/app/backend` :8001
(all routes `/api`)** + **MongoDB**. Supervisor-managed, hot-reload.

Built & verified (35/35 backend tests; core UI flows checked):
- Spatial field homepage (field → location → circle, proximity reveal, temporal
  ochre rings, RSVP-as-connection line, compact mobile fallback) — `pages/Home.jsx`.
- Circles: browse/search/detail/create. Meetings: schedule. RSVP:
  request → approve/decline → exact location revealed to approved.
- Notifications (in-app center + unread badge; email dispatch mocked/logged).
- Calendar: ICS download + Google Calendar link (gated by approval).
- Resource directory: public, tag filter, moderated submission + queue.
- Auth: **Bearer-token** (email/password + Google OAuth). NOTE: frontend uses
  Bearer only (not cookies) because the preview ingress rewrites CORS
  `Allow-Origin` to `*`, which browsers reject with credentials. Keep
  `withCredentials:false` (`frontend/src/lib/api.js`).
- White-label config endpoint (`/api/config`) + env-driven branding/region.
- Palette system + Field/Warm toggle. Slot-machine wordmark (needs work, §8).

Backend files: `server.py` (app/startup/CORS/router includes), `common.py`
(serializers/site_config), `security.py`, `services.py` (swappable email + ICS +
payments stub), `seed.py`, `db.py`, `models.py`, `routers/*`
(meta/auth/discovery/meetings/rsvps/resources/notifications).
Frontend pages: Home, Directory, Organize, StartCircle, Connections,
Notifications, Login, Register, Legal. Components: Layout, Wordmark,
RotatingBrand, CalendarActions, AuthCallback.

Env: `frontend/.env` → `REACT_APP_BACKEND_URL`. `backend/.env` → `MONGO_URL`,
`DB_NAME`, `BRAND_*`, `REGION_*`, `ENTITY_*`, `EMAIL_PROVIDER`, `RESEND_API_KEY`,
`CORS_ORIGINS`, `PAYMENT_PROVIDER`, `ADMIN_EMAILS`.

Seeded accounts (pw `Cultivate123!`): organizer@cultivatesf.org,
member@cultivatesf.org, admin@cultivatesf.org (moderator).

Mocked / NOT built (by design): real email send (mock logger; set
`EMAIL_PROVIDER=resend` + `RESEND_API_KEY`), payments checkout (provider stub
only), timed reminders, admin dashboards, directory vetting workflow, message board.

---

## 7) Run
```
# backend + frontend run under supervisor; hot reload
sudo supervisorctl status
# tests
cd backend && python -m pytest tests/backend_test.py   # clear rsvps collection if re-running
```

---

## 8) DESIGN + FEATURE WORK REMAINING (prioritized — this is the meat)

### A. Rotating wordmark (owner-specified rewrite) — `components/RotatingBrand.jsx`
Current is a one-shot decel that lands on the brand. Owner wants:
- **Decelerate, PAUSE on each word, then continue** cycling (readable dwell per word, not a blur).
- **More words** (C-words in context: create, coordinate, collaborate, community,
  convene, care, courage, cultivate…). Land/settle on the brand ("Cultivate"),
  locale ("Santa Fe") static and config-driven.
- **Pointer-velocity reactive:** on hover + mouse-move, cycling speed responds to
  how fast the pointer moves (faster move → faster spin; slow/stop → settle).
- Mobile behavior deferred (different day).
- Keep the subtle per-word color variation (approved, looks great).

### B. High-desert watercolor band (see §5)
Full-width atmospheric band above footer with botanical line art + italic quote
+ chevron divider. Generate/commission a wide low-contrast watercolor asset.
Consider extending this atmosphere (horizon line, botanical marks) subtly into
the field/hero without breaking the #FAFAF8 calm.

### C. Deepen the spatial field (§3 is only partially realized)
- Richer **proximity pre-hover** behavior (fields becoming legible, faint
  relationships surfacing before hover) and **pointer-velocity-aware** motion.
- Stronger **re-centering** choreography for enter-location / enter-circle
  (field contraction, network recession, staggered emergence).
- More expressive **temporal atmosphere** (moving warm mark along a line, density
  around a soon-to-meet circle) beyond the current ring.
- RSVP connection line polish (gap-closing, mark joining the circle edge).
- Real **mobile** interaction model for the field (currently a list fallback).

### D. Owner will handle the hero personally — coordinate, don't overwrite.

### E. Features (from FUTURE_IDEAS.md)
- **Admin metrics + organizer dashboards** (aggregations over existing
  collections; health flags; growth sparklines — keep ops-light).
- **Directory vetting/moderation workflow** (multi-step review, audit trail,
  re-verification, public criteria, report-a-listing) — spec with owner.
- **Real email (Resend)** + templates; **timed meeting reminders** (scheduler).
- **Payments** behind the existing stub when scoped (likely Stripe, opt-in per circle).
- **Ultra-secure message board** — SPEC ONLY for now; if pursued, circle-scoped
  (RSVP-approval gates access), pseudonymous, moderated (hard block on
  sourcing/facilitation), data-minimized. True E2EE is heavy/ops-costly — start
  with strict access control + at-rest encryption, treat E2EE as later opt-in.
- **Native wrap** (Capacitor) reusing this codebase.

### F. Guardrails for all design work
Keep #FAFAF8 canvas; keep color phenomenological (meaning, not decoration); keep
it quiet; obey the §3 "DO NOT create" list; every motion needs a reason.
