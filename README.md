# Cairn (working title)

A networking platform for **in-person psychedelic integration circles**:
people who host integration groups list them here, and people looking for
community after an experience find a room near them and show up.

> A cairn is the stack of stones that marks the trail back down the
> mountain. That's the product: markers for the descent.

## Product boundaries (from client planning)

These are decisions, not copy — they shape the data model, the pages, and
the legal text:

1. **Integration only.** The platform is for people who have already had an
   experience. It never provides, sources, or facilitates access, and groups
   that drift toward facilitation get removed.
2. **Legally independent.** The platform is its own entity, deliberately
   unaffiliated with any psychedelic society. See `lib/site-config.ts`
   (`entity`) and `/legal`.
3. **Licensable.** Society leaders in other regions can run the platform
   under their own banner. All brand/region-specific values live in
   `lib/site-config.ts` so a licensee deployment is a config swap.
4. **In-person first.** The product's job is to get people into a real room.
   No feeds, no video calls.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS v4

```bash
npm install
npm run dev    # http://localhost:3000
npm run build
```

## What exists

| Route | What it is |
| --- | --- |
| `/` | Landing: pitch, how it works, featured circles, platform commitments, host/licensing CTA |
| `/groups` | Circle directory with city + format filters (URL-param based, server-rendered) |
| `/groups/[slug]` | Circle detail: description, host, agreements, upcoming meetings, RSVP stub |
| `/start` | Host onboarding: expectations + application form (stub) |
| `/legal` | Platform boundaries: integration-only, independence, peer-not-clinical, privacy |

- `lib/site-config.ts` — white-label/tenant config
- `lib/data.ts` — placeholder groups & meetings; the types are the intended
  schema in miniature

## What's deliberately not built yet

- Auth, real RSVP flow, host review queue (forms/buttons are stubs that say so)
- Database — everything is static placeholder data
- Payments/membership tiers — pending a decision on the membership model
- Real legal language — `/legal` is intent, not counsel-reviewed terms

## Design

High-desert editorial: warm paper, clay, sage, ink; Fraunces display serif +
Instrument Sans; hairline rules, numbered sections, subtle paper grain.
Tokens live in `app/globals.css` under `@theme` — a licensee re-theme is a
token swap.
