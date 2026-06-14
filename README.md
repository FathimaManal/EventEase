# EventEase

Event registration platform built with Django REST Framework and React.

## Live demo

- App: https://event-ease-eight-rust.vercel.app
- API: https://eventease-api-v8kr.onrender.com/api/events

The backend runs on Render's free tier and sleeps after 15 minutes of inactivity, so the first request after a while can take 30-60s to wake up.

## Stack

- Backend: Django 5, DRF, SimpleJWT
- Frontend: React 19, Vite, Tailwind, Axios, React Router
- Database: SQLite locally, Postgres in production
- Auth: JWT (access + refresh, refresh token blacklisted on logout)

## Run locally

Backend:

```
cd backend
python -m venv venv
.\venv\Scripts\activate     # or: source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_events
python manage.py runserver
```

Frontend (in another terminal):

```
cd frontend
npm install
npm run dev
```

Frontend reads the API URL from `frontend/.env`. Default points to `http://localhost:8000/api`.

## API

Base URL: `/api`

Authenticated endpoints expect a JWT in the header:

```
Authorization: Bearer <access_token>
```

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/register` | – | Create account |
| POST | `/login` | – | Get tokens |
| POST | `/logout` | Bearer | Blacklist refresh token |
| POST | `/token/refresh/` | – | Get new access token |
| GET | `/me` | Bearer | Current user |
| GET | `/events` | – | List events |
| GET | `/events/:id` | – | Event detail |
| POST | `/events/:id/register` | Bearer | Register for event |
| GET | `/my-registrations` | Bearer | Current user's registrations |

### Auth

**POST `/register`**
Request: `{ "name": "Ada", "email": "ada@example.com", "password": "secret123" }`
Response (201): `{ "user": { "id", "name", "email", "created_at" }, "tokens": { "access", "refresh" } }`
Errors: `400` if email is taken or password fails validation (min 8 chars, not all numeric, etc.)

**POST `/login`**
Request: `{ "email": "...", "password": "..." }`
Response (200): same shape as `/register`
Errors: `400` invalid credentials

**POST `/logout`** *(auth)*
Request: `{ "refresh": "<refresh_token>" }`
Response: `205`, refresh token is added to the blacklist

**POST `/token/refresh/`**
Request: `{ "refresh": "<refresh_token>" }`
Response (200): `{ "access": "<new_access_token>" }`

### Events

**GET `/events`** — paginated list, 9 per page
Query params: `search` (matches title/description/location), `page`, `ordering` (e.g. `date`, `-date`)
Response (200): `{ "count": 12, "next": "...", "previous": null, "results": [Event...] }`

Each event includes `is_registered` (whether the current user has registered) and `attendee_count`.

**GET `/events/:id`**
Response (200): a single Event object with the same shape as items in the list above.

**POST `/events/:id/register`** *(auth)*
Response (201): `{ "id", "event": {...}, "registered_at" }`
Errors: `400` if the user is already registered

**GET `/my-registrations`** *(auth)*
Response (200): array of registrations (not paginated), each with the embedded event.

## Database

SQLite locally, Postgres in production (auto-provisioned by Render from `render.yaml`).

Setup is two commands (already included in the local run steps above):

```
python manage.py migrate       # creates the tables
python manage.py seed_events   # loads 12 sample events
```

No external database server to install for local dev. The SQLite file lives at `backend/db.sqlite3` and is gitignored.

To view or edit the data visually, create a Django admin user and log in to `/admin/`:

```
python manage.py createsuperuser
```

Then visit `http://localhost:8000/admin/`.

**Schema:**

**User**: id, name, email (unique), password (PBKDF2-hashed), created_at
**Event**: id, title, description, date, location, created_at
**Registration**: id, user_id, event_id, registered_at

`Registration` has `unique_together(user, event)`, so the database itself prevents duplicate sign-ups.

## Project structure

```
event-platform/
├── backend/
│   ├── accounts/     # User model, auth views
│   ├── events/       # Event + Registration, views, seed command
│   ├── core/         # settings, urls
│   └── manage.py
└── frontend/
    └── src/
        ├── api/      # axios client + JWT refresh interceptor
        ├── components/
        ├── context/  # AuthContext, ThemeContext
        ├── pages/
        └── App.jsx
```
