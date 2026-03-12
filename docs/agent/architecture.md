# Frontend Architecture

## Pages Router Structure

```
src/pages/
├── _app.tsx                    — global providers (QueryClient, authStore hydration)
├── _document.tsx               — HTML shell (Plus Jakarta Sans font, meta)
├── index.tsx                   — home page (/)
├── listings/
│   ├── index.tsx               — discovery / browse listings (/listings)
│   └── [id].tsx                — listing detail (/listings/123)
├── planners/
│   ├── index.tsx               — browse planners (/planners)
│   └── [id].tsx                — public planner profile (/planners/123)
├── auth/
│   ├── login.tsx               — sign in
│   └── register.tsx            — role picker + registration form
├── dashboard/
│   ├── index.tsx               — role-aware redirect (CLIENT → client view, PLANNER → planner view)
│   ├── bookings/
│   │   ├── index.tsx           — booking list
│   │   └── [id].tsx            — booking detail + actions
│   ├── listings/
│   │   ├── index.tsx           — planner listing management
│   │   └── new.tsx             — create / edit listing form
│   ├── inquiries/
│   │   └── index.tsx           — inquiry list
│   ├── disputes/
│   │   └── index.tsx           — dispute list
│   ├── calendar/
│   │   └── index.tsx           — availability calendar
│   ├── profile/
│   │   └── index.tsx           — planner profile & settings
│   └── settings/
│       └── index.tsx           — client account settings
├── messages/
│   └── [inquiryId].tsx         — real-time chat (STOMP WebSocket)
├── admin/
│   ├── index.tsx               — redirects to /admin/planners
│   ├── planners.tsx            — pending planner approval queue
│   └── disputes.tsx            — open dispute resolution
├── showcase/                   — dev-only UI preview (see docs/agent/showcase.md)
├── sitemap.xml.tsx             — dynamic sitemap served at /sitemap.xml
├── robots.txt.tsx              — dynamic robots.txt
├── forgot-password.tsx
├── reset-password.tsx
├── verify-email.tsx
├── 404.tsx
└── 500.tsx
```

---

## Auth State

### Zustand Store (`src/store/authStore.ts`)

```typescript
type AuthState = {
  token: string | null
  user: { id: number; email: string; firstName: string; lastName: string; role: UserRole } | null
  logout: () => void
}
```

- Persisted to `localStorage` via Zustand persist middleware
- Also stored as a cookie (`planit_token`) for the Axios interceptor
- Token is a Bearer JWT

### Login Flow

```typescript
// On successful login/register, call:
handleAuthSuccess(data: AuthResponse)

// This sets both:
Cookies.set('planit_token', data.token, { expires: 7 })
useAuthStore.setState({ token: data.token, user: { ... } })
```

### Auth Guards in Pages

```typescript
// Protected page pattern (dashboard, messages etc.)
useEffect(() => {
  if (!token) router.replace('/auth/login')
}, [token])

if (!token) return null  // Prevent flash of protected content
```

### Role-Based Rendering

```typescript
const { user } = useAuthStore()

if (user?.role === 'PLANNER') return <PlannerView />
if (user?.role === 'CLIENT')  return <ClientView />
```

---

## React Query Patterns

### Demo-First Pattern (mandatory for all data fetching)

Every `useQuery` must follow this pattern:

```typescript
const DEMO_DATA: MyType = { /* realistic demo values */ }

const { data = DEMO_DATA, isLoading } = useQuery<MyType>({
  queryKey: ['my-resource', id],
  queryFn: () => api.get(`/my-resource/${id}`).then(r => r.data.data),
  placeholderData: DEMO_DATA,   // shown while loading (no flash)
  retry: false,                  // fail fast, don't hammer API
})
```

Why both `placeholderData` AND `= DEMO_DATA`:
- `placeholderData` covers the loading state
- `= DEMO_DATA` covers the error state (when `data` is `undefined` after failure)

### Mutations

