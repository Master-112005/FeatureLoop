# FeatureLoop

A MERN-stack **Feature Request & Public Roadmap Portal** with an Instagram-inspired feed UX.
Users submit ideas, upvote (arrow, not heart), comment in threads, and watch requests move
through a public roadmap lanes (Planned → In Progress → Completed). Admins moderate requests
and enforce a strict one-step-forward status flow.

Built on the [coss.com/ui](https://coss.com/ui) shadcn-style component library
(Tailwind v4 + Base UI). All UI primitives are consumed from `client/src/components/ui/`.

---

## Stack

| Layer     | Tech                                                             |
| --------- | ---------------------------------------------------------------- |
| Frontend  | React 19 + Vite 8, Tailwind CSS v4, coss.com/ui, React Router 6  |
| Backend   | Node.js + Express                                                |
| Database  | MongoDB (Mongoose)                                               |
| Auth      | JWT (15m access in memory + 7d refresh httpOnly cookie, hashed)  |
| Email     | Mock transport — verification/reset links print to server console|

## Demo accounts (seed)

| Role | Username / Email | Password     |
| ---- | ---------------- | ------------ |
| admin| `admin@featureloop.dev` | `password123` |
| user | `maya@featureloop.dev`  | `password123` |

## Getting started

### 1. Backend

```bash
cd server
npm install
copy .env.example .env    # then edit to taste (falls back to dev secrets)
npm run seed              # wipe + reseed demo data
npm run dev               # API on http://localhost:5000
```

Requires a local MongoDB instance (default `mongodb://127.0.0.1:27017/featureloop`).

### 2. Frontend

```bash
cd client
npm install
copy .env.example .env    # VITE_API_BASE_URL=http://localhost:5000/api
npm run dev               # app on http://localhost:5173
```

### 3. Use it

- Browse `/` (feed), `/roadmap`, submit a request, upvote, and comment.
- Log in as the admin, open `/admin`, and drag requests through the roadmap one step at a time
  (a skip or rollback requires an explicit **force** override).
- Watch the server console: signup triggers a mock "verify your email" link
  (`http://localhost:5173/verify-email?token=…`), and forgot-password prints a
  mock reset-password link (`/reset-password?token=…`).

## API summary

Base path: `/api`

| Method | Endpoint | Body / params | Access |
| ------ | -------- | ------------- | ------ |
| POST | `/auth/signup` | `{ username, email, password }` | public |
| GET  | `/auth/verify/:token` | — | public |
| POST | `/auth/login` | `{ emailOrUsername, password }` | public |
| POST | `/auth/refresh` | (httpOnly cookie) | public |
| POST | `/auth/logout` | (httpOnly cookie) | public |
| POST | `/auth/forgot-password` | `{ email }` | public |
| POST | `/auth/reset-password/:token` | `{ password }` | public |
| GET  | `/users/me` | — | logged in |
| GET  | `/requests?sort&category&q&page&limit` | — | public |
| GET  | `/requests/:id` | — | public |
| POST | `/requests` | `{ title, description, category }` | logged in |
| PATCH| `/requests/:id` | `{ title?, description?, category? }` | author / admin |
| POST | `/requests/:id/upvote` | — | logged in |
| DELETE | `/requests/:id` | — | author / admin |
| GET  | `/requests/:id/comments` | — | public |
| POST | `/requests/:id/comments` | `{ content, parentComment? }` | logged in |
| PATCH| `/comments/:id` | `{ content }` | author / admin |
| DELETE | `/comments/:id` | — | author / admin |
| GET  | `/roadmap` | — | public |
| GET  | `/admin/requests?status&page&limit` | — | admin |
| PATCH| `/admin/requests/:id/status` | `{ status, force? }` | admin |
| GET  | `/health` | — | public |

**Status flow:** `Under Review → Planned → In Progress → Completed`. Each move advances exactly
one step; setting `force: true` (admin) bypasses the restriction.

## Notes

- **Passwords** are hashed with `bcryptjs` (pure JS) rather than `bcrypt` to avoid the native
  build step on Windows. Logic is equivalent.
- **Upvotes** are atomic on the server (`$addToSet` / `$pull` + `$inc`) with optimistic UI plus
  rollback on failure. Unlike Instagram, an upvote is an arrow — a prioritization signal.
- **Comments** are soft-deleted so reply threads keep their shape; removed nodes render as
  "[comment removed]".
- **Auth** never touches `localStorage`/`sessionStorage`: the access token lives in memory, and
  the refresh token is set in an httpOnly, `SameSite=Lax` cookie. Tokens are stored hashed and
  rotated on every refresh (reuse revokes the session).
- **Markdown** input is sanitized both server-side (`sanitize-html`) and client-side
  (`rehype-sanitize`), and returned HTML is escaped on render.

## Project layout

```
server/            Express API (models, controllers, routes, middleware, seed)
client/            Vite + React app (pages, components, context, hooks)
client/src/components/ui/   coss.com/ui primitives (installed via shadcn CLI)
```