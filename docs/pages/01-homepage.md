# Page 01 — Homepage (`/`)

> **Goal:** Make a stunning first impression. Hero with search. Event type categories.
> Featured listings grid. This is the page that sells the product.

**Status:** ⬜ Not started

---

## Wireframe

```
┌─────────────────────────────────────────────────────────┐
│  NAVBAR                                                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  HERO — full-bleed, 70vh min height                     │
│  Background: warm earthy photo overlay or gradient      │
│                                                         │
│    Find the perfect planner                             │
│    for your perfect day.                                │
│                                                         │
│  ┌──────────┬──────────┬──────────┬────────────────┐   │
│  │ What?    │ Where?   │ When?    │  [Search →]    │   │
│  └──────────┴──────────┴──────────┴────────────────┘   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  EVENT TYPE CATEGORIES                                  │
│  Scrollable horizontal pill row                         │
│  🎂 Wedding  🎉 Birthday  🏢 Corporate  ...             │
├─────────────────────────────────────────────────────────┤
│  FEATURED LISTINGS                                      │
│  "Handpicked for you"                                   │
│  [ Card ]  [ Card ]  [ Card ]  [ Card ]                 │
├─────────────────────────────────────────────────────────┤
│  HOW IT WORKS  (3-step explainer)                       │
│  1. Browse   2. Message   3. Book                       │
├─────────────────────────────────────────────────────────┤
│  FOOTER                                                 │
└─────────────────────────────────────────────────────────┘
```

---

## Components Needed

| Component | Path | Notes |
|---|---|---|
| `HeroSearch` | `components/home/HeroSearch.tsx` | Inline search form with 3 inputs |
| `EventTypeCategories` | `components/home/EventTypeCategories.tsx` | Fetches `/event-types`, horizontal scroll |
| `ListingCard` | `components/listings/ListingCard.tsx` | Reused across the whole app |
| `FeaturedListings` | `components/home/FeaturedListings.tsx` | Grid of 4–8 cards |
| `HowItWorks` | `components/home/HowItWorks.tsx` | Static 3-step section |
| `Navbar` | `components/layout/Navbar.tsx` | Shared |
| `Footer` | `components/layout/Footer.tsx` | Shared |

---

## API Calls

```ts
// Featured listings — filter isFeatured
GET /listings?sortBy=RATING&size=8

// Event type categories
GET /event-types
```

Both are public (no auth required). Fetch client-side with React Query.

---

## Step-by-Step Build

### Step 1 — Foundation files (do this before any page)

1. **Tailwind config** — update `tailwind.config.ts` with the earth-tone colours from `docs/DESIGN_SYSTEM.md`

2. **Font** — update `src/pages/_document.tsx` to load Plus Jakarta Sans from Google Fonts

3. **Globals** — update `src/styles/globals.css`:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;

   body {
     @apply bg-sand text-charcoal font-sans;
   }
   ```

4. **API client** — create `src/lib/api.ts`:
   ```ts
   import axios from 'axios'
   import Cookies from 'js-cookie'

   export const api = axios.create({
     baseURL: process.env.NEXT_PUBLIC_API_URL,
   })

   api.interceptors.request.use((config) => {
     const token = Cookies.get('planit_token')
     if (token) config.headers.Authorization = `Bearer ${token}`
     return config
   })
   ```

5. **Types** — create `src/lib/types.ts` with all types from `docs/API_REFERENCE.md`

6. **Auth store** — create `src/store/authStore.ts` (see `docs/NEXTJS_CONCEPTS.md` §11)

7. **Utils** — create `src/lib/utils.ts`:
   ```ts
   export function formatPrice(amount: number, currency = 'GBP') {
     return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(amount)
   }

   export function formatDate(date: string) {
     return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
   }

   export function cn(...classes: (string | undefined | false)[]) {
     return classes.filter(Boolean).join(' ')
   }
   ```

8. **`_app.tsx`** — wrap with QueryClientProvider + read auth from store

9. **Navbar** — sticky, logo, auth-aware links

10. **Footer** — simple links, copyright

---

### Step 2 — ListingCard component

This is the most reused component in the app. Build it carefully.

```tsx
// src/components/listings/ListingCard.tsx
import Link from 'next/link'
import Image from 'next/image'
import { EventListingResponse } from '@/lib/types'
import { formatPrice } from '@/lib/utils'

