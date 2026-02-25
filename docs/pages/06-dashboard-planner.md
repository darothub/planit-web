# Page 06 — Planner Dashboard (`/dashboard` when role=PLANNER)

> **Goal:** A planner's command centre. Manage listings, view incoming bookings,
> accept/decline requests, view analytics, manage calendar availability.

**Status:** ⬜ Not started
**Depends on:** Page 04 Auth, Page 05 Dashboard shell

---

## Wireframe

```
┌─────────────────────────────────────────────────────────┐
│  NAVBAR                                                 │
├──────────────┬──────────────────────────────────────────┤
│              │                                          │
│  SIDEBAR     │  Hello, Elegant Events!                  │
│              │                                          │
│  📊 Overview │  STATS ROW                               │
│  📋 Bookings │  [5 Bookings] [£8,500 Est.] [★4.9]      │
│  🗂 Listings │                                          │
│  💬 Messages │  INCOMING BOOKING REQUESTS               │
│  📅 Calendar │  ┌──────────────────────────────────┐   │
│  ⚠ Disputes │  │ Sarah J · Jun 15 · £2,000        │   │
│  👤 Profile  │  │ [Accept ✓]  [Decline ✗]          │   │
│              │  └──────────────────────────────────┘   │
│              │                                          │
│              │  YOUR LISTINGS                           │
│              │  ┌──────┐ ┌──────┐ ┌──────┐            │
│              │  │ List1│ │ List2│ │ + New│            │
│              │  └──────┘ └──────┘ └──────┘            │
│              │                                          │
└──────────────┴──────────────────────────────────────────┘
```

---

## Sidebar Nav (Planner)

```ts
const plannerNav = [
  { href: '/dashboard', label: 'Overview', icon: '📊' },
  { href: '/dashboard/bookings', label: 'Bookings', icon: '📋' },
  { href: '/dashboard/listings', label: 'My Listings', icon: '🗂' },
  { href: '/dashboard/inquiries', label: 'Messages', icon: '💬' },
  { href: '/dashboard/calendar', label: 'Calendar', icon: '📅' },
  { href: '/dashboard/disputes', label: 'Disputes', icon: '⚠️' },
  { href: '/dashboard/profile', label: 'Profile', icon: '👤' },
]
```

---

## API Calls

```ts
GET /planners/me/stats          → PlannerStatsResponse
GET /planners/me/analytics      → PlannerAnalyticsResponse
GET /bookings/received          → BookingResponse[] (all received)
GET /planners/me/listings       → EventListingResponse[]
GET /inquiries/received         → InquiryResponse[]
PATCH /bookings/received/{id}/respond   Body: { accept, declineReason? }
POST /planners/me/calendar/blocks
DELETE /planners/me/calendar/blocks/{id}
```

---

## Step-by-Step Build

### Step 1 — Stats Row (overview)

```tsx
// src/components/dashboard/PlannerStatsRow.tsx
const { data: stats } = useQuery({
  queryKey: ['planner-stats'],
  queryFn: () => api.get('/planners/me/stats').then(r => r.data.data),
})

// Display: totalBookings, estimatedEarnings, rating, averageResponseTimeDisplay
```

```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  12          │ │  £18,500     │ │  ★ 4.9        │ │  2h avg      │
│  Bookings    │ │  Est. Value  │ │  Rating       │ │  Response    │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

Each stat in a parchment card with a coloured icon.

### Step 2 — Incoming Booking Requests

Show REQUESTED status bookings that need a response.

```tsx
// Filter bookings by REQUESTED status
const pendingBookings = bookings?.filter(b => b.status === 'REQUESTED') ?? []
```

For each pending booking, show:
- Client name, event date, location, guest count
- Agreed price
- Accept / Decline buttons

```tsx
// Accept button
const respondMutation = useMutation({
  mutationFn: ({ bookingId, accept, declineReason }: { bookingId: number; accept: boolean; declineReason?: string }) =>
    api.patch(`/bookings/received/${bookingId}/respond`, { accept, declineReason })
       .then(r => r.data.data),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['received-bookings'] }),
})

