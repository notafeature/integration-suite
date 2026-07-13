# Cultivate Santa Fe

**The real application lives in `frontend/` (React) + `backend/` (FastAPI + MongoDB).**
Start there. Everything else at the repo root is a deprecated earlier draft (see
"Repo map" below).

A web platform for organizing in-person peer psychedelic-integration circles.
People who have already had an experience find a real room, real chairs, and
people who get it. First instance: Santa Fe, NM. Region and brand are
configuration (`BRAND_NAME` etc. via `backend/.env`, served at `GET /api/config`),
so another community can run the whole platform under its own banner.

## The philosophy (understand this before touching design)

The site is a living place people enter, orient within, and become connected
to: locate yourself → approach → enter a circle → become connected. Communicate
relationship through space, proximity, line, scale, emergence, and restrained,
meaningful color. Calm, human, spatial, quietly alive — confident enough to be
quiet.

- Canvas is **#FAFAF8**, near-empty at rest, with very dark charcoal text.
  Editorial serif (Newsreader) for important language, Instrument Sans for
  functional info.
- Color appears **because of meaning**, never per-section: slate carries
  orientation, ochre/amber carries time (a meeting drawing near), clay carries
  human action (hosting, asking to join), violet-grey carries reflection.
  The approved CSS-variable values live in `frontend/src/index.css`.
- Motion exists to communicate proximity, emergence, relationship, and time.
  Every movement has a reason.
- The homepage is a field, not a feature grid: places as areas of activity,
  circles that emerge as you approach, an RSVP that draws a connection line
  which completes when the host approves.

## Product commitments (shape the data model and every page)

1. **Integration only** — support for after an experience. The platform never
   provides, sources, or facilitates access to any substance.
2. **Independent** — the platform is its own legal entity, unaffiliated with
   any organization whose members use it.
3. **In-person first** — the product's job is to get people into a real room.
4. **Peer, not clinical** — community support; crisis needs go to professionals.

## The to-do list

Priorities live in **`CLAUDE_CODE_PROMPT.md` §8**, in order, starting with the
rotating wordmark (§8A: decelerate, pause readably on each word, more C-words,
pointer-velocity-reactive on hover). Then the high-desert watercolor band
(§5/§8B), deepening the spatial field (§8C), and the feature list (§8E).
Longer-horizon ideas: `FUTURE_IDEAS.md`. Build log and state: `memory/PRD.md`,
`HANDOFF.md`. The owner handles the hero personally — coordinate, don't
overwrite it.

## Running it

Backend (needs MongoDB — real, Atlas, or an in-memory emulator for sandboxes):

```bash
cd backend && pip install -r requirements.txt
# .env: MONGO_URL, DB_NAME, CORS_ORIGINS=http://localhost:3000
uvicorn server:app --port 8001     # seeds demo data on startup
python -m pytest tests/backend_test.py
```

Sandboxes without MongoDB access: `pip install mongomock-motor` in a venv and
patch `motor.motor_asyncio.AsyncIOMotorClient = AsyncMongoMockClient` before
importing `server` — the full app runs against it, seed data included.

Frontend:

```bash
cd frontend
echo "REACT_APP_BACKEND_URL=http://localhost:8001" > .env
npm install --legacy-peer-deps && npm install ajv@^8 --legacy-peer-deps
BROWSER=none npm start             # http://localhost:3000
```

Seeded sign-ins (password `Cultivate123!`): `organizer@cultivatesf.org`,
`member@cultivatesf.org`, `admin@cultivatesf.org` (moderator). Full list:
`memory/test_credentials.md`.

## Repo map

- `frontend/`, `backend/` — **the application** (see above).
- `CLAUDE_CODE_PROMPT.md`, `HANDOFF.md`, `memory/`, `FUTURE_IDEAS.md` — design
  brief, priorities, build log.
- `app/`, `components/`, `lib/`, root `package.json` — **deprecated**: an
  earlier Next.js draft ("Cairn", warm-cream look) whose aesthetic was
  rejected. Kept only as history; do not build on it, imitate it, or take its
  branding. Delete when ready.
