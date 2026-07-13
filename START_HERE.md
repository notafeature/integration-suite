# START HERE — session startup prompt

If you are a fresh Claude Code session: read this file top to bottom, then
`README.md`, then begin. This is the owner's standing brief.

## The one thing you must get right

This repo contains TWO apps. Do not confuse them:

- **THE REAL APP — keep and continue:** `frontend/` (React CRA) + `backend/`
  (FastAPI + MongoDB). Brand: **"Cultivate Santa Fe"** — config-driven
  (`BRAND_NAME` env → `GET /api/config`), must stay swappable for other
  regions. Canvas **#FAFAF8**, charcoal ink, meaning-driven color (slate =
  orientation, ochre = temporal, clay = human action, violet-grey =
  reflection), Newsreader + Instrument Sans, spatial "field" homepage. This
  design is APPROVED and works; the backend has a 35-test pytest suite.
- **THE REJECT:** the root-level Next.js app (`app/`, `components/`, `lib/`,
  root `package.json`), branded "Cairn", warm-cream look — an earlier draft
  whose aesthetic was rejected. Build nothing on it, imitate nothing from it.
  Ask the owner before deleting it; otherwise ignore it.

## Read next (in this order)

1. `CLAUDE_CODE_PROMPT.md` — design philosophy (§3), approved palette values
   (§4), aesthetic reference (§5), and the prioritized work list (§8).
2. `HANDOFF.md` — run details, auth model, router map.
3. `memory/PRD.md`, `FUTURE_IDEAS.md` — build log, longer-horizon ideas.

## Standing rules

- Canvas stays **#FAFAF8**; palette values come from `frontend/src/index.css`
  — don't invent colors. Every motion needs a reason. Quiet confidence.
- Product commitments: integration only (never access to substances);
  platform legally independent; in-person first; peer, not clinical.
- Brand/region always through config, never hardcoded.
- The owner handles the hero personally — coordinate, don't overwrite.
- Feature branch + PR into `main`; never push `main` directly.
- Ask before architecturally significant moves (framework, DB, auth, deletes).

## Work order

`CLAUDE_CODE_PROMPT.md` §8, in sequence. First: **§8A rotating wordmark**
(`frontend/src/components/RotatingBrand.jsx`) — decelerate and PAUSE readably
on each word, then keep cycling; expand the C-word list; react to pointer
velocity on hover (fast movement = faster cycling, slow/stop = settle); keep
per-word color variation; mobile deferred. Then §8B watercolor band, §8C
field-deepening, §8E features.

## De-Emergent checklist (platform dependencies to sever)

Emergent quietly provided hosting, database, and OAuth. Off-platform, these
need replacing — track them as real tasks:

1. **Database:** `backend/` expects MongoDB. Fastest: free MongoDB Atlas
   cluster (`MONGO_URL` env). A later migration to Postgres/Supabase is an
   architectural decision for the owner — do not start it unprompted.
2. **Google OAuth is broken by design off-Emergent:** `backend/routers/auth.py`
   calls `EMERGENT_AUTH_SESSION_URL` (Emergent's auth service). Email/password
   auth is self-contained and works. Replacing Emergent OAuth with direct
   Google OAuth (or dropping Google sign-in until needed) is a task — surface
   it, get the owner's call.
3. **Email:** already architected for Resend — set `EMAIL_PROVIDER=resend` +
   `RESEND_API_KEY` (swap point: `backend/services.py`). Templates + timed
   reminders are §8E work.
4. **Hosting (owner has Cloudflare; Railway is vetoed):** frontend fits
   Cloudflare Pages as-is (CRA build). The Python backend cannot run on
   Cloudflare as-is — it needs a Python host (e.g. Render or Fly.io free tier)
   or a future rewrite; owner's call. Staging must NOT touch the client's
   real domain — unguessable subdomain, optionally password-gated.

## Running / viewing in a sandbox session

See `README.md` "Running it" — full recipe including the `mongomock-motor`
in-memory DB patch (no network needed), the CRA `ajv@^8` fix, and seeded
sign-ins (`organizer@` / `member@` / `admin@cultivatesf.org`, password
`Cultivate123!`). Chromium is preinstalled at `/opt/pw-browsers/chromium` —
screenshot every visual change (use `playwright-core` + `NO_PROXY=localhost`)
and show the owner before/after.
