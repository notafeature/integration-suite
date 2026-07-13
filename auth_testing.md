# Auth-Gated App Testing Playbook (Cultivate)

This app supports TWO auth methods, both issuing an opaque `session_token`
(httpOnly cookie, 7-day expiry) stored in `user_sessions`:
1. Email + password (bcrypt) — `/api/auth/register`, `/api/auth/login`
2. Emergent Google OAuth — `/api/auth/session` (exchanges `session_id`)

`get_current_user` reads `session_token` from the cookie first, then the
`Authorization: Bearer <token>` header.

## Seeded test accounts (email/password)
- Organizer: organizer@cultivatesf.org / Cultivate123!  (organizes seeded circles)
- Member:    member@cultivatesf.org / Cultivate123!
- Moderator: admin@cultivatesf.org / Cultivate123!  (role: moderator)

## Step 1 — Backend API test
```
API=$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d '=' -f2)
TOKEN=$(curl -s -X POST "$API/api/auth/login" -H "Content-Type: application/json" \
  -d '{"email":"member@cultivatesf.org","password":"Cultivate123!"}' \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['session_token'])")
curl -s "$API/api/auth/me" -H "Authorization: Bearer $TOKEN"
```

## Step 2 — Create a session manually (Google-style) for browser tests
```
mongosh --eval "
use('cultivate');
var uid='test-user-'+Date.now();
var tok='test_session_'+Date.now();
db.users.insertOne({user_id:uid,email:'t'+Date.now()+'@example.com',name:'Test User',roles:['member'],auth_provider:'google',created_at:new Date()});
db.user_sessions.insertOne({user_id:uid,session_token:tok,expires_at:new Date(Date.now()+7*24*60*60*1000),created_at:new Date()});
print('token '+tok);"
```

## Step 3 — Browser cookie
```
await page.context.add_cookies([{ "name":"session_token","value":TOKEN,
  "domain": <preview-host>, "path":"/","httpOnly":true,"secure":true,"sameSite":"None"}])
```

## Checklist
- users doc has `user_id` (UUID); sessions `user_id` matches
- all queries use `{"_id":0}` projection
- `/api/auth/me` returns user (not 401)
- Organizer can approve RSVPs; approved member sees exact meeting location
