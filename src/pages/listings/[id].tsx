import Head from 'next/head'
import type { GetServerSideProps } from 'next'
import { EventListingDetailResponse } from '@/lib/types'
import { getAllDemoListings } from '@/lib/demoData'
import PageShell from '@/components/layout/PageShell'
import PhotoGallery from '@/components/listings/PhotoGallery'
import BookingCard from '@/components/listings/BookingCard'
import PlannerCard from '@/components/listings/PlannerCard'
import ReviewList from '@/components/listings/ReviewList'
import EventAmenities from '@/components/listings/EventAmenities'
import AvailabilityCalendar from '@/components/listings/AvailabilityCalendar'
import { formatPrice } from '@/lib/utils'

type Props = { listing: EventListingDetailResponse }

export default function ListingDetailPage({ listing }: Props) {
  return (
    <>
      <Head>
        <title>{listing.title} — Planit</title>
        <meta name="description" content={listing.description?.slice(0, 160)} />
        <meta property="og:title" content={listing.title} />
        {listing.coverImageUrl && (
          <meta property="og:image" content={listing.coverImageUrl} />
        )}
      </Head>

      <PageShell>
        <div className="max-w-7xl mx-auto px-4 py-8">

          {/* Photo gallery */}
          <PhotoGallery
            coverUrl={listing.coverImageUrl}
            images={listing.images}
          />

          {/* Main content grid */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">

            {/* ── Left: listing info ─────────────────────────────────── */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-charcoal leading-tight">
                {listing.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-sm text-stone-warm">
                {listing.averageRating != null && (
                  <span className="text-charcoal font-medium">
                    ★ {listing.averageRating.toFixed(1)}
                    <span className="text-stone-warm font-normal"> · {listing.reviewCount} {listing.reviewCount === 1 ? 'review' : 'reviews'}</span>
                  </span>
                )}
                <span>·</span>
                <span>📍 {listing.location}</span>
                <span>·</span>
                <span>{listing.eventType.displayName}</span>
              </div>

              {/* Capacity + price summary */}
              <div className="flex gap-6 mb-6">
                <div>
                  <p className="text-xs text-stone-warm mb-0.5">Starting from</p>
                  <p className="font-semibold text-charcoal">{formatPrice(listing.basePrice)}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-warm mb-0.5">Capacity</p>
                  <p className="font-semibold text-charcoal">
                    {listing.minGuests}–{listing.maxGuests} guests
                  </p>
                </div>
              </div>

              <div className="border-t border-cream py-6">
                <h2 className="text-lg font-semibold text-charcoal mb-3">About this service</h2>
                <p className="text-charcoal leading-relaxed whitespace-pre-line">
                  {listing.description || 'No description provided.'}
                </p>
              </div>

              {/* What this event includes */}
              {(listing.amenities?.length ?? 0) > 0 && (
                <div className="border-t border-cream py-8">
                  <EventAmenities amenities={listing.amenities!} />
                </div>
              )}

              {/* Availability calendar */}
              <div className="border-t border-cream py-8">
                <h2 className="text-xl font-semibold text-charcoal mb-5">Availability</h2>
                <AvailabilityCalendar listingId={listing.id} />
              </div>

              <div className="border-t border-cream py-8">
                {/* Planner */}
                <h2 className="text-lg font-semibold text-charcoal mb-4">Your planner</h2>
                <PlannerCard planner={listing.planner} />
              </div>

              {/* Reviews */}
              {listing.reviewCount > 0 && (
                <div className="border-t border-cream py-8">
                  <ReviewList
                    reviews={listing.recentReviews}
                    listingId={listing.id}
                    totalCount={listing.reviewCount}
                  />
                </div>
              )}
            </div>

            {/* ── Right: sticky booking card ──────────────────────────── */}
            <div>
              <div className="sticky top-24">
                <BookingCard listing={listing} />
              </div>
            </div>

          </div>
        </div>
      </PageShell>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = context.params!.id as string
  const numId = parseInt(id)

  // Demo fallback for negative IDs (demo listings from homepage/discovery)
  if (numId < 0) {
    const demo = getAllDemoListings().find(l => l.id === numId)
    if (!demo) return { notFound: true }
    return {
      props: {
        listing: {
          ...demo,
          images: [],
          recentReviews: [],
        } satisfies EventListingDetailResponse,
      },
    }
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings/${id}`)
    const json = await res.json()
    if (!json.success || !json.data) return { notFound: true }
    return { props: { listing: json.data } }
  } catch {
    return { notFound: true }
  }
}
