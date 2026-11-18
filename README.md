# 🏥 Smart Clinic 2.0 — Appointment & Queue Management

Full-stack clinic system: **Next.js (React) + Tailwind CSS** frontend, **Express + MongoDB** backend, real-time queue with **Socket.io**.

Team:  Diwanshu

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, JavaScript ES6+, Tailwind CSS 4, Lucide React |
| Backend | Node.js, Express.js, MongoDB + Mongoose, JWT + bcrypt, Socket.io |
| Real-time | Socket.io + socket.io-client (polling fallback) |
| Notifications | Firebase Cloud Messaging (push) |
| Deployment | Vercel (frontend) · Render (backend) · MongoDB Atlas |

## Project structure

```
backend/                    Express API (unchanged architecture)
frontend/
├── app/
│   ├── layout.js, page.js  Root layout + landing page
│   ├── login/ register/
│   ├── patient/            dashboard · book · appointments · queue · profile
│   ├── doctor/             dashboard · queue · settings · profile
│   └── admin/              dashboard · appointments · doctors · patients · slots · analytics · profile
├── components/             common/ layout/ auth/ patient/ doctor/ admin/ queue/ profile/
├── context/                AuthContext, ToastContext
├── hooks/                  useAsyncData, useQueueSocket, useDoctorQueue, push/reminder hooks
├── services/               api.js (central client) + one service per backend resource
├── lib/                    config, utils, socket, firebase, navigation
└── public/                 firebase-messaging-sw.js, icons
```

## Run locally

Requirements: Node 18.18+, a MongoDB instance.

```bash
npm run install:all                       # installs backend + frontend (+ root dev tool)
cp backend/.env.example  backend/.env     # set MONGODB_URI and JWT_SECRET
cp frontend/.env.example frontend/.env.local
npm run seed                              # demo admin / doctor / patient accounts
npm run dev                               # API on :5000, Next.js on :3000
```

Open http://localhost:3000. Demo logins (shown on the login page while `NEXT_PUBLIC_SHOW_DEMO_LOGINS=true`):
`admin@clinic.com / admin123`, `doctor@clinic.com / doctor123`, `patient@clinic.com / patient123`.

## Environment variables

**frontend/.env.local** (browser-visible — never put secrets here)

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Express base URL, e.g. `http://localhost:5000` (no trailing slash, no `/api`) |
| `NEXT_PUBLIC_SOCKET_URL` | Optional; defaults to the API URL |
| `NEXT_PUBLIC_SHOW_DEMO_LOGINS` | `true` only for demos |
| `NEXT_PUBLIC_FIREBASE_*` | Firebase *web* config + VAPID key (public identifiers). Blank = push disabled |

**backend/.env** — see `backend/.env.example`. `FRONTEND_URL` is the CORS/Socket.io allow-list (comma-separated); in development `http://localhost:3000` is always allowed.

## Deployment

1. **Render (backend):** uses `render.yaml`. Set `MONGODB_URI`, `JWT_SECRET`, and `FRONTEND_URL=https://<your-app>.vercel.app`.
2. **Vercel (frontend):** import the repo, set **Root Directory = `frontend`**, add `NEXT_PUBLIC_API_URL=https://<your-service>.onrender.com` (and the Firebase vars). Remove `NEXT_PUBLIC_SHOW_DEMO_LOGINS`.
3. **MongoDB Atlas:** put the connection string in `MONGODB_URI`.

## Security notes

- Public registration can only create **patient** or **doctor** accounts (admins come from the seed script).
- Authorisation is enforced by the API (JWT + role middleware). The Next.js route guards only control what the UI shows.
- The JWT is kept in `localStorage` and sent as a Bearer token (matches the existing API and works across Vercel → Render). For stricter setups, move to httpOnly cookies served through a same-site proxy.
- CORS and Socket.io are restricted to `FRONTEND_URL`; login/register have a stricter rate limit.
- Doctors can only change the status/notes of their own appointments; doctor-profile updates are field-whitelisted.
- React escapes all output (the old HTML pages injected names with `innerHTML`).

## API changes made for 2.0

New: `GET /api/admin/patients`, `GET /api/admin/doctors`, `PUT /api/admin/users/:id/status`, `PUT /api/appointments/:id/notes`.
The backend no longer serves static HTML.
