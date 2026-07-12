# Cultivate — Product Requirements & Build Log

## Problem statement
Web app for organizing **in-person peer psychedelic-integration meetings** (post-experience
integration). First deployment: Santa Fe, NM ("Cultivate Santa Fe", placeholder brand).
One codebase, region-as-configuration, open-source / self-hostable, minimal ops.

### Hard boundaries
- Integration **after** an experience only. Never facilitates access to substances. No exceptions.
- Platform is independent — not affiliated with any organization whose members use it.

## Personas
- **Visitor (logged-out):** browse/search circles by location; view resource directory.
- **Member:** RSVP to meetings; receive details once approved; follow connections; notifications.
- **Organizer:** create circles, schedule meetings, approve/decline RSVPs.
- **Moderator:** review & approve resource-directory submissions.

## Architecture
- **Frontend:** React (CRA) :3000 — Tailwind, framer-motion, react-router. Spatial "field" UX.
- **Backend:** FastAPI :8001, all routes under `/api`. **MongoDB** (motor).
- **Auth:** Emergent Google OAuth + email/password; unified opaque `session_token`
  (httpOnly cookie + Bearer). `security.py`.
- **Branding/region = config** via backend `.env` (BRAND_NAME, REGION_LABEL, ENTITY_*, ...)
  surfaced at `GET /api/config`. Forking a new city = env swap.
- **Notifications:** swappable layer (`services.py`). Email provider = mock (logged) now;
  set `EMAIL_PROVIDER=resend` + `RESEND_API_KEY` to go live. In-app notifications are real DB records.
- **Payments:** architected as a provider registry (`services.py`, `GET /api/payments/status`),
  intentionally empty — NO checkout built. A provider can be registered without touching call sites.
- **Calendar:** ICS export + Google Calendar URL per meeting (exact location gated to approved).

## Design language
Base canvas #FAFAF8, dark-charcoal text, Fraunces (display serif) + Instrument Sans.
Phenomenological color: blue-grey = orientation, ochre/amber = temporal (meeting soon),
clay = human action (RSVP/host), violet-grey = reflection. Homepage is a spatial field:
locate → approach (cursor proximity reveals) → enter a location (circles emerge) →
enter a circle (context panel) → RSVP draws a connection (pending = incomplete line,
approved = completed line + details revealed). Ported from the "Cairn" scaffold tokens.

## Implemented (2026-06-12 / build date 2026-07-12 env)
- ✅ Spatial field homepage: location nodes, proximity reveal, temporal ochre signals,
  enter-location recentre, enter-circle context panel, RSVP-as-connection. Mobile compact fallback.
- ✅ Circles: browse/search, detail, create (organizer). Locations aggregated for the field.
- ✅ Meetings + RSVP: schedule, request → pending → organizer approve/decline → exact location revealed.
- ✅ Notifications: in-app center + unread badge; email dispatch (mocked).
- ✅ Calendar: ICS download + Google Calendar link.
- ✅ Resource directory: public, tag filter (local/national/online), moderated submission + queue.
- ✅ Auth: Google OAuth + email/password; protected routes; 3 seeded accounts.
- ✅ Legal/boundaries page. White-label config endpoint.
- ✅ Tested: 35/35 backend pytest pass; all critical frontend flows verified.

## Backlog / next
- P1: Meeting **reminder** notifications (scheduler/cron) — type exists, not yet triggered on a timer.
- P1: Wire real Resend email (add key) + email templates.
- P1: Richer moderation/vetting workflow for the directory (client to specify).
- P2: Payments provider (Stripe) behind the existing stub, when scope is defined.
- P2: PWA install polish + native wrapper (Capacitor) reusing this codebase.
- P2: Pin CORS to frontend origin for production; refactor server.py into per-domain routers.
- P2: Handle seed date-drift (compute relative dates or periodic reseed).
