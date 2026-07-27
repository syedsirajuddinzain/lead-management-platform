# LeadFlow — Lead Management Platform

A lightweight CRM for managing inbound leads: public capture form, role-based pipeline management, assignment, notes, and a full activity timeline. Built as a full-stack assessment project with production-oriented architecture (layered backend, JWT auth, validation, tests, and a responsive React dashboard).

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Features](#features)
3. [Folder Structure](#folder-structure)
4. [Getting Started](#getting-started)
5. [Environment Variables](#environment-variables)
6. [Running Locally](#running-locally)
7. [Running Tests](#running-tests)
8. [API Documentation](#api-documentation)
9. [Roles & Permissions](#roles--permissions)
10. [Deployment](#deployment)
11. [Design Decisions](#design-decisions)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT, bcrypt |
| Validation | Zod |
| Testing | Jest, Supertest, mongodb-memory-server |
| Security | Helmet, express-rate-limit, express-mongo-sanitize, xss-clean |
| Deployment | Vercel (frontend), Render (backend) |

---

## Features

**Public Lead Capture**
- Anyone can submit a lead (name, email, phone, company, message) — no login required.
- Server-side validation on every field; duplicate submissions (same email + phone) are rejected with a 409.
- Rate-limited to deter spam.

**Authentication & Authorization**
- JWT-based auth, bcrypt-hashed passwords.
- Two roles: **Admin** and **Member**, enforced both in the UI (hiding actions) and on the API (rejecting unauthorized requests regardless of what the UI shows).

**Lead Pipeline**
- Statuses: `New → Contacted → Qualified → Won / Lost`.
- Priority (`Low` / `Medium` / `High`) and source (`Website` / `Referral` / `LinkedIn` / `Other`) for triage.

**Assignment, Notes & Activity Timeline**
- Admins assign leads to members. Every note stores its author and timestamp.
- Every meaningful event (created, assigned, status changed, note added, edited) is recorded and rendered as a chronological timeline.

**Professional REST API**
- Pagination, filtering, full-text-style search, sorting, consistent success/error envelopes, and proper HTTP status codes throughout.

**Dashboard**
- Pipeline breakdown by status, conversion rate, and a live recent-activity feed.

**Bonus features included:** dark mode, search bar, avatar initials, toast notifications, confirmation dialogs before destructive actions, loading skeletons, empty states, and descriptive error messages surfaced from the API.

---

## Folder Structure

```
lead-management-platform/
├── server/                        # Express API
│   ├── src/
│   │   ├── config/                # env loader, DB connection
│   │   ├── models/                # Mongoose schemas (User, Lead)
│   │   ├── validations/           # Zod request schemas
│   │   ├── middleware/            # auth, role guard, validation, rate limit, error handler
│   │   ├── services/               # business logic (auth, user, lead)
│   │   ├── controllers/           # thin HTTP layer calling services
│   │   ├── routes/                # route definitions + per-route validation/guards
│   │   ├── utils/                 # ApiError, ApiResponse, asyncHandler, JWT helper, seed script
│   │   └── app.js                 # Express app assembly
│   ├── tests/                     # Jest + Supertest test suites
│   ├── server.js                  # entry point
│   ├── jest.config.js
│   ├── .env.example
│   └── package.json
│
├── client/                        # React (Vite) frontend
│   ├── src/
│   │   ├── api/                   # axios instance + endpoint modules
│   │   ├── components/
│   │   │   ├── common/            # Button, FormControls, Modal, ConfirmDialog, Display (badges/avatars/skeletons)
│   │   │   ├── layout/            # Sidebar, Navbar, MobileSidebar, AppLayout, ProtectedRoute
│   │   │   └── leads/             # LeadFormModal
│   │   ├── context/                # AuthContext, ThemeContext
│   │   ├── hooks/                  # useDebounce
│   │   ├── pages/                  # Login, Register, PublicLeadForm, Dashboard, Leads, LeadDetail, Users, Settings
│   │   ├── App.jsx                 # routing
│   │   └── main.jsx                # entry point
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB instance (local, Docker, or [MongoDB Atlas](https://www.mongodb.com/atlas))

### Clone & Install

```bash
git clone <your-repo-url> lead-management-platform
cd lead-management-platform

# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

---

## Environment Variables

### Backend (`server/.env`)

Copy `server/.env.example` to `server/.env` and fill in:

| Variable | Description | Example |
|---|---|---|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | API port | `5000` |
| `CLIENT_URL` | Frontend origin, used for CORS | `http://localhost:5173` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/lead_management` |
| `JWT_SECRET` | Long random secret used to sign tokens | `openssl rand -hex 32` |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `BCRYPT_SALT_ROUNDS` | Password hashing cost factor | `10` |
| `RATE_LIMIT_WINDOW_MS` | General API rate-limit window | `900000` |
| `RATE_LIMIT_MAX` | Max requests per window | `200` |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Used only by `npm run seed` | — |

### Frontend (`client/.env`)

Copy `client/.env.example` to `client/.env`:

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Base URL of the backend API | `http://localhost:5000/api` |

---

## Running Locally

```bash
# Terminal 1 — start MongoDB if running locally
mongod

# Terminal 2 — backend
cd server
cp .env.example .env   # then edit values
npm run seed           # creates an initial admin user
npm run dev             # starts on http://localhost:5000

# Terminal 3 — frontend
cd client
cp .env.example .env
npm run dev             # starts on http://localhost:5173
```

Log in with the seeded admin (defaults, unless overridden in `.env`):
```
Email:    admin@leadflow.com
Password: Admin@12345
```

The public lead capture form is available at `/submit-lead` with no login required.

---

## Running Tests

```bash
cd server
npm test
```

Tests spin up an in-memory MongoDB instance (`mongodb-memory-server`), so no real database connection is required to run the suite. Coverage includes:
- Authentication (register, login, invalid credentials, token validation)
- Authorization (admin-only endpoints correctly reject members)
- Lead creation (public + authenticated, validation, duplicate prevention)
- Lead assignment and status transitions
- Pagination, filtering, and search

---

## API Documentation

Base URL: `/api`. All authenticated routes expect `Authorization: Bearer <token>`.

Every response follows the shape:
```json
{ "success": true, "statusCode": 200, "message": "...", "data": {}, "meta": {} }
```
Errors follow:
```json
{ "success": false, "statusCode": 400, "message": "Validation failed", "details": [ { "field": "email", "message": "Invalid email address" } ] }
```

### Auth
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Create an account (always created as `member`) |
| POST | `/auth/login` | Public | Log in, returns JWT + user |
| GET | `/auth/me` | Authenticated | Get current profile |
| PATCH | `/auth/me` | Authenticated | Update name / password |

### Public Lead Capture
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/public/leads` | Public | Submit a lead (rate-limited, duplicate-checked) |

### Leads
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/leads` | Authenticated | List leads. Members see only their assigned leads. Query: `page, limit, status, priority, source, assignedTo, search, sortBy, sortOrder` |
| GET | `/leads/stats` | Authenticated | Dashboard statistics (scoped for members) |
| GET | `/leads/:id` | Authenticated | Get a single lead (403 if a member requests one not assigned to them) |
| POST | `/leads` | Admin | Create a lead directly |
| PATCH | `/leads/:id` | Admin | Update lead fields |
| PATCH | `/leads/:id/status` | Authenticated | Update status (member restricted to their own leads) |
| PATCH | `/leads/:id/assign` | Admin | Assign a lead to a member |
| POST | `/leads/:id/notes` | Authenticated | Add a note (member restricted to their own leads) |
| DELETE | `/leads/:id` | Admin | Soft-delete a lead |

### Users (admin only)
| Method | Route | Description |
|---|---|---|
| GET | `/users` | List users (`page, limit, role, search`) |
| POST | `/users` | Create a user with a specific role |
| PATCH | `/users/:id` | Update name, role, or active status |
| DELETE | `/users/:id` | Delete a user (blocked if they have assigned leads) |

---

## Roles & Permissions

Enforced identically on the frontend (hiding actions) and backend (rejecting requests), since a determined client could bypass the UI entirely.

| Action | Admin | Member |
|---|:---:|:---:|
| View assigned leads | ✅ | ✅ |
| View all leads | ✅ | ❌ (scoped to their own) |
| Create leads | ✅ | ❌ |
| Edit lead fields | ✅ | ❌ |
| Update lead status | ✅ | ✅ (own leads only) |
| Add notes | ✅ | ✅ (own leads only) |
| Assign leads | ✅ | ❌ |
| Delete leads | ✅ | ❌ |
| Manage users | ✅ | ❌ |

---

## Deployment

### Backend → Render
1. Push this repo to GitHub.
2. Create a new **Web Service** on [Render](https://render.com), pointing at the `server/` directory (set the root directory in the Render dashboard).
3. Build command: `npm install`. Start command: `npm start`.
4. Add the environment variables from `server/.env.example` in the Render dashboard (use a MongoDB Atlas connection string for `MONGO_URI`).
5. Once deployed, note the public URL (e.g. `https://leadflow-api.onrender.com`).

### Frontend → Vercel
1. Import the repo into [Vercel](https://vercel.com), set the root directory to `client/`.
2. Framework preset: Vite.
3. Add environment variable `VITE_API_URL` pointing at your Render backend, e.g. `https://leadflow-api.onrender.com/api`.
4. Deploy. `vercel.json` is included to handle SPA client-side routing rewrites.
5. Update the backend's `CLIENT_URL` env var to your Vercel domain so CORS allows it.

---

## Design Decisions

- **Layered backend architecture**: routes never contain business logic — they validate input, then hand off to controllers (thin HTTP glue) and services (all business rules), keeping routes and controllers easy to read and services easy to unit test.
- **Embedded notes & activity on the Lead document** rather than separate collections: notes/activity are always read and written alongside their parent lead, have no independent lifecycle, and are bounded in size — embedding avoids needless joins while keeping the data model simple.
- **Soft delete for leads**: `isDeleted` flag instead of hard delete, so accidental deletions don't destroy the activity/audit trail; all queries exclude soft-deleted documents by default.
- **Zod for validation**: schema-based validation that is declarative, composable, and gives the frontend and backend the same source of truth for what "valid" looks like.
- **Member-scoping enforced in the service layer**, not just the route layer, so it's impossible to bypass by hitting the same endpoint with different query params.
- **Rate limiting tuned per surface**: a strict limiter on the public capture form (spam-prone, no auth), a moderate one on auth endpoints (brute-force mitigation), and a general one across the rest of the API.