type Props = { listing: EventListingResponse }

export default function ListingCard({ listing }: Props) {
  return (
    <Link href={`/listings/${listing.id}`} className="group block">
      <div className="bg-parchment rounded-card shadow-card hover:shadow-card-hover transition-shadow duration-300 overflow-hidden">

        {/* Image with zoom on hover */}
        <div className="relative aspect-[3/2] overflow-hidden">
          <Image
            src={listing.coverImageUrl || '/placeholder.jpg'}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Event type badge */}
          <span className="absolute top-3 left-3 bg-accent/80 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
            {listing.eventType.displayName}
          </span>
        </div>

        {/* Card content */}
        <div className="p-4">
          <p className="text-stone-warm text-sm">{listing.location}</p>
          <h3 className="font-semibold text-charcoal line-clamp-2 mt-1">{listing.title}</h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-2">
            <span className="text-primary text-sm">★</span>
            <span className="text-sm font-medium">{listing.averageRating?.toFixed(1) ?? 'New'}</span>
            {listing.reviewCount > 0 && (
              <span className="text-stone-warm text-sm">({listing.reviewCount})</span>
            )}
          </div>

          {/* Price */}
          <p className="mt-2 text-charcoal">
            <span className="text-stone-warm text-sm">From </span>
            <span className="font-semibold">{formatPrice(listing.basePrice)}</span>
          </p>
        </div>
      </div>
    </Link>
  )
}
```

---

### Step 3 — HeroSearch component

The hero takes up ~70vh. Search bar has 3 fields: event type (dropdown), location (text), date (date picker).

On submit, navigate to `/listings` with the search params in the URL:
```ts
router.push({
  pathname: '/listings',
  query: { eventTypeId, location, date }
})
```

---

### Step 4 — EventTypeCategories

```tsx
// Fetch event types and render as horizontal scrollable pills
const { data } = useQuery({
  queryKey: ['event-types'],
  queryFn: () => api.get('/event-types').then(r => r.data.data),
  staleTime: Infinity, // never changes
})
```

Each pill: clicking navigates to `/listings?eventTypeId={id}`.

---

### Step 5 — FeaturedListings

```tsx
const { data, isLoading } = useQuery({
  queryKey: ['featured-listings'],
  queryFn: () =>
    api.get('/listings', { params: { sortBy: 'RATING', size: 8 } })
       .then(r => r.data.data.content),
})
```

Show skeleton cards while loading (see DESIGN_SYSTEM.md skeleton pattern).

---

### Step 6 — Assemble in `src/pages/index.tsx`

```tsx
import PageShell from '@/components/layout/PageShell'
import HeroSearch from '@/components/home/HeroSearch'
import EventTypeCategories from '@/components/home/EventTypeCategories'
import FeaturedListings from '@/components/home/FeaturedListings'
import HowItWorks from '@/components/home/HowItWorks'

export default function HomePage() {
  return (
    <PageShell>
      <HeroSearch />
      <EventTypeCategories />
      <FeaturedListings />
      <HowItWorks />
    </PageShell>
  )
}
```

---

## Done Checklist

- [ ] Tailwind config updated with earth-tone palette
- [ ] Plus Jakarta Sans font loaded
- [ ] `src/lib/api.ts` created
- [ ] `src/lib/types.ts` created with all API types
- [ ] `src/store/authStore.ts` created
- [ ] `src/lib/utils.ts` created (formatPrice, formatDate, cn)
- [ ] `_app.tsx` has QueryClientProvider
- [ ] Navbar built and working
- [ ] Footer built
- [ ] `ListingCard` component built
- [ ] `HeroSearch` with 3 fields + submit navigates to /listings
- [ ] `EventTypeCategories` fetches and renders
- [ ] `FeaturedListings` fetches, shows skeletons while loading
- [ ] `HowItWorks` static section
- [ ] Homepage looks great on mobile and desktop
- [ ] Update status in `FRONTEND_PLAN.md`