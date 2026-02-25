# Page 03 — Listing Detail (`/listings/[id]`)

> **Goal:** The most important page for conversion. Full listing info, photo gallery,
> planner card, reviews, availability calendar, and booking CTA. Uses SSR for SEO.

**Status:** ⬜ Not started
**Depends on:** Page 01 foundation, Page 04 Auth (user must be logged in to book)

---

## Next.js Concept — SSR with getServerSideProps
*Read `NEXTJS_CONCEPTS.md` §4 before building this page*

This page uses **Server-Side Rendering** because:
- Google must be able to read listing titles, descriptions, and prices
- The content is dynamic (listings can change)

The data is fetched on the server, and the full HTML is sent to the browser.
No loading spinner on first load.

---

## Wireframe

```
┌─────────────────────────────────────────────────────────┐
│  NAVBAR                                                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  PHOTO GALLERY                                          │
│  ┌──────────────────┬────────────┬───────────┐          │
│  │                  │  Photo 2   │  Photo 3  │          │
│  │   Main Photo     ├────────────┼───────────┤          │
│  │   (large)        │  Photo 4   │  Photo 5  │          │
│  └──────────────────┴────────────┴───────────┘          │
│                           [Show all photos]             │
├──────────────────────────┬──────────────────────────────┤
│                          │                              │
│  LISTING INFO            │  BOOKING CARD (sticky)       │
│                          │                              │
│  # Title                 │  From £1,500                 │
│  ★ 4.9 · 124 reviews     │  [Date picker]               │
│  📍 Lisbon               │  [Guests input]              │
│                          │  [Message Planner]           │
│  ABOUT                   │  [Book Now]  (if logged in)  │
│  Lorem ipsum...          │                              │
│                          │  Cancellation Policy:        │
│  EVENT TYPE              │  MODERATE                    │
│  Wedding                 │                              │
│                          │                              │
│  PLANNER CARD            │                              │
│  [Avatar] Name           │                              │
│  ★ 4.9 · Verified        │                              │
│  [View Profile]          │                              │
│                          │                              │
│  REVIEWS                 │                              │
│  [ Review ] [ Review ]   │                              │
│                          │                              │
└──────────────────────────┴──────────────────────────────┘
│  FOOTER                                                 │
└─────────────────────────────────────────────────────────┘
```

---

## Components Needed

| Component | Path | Notes |
|---|---|---|
| `PhotoGallery` | `components/listings/PhotoGallery.tsx` | Grid of 5 photos + "show all" |
| `BookingCard` | `components/listings/BookingCard.tsx` | Sticky right column |
| `PlannerCard` | `components/listings/PlannerCard.tsx` | Planner info + link to profile |
| `ReviewList` | `components/listings/ReviewList.tsx` | List of review cards |
| `ReviewCard` | `components/listings/ReviewCard.tsx` | Single review |
| `StarRating` | `components/ui/StarRating.tsx` | Reusable star display |
| `CancellationBadge` | `components/ui/CancellationBadge.tsx` | Policy label + tooltip |

---

## API Calls

```ts
// Server-side (in getServerSideProps)
GET /listings/{id}    → EventListingDetailResponse (listing + images + recentReviews)

// Client-side (after page loads)
GET /listings/{id}/reviews    → full review list (if user wants to see more)
```

---

## Step-by-Step Build

### Step 1 — Page file with SSR