```typescript
const mutation = useMutation({
  mutationFn: (payload: MyRequest) =>
    api.post('/my-endpoint', payload).then(r => r.data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['my-resource'] })
    toast.success('Done!')
  },
  onError: (err: AxiosError<ApiResponse<null>>) => {
    toast.error(err.response?.data?.message ?? 'Something went wrong')
  },
})
```

### Query Keys Convention

```typescript
['listings', queryParams]          // browse listings
['listing', id]                    // single listing
['planners', queryParams]          // browse planners
['planner', id]                    // single planner
['my-bookings']                    // client's bookings
['received-bookings']              // planner's received bookings
['booking', id]                    // single booking detail
['my-inquiries']                   // client inquiries
['received-inquiries']             // planner inquiries
['messages', inquiryId]            // chat messages
['planner-stats']                  // planner dashboard stats
['my-listings']                    // planner's own listings
['event-types']                    // catalog (staleTime: Infinity)
['profile-avatar', userId]         // navbar avatar
```

---

## API Client (`src/lib/api.ts`)

Axios instance with base URL from `NEXT_PUBLIC_API_URL`. Interceptor automatically attaches `Authorization: Bearer <token>` from `Cookies.get('planit_token')` to every request.

```typescript
// GET with query params
api.get('/listings', { params: { eventTypeId: 1, location: 'London', page: 0 } })

// POST
api.post('/bookings', { inquiryId, stripePaymentMethodId, agreedPrice })

// PATCH
api.patch(`/bookings/${id}/accept`)

// All responses: { success, message, data }
// Access with: .then(r => r.data.data)
```

---

## TypeScript Types

All API types are in `src/lib/types.ts`. When adding a new endpoint:
1. Add the response type to `types.ts` first
2. Reference it in the page/component

Never define inline types for API shapes — always go to `types.ts`.

Key types:
- `ApiResponse<T>` — universal API wrapper `{ success, message, data: T }`
- `PageResponse<T>` — pagination `{ content, page, size, totalElements, totalPages, first, last }`
- `EventListingResponse`, `EventListingDetailResponse` — listing data
- `PlannerProfileResponse`, `PlannerSummaryResponse` — planner data
- `BookingResponse`, `BookingPaymentResponse` — booking data
- `InquiryResponse`, `InquiryMessageResponse` — messaging
- `AuthResponse` — login/register response (includes token)

---

## Component Structure

```
src/components/
├── ui/           — primitives: Pagination, EmptyState, Modal, Badge, etc.
├── layout/       — Navbar, Footer, PageShell (wraps every public page)
├── home/         — HomePage-specific: SearchStrip, CategoryRow, HowItWorks
├── listings/     — ListingCard, ListingGrid, FilterBar, ReviewCard
├── planners/     — PlannerCard, ContactButton
├── bookings/     — BookingCard, PaymentBreakdown, DisputePanel
├── auth/         — LoginForm, RegisterForm
├── dashboard/    — ClientDashboard, PlannerDashboard, DashboardShell
├── inquiries/    — InquiryList, InquiryCard
├── messages/     — ChatWindow, InboxSidebar (STOMP hooks in src/hooks/)
└── reviews/      — ReviewForm, ReviewCard (reused in listings + planner profile)
```

### PageShell

Wraps every public page with `<Navbar />` + `<Footer />`. Use for all non-dashboard, non-auth pages.

```typescript
<PageShell>
  {/* page content */}
</PageShell>
```

Dashboard pages use `DashboardShell` instead.

---

## Demo Data (`src/lib/demoData.ts`)

- 7 event categories, each with multiple listings
- Unsplash images for visuals
- **Negative IDs** (`id: -1`, `-2`, etc.) — guaranteed never to clash with real DB IDs
- `getAllDemoListings()` — flat array of all demo listings
- `getDemoListings(eventTypeName)` — listings for a specific category

Used by public pages as fallback data when the API is unavailable.
