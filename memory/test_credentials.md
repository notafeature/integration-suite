# Test Credentials — Cultivate

Auth: two methods, both issue an opaque `session_token` (httpOnly cookie + also
returned in JSON for Bearer use). `get_current_user` reads cookie first, then
`Authorization: Bearer <token>`.

## Seeded accounts (email/password) — password: Cultivate123!
| Role | Email | Notes |
| --- | --- | --- |
| Organizer | organizer@cultivatesf.org | Organizes all seeded circles; can approve RSVPs, schedule meetings |
| Member | member@cultivatesf.org | Plain member; use to test RSVP request flow |
| Moderator | admin@cultivatesf.org | role `moderator`; can view/approve resource submissions (ADMIN_EMAILS) |

Google OAuth (Emergent-managed) is also wired at POST /api/auth/session.

## Quick login
```
API=$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d '=' -f2)
curl -s -X POST "$API/api/auth/login" -H "Content-Type: application/json" \
  -d '{"email":"member@cultivatesf.org","password":"Cultivate123!"}'
```

DB: mongodb://localhost:27017 / db `cultivate`.
