# Planit Web — Agent Operating Manual

## What This Project Is

The Next.js frontend for Planit — a two-sided event planning marketplace. Clients browse listings, message planners, and manage bookings. Planners manage listings, availability, and incoming requests. The app consumes the Spring Boot backend API (`planit` repo).

---

## Tech Stack

| Tool | Purpose |
|---|---|
| Next.js 16 (Pages Router) | Framework — routing, SSR via `getServerSideProps` |
| TypeScript | Type safety — all types in `src/lib/types.ts` |
| Tailwind CSS v4 | Styling — CSS-based `@theme {}` in `globals.css`, **no `tailwind.config.ts`** |
| Zustand | Global auth state (`src/store/authStore.ts`) |
| TanStack React Query v5 | Server state, caching, loading/error handling |
| React Hook Form + Zod | Forms and validation |
| Axios | HTTP client (`src/lib/api.ts`) |
| js-cookie | JWT cookie storage |
| Heroicons | Icons (`@heroicons/react/24/outline`) |

---

## Environment

```bash
# Local dev
NEXT_PUBLIC_API_URL=http://localhost:8081/api/v1

# Production (Railway)
NEXT_PUBLIC_API_URL=https://planit-production-8ffb.up.railway.app/api/v1
```

Dev server: `npm run dev` → http://localhost:3000

---

## Critical Rules — Read Before Every Task

1. **Demo-first React Query.** Every `useQuery` call must have both `placeholderData: DEMO_DATA` AND `data = DEMO_DATA` as the default in destructuring. `retry: false` always. This makes pages render instantly with demo content even when the API is unavailable.

2. **Tailwind v4 — no `tailwind.config.ts`.** Custom tokens are defined with `@theme {}` in `src/styles/globals.css`. Use `bg-primary`, `text-charcoal`, `rounded-card` etc. directly. Never add a `tailwind.config.ts`.

3. **All types live in `src/lib/types.ts`.** Never define local TypeScript types that duplicate or shadow the shared types. Add new API types there.

4. **Auth token is in a cookie, not localStorage.** `api.ts` reads `Cookies.get('planit_token')`. Auth state is in Zustand (`useAuthStore`). Both must be set on login via `handleAuthSuccess`.

5. **Registration endpoints are role-specific.** `POST /auth/register/client` and `POST /auth/register/planner` — not `/auth/register`.

6. **Listing management is under `/planners/me`.** `POST /planners/me/listings` (not `/listings`).

7. **`EventListingResponse.averageRating`** — not `rating`. The field was renamed.

8. **`InquiryResponse.listing` is a nested object** `{ id, title, coverImageUrl }` — not a flat `listingId`.

9. **Showcase pages are dev-only.** Every showcase page must have the `NODE_ENV` guard. For pages with URL-driven filter state, write a standalone showcase component — do not wrap the real page. See `docs/agent/showcase.md`.

10. **Run `npx tsc --noEmit` before committing.** No type errors allowed.

---

## Key File Paths

| File | Purpose |
|---|---|
| `src/lib/types.ts` | All TypeScript types matching API shapes |
| `src/lib/api.ts` | Axios instance with JWT interceptor |
| `src/lib/demoData.ts` | Demo listings (7 categories, Unsplash images, negative IDs) |
| `src/lib/utils.ts` | `cn()`, `formatPrice()`, `formatDate()`, `formatShortDate()` |
| `src/store/authStore.ts` | Zustand auth state (token, user, logout) |
| `src/styles/globals.css` | Tailwind v4 `@theme {}` — all custom tokens defined here |
| `src/showcase/ShowcaseShell.tsx` | Showcase chrome bar, auth injection, router interception |
| `src/showcase/data.ts` | All mock fixtures for showcase pages |
| `src/pages/showcase/index.tsx` | Showcase gallery — update whenever a new screen is added |

---

## Deeper Documentation

For any non-trivial task, read the relevant doc first:

- **Building or modifying a page** → `docs/agent/architecture.md`
- **Styling, layout, design tokens** → `docs/agent/design.md`
- **Adding or updating a showcase page** → `docs/agent/showcase.md`
- **Building a form** → `docs/agent/forms.md`

---

## How to Approach a Task

1. Read the relevant `docs/agent/` file for the task type.
2. Read the existing files you'll be touching — understand before modifying.
3. Add new types to `src/lib/types.ts` if the API shape is new.
4. Follow the demo-first React Query pattern for any data fetching.
5. Add demo data to `src/showcase/data.ts` if building a new page.
6. Create or update the corresponding showcase page in `src/pages/showcase/`.
7. Update `src/pages/showcase/index.tsx` with the new entry.
8. Run `npx tsc --noEmit` — must be clean before committing.