// Decline: open a modal to capture declineReason before submitting
```

### Step 3 — Listing Management

```tsx
// src/pages/dashboard/listings/index.tsx
// GET /planners/me/listings → grid of listing cards
// Each card shows: cover image, title, status (Published/Draft), basePrice, booking count

// Actions on each card:
// [Edit] → /dashboard/listings/{id}/edit
// [Publish/Unpublish] → PATCH /planners/me/listings/{id}/publish
// [Delete] → DELETE (with confirmation modal)

// "New Listing" button → /dashboard/listings/new
```

### Step 4 — Create / Edit Listing Form

```tsx
// src/pages/dashboard/listings/new.tsx
// src/pages/dashboard/listings/[id]/edit.tsx

// Fields: title, description, eventTypeId (dropdown), location, basePrice,
//         cancellationPolicy (dropdown), minGuests, maxGuests, coverImageUrl

// Cover image: use the upload endpoint first, then save the URL
// POST /upload (multipart) → { url }
// Then store url in coverImageUrl field

// Image gallery management:
// POST /planners/me/listings/{id}/images  → add image
// DELETE /planners/me/listings/{id}/images/{imageId}  → remove
```

### Step 5 — Payment Schedule Configuration

On the listing edit page, add a "Payment Schedule" section:

```tsx
// GET /planners/me/listings/{id}/payment-schedule
// PUT /planners/me/listings/{id}/payment-schedule

// UI: number of instalments selector (1-4)
// For each instalment beyond 1: percentage input + days-before-event input
// Validation: percentages must sum to 100 (do this on the frontend too)
// Show a preview: "30% (£600) on booking · 70% (£1,400) 30 days before event"
```

### Step 6 — Calendar / Availability

```tsx
// src/pages/dashboard/calendar/index.tsx
// Show a monthly calendar (use a library like react-calendar or build simple grid)
// Blocked dates shown in terracotta
// Click a date range → modal to create a CalendarBlock
// POST /planners/me/calendar/blocks
//   { startDate, endDate, reason?, scope: 'ALL' | 'SELECTED', listingIds?: [] }
// Delete block: DELETE /planners/me/calendar/blocks/{id}
```

### Step 7 — Planner Profile Edit

```tsx
// src/pages/dashboard/profile/index.tsx
// GET /planners/me  → populate form
// PUT /planners/me  → save changes

// Sections:
// 1. Basic info (businessName, bio, location, yearsOfExperience)
// 2. Profile photo (upload → /upload → save URL to profileImageUrl)
// 3. Specialties (multi-select from event types, PUT /planners/me/specialties)
// 4. Portfolio images (grid of uploads, POST/DELETE /planners/me/portfolio)
```

---

## Booking Response Flow

When planner accepts:
1. Show confirmation: "Accepting will charge the client's deposit of £600"
2. On confirm: `PATCH /bookings/received/{id}/respond { accept: true }`
3. Success: show "Booking accepted! Deposit captured." toast
4. Refresh booking list

When planner declines:
1. Open modal with reason input (optional but encouraged)
2. `PATCH /bookings/received/{id}/respond { accept: false, declineReason: "..." }`
3. Success: "Booking declined" toast

---

## Done Checklist

- [ ] Planner overview page with stats row
- [ ] Incoming REQUESTED bookings shown with accept/decline
- [ ] Accept/decline mutation with confirmation modal
- [ ] Listing list: grid of planner's listings
- [ ] Create listing form with all fields
- [ ] Edit listing form (pre-populated)
- [ ] Image upload on listing form
- [ ] Publish/unpublish toggle
- [ ] Payment schedule configuration UI
- [ ] Calendar availability UI with block creation
- [ ] Planner profile edit form
- [ ] Portfolio image management
- [ ] Received booking list (all statuses)
- [ ] Update status in `FRONTEND_PLAN.md`