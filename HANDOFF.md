# Cultivate — Handoff (for Claude Code / next dev)

Working, tested app. This doc is the fast on-ramp. See also `PRD.md` and `FUTURE_IDEAS.md`.

## Stack & run
- **Frontend:** React (CRA) in `/app/frontend`, dev server on :3000 (`yarn start`). Tailwind + framer-motion + react-router + axios + lucide-react + date-fns.
- **Backend:** FastAPI in `/app/backend`, :8001, **all routes under `/api`**. MongoDB via `motor`.
- **Managed by supervisor** (`sudo supervisorctl status`). Both hot-reload; restart only after `.env`/dependency changes.
- Env: `frontend/.env` → `REACT_APP_BACKEND_URL`; `backend/.env` → `MONGO_URL`, `DB_NAME`, branding/region, `EMAIL_PROVIDER`, `RESEND_API_KEY`, `CORS_ORIGINS`, `PAYMENT_PROVIDER`, `ADMIN_EMAILS`.

## Auth (important)
- Two methods, one opaque `session_token` (in `user_sessions`): email/password (bcrypt) + Emergent Google OAuth.
- **Frontend uses Bearer token only** (localStorage), NOT cookies — because the preview ingress rewrites CORS `Allow-Origin` to `*`, which browsers reject alongside credentials. Keep `withCredentials: false` (`frontend/src/lib/api.js`).
- `get_current_user` reads cookie first, then `Authorization: Bearer`. So cookies still work in same-origin deploys; Bearer is the reliable path.
- Seeded accounts (pw `Cultivate123!`): organizer@cultivatesf.org, member@cultivatesf.org, admin@cultivatesf.org (moderator).

## Backend layout (refactored)
- `server.py` — app, startup (indexes + seed), CORS, router includes.
- `common.py` — `site_config`, serializers (`circle_brief`, `meeting_brief`, `next_meeting_for`).
- `security.py` — password/session/`get_current_user`/`require_moderator`.
- `services.py` — swappable email (mock ↔ Resend), ICS + Google Calendar, payments provider registry (empty stub).
- `seed.py` — seed circles/meetings/resources/users. `db.py`, `models.py`.
- `routers/` — `meta, auth, discovery, meetings, rsvps, resources, notifications`.
- Tests: `tests/backend_test.py` (`python -m pytest`). 35 pass on a fresh DB (RSVP tests assume no prior approved RSVP for member — clear `rsvps` if re-running).

## Frontend layout
- `pages/Home.jsx` — the spatial **field** (levels: field → location → circle), proximity reveal, temporal rings, RSVP-as-connection. Compact list fallback under 820px.
- `pages/`: Directory, Organize, StartCircle, Connections, Notifications, Login, Register, Legal.
- `components/`: Layout (header/footer + palette toggle), Wordmark, RotatingBrand, CalendarActions, AuthCallback.
- **Palette** = CSS variables in `src/index.css` (`--c-*` channels) + `tailwind.config.js` maps them with `<alpha-value>`. Presets: default `field`, and `warm` (`:root[data-theme="warm"]`). Toggle persists in `localStorage` (`cultivate_theme`). Canvas = **#FAFAF8**.
- Phenomenological color: slate=orientation, amber/ochre=temporal (meeting soon), clay=human action (RSVP), violet=reflection.

## Design TODOs the owner wants next (do NOT let these regress the palette — it's approved)
1. **Rotating wordmark** (`components/RotatingBrand.jsx`) — owner will refine. Desired behavior:
   - Decelerate, **pause on each word**, then continue (not a one-shot blur).
   - **More words** (C-word list is in the file).
   - On **hover + mouse-move, react to pointer speed** (faster movement → faster cycling).
   - Mobile behavior deferred.
   - Current impl is a simple `setTimeout` decel that lands on the brand short name; replace with a velocity-aware loop.
2. **High-desert watercolor band** (owner's inspo, loved): full-width band above the footer — soft watercolor dawn/dusk horizon in warm neutrals + fine botanical line drawings (dried seed-heads / chamisa), centered italic serif quote e.g. *“Healing happens in relationship. Integration happens in community.”* with a small chevron/arrow divider. Generate the watercolor as a wide, low-contrast background asset; keep text legible; must not fight the #FAFAF8 canvas.

## Not built (by design)
- Payments checkout (provider stub only). Real email send (mocked; add `RESEND_API_KEY` + `EMAIL_PROVIDER=resend`). Timed reminders. Admin metrics dashboards. Directory vetting workflow. Message board (spec in FUTURE_IDEAS.md).

## Deploy
- No deploy needed to use the preview. To go live on your domain: deploy, then point `cultivatesantafe.org` via Cloudflare. Update `REACT_APP_BACKEND_URL`, `CORS_ORIGINS`, and branding env for the new host. Push code via the platform's **"Save to Github"** button.
