# Page 08 — Public Planner Profile (`/planners/[id]`)

> **Goal:** A public-facing profile page for a planner. Clients can browse their portfolio,
> read reviews, see their listings, and start a conversation. Uses SSR for SEO.

**Status:** ⬜ Not started
**Depends on:** Page 01 foundation, Page 03 ListingCard

---

## Next.js Concept — SSR
*Same pattern as Listing Detail (Page 03). Uses `getServerSideProps`.*

---

## Wireframe

```
┌─────────────────────────────────────────────────────────┐
│  NAVBAR                                                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  HERO BANNER (earthy gradient or blurred portfolio img) │
│                                                         │
│  ┌─────┐  Elegant Events Studio            [Contact]   │
│  │ Img │  ★ 4.9 · 124 reviews · Lisbon                │
│  └─────┘  Wedding · Corporate · Birthday               │
│           8 years experience · Verified ✓              │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ABOUT                                                  │
│  Bio text goes here...                                  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  PORTFOLIO                                              │
│  [Img] [Img] [Img] [Img] [Img] [Img]                   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  LISTINGS BY THIS PLANNER                              │
│  [ ListingCard ] [ ListingCard ] [ ListingCard ]        │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  REVIEWS                                                │
│  [ ReviewCard ] [ ReviewCard ] [ ReviewCard ]           │
│                                                         │
└─────────────────────────────────────────────────────────┘
│  FOOTER                                                 │
└─────────────────────────────────────────────────────────┘
```

---

## API Calls

```ts
// Server-side (in getServerSideProps)
GET /planners/{id}       → we don't have a public planner endpoint yet!

// The current API has GET /planners/me (auth required)
// For public profile, we can combine:
GET /listings?plannerId={id}&size=20   → planner's published listings (includes planner info)
GET /planners/{id}/reviews             → public planner reviews

// OR: derive planner info from the listings response (listing.planner has id, businessName, profileImageUrl)
// For full profile data (bio, portfolio), we may need to add a public endpoint later
```

> ⚠️ **Note:** The backend doesn't yet have a public `GET /planners/{id}` endpoint.
> For MVP, get planner info from their listing details.
> The planner profile page can be built with listing data + reviews.
> A future backend task: add `GET /api/v1/planners/{id}` (public, no auth).

---

## Components Needed

| Component | Path | Notes |
|---|---|---|
| `PlannerHero` | `components/planners/PlannerHero.tsx` | Name, avatar, stats, bio |
| `PortfolioGrid` | `components/planners/PortfolioGrid.tsx` | Photo grid with lightbox |
| `ListingCard` | `components/listings/ListingCard.tsx` | Reused from Page 01 |
| `ReviewCard` | `components/listings/ReviewCard.tsx` | Reused from Page 03 |
| `ContactButton` | `components/planners/ContactButton.tsx` | Opens inquiry flow |

---

## Step-by-Step Build

### Step 1 — Page with SSR

