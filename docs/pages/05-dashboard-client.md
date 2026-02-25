# Page 05 — Client Dashboard (`/dashboard`)

> **Goal:** A client's home base. See their bookings, inquiries, and disputes.
> Role-aware: the same `/dashboard` route detects role and renders the right view.

**Status:** ⬜ Not started
**Depends on:** Page 04 Auth (requires login)

---

## Next.js Concepts
*Read `NEXTJS_CONCEPTS.md` §9 (Protected Routes) before building*

---

## Wireframe

```
┌─────────────────────────────────────────────────────────┐
│  NAVBAR                                                 │
├──────────────┬──────────────────────────────────────────┤
│              │                                          │
│  SIDEBAR     │  MAIN CONTENT                            │
│              │                                          │
│  📋 Bookings │  Hello, Sarah!                           │
│  💬 Messages │                                          │
│  ⭐ Reviews  │  YOUR BOOKINGS                           │
│  ⚠ Disputes │  ┌──────────────────────────────────┐   │
│              │  │ Elegant Garden · ACCEPTED         │   │
│              │  │ 📅 Jun 15 · £2,000               │   │
│              │  │ [View Details] [Message Planner]  │   │
│              │  └──────────────────────────────────┘   │
│              │  ┌──────────────────────────────────┐   │
│              │  │ City Rooftop · REQUESTED          │   │
│              │  │ 📅 Aug 20 · £3,500               │   │
│              │  └──────────────────────────────────┘   │
│              │                                          │
└──────────────┴──────────────────────────────────────────┘
```

---

## Route Structure

```
src/pages/dashboard/
├── index.tsx           ← role-aware landing (redirects based on role)
├── bookings/
│   ├── index.tsx       ← booking list
│   └── [id].tsx        ← single booking detail
├── inquiries/
│   └── index.tsx       ← inquiry list
└── disputes/
    └── index.tsx       ← dispute list + detail
```

---

## Role-Aware Routing

The `/dashboard` index detects the user's role and shows the right content:

```tsx
// src/pages/dashboard/index.tsx
import { useAuthStore } from '@/store/authStore'
import ClientDashboard from '@/components/dashboard/ClientDashboard'
import PlannerDashboard from '@/components/dashboard/PlannerDashboard'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { token, user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!token) router.replace('/auth/login?redirect=/dashboard')
  }, [token, router])

  if (!user) return null

  if (user.role === 'CLIENT') return <ClientDashboard />
  if (user.role === 'PLANNER') return <PlannerDashboard />
  if (user.role === 'ADMIN') return <div>Admin panel coming soon</div>

  return null
}
```

---

## Components Needed

| Component | Path | Notes |
|---|---|---|
| `DashboardShell` | `components/dashboard/DashboardShell.tsx` | Sidebar + main layout |
| `ClientDashboard` | `components/dashboard/ClientDashboard.tsx` | Client's home view |
| `BookingCard` | `components/bookings/BookingCard.tsx` | Single booking summary |
| `BookingStatusBadge` | `components/bookings/BookingStatusBadge.tsx` | Coloured status pill |
| `InquiryCard` | `components/inquiries/InquiryCard.tsx` | Single inquiry summary |
| `DisputeCard` | `components/disputes/DisputeCard.tsx` | Single dispute summary |

---

## API Calls

```ts
GET /bookings/my           → ApiResponse<BookingResponse[]>
GET /inquiries/my          → ApiResponse<InquiryResponse[]>
GET /bookings/my/{id}      → single booking detail
PATCH /bookings/my/{id}/cancel
POST /bookings/my/{id}/confirm-completion
```

---

## Step-by-Step Build

### Step 1 — DashboardShell

Shared wrapper for client and planner dashboards.
Sidebar with nav links, main content area on the right.

```tsx
// src/components/dashboard/DashboardShell.tsx
import { useAuthStore } from '@/store/authStore'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Navbar from '@/components/layout/Navbar'

const clientNav = [
  { href: '/dashboard/bookings', label: 'Bookings', icon: '📋' },
  { href: '/dashboard/inquiries', label: 'Messages', icon: '💬' },
  { href: '/dashboard/disputes', label: 'Disputes', icon: '⚠️' },
]

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user } = useAuthStore()
  const nav = user?.role === 'CLIENT' ? clientNav : plannerNav // see Page 06

  return (
    <div className="min-h-screen bg-sand">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
        {/* Sidebar */}
        <aside className="hidden md:block w-56 flex-shrink-0">
          <nav className="flex flex-col gap-1">
            {nav.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-btn text-sm font-medium transition-colors',
                  router.pathname.startsWith(item.href)
                    ? 'bg-primary text-white'
                    : 'text-charcoal hover:bg-cream'
                )}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
```