```tsx
// src/pages/listings/[id].tsx
import type { GetServerSideProps } from 'next'
import { EventListingDetailResponse } from '@/lib/types'
import PageShell from '@/components/layout/PageShell'
import PhotoGallery from '@/components/listings/PhotoGallery'
import BookingCard from '@/components/listings/BookingCard'
import PlannerCard from '@/components/listings/PlannerCard'
import ReviewList from '@/components/listings/ReviewList'

type Props = { listing: EventListingDetailResponse }

export default function ListingDetailPage({ listing }: Props) {
  return (
    <PageShell>
      <div className="max-w-7xl mx-auto px-4 py-8">

        <PhotoGallery images={[listing.coverImageUrl, ...listing.images.map(i => i.imageUrl)]} />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">

          {/* Left: listing info */}
          <div>
            <h1 className="text-3xl font-bold text-charcoal">{listing.title}</h1>
            <div className="flex items-center gap-3 mt-2 text-stone-warm">
              <span>★ {listing.averageRating?.toFixed(1)} · {listing.reviewCount} reviews</span>
              <span>·</span>
              <span>📍 {listing.location}</span>
            </div>

            <hr className="my-6 border-cream" />

            <h2 className="text-xl font-semibold mb-3">About this service</h2>
            <p className="text-charcoal leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>

            <hr className="my-6 border-cream" />
            <PlannerCard planner={listing.planner} />

            <hr className="my-6 border-cream" />
            <ReviewList reviews={listing.recentReviews} listingId={listing.id} />
          </div>

          {/* Right: sticky booking card */}
          <div className="relative">
            <div className="sticky top-24">
              <BookingCard listing={listing} />
            </div>
          </div>
        </div>

      </div>
    </PageShell>
  )
}

// SSR — runs on server, fetches data before page renders
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings/${id}`)
    const json = await res.json()

    if (!json.success || !json.data) {
      return { notFound: true }
    }

    return { props: { listing: json.data } }
  } catch {
    return { notFound: true }
  }
}
```

### Step 2 — PhotoGallery

Show up to 5 images in an Airbnb-style grid:
- Mobile: single scrollable row or first image only
- Desktop: 1 large image left + 2x2 grid right

```
┌─────────────────┬────────┬────────┐
│                 │   2    │   3    │
│       1         ├────────┼────────┤
│                 │   4    │   5    │
└─────────────────┴────────┴────────┘
```

"Show all photos" button → opens a fullscreen modal with all images.

### Step 3 — BookingCard

This is the right-column sticky card. Logic:
- If user is NOT logged in: show "Sign in to book" button
- If user IS logged in as CLIENT: show "Message Planner" (→ creates inquiry and opens chat) and "Book Now"
- If user IS logged in as PLANNER: hide booking CTA (planners can't book)

```tsx
const { user } = useAuthStore()

// "Message Planner" flow:
// 1. POST /inquiries with listingId + eventDate + guestCount + message
// 2. On success, navigate to /messages/{inquiryId}

// "Book Now" flow:
// 1. POST /inquiries first (creates thread)
// 2. Then POST /bookings with agreedPrice + stripePaymentMethodId
// (For MVP, agreedPrice = listing.basePrice; Stripe UI is simplified)
```

Cancellation policy display — show human-readable label:
```ts
const policyLabels = {
  FLEXIBLE: 'Full refund up to 14 days before event',
  MODERATE: '50% refund up to 7 days before event',
  STRICT: 'No refund after booking is accepted',
}
```

### Step 4 — PlannerCard

Small card showing the planner's name, avatar, rating, and a "View Profile" link.
Clicking navigates to `/planners/{id}`.

```tsx
<div className="flex items-center gap-4">
  <Image src={planner.profileImageUrl || '/avatar-placeholder.png'} ... className="rounded-full" />
  <div>
    <p className="font-semibold">{planner.businessName || 'Event Planner'}</p>
    <p className="text-stone-warm text-sm">★ {planner.rating} · Verified Planner</p>
  </div>
  <Link href={`/planners/${planner.id}`} className="ml-auto text-primary font-medium hover:underline">
    View Profile
  </Link>
</div>
```

### Step 5 — ReviewList

Show `listing.recentReviews` from SSR data initially.
Add a "Show all reviews" button that fetches `GET /listings/{id}/reviews` client-side.

---

## SEO — Page `<head>`

Add listing title, description, and image to page metadata.
In Pages Router, use `next/head`:

```tsx
import Head from 'next/head'

// Inside the page component:
<Head>
  <title>{listing.title} — Planit</title>
  <meta name="description" content={listing.description?.slice(0, 160)} />
  <meta property="og:title" content={listing.title} />
  <meta property="og:image" content={listing.coverImageUrl} />
</Head>
```

---

## Done Checklist

- [ ] `src/pages/listings/[id].tsx` created with `getServerSideProps`
- [ ] 404 returned for non-existent listing ID
- [ ] PhotoGallery — grid layout with "show all" modal
- [ ] BookingCard — sticky right column
- [ ] BookingCard shows correct CTA based on auth state
- [ ] Cancellation policy displayed with human-readable text
- [ ] PlannerCard links to planner profile
- [ ] ReviewList shows initial reviews, "show all" loads more
- [ ] `<Head>` with title, description, og:image set
- [ ] Page looks correct on mobile (booking card stacks below info)
- [ ] Update status in `FRONTEND_PLAN.md`