import { useState, useRef } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import type { GetServerSideProps } from 'next'
import { EventListingDetailResponse, PlannerSummaryResponse } from '@/lib/types'
import { getAllDemoListings } from '@/lib/demoData'
import PageShell from '@/components/layout/PageShell'
import PhotoGallery from '@/components/listings/PhotoGallery'
import BookingCard from '@/components/listings/BookingCard'
import ReviewList from '@/components/listings/ReviewList'
import EventAmenities from '@/components/listings/EventAmenities'
import AvailabilityCalendar from '@/components/listings/AvailabilityCalendar'
import { formatPrice, TERRA_GRADIENT } from '@/lib/utils'

type Props = {
  listing: EventListingDetailResponse
  plannerProfile: PlannerSummaryResponse | null
}

const DESC_LIMIT = 280

export default function ListingDetailPage({ listing, plannerProfile }: Props) {
  const [showFullDesc, setShowFullDesc] = useState(false)
  const mobileFormRef = useRef<HTMLDivElement>(null)

  const planner = listing.planner
  const plannerName =
    plannerProfile?.businessName ??
    planner.businessName ??
    (plannerProfile ? plannerProfile.firstName : null) ??
    'Event Planner'
  const plannerAvatar = plannerProfile?.profileImageUrl ?? planner.profileImageUrl

  const desc = listing.description ?? ''
  const descTruncated = desc.length > DESC_LIMIT
  const descVisible = showFullDesc || !descTruncated ? desc : desc.slice(0, DESC_LIMIT)

  return (
    <>
      <Head>
        <title>{listing.title} — Planit</title>
        <meta name="description" content={desc.slice(0, 160)} />
        <meta property="og:title" content={listing.title} />
        {listing.coverImageUrl && (
          <meta property="og:image" content={listing.coverImageUrl} />
        )}
      </Head>

      <PageShell>
        {/* Extra bottom padding on mobile for sticky bar */}
        <div className="max-w-7xl mx-auto px-4 py-8 pb-28 lg:pb-8">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-stone-warm mb-6 flex-wrap">
            <Link href="/listings" className="hover:text-primary transition-colors">Browse Events</Link>
            <span>/</span>
            <Link
              href={`/listings?eventTypeId=${listing.eventType.id}`}
              className="hover:text-primary transition-colors"
            >
              {listing.eventType.displayName}
            </Link>
            <span>/</span>
            <span className="text-charcoal truncate max-w-[200px]">{listing.title}</span>
          </nav>

          <PhotoGallery coverUrl={listing.coverImageUrl} images={listing.images} />

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">

            {/* ── Left column ──────────────────────────────────────────── */}
            <div>
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs font-medium px-3 py-1 bg-sand text-charcoal rounded-full border border-cream">
                  {listing.eventType.displayName}
                </span>
                <span className="flex items-center gap-1 text-xs font-medium px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full">
                  <span className="text-green-600 font-bold">✓</span> Verified Planner
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold text-charcoal leading-tight">
                {listing.title}
              </h1>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-sm text-stone-warm">
                <span>📍 {listing.location}</span>
                {listing.averageRating != null && (
                  <>
                    <span>·</span>
                    <span className="font-medium text-charcoal">★ {listing.averageRating.toFixed(1)}</span>
                    <span>
                      ({listing.reviewCount} {listing.reviewCount === 1 ? 'review' : 'reviews'})
                    </span>
                  </>
                )}
              </div>

              {/* Planner strip */}
              <div className="border-t border-cream mt-6 pt-6">
                <div className="bg-white border border-cream rounded-xl p-5 flex items-start gap-4">
                  {/* Avatar */}
                  <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
                    {plannerAvatar ? (
                      <Image src={plannerAvatar} alt={plannerName} fill className="object-cover" />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-white text-xl font-bold"
                        style={{ background: TERRA_GRADIENT }}
                      >
                        {plannerName[0]}
                      </div>
                    )}
                  </div>

                  {/* Info + stats */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-stone-warm mb-0.5">Hosted by</p>
                    <Link
                      href={`/planners/${planner.id}`}
                      className="font-semibold text-charcoal hover:text-primary transition-colors"
                    >
                      {plannerName}
                    </Link>
                    {plannerProfile?.bio && (
                      <p className="text-xs text-stone-warm mt-1 line-clamp-2 leading-relaxed">
                        {plannerProfile.bio}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-3">
                      {plannerProfile?.rating != null && (
                        <div className="text-center">
                          <p className="text-sm font-bold text-charcoal leading-none">★ {plannerProfile.rating.toFixed(1)}</p>
                          <p className="text-xs text-stone-warm mt-0.5">Rating</p>
                        </div>
                      )}
                      {(plannerProfile?.totalBookings ?? 0) > 0 && (
                        <>
                          <div className="h-6 w-px bg-cream" />
                          <div className="text-center">
                            <p className="text-sm font-bold text-charcoal leading-none">{plannerProfile!.totalBookings}</p>
                            <p className="text-xs text-stone-warm mt-0.5">Bookings</p>
                          </div>
                        </>
                      )}
                      {(plannerProfile?.reviewCount ?? 0) > 0 && (
                        <>
                          <div className="h-6 w-px bg-cream" />
                          <div className="text-center">
                            <p className="text-sm font-bold text-charcoal leading-none">{plannerProfile!.reviewCount}</p>
                            <p className="text-xs text-stone-warm mt-0.5">Reviews</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* View profile */}
                  <Link
                    href={`/planners/${planner.id}`}
                    className="hidden sm:block text-sm text-primary font-semibold hover:underline underline-offset-2 flex-shrink-0"
                  >
                    View profile →
                  </Link>
                </div>
              </div>

              {/* About */}
              <div className="border-t border-cream mt-6 pt-6">
                <h2 className="text-lg font-semibold text-charcoal mb-3">About this service</h2>
                {desc ? (
                  <>
                    <p className="text-charcoal leading-relaxed whitespace-pre-line">
                      {descVisible}
                      {descTruncated && !showFullDesc && '…'}
                    </p>
                    {descTruncated && (
                      <button
                        onClick={() => setShowFullDesc(v => !v)}
                        className="mt-2 text-sm font-semibold text-charcoal underline underline-offset-2 hover:text-primary transition-colors"
                      >
                        {showFullDesc ? 'Show less' : 'Read more'}
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-stone-warm text-sm">No description provided.</p>
                )}
              </div>

              {/* What's included */}
              {(listing.amenities?.length ?? 0) > 0 && (
                <div className="border-t border-cream mt-6 pt-6">
                  <EventAmenities amenities={listing.amenities!} />
                </div>
              )}

              {/* Availability */}
              <div className="border-t border-cream mt-6 pt-6">
                <h2 className="text-xl font-semibold text-charcoal mb-5">Availability</h2>
                <AvailabilityCalendar listingId={listing.id} />
              </div>

              {/* Reviews */}
              <div className="border-t border-cream mt-6 pt-6">
                <ReviewList
                  reviews={listing.recentReviews}
                  listingId={listing.id}
                  totalCount={listing.reviewCount}
                  averageRating={listing.averageRating}
                />
              </div>

              {/* Mobile booking card */}
              <div ref={mobileFormRef} className="lg:hidden border-t border-cream mt-6 pt-6">
                <h2 className="text-lg font-semibold text-charcoal mb-4">Send an enquiry</h2>
                <BookingCard listing={listing} plannerProfile={plannerProfile} />
              </div>
            </div>

            {/* ── Right: desktop sticky card ───────────────────────────── */}
            <div className="hidden lg:block">
              <div className="sticky top-24">
                <BookingCard listing={listing} plannerProfile={plannerProfile} />
              </div>
            </div>

          </div>
        </div>

        {/* Mobile sticky bottom bar */}
        <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-cream px-4 py-3 z-40 flex items-center gap-3 shadow-lg">
          <div className="flex-shrink-0">
            <p className="text-[11px] text-stone-warm leading-none mb-0.5">From</p>
            <p className="font-bold text-charcoal text-sm">{formatPrice(listing.basePrice)}</p>
          </div>
          <button
            onClick={() => mobileFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="flex-1 bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-btn transition-colors text-sm"
          >
            Message Planner
          </button>
        </div>
      </PageShell>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = context.params!.id as string
  const numId = parseInt(id)

  // Demo listings (negative IDs) — dev only
  if (numId < 0) {
    if (process.env.NODE_ENV === 'production') return { notFound: true }
    const demo = getAllDemoListings().find(l => l.id === numId)
    if (!demo) return { notFound: true }
    return {
      props: {
        listing: {
          ...demo,
          images: [],
          recentReviews: [],
        } satisfies EventListingDetailResponse,
        plannerProfile: null,
      },
    }
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings/${id}`)
    const json = await res.json()
    if (!json.success || !json.data) return { notFound: true }
    const listing: EventListingDetailResponse = json.data

    // Fetch planner profile for extra stats (non-critical)
    let plannerProfile: PlannerSummaryResponse | null = null
    try {
      const plannerRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/planners/${listing.planner.id}`
      )
      const plannerJson = await plannerRes.json()
      if (plannerJson.success) plannerProfile = plannerJson.data
    } catch { /* non-critical — page still renders without planner stats */ }

    return { props: { listing, plannerProfile } }
  } catch {
    return { notFound: true }
  }
}
