# Page 02 — Discovery (`/listings`)

> **Goal:** The search results page. Filterable grid of listing cards with an optional
> map view. URL params drive all filtering so searches are shareable and bookmarkable.

**Status:** ⬜ Not started
**Depends on:** Page 01 foundation (ListingCard, api.ts, types.ts)

---

## Wireframe

```
┌─────────────────────────────────────────────────────────┐
│  NAVBAR (with embedded compact search bar)              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  FILTER BAR                                             │
│  [Event Type ▼] [Location] [Date] [Max Price] [Guests]  │
│  [Sort: Rating ▼]                          [Clear]      │
│                                                         │
├──────────────────────────────┬──────────────────────────┤
│                              │                          │
│  RESULTS                     │  MAP (optional, desktop) │
│  "124 planners found"        │                          │
│                              │  [leaflet or google map] │
│  [ Card ]  [ Card ]          │                          │
│  [ Card ]  [ Card ]          │                          │
│  [ Card ]  [ Card ]          │                          │
│                              │                          │
│  [ Load more / Pagination ]  │                          │
│                              │                          │
└──────────────────────────────┴──────────────────────────┘
│  FOOTER                                                 │
└─────────────────────────────────────────────────────────┘
```

---

## Next.js Concept — URL as State
*Read `NEXTJS_CONCEPTS.md` §1 for routing basics*

On this page, all filter state lives in the URL query string, not in `useState`.
This means:
- Searches are bookmarkable and shareable: `/listings?location=Lisbon&eventTypeId=1`
- Browser back/forward navigation works correctly
- The page can be SSR'd if needed

```ts
// Read filters from URL
const router = useRouter()
const { q, location, eventTypeId, date, maxPrice, guests, sortBy, page } = router.query

// Update filters — push to URL instead of setState
const updateFilter = (key: string, value: string) => {
  router.push({
    pathname: '/listings',
    query: { ...router.query, [key]: value, page: '0' }
  }, undefined, { shallow: true }) // shallow: don't re-run getServerSideProps
}
```

`shallow: true` updates the URL without a full page reload.

---

## Components Needed

| Component | Path | Notes |
|---|---|---|
| `FilterBar` | `components/listings/FilterBar.tsx` | All filter inputs |
| `ListingGrid` | `components/listings/ListingGrid.tsx` | Grid + skeleton states |
| `ListingCard` | `components/listings/ListingCard.tsx` | From Page 01 |
| `SortSelect` | `components/listings/SortSelect.tsx` | Dropdown for sort order |
| `Pagination` | `components/ui/Pagination.tsx` | Page controls |
| `ResultsCount` | `components/listings/ResultsCount.tsx` | "124 planners found" |
| `EmptyState` | `components/ui/EmptyState.tsx` | No results message |

---

## API Call

```ts
GET /listings
Query params: q, location, eventTypeId, date, maxPrice, guests, sortBy, page, size

// In component:
const { q, location, eventTypeId, date, maxPrice, guests, sortBy, page } = router.query

const { data, isLoading } = useQuery({
  queryKey: ['listings', router.query],  // refetches when any filter changes
  queryFn: () =>
    api.get('/listings', { params: router.query }).then(r => r.data.data),
  keepPreviousData: true,  // don't blank out results while loading next page
})
```

`data` is a `PageResponse<EventListingResponse>`:
```ts
{
  content: EventListingResponse[]
  page: number
  totalElements: number
  totalPages: number
  last: boolean
}
```

---

## Step-by-Step Build

### Step 1 — Create the page file

```tsx
// src/pages/listings/index.tsx
import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import PageShell from '@/components/layout/PageShell'
import FilterBar from '@/components/listings/FilterBar'
import ListingGrid from '@/components/listings/ListingGrid'
import Pagination from '@/components/ui/Pagination'

export default function DiscoveryPage() {
  const router = useRouter()

  const { data, isLoading } = useQuery({
    queryKey: ['listings', router.query],
    queryFn: () => api.get('/listings', { params: router.query }).then(r => r.data.data),
    keepPreviousData: true,
    enabled: router.isReady, // wait for router to be ready before fetching
  })

  return (
    <PageShell>
      <FilterBar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {data && (
          <p className="text-stone-warm mb-6">
            {data.totalElements} planners found
          </p>
        )}
        <ListingGrid listings={data?.content} isLoading={isLoading} />
        {data && <Pagination page={data.page} totalPages={data.totalPages} />}
      </div>
    </PageShell>
  )
}
```

### Step 2 — FilterBar component

Each filter input calls `updateFilter(key, value)` on change.
On mobile: filters collapse into a slide-out drawer or a "Filters" button + modal.

Inputs:
- Event type: `<select>` populated from `/event-types`
- Location: text input with debounce (wait 400ms after typing before updating URL)
- Date: `<input type="date">`
- Max Price: `<input type="number">`
- Guests: `<input type="number">`
- Sort: `<select>` with options PRICE_ASC, PRICE_DESC, RATING, NEWEST
- Clear button: `router.push('/listings')` to reset all filters

**Debounce** — don't hit the API on every keystroke:
```ts
import { useCallback, useEffect, useState } from 'react'

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}
```

### Step 3 — ListingGrid with skeletons

```tsx
// src/components/listings/ListingGrid.tsx
import ListingCard from './ListingCard'
import { EventListingResponse } from '@/lib/types'

type Props = {
  listings?: EventListingResponse[]
  isLoading: boolean
}

const SkeletonCard = () => (
  <div className="animate-pulse">
    <div className="bg-cream rounded-card aspect-[3/2] mb-3" />
    <div className="bg-cream h-4 rounded w-3/4 mb-2" />
    <div className="bg-cream h-4 rounded w-1/2" />
  </div>
)

export default function ListingGrid({ listings, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (!listings?.length) {
    return <EmptyState message="No planners found. Try adjusting your filters." />
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {listings.map(listing => <ListingCard key={listing.id} listing={listing} />)}
    </div>
  )
}
```

### Step 4 — Pagination

```tsx
// src/components/ui/Pagination.tsx
import { useRouter } from 'next/router'

type Props = { page: number; totalPages: number }

export default function Pagination({ page, totalPages }: Props) {
  const router = useRouter()

  const goTo = (p: number) => {
    router.push({ pathname: '/listings', query: { ...router.query, page: p } }, undefined, { shallow: true })
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex justify-center gap-2 mt-12">
      <button
        onClick={() => goTo(page - 1)}
        disabled={page === 0}
        className="px-4 py-2 rounded-btn border border-cream disabled:opacity-40
          hover:bg-primary hover:text-white hover:border-primary transition-colors"
      >
        Previous
      </button>
      <span className="px-4 py-2 text-stone-warm">
        Page {page + 1} of {totalPages}
      </span>
      <button
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages - 1}
        className="px-4 py-2 rounded-btn border border-cream disabled:opacity-40
          hover:bg-primary hover:text-white hover:border-primary transition-colors"
      >
        Next
      </button>
    </div>
  )
}
```

---

## Done Checklist

- [ ] `src/pages/listings/index.tsx` created
- [ ] FilterBar with all filter inputs working
- [ ] Filter changes update URL params (shallow routing)
- [ ] Debounce on text inputs (location, price)
- [ ] ListingGrid shows skeletons while loading
- [ ] ListingGrid shows EmptyState when no results
- [ ] Pagination controls working
- [ ] Results count displayed
- [ ] "Clear filters" resets to `/listings`
- [ ] Works correctly on mobile (filters collapse)
- [ ] Update status in `FRONTEND_PLAN.md`