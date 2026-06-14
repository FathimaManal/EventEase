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

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/register` | – | Create account, returns user + tokens |
| POST | `/login` | – | Returns user + tokens |
| POST | `/logout` | Bearer | Blacklists the refresh token |
| POST | `/token/refresh/` | – | New access token from a refresh token |
| GET | `/me` | Bearer | Current user |
| GET | `/events` | – | List events (supports `?search` and `?page`) |
| GET | `/events/:id` | – | Event detail |
| POST | `/events/:id/register` | Bearer | Register for an event (400 if already registered) |
| GET | `/my-registrations` | Bearer | Current user's registrations |

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
