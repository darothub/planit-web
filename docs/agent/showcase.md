# Showcase System

## What It Is

The showcase (`/showcase`) is a dev-only UI gallery that renders every screen of the app with hardcoded demo data — no auth, no backend required. It serves as a living Figma replacement: a place to evaluate and adjust screens in isolation.

Every showcase page is **blocked in production** via `NODE_ENV` guard and blocked from search engines via `robots.txt`.

---

## File Locations

```
src/showcase/
  ShowcaseShell.tsx    — chrome bar, auth injection, router interception
  data.ts              — all mock fixtures (users, bookings, listings, etc.)

src/pages/showcase/
  index.tsx            — gallery grid (update whenever a new screen is added)
  [screen-name].tsx    — one file per screen
```

---

## Three Patterns — Choose the Right One

### Pattern 1: Standalone showcase (for pages with URL-driven filter state)

**When:** The page uses `router.push` to update URL-based filters (e.g. browse pages).

**Why:** Wrapping the real page would cause it to `router.push` on every filter change, potentially navigating away from the showcase.

**How:** Write a self-contained showcase component that owns filter state with `useState` and filters demo data client-side.

```tsx
// src/pages/showcase/listings.tsx
export default function ShowcaseListings() {
  const [eventTypeId, setEventTypeId] = useState('')
  const [location, setLocation]       = useState('')

  const filtered = useMemo(() => {
    let result = [...ALL_LISTINGS]
    if (location) result = result.filter(l => l.location.toLowerCase().includes(location.toLowerCase()))
    return result
  }, [location])

  return (
    <ShowcaseShell pageName="Browse Events">
      <PageShell>
        {/* Inline filter bar using local state */}
        {/* ListingGrid / PlannerCard grid using filtered demo data */}
      </PageShell>
    </ShowcaseShell>
  )
}
```

**Real examples:** `listings.tsx`, `planners-browse.tsx`

---

### Pattern 2: Props-passing showcase (for SSR pages that accept props)

**When:** The real page component accepts props (data passed via `getServerSideProps`).

**How:** The showcase uses its own `getServerSideProps` to return hardcoded demo props, then renders the real page component with those props.

```tsx
// src/pages/showcase/planner-profile.tsx
export const getServerSideProps: GetServerSideProps = () => {
  if (process.env.NODE_ENV === 'production') return Promise.resolve({ notFound: true })
  return Promise.resolve({ props: { planner: DEMO_PLANNER, listings: DEMO_LISTINGS, reviews: DEMO_REVIEWS } })
}

export default function ShowcasePlannerProfile(props: Parameters<typeof PlannerProfilePage>[0]) {
  return (
    <ShowcaseShell pageName="Planner Profile" demoRole="CLIENT">
      <PlannerProfilePage {...props} />
    </ShowcaseShell>
  )
}
```

**Real examples:** `planner-profile.tsx`, `listing-detail.tsx`, `listing-detail-client.tsx`

---

### Pattern 3: QueryClient seeding (for dashboard pages with `useQuery` hooks)

**When:** The real page component calls `useQuery` internally and you want those queries to resolve to demo data without API calls.

**How:** Create a fresh `QueryClient`, seed it with demo data for each query key, wrap content in a nested `<QueryClientProvider>`. React Query resolves to the innermost provider.

```tsx
// src/pages/showcase/dashboard-client.tsx
export default function ShowcaseDashboardClient() {
  const qc = useMemo(() => {
    const c = new QueryClient()
    c.setQueryData(['my-bookings'],  DEMO_BOOKINGS_CLIENT)
    c.setQueryData(['my-inquiries'], DEMO_INQUIRIES_CLIENT)
    return c
  }, [])

  return (
    <QueryClientProvider client={qc}>
      <ShowcaseShell pageName="Client Dashboard" demoRole="CLIENT">
        <ClientDashboard />
      </ShowcaseShell>
    </QueryClientProvider>
  )
}
```

**Real examples:** `dashboard-client.tsx`, `dashboard-planner.tsx`, `dashboard-bookings-*.tsx`, `messages.tsx`

---

## When NOT to Wrap a Real Page Directly