```tsx
// src/pages/planners/[id].tsx
import type { GetServerSideProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import PageShell from '@/components/layout/PageShell'
import { EventListingResponse, ReviewResponse } from '@/lib/types'
import ListingCard from '@/components/listings/ListingCard'

type PlannerInfo = {
  id: number
  businessName: string
  profileImageUrl: string
  rating: number
  reviewCount: number
}

type Props = {
  planner: PlannerInfo
  listings: EventListingResponse[]
  reviews: ReviewResponse[]
}

export default function PlannerProfilePage({ planner, listings, reviews }: Props) {
  return (
    <PageShell>
      <Head>
        <title>{planner.businessName} — Planit</title>
        <meta name="description" content={`Book ${planner.businessName} on Planit. ★${planner.rating} rating.`} />
      </Head>

      {/* Hero */}
      <div className="bg-gradient-to-br from-accent to-primary h-48" />

      <div className="max-w-5xl mx-auto px-4">
        {/* Planner header — overlaps hero */}
        <div className="-mt-16 flex items-end gap-6 mb-8">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
            <Image
              src={planner.profileImageUrl || '/avatar-placeholder.png'}
              alt={planner.businessName}
              fill
              className="object-cover"
            />
          </div>
          <div className="pb-2">
            <h1 className="text-2xl font-bold text-charcoal">{planner.businessName}</h1>
            <p className="text-stone-warm">
              ★ {planner.rating?.toFixed(1)} · {planner.reviewCount} reviews
            </p>
          </div>
        </div>

        {/* Listings */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6">Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
        </section>

        {/* Reviews */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6">Reviews</h2>
          <div className="flex flex-col gap-4">
            {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
          </div>
        </section>
      </div>
    </PageShell>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!
  const base = process.env.NEXT_PUBLIC_API_URL

  try {
    const [listingsRes, reviewsRes] = await Promise.all([
      fetch(`${base}/listings?size=20`),   // ideally filter by plannerId when backend supports it
      fetch(`${base}/planners/${id}/reviews`),
    ])

    const listingsJson = await listingsRes.json()
    const reviewsJson = await reviewsRes.json()

    const listings: EventListingResponse[] = listingsJson.data?.content ?? []

    // Derive planner info from first listing
    const plannerFromListing = listings[0]?.planner
    if (!plannerFromListing) return { notFound: true }

    const planner: PlannerInfo = {
      id: Number(id),
      businessName: plannerFromListing.businessName ?? 'Event Planner',
      profileImageUrl: plannerFromListing.profileImageUrl ?? '',
      rating: listings[0]?.averageRating ?? 0,
      reviewCount: reviewsJson.data?.length ?? 0,
    }

    return {
      props: {
        planner,
        listings,
        reviews: reviewsJson.data ?? [],
      }
    }
  } catch {
    return { notFound: true }
  }
}
```

> **Note:** This is a temporary workaround. When the backend adds `GET /planners/{id}`,
> replace the listings-derived planner info with the real endpoint response.
> Add a TODO comment in the code for this.

### Step 2 — ContactButton

The contact button opens the inquiry flow:
- If not logged in → redirect to `/auth/login?redirect=/planners/{id}`
- If logged in as CLIENT → show a modal to select which listing and send first message

```tsx
// The Contact / Book flow:
// 1. User picks a listing from the planner's listings
// 2. Fills in event date, guest count, budget, opening message
// 3. POST /inquiries { listingId, eventDate, guestCount, budgetRange, message }
// 4. Navigate to /messages/{inquiryId}
```

### Step 3 — ReviewCard

```tsx
// src/components/listings/ReviewCard.tsx
import { ReviewResponse } from '@/lib/types'
import { formatDate } from '@/lib/utils'

export default function ReviewCard({ review }: { review: ReviewResponse }) {
  return (
    <div className="bg-parchment rounded-card p-5 shadow-card">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center
          text-charcoal font-semibold text-sm">
          {review.reviewer.firstName[0]}{review.reviewer.lastName[0]}
        </div>
        <div>
          <p className="font-medium text-sm">
            {review.reviewer.firstName} {review.reviewer.lastName}
          </p>
          <p className="text-xs text-stone-warm">{formatDate(review.createdAt)}</p>
        </div>
        <div className="ml-auto text-primary text-sm">
          {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
        </div>
      </div>
      {review.comment && (
        <p className="text-charcoal text-sm leading-relaxed">{review.comment}</p>
      )}
    </div>
  )
}
```

---

## Future Backend Task

Add a public planner profile endpoint to the Spring Boot API:

```
GET /api/v1/planners/{id}
Auth: none (public)
Response: ApiResponse<PublicPlannerProfileResponse>
  - id, businessName, bio, location, profileImageUrl
  - yearsOfExperience, rating, reviewCount
  - specialties, portfolio images
  - verificationStatus (only show if VERIFIED)
```

This removes the need to derive planner info from listing data.

---

## Done Checklist

- [ ] `src/pages/planners/[id].tsx` with `getServerSideProps`
- [ ] Hero banner with planner avatar, name, rating
- [ ] Planner listings grid using ListingCard
- [ ] Reviews section with ReviewCard
- [ ] ContactButton — opens inquiry creation modal
- [ ] Inquiry creation form (listing picker + event details + message)
- [ ] Success → navigate to `/messages/{inquiryId}`
- [ ] Not-logged-in state → redirect to auth
- [ ] `<Head>` with SEO meta tags
- [ ] 404 for non-existent planner ID
- [ ] TODO comment for future `GET /planners/{id}` endpoint
- [ ] Update status in `FRONTEND_PLAN.md`