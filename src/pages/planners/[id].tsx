import Head from 'next/head'
import Image from 'next/image'
import type { GetServerSideProps } from 'next'
import { EventListingResponse, ReviewResponse } from '@/lib/types'
import PageShell from '@/components/layout/PageShell'
import ListingCard from '@/components/listings/ListingCard'
import ReviewCard from '@/components/listings/ReviewCard'
import ContactButton from '@/components/planners/ContactButton'

// TODO: Replace with real GET /api/v1/planners/{id} endpoint once added to the backend.
// Currently, planner info is derived from their listing data since no public
// planner profile endpoint exists.

type PlannerInfo = {
  id: number
  businessName: string
  profileImageUrl: string | null
  location: string | null
  averageRating: number | null
  reviewCount: number
}

type Props = {
  planner: PlannerInfo
  listings: EventListingResponse[]
  reviews: ReviewResponse[]
}

export default function PlannerProfilePage({ planner, listings, reviews }: Props) {
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : planner.averageRating?.toFixed(1) ?? null

  return (
    <>
      <Head>
        <title>{planner.businessName} — Planit</title>
        <meta
          name="description"
          content={`Book ${planner.businessName} on Planit.${avgRating ? ` ★${avgRating} rating.` : ''}`}
        />
        <meta property="og:title" content={planner.businessName} />
      </Head>

      <PageShell>
        {/* Hero banner */}
        <div className="bg-gradient-to-br from-accent to-primary h-44 md:h-56" />

        <div className="max-w-5xl mx-auto px-4">
          {/* Planner header — overlaps hero */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16 mb-8">
            <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden
              border-4 border-white shadow-lg flex-shrink-0 bg-sand">
              {planner.profileImageUrl ? (
                <Image
                  src={planner.profileImageUrl}
                  alt={planner.businessName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center
                  bg-primary text-white text-3xl font-bold">
                  {planner.businessName[0]}
                </div>
              )}
            </div>

            <div className="flex-1 pb-1">
              <h1 className="text-2xl font-bold text-charcoal leading-tight">
                {planner.businessName}
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-stone-warm">
                {avgRating && (
                  <span className="text-charcoal font-medium">
                    ★ {avgRating}
                    <span className="text-stone-warm font-normal">
                      {' '}· {planner.reviewCount} {planner.reviewCount === 1 ? 'review' : 'reviews'}
                    </span>
                  </span>
                )}
                {planner.location && <><span>·</span><span>📍 {planner.location}</span></>}
                <span>·</span>
                <span className="text-green-700 font-medium">✓ Verified</span>
              </div>
            </div>

            <div className="pb-1">
              <ContactButton listings={listings} plannerId={planner.id} />
            </div>
          </div>

          {/* Listings */}
          {listings.length > 0 && (
            <section className="mb-12">
              <h2 className="text-xl font-semibold text-charcoal mb-5">Services</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {listings.map(l => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            </section>
          )}

          {/* Reviews */}
          {reviews.length > 0 && (
            <section className="mb-12">
              <h2 className="text-xl font-semibold text-charcoal mb-5">
                Reviews ({reviews.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {reviews.map(r => (
                  <ReviewCard key={r.id} review={r} />
                ))}
              </div>
            </section>
          )}

          {listings.length === 0 && reviews.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-stone-warm">No public information available for this planner yet.</p>
            </div>
          )}
        </div>
      </PageShell>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = Number(context.params!.id)
  if (isNaN(id)) return { notFound: true }

  const base = process.env.NEXT_PUBLIC_API_URL

  try {
    const [profileRes, listingsRes, reviewsRes] = await Promise.all([
      fetch(`${base}/planners/${id}`),
      fetch(`${base}/listings?plannerId=${id}&size=50`),
      fetch(`${base}/planners/${id}/reviews`),
    ])

    if (!profileRes.ok) return { notFound: true }

    const profileJson  = await profileRes.json()
    const listingsJson = await listingsRes.json()
    const reviewsJson  = await reviewsRes.json()

    const profile = profileJson.data
    const allListings: EventListingResponse[] = listingsJson.data?.content ?? []
    const reviews: ReviewResponse[] = Array.isArray(reviewsJson.data) ? reviewsJson.data : []

    const planner: PlannerInfo = {
      id,
      businessName:    profile.businessName ?? 'Event Planner',
      profileImageUrl: profile.profileImageUrl ?? null,
      location:        profile.location ?? null,
      averageRating:   profile.rating ?? null,
      reviewCount:     profile.reviewCount ?? reviews.length,
    }

    return { props: { planner, listings: allListings, reviews } }
  } catch {
    return { notFound: true }
  }
}