Do **not** do:
```tsx
// BAD — real page has router.push for filter state
<ShowcaseShell pageName="Browse Events">
  <DiscoveryPage />          {/* pushes to /listings on every filter change */}
</ShowcaseShell>
```

This leaks `router.push` calls. The router interception in `ShowcaseShell` handles most cases, but standalone is always cleaner for filter-heavy pages.

---

## ShowcaseShell

### Props

```tsx
<ShowcaseShell
  pageName="Screen Name"          // shown in the chrome bar centre
  demoRole="CLIENT"               // CLIENT | PLANNER | ADMIN | GUEST (default)
>
  {children}
</ShowcaseShell>
```

### What it does

1. **Auth injection** — `useLayoutEffect` sets the Zustand auth store with a demo user matching `demoRole` before children mount. This prevents protected pages from redirecting to login. On unmount, original state is restored.

2. **Router interception** — monkey-patches `router.push` and `router.replace`, plus a capture-phase click listener on `<a>` tags. Real app URLs are translated to showcase equivalents:
   - `/listings` → `/showcase/listings`
   - `/planners` → `/showcase/planners-browse`
   - `/planners/:id` → `/showcase/planner-profile`
   - `/listings/:id` → `/showcase/listing-detail`
   - `/` → `/showcase/home`
   - `/dashboard/bookings` → `/showcase/dashboard-bookings-{client|planner}`
   - (etc. — see `ShowcaseShell.tsx` for full map)

3. **Device toggle** — chrome bar has 📱 (390px) / 💻 (768px) / 🖥 (full) buttons that constrain content width.

### Auth roles

| `demoRole` | Auth store state | Use for |
|---|---|---|
| `CLIENT` | Sarah Chen, CLIENT role | Client dashboard screens |
| `PLANNER` | Alex Rivera, PLANNER role | Planner dashboard screens |
| `ADMIN` | Admin User, ADMIN role | Admin screens |
| `GUEST` (default) | `token: null, user: null` | Public pages, auth pages (prevents redirect to dashboard) |

---

## Mock Data (`src/showcase/data.ts`)

Add new fixtures here when building new showcase pages. Existing exports:

```typescript
DEMO_CLIENT_USER         // AuthResponse — Sarah Chen, CLIENT
DEMO_PLANNER_USER        // AuthResponse — Alex Rivera, PLANNER
DEMO_ADMIN_USER          // AuthResponse — Admin User, ADMIN
DEMO_BOOKINGS_CLIENT     // BookingResponse[] — 3 items
DEMO_BOOKINGS_PLANNER    // BookingResponse[] — 3 items
DEMO_BOOKING_DETAIL      // BookingResponse — ACCEPTED, 2 payment instalments
DEMO_INQUIRIES_CLIENT    // InquiryResponse[] — 4 items
DEMO_INQUIRIES_PLANNER   // InquiryResponse[] — 4 items
DEMO_MESSAGES            // InquiryMessageResponse[] — 8 messages
DEMO_PLANNER_STATS       // PlannerStatsResponse
DEMO_PLANNER_LISTINGS    // EventListingResponse[] — 4 items
DEMO_PLANNERS            // PlannerSummaryResponse[] — 6 planners
DEMO_DISPUTES            // DisputeResponse[]
DEMO_PENDING_PLANNERS    // PendingPlannerResponse[]
```

---

## Adding a New Showcase Page — Checklist

1. Choose the right pattern (standalone / props / QueryClient seeding).
2. Create `src/pages/showcase/{screen-name}.tsx` with the `NODE_ENV` guard.
3. Add any needed demo data to `src/showcase/data.ts`.
4. Update `src/pages/showcase/index.tsx` — add the new entry to the correct section.
5. If the real page navigates to new routes, add those routes to `getShowcaseRedirect` in `ShowcaseShell.tsx`.

---

## Production Guard (mandatory on every showcase page)

```typescript
export const getServerSideProps = () => {
  if (process.env.NODE_ENV === 'production') return { notFound: true }
  return { props: {} }
}
```

Never omit this. Showcase pages must never be reachable in production.
