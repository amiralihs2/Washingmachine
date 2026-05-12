# WashSlot — PRD

## Original Problem Statement
Build a simple, mobile-friendly web app called WashSlot for a shared dorm washing machine reservation system. One machine, 5 residents, frequent arguments over availability. Need: weekly calendar, available/booked slots (green/red), name-based booking, prevent double booking, cancel own reservation, persistent DB, mobile responsive, simple auth, dark/light mode, plus laundry queue bonus.

## User Choices (Feb 2026)
- Name-based login (no password)
- MongoDB + FastAPI stack (built-in)
- Bonus: Laundry queue (waitlist)
- 24/7 slots, 1h or 2h duration option
- Green = available, Red = booked
- Light/Dark mode toggle

## User Personas
- **Dorm resident (5 users)** — needs to see machine availability at a glance and reserve a 1–2h slot from phone, cancel own bookings, or join queue when slots are taken.

## Core Requirements (Static)
1. Weekly calendar view (7 days starting today)
2. 24 hourly time slots per day (24/7 operation)
3. Booking duration: 1h or 2h
4. Green for available, red for booked, dark red for own bookings
5. Prevent double booking (server-side conflict detection)
6. Cancel own reservation only
7. Laundry queue per booking
8. Persistent storage (MongoDB)
9. Mobile responsive
10. Dark/light theme toggle (persisted)
11. Name-based login (persisted in localStorage)

## What's Been Implemented (2026-02-13)
- **Backend** (`/app/backend/server.py`)
  - `GET /api/reservations?start_date=&end_date=` — list within range
  - `POST /api/reservations` — create with conflict check (1h vs 2h overlap handled)
  - `DELETE /api/reservations/{id}` — owner-only cancel; **auto-promotes first user in queue to new owner** (returns `{promoted, new_owner}`)
  - `POST /api/reservations/{id}/queue` — join waitlist (rejects owner & duplicates)
  - `DELETE /api/reservations/{id}/queue` — leave waitlist
  - All responses exclude Mongo `_id`
- **Frontend** (`/app/frontend/src/`)
  - Brutalist / High-contrast Swiss design (Archivo Black + IBM Plex Mono + Chivo)
  - Login (name-only), Schedule (day selector + 24 slot rows), Booking modal (1h/2h), Cancel, Queue join/leave, Theme toggle, Logout
  - **Loading skeleton** on cold-start
  - **Merged booked blocks**: 2h booking renders as one block (e.g. `09:00–11:00 · 2h`) instead of two duplicate rows
  - **Visible queue list** with expandable toggle inside each booked block
  - **QR landing page** at `/qr` with printable QR code (qrcode.react), back & print buttons
  - localStorage for `washslot.user` and `washslot.theme`
- **Tests**: 12/12 backend pytest tests passing; frontend critical flows verified by testing agent.

## Backlog
### P1 (done in iteration 2 ✓)
- ~~Loading skeleton on slot grid~~ ✓
- ~~Merge consecutive booked hours into one block~~ ✓
- ~~Queue list visible + auto-promote first-in-queue on cancel~~ ✓

### P2
- ~~15-min-before-end in-app reminder toast~~ ✓ (added 2026-02-13)
- Admin view (history, weekly stats per user)
- Input length / sanitization on login
- Optional: harden Join Queue with pending state (avoid rapid-switch race)

## Tech Stack
- Backend: FastAPI, Motor (Mongo async), Pydantic v2
- Frontend: React 19, Tailwind, Sonner, Lucide
- DB: MongoDB
