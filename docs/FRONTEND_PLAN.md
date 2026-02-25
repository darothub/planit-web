# Planit Frontend — Master Plan

> **How to use this doc:**
> Read this first in every session. It tells you what the app is, where things stand,
> and where to go next. Then open the relevant page doc in `docs/pages/`.

---

## What We're Building

An Airbnb-style event listing and discovery platform for event planners and clients.
Clients browse and book verified event planners. Planners manage listings, availability,
and bookings. The design uses warm earth tones and feels premium but approachable.

**Live API:** `http://localhost:8081/api/v1` (dev) — see `docs/API_REFERENCE.md` for all endpoints.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| Next.js 16 (Pages Router) | Framework — routing, SSR, SSG |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Zustand | Global state (auth, user) |
| TanStack React Query | Server state, caching, loading/error |
| React Hook Form + Zod | Forms and validation |
| Axios | HTTP client |
| js-cookie | JWT storage |

> **New to Next.js?** Read `docs/NEXTJS_CONCEPTS.md` — it explains each concept
> right before we use it, so learning stays in context.

---

## Design System

See `docs/DESIGN_SYSTEM.md` for the full system.

**Quick reference:**
- Primary: Terracotta `#C1694F`
- Background: Warm Sand `#F5ECD7`
- Text: Charcoal `#2C2C2C`
- Accent: Deep Olive `#4A5240`
- Font: Plus Jakarta Sans

---

## Project Structure

```
planit-web/
├── docs/                         ← all planning and reference docs
│   ├── FRONTEND_PLAN.md          ← YOU ARE HERE
│   ├── DESIGN_SYSTEM.md
│   ├── API_REFERENCE.md
│   ├── NEXTJS_CONCEPTS.md
│   └── pages/
│       ├── 01-homepage.md
│       ├── 02-discovery.md
│       ├── 03-listing-detail.md
│       ├── 04-auth.md
│       ├── 05-dashboard-client.md
│       ├── 06-dashboard-planner.md
│       ├── 07-messages.md
│       └── 08-planner-profile.md
├── src/
│   ├── pages/                    ← Next.js pages (each file = a route)
│   │   ├── _app.tsx              ← global providers wrap every page
│   │   ├── _document.tsx         ← HTML shell (fonts, meta)
│   │   ├── index.tsx             ← homepage (/)
│   │   ├── listings/
│   │   │   ├── index.tsx         ← discovery (/listings)
│   │   │   └── [id].tsx          ← listing detail (/listings/123)
│   │   ├── auth/
│   │   │   ├── login.tsx
│   │   │   └── register.tsx
│   │   ├── dashboard/
│   │   │   ├── index.tsx         ← role-aware landing
│   │   │   ├── listings/         ← planner listing management
│   │   │   ├── bookings/         ← booking history and actions
│   │   │   └── disputes/
│   │   ├── messages/
│   │   │   └── [inquiryId].tsx   ← real-time chat
│   │   └── planners/
│   │       └── [id].tsx          ← public planner profile
│   ├── components/
│   │   ├── ui/                   ← reusable primitives (Button, Input, Card...)
│   │   ├── layout/               ← Navbar, Footer, PageShell
│   │   ├── listings/             ← ListingCard, ListingGrid, SearchBar...
│   │   ├── bookings/             ← BookingCard, PaymentBreakdown...
│   │   └── auth/                 ← LoginForm, RegisterForm...
│   ├── lib/
│   │   ├── api.ts                ← axios instance with auth headers
│   │   ├── types.ts              ← all TypeScript types matching API shapes
│   │   └── utils.ts              ← formatPrice, formatDate, cn()...
│   ├── hooks/                    ← custom React hooks (useListings, useBookings...)
│   └── store/
│       └── authStore.ts          ← Zustand auth state
└── .env.local                    ← NEXT_PUBLIC_API_URL (gitignored)
```

---

## Pages — Build Status

| # | Page | Route | Status |
|---|---|---|---|
| 1 | Homepage | `/` | ✅ Done |
| 2 | Discovery | `/listings` | ⬜ Not started |
| 3 | Listing Detail | `/listings/[id]` | ⬜ Not started |
| 4 | Auth (Login + Register) | `/auth/login`, `/auth/register` | ✅ Done |
| 5 | Client Dashboard | `/dashboard` | ⬜ Not started |
| 6 | Planner Dashboard | `/dashboard` (role-aware) | ⬜ Not started |
| 7 | Messages / Chat | `/messages/[inquiryId]` | ⬜ Not started |
| 8 | Public Planner Profile | `/planners/[id]` | ⬜ Not started |

**Legend:** ⬜ Not started · 🔄 In progress · ✅ Done

---

## Foundation — Build First

Before building any page, these must exist:

| Task | File | Status |
|---|---|---|
| Tailwind v4 earth-tone config (`@theme` in globals.css) | `src/styles/globals.css` | ✅ |
| Global font setup (Plus Jakarta Sans) | `src/pages/_document.tsx` | ✅ |
| Axios API client | `src/lib/api.ts` | ✅ |
| TypeScript types | `src/lib/types.ts` | ✅ |
| Auth store (Zustand) | `src/store/authStore.ts` | ✅ |
| App providers (QueryClientProvider) | `src/pages/_app.tsx` | ✅ |
| Utility functions | `src/lib/utils.ts` | ✅ |
| Navbar component | `src/components/layout/Navbar.tsx` | ✅ |
| Footer component | `src/components/layout/Footer.tsx` | ✅ |
| Demo data (Unsplash images, 7 categories) | `src/lib/demoData.ts` | ✅ |

---

## Build Order

1. **Foundation** (above table) — everything else depends on this
2. **Page 4: Auth** — login and register; needed to test protected pages
3. **Page 1: Homepage** — first impression, hero, search, featured listings
4. **Page 2: Discovery** — search results, filters, listing cards
5. **Page 3: Listing Detail** — SSR, booking CTA, planner card
6. **Page 5 & 6: Dashboard** — client bookings, planner management
7. **Page 7: Messages** — real-time STOMP chat
8. **Page 8: Planner Profile** — public profile page

---

## How to Start a New Session

1. Read this file (`docs/FRONTEND_PLAN.md`)
2. Check the status table — find the first ⬜ or 🔄 item
3. Open the relevant page doc in `docs/pages/`
4. Follow the step-by-step build instructions in that doc
5. Update the status table in this file when a page is done

---

## Environment Variables

```bash
# .env.local (local development)
NEXT_PUBLIC_API_URL=http://localhost:8081/api/v1

# .env.production (Railway deployment)
NEXT_PUBLIC_API_URL=https://your-railway-domain.up.railway.app/api/v1
```

---

## Running the App

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```