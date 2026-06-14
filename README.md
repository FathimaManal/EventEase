# EventEase — Event Registration Platform

A full-stack event registration platform built with **Django + DRF** on the backend and **React + Vite + Tailwind** on the frontend. Users can register, log in, browse events, register for events, and view their registrations.

## Tech Stack

| Layer        | Technology                                       |
| ------------ | ------------------------------------------------ |
| Frontend     | React 19, Vite, React Router, Axios, Tailwind v3 |
| Backend      | Django 5, Django REST Framework, SimpleJWT       |
| Database     | SQLite (file-based, zero setup)                  |
| Auth         | JWT (access + refresh tokens, refresh blacklist) |

---

## Quick Start

### 1. Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate          # Windows
# source venv/bin/activate       # macOS/Linux
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_events     # loads 12 sample events
python manage.py runserver 8000
```

Backend runs at `http://localhost:8000`.

Optional — create a Django admin superuser:

```powershell
python manage.py createsuperuser
```

Then visit `http://localhost:8000/admin/` to manage events directly.

### 2. Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

The frontend reads its API URL from `frontend/.env`:

```
VITE_API_URL=http://localhost:8000/api
```

---

## Database

SQLite is used out of the box — the database file (`backend/db.sqlite3`) is created automatically by `manage.py migrate`. No external database server is required.

### Schema

**User** (`accounts.User` — custom user with email login)

| Field        | Type           |
| ------------ | -------------- |
| `id`         | bigint, PK     |
| `name`       | varchar(120)   |
| `email`      | email, unique  |
| `password`   | hashed (PBKDF2)|
| `created_at` | datetime       |

**Event**

| Field         | Type          |
| ------------- | ------------- |
| `id`          | bigint, PK    |
| `title`       | varchar(200)  |
| `description` | text          |
| `date`        | datetime      |
| `location`    | varchar(200)  |
| `created_at`  | datetime      |

**Registration** (`user` + `event` is a unique pair → no double registration)

| Field           | Type                 |
| --------------- | -------------------- |
| `id`            | bigint, PK           |
| `user_id`       | FK → User            |
| `event_id`      | FK → Event           |
| `registered_at` | datetime             |

---

## API Reference

Base URL: `http://localhost:8000/api`

All authenticated endpoints expect:

```
Authorization: Bearer <access_token>
```

### Auth

| Endpoint | Method | Auth | Purpose |
| -------- | ------ | ---- | ------- |
| `/register` | POST | — | Create account, returns access + refresh tokens |
| `/login` | POST | — | Returns access + refresh tokens |
| `/logout` | POST | Bearer | Blacklists the refresh token |
| `/token/refresh/` | POST | — | Exchange a refresh token for a new access token |
| `/me` | GET | Bearer | Returns the current user's profile |

#### `POST /register`

```json
{ "name": "Ada Lovelace", "email": "ada@example.com", "password": "yourpassword" }
```

→ `201`

```json
{
  "user": { "id": 1, "name": "Ada Lovelace", "email": "ada@example.com", "created_at": "..." },
  "tokens": { "access": "<jwt>", "refresh": "<jwt>" }
}
```

#### `POST /login`

```json
{ "email": "ada@example.com", "password": "yourpassword" }
```

→ `200` (same shape as register)

#### `POST /token/refresh/`

```json
{ "refresh": "<refresh_token>" }
```

→ `200`

```json
{ "access": "<new_access_token>" }
```

#### `POST /logout` *(auth required)*

```json
{ "refresh": "<refresh_token>" }
```

→ `205` on success. The refresh token is added to the blacklist so it cannot be reused even if leaked.

#### `GET /me` *(auth required)*

→ Returns the current user's profile.

### Events

#### `GET /events`

Query params: `search`, `page`, `ordering` (e.g. `date`, `-date`, `title`).

→ Paginated (9 per page):

```json
{
  "count": 12,
  "next": "http://localhost:8000/api/events?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "...",
      "description": "...",
      "date": "2026-06-19T...",
      "location": "...",
      "created_at": "...",
      "is_registered": false,
      "attendee_count": 0
    }
  ]
}
```

#### `GET /events/:id`

→ Single event with `is_registered` and `attendee_count`.

#### `POST /events/:id/register` *(auth required)*

→ `201` on success, `400` if the user is already registered.

### Registrations

#### `GET /my-registrations` *(auth required)*

→ Array of the current user's registrations, each with the embedded event:

```json
[
  {
    "id": 1,
    "event": { "id": 1, "title": "...", "date": "...", "location": "...", ... },
    "registered_at": "..."
  }
]
```

---

## Frontend Pages

| Path                 | Page                  | Auth required |
| -------------------- | --------------------- | ------------- |
| `/login`             | Login                 | No            |
| `/register`          | Registration          | No            |
| `/`                  | Event listing         | No            |
| `/events/:id`        | Event details         | No (action requires sign-in) |
| `/my-registrations`  | My Registrations      | Yes           |

### Features

- **Responsive design** — single column on mobile, 3-column grid on desktop.
- **Form validation** — inline field errors plus surfaced server errors.
- **Loading states** — spinners while fetching, disabled buttons while submitting.
- **Error handling** — friendly messages from API errors, including duplicate-registration.
- **Search** — debounced query on the listing page (filters by title, description, location).
- **Pagination** — Previous / Next with current-page indicator.
- **Dark mode** — toggle in the navbar, remembered in `localStorage`, defaults to system preference.

---

## Project Structure

```
event-platform/
├── backend/
│   ├── accounts/        # custom User, auth views (register/login/logout/me)
│   ├── events/          # Event + Registration models, views, seed command
│   ├── core/            # Django project (settings, urls)
│   ├── manage.py
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── api/         # axios client + JWT refresh interceptor
    │   ├── components/  # Navbar, EventCard, Spinner, ErrorMessage, ProtectedRoute
    │   ├── context/     # AuthContext, ThemeContext
    │   ├── pages/       # Login, Register, Events, EventDetail, MyRegistrations
    │   ├── utils/
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    └── package.json
```

---

## Running the Tests

The backend has 18 API tests covering authentication, validation, the duplicate-registration guard, the DB unique constraint, and authorization:

```powershell
cd backend
.\venv\Scripts\activate
python manage.py test
```

Expected output:

```
Ran 18 tests in ~13s
OK
```

---

## Security Notes

- Passwords are hashed with Django's PBKDF2 (the framework default).
- JWT access tokens last 12 hours; refresh tokens last 7 days. The frontend transparently refreshes on `401`.
- On logout, the refresh token is blacklisted (`rest_framework_simplejwt.token_blacklist`) so it cannot be reused.
- `SECRET_KEY` is read from `DJANGO_SECRET_KEY` if set, otherwise falls back to a dev key. **Set a real secret in production.**
- CORS is restricted to `http://localhost:5173` in development.

---

## Manual Test Checklist

1. Register a new account → redirected to events list, navbar shows your name.
2. Log out → log back in.
3. Click an event → "Register for this event" → button shows "Already registered".
4. Try registering again from the API → returns 400 with a friendly message.
5. Visit `/my-registrations` → the event appears there.
6. Toggle dark mode in the navbar → persists across reloads.
7. Search "React" on the events page → only matching events appear.
