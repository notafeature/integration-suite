# Cultivate — Future Ideas & Feature Specs (parking lot)

A living doc to spec out ideas before building. Nothing here is committed.
Keep the hard boundaries in mind for every idea: **integration-only, never
facilitates access; platform independent; in-person first; minimal ops.**

---

## 1. Admin — metrics & user dashboards  (likely near-term)
**Goal:** give an instance operator + organizers a clear view without heavy ops.

- **Operator (moderator/admin) dashboard**
  - Instance metrics: # circles, # meetings (upcoming/past), # members, RSVP
    approval rate, active organizers, directory submissions pending.
  - Growth over time (signups, RSVPs) — simple sparklines, no heavy analytics stack.
  - Health flags: circles with no upcoming meeting, meetings with 0 approvals, stale listings.
- **Organizer dashboard** (extends current `/organize`)
  - Per-circle: attendance history, no-show rate, repeat attendees, capacity fill.
  - Member notes (private, organizer-only) — sensitive; see privacy note below.
- **Data model:** most metrics are aggregations over existing collections
  (circles, meetings, rsvps, users, resources). Add lightweight event log if needed.

## 2. Directory vetting / moderation workflow  (client to define)
Current state: submissions land as `status: "pending"`; moderator approve/reject exists.
To spec:
- Multi-step review (submitted → in-review → needs-info → approved/rejected) with notes.
- Reviewer assignment + audit trail (who approved, when, why).
- Re-verification cadence (e.g., annual) + expiry.
- Public "vetting criteria" page so the bar is transparent.
- Report-a-listing flow for the community.

## 3. Message board / social component  (DO NOT BUILD YET — spec only)
The ask: an **ultra-secure** discussion/social space. This is a large, sensitive
surface. Given the subject matter (post-experience integration), privacy and
safety are paramount. If pursued, treat it as its own project.

**What "ultra-secure" should mean here**
- **Access:** members-only, and likely **circle-scoped** (you can only see the
  board for circles you've been *approved* into) — mirrors the real trust boundary.
- **Identity:** pseudonymous display names; never expose emails; optional
  per-circle aliases.
- **Confidentiality:** enforce the same "what's shared in the circle stays in the
  circle" agreement technically — no public indexing, `noindex`, no share links
  that leak content to logged-out users.
- **Encryption:** TLS in transit (default). For "ultra" — consider
  **end-to-end encryption** for direct/private threads (client-side keys), which
  is a serious undertaking (key management, recovery, multi-device). Realistic
  first step: encryption-at-rest + strict access control + short retention,
  *not* full E2EE.
- **Moderation & safety:** report/flag, organizer/mod tools, rate limits, a hard
  filter + human review for any content that drifts toward **sourcing/facilitation**
  (auto-remove + escalate — this is a boundary, not a preference).
- **Data minimization:** short default retention, easy delete, export-my-data,
  no third-party trackers.
- **Abuse resistance:** invite/approval-gated posting, rate limiting, audit logs.

**How hard is it?** A *circle-scoped, access-controlled, moderated* board (no E2EE)
is a moderate build on top of the current model (reuse RSVP-approval as the access
gate). **True end-to-end encryption** is hard (weeks, not days) and adds real
support burden (lost keys = lost history), which conflicts with "minimal ops."
Recommendation if we go there: start with strict access control + at-rest
encryption + strong moderation; treat E2EE as a later, opt-in enhancement for
private 1:1 threads only.

**Risks to weigh:** turning an in-person-first product into a feed/social app
could undercut the core intent ("get people into a real room"). Consider scoping
it as *async continuation between meetings* for approved members, not an open feed.

## 4. Payments (already architected, not built)
- Provider registry stub exists (`services.py`, `GET /api/payments/status`).
- When scoped: small per-meeting or membership fees to cover costs. Likely Stripe.
- Keep it optional per-circle; organizers opt in. Never gate safety/crisis info behind payment.

## 5. Notifications — timed reminders
- Reminder type exists but isn't fired on a schedule yet. Add a lightweight
  scheduler (cron/APScheduler) to send "meeting tomorrow" reminders to approved members.

## 6. Native app
- Current web is responsive + PWA-ready. Wrap with Capacitor for iOS/Android
  reusing this codebase (single source), rather than a second codebase.