### Step 2 — Booking List

```tsx
// src/pages/dashboard/bookings/index.tsx
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import DashboardShell from '@/components/dashboard/DashboardShell'
import BookingCard from '@/components/bookings/BookingCard'

export default function ClientBookingsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => api.get('/bookings/my').then(r => r.data.data),
  })

  return (
    <DashboardShell>
      <h1 className="text-2xl font-bold mb-6">Your Bookings</h1>
      {isLoading && <p>Loading...</p>}
      <div className="flex flex-col gap-4">
        {data?.map(booking => (
          <BookingCard key={booking.id} booking={booking} role="CLIENT" />
        ))}
      </div>
    </DashboardShell>
  )
}
```

### Step 3 — BookingCard

Shows booking summary with status badge and action buttons.

```tsx
// Status → colour mapping
const statusColours: Record<BookingStatus, string> = {
  REQUESTED:  'bg-yellow-100 text-yellow-800',
  ACCEPTED:   'bg-green-100 text-green-800',
  DECLINED:   'bg-red-100 text-red-800',
  COMPLETED:  'bg-accent/10 text-accent',
  CANCELLED:  'bg-gray-100 text-gray-600',
  REFUNDED:   'bg-blue-100 text-blue-800',
  DISPUTED:   'bg-orange-100 text-orange-800',
  AT_RISK:    'bg-red-100 text-red-800',
}

// Client actions per status:
// REQUESTED  → no action (waiting for planner)
// ACCEPTED   → [Confirm Completion] [Cancel] [Message Planner]
// COMPLETED  → [Leave Review]
// REFUNDED   → read only
```

### Step 4 — Booking Detail Page

```tsx
// src/pages/dashboard/bookings/[id].tsx
// Fetch single booking: GET /bookings/my/{id}
// Show full details: instalment breakdown, event info, payment status
// Actions: cancel, confirm completion, request date change
```

Payment instalment table:
```
Instalment  Amount   Due Date     Status
1 (Deposit) £600     Paid         ✅ CAPTURED
2           £1,400   Jun 15       ⏳ SCHEDULED
```

### Step 5 — Cancellation flow

When client clicks "Cancel Booking":
1. Show a confirmation modal (don't cancel immediately)
2. Display the cancellation policy and estimated refund
3. Confirm → `PATCH /bookings/my/{id}/cancel`

Refund estimates:
```ts
function estimateRefund(booking: BookingResponse): string {
  const policy = booking.listing.cancellationPolicy // you'll need to store this on booking
  const daysUntilEvent = differenceInDays(new Date(booking.eventDate), new Date())

  if (policy === 'FLEXIBLE' && daysUntilEvent > 14) return 'Full refund'
  if (policy === 'MODERATE' && daysUntilEvent > 7) return '50% refund'
  return 'No refund'
}
```

### Step 6 — Date Change Request flow

From booking detail, client can request a new date:
1. Show date picker
2. Fetch fee quote: `GET /bookings/{id}/date-change/quote?requestedDate=YYYY-MM-DD`
3. Display fee, optional coupon code input
4. Submit: `POST /bookings/{id}/date-change`

---

## Done Checklist

- [ ] `src/pages/dashboard/index.tsx` with role-aware redirect
- [ ] `DashboardShell` with sidebar nav
- [ ] Protected — redirects to login if unauthenticated
- [ ] `src/pages/dashboard/bookings/index.tsx` booking list
- [ ] `BookingCard` with status badge and contextual actions
- [ ] `BookingStatusBadge` colour-coded by status
- [ ] `src/pages/dashboard/bookings/[id].tsx` booking detail
- [ ] Instalment payment table shown on booking detail
- [ ] Cancellation confirmation modal with refund estimate
- [ ] Date change request flow with fee quote
- [ ] `src/pages/dashboard/inquiries/index.tsx` inquiry list
- [ ] `src/pages/dashboard/disputes/index.tsx` dispute list
- [ ] Update status in `FRONTEND_PLAN.md`