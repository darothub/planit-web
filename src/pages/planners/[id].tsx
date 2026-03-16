import Head from 'next/head'
import Image from 'next/image'
import type { GetServerSideProps } from 'next'
import { EventListingResponse, ReviewResponse } from '@/lib/types'
import PageShell from '@/components/layout/PageShell'
import ListingCard from '@/components/listings/ListingCard'
import ReviewCard from '@/components/listings/ReviewCard'
import ContactButton from '@/components/planners/ContactButton'

type PlannerInfo = {
  id: number
  businessName: string
  profileImageUrl: string | null
  location: string | null
  averageRating: number | null
  reviewCount: number
  bio: string | null
  yearsOfExperience: number | null
  specialties: string[]
  isAcceptingInquiries: boolean
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

  // Build stat strip — only include items with meaningful values
  const stats: { label: string; value: string | number }[] = [
    ...(listings.length > 0 ? [{ label: listings.length === 1 ? 'Service' : 'Services', value: listings.length }] : []),
    ...(avgRating            ? [{ label: 'Rating',                                        value: `★ ${avgRating}` }] : []),
    { label: planner.reviewCount === 1 ? 'Review' : 'Reviews', value: planner.reviewCount },
    ...(planner.yearsOfExperience != null && planner.yearsOfExperience > 0
      ? [{ label: 'Yrs experience', value: planner.yearsOfExperience }] : []),
  ]

  return (
    <>
      <Head>
        <title>{planner.businessName} — Planit</title>
        <meta
          name="description"
          content={`Book ${planner.businessName} on Planit.${avgRating ? ` ★${avgRating} rating.` : ''}${planner.bio ? ` ${planner.bio.slice(0, 100)}` : ''}`}
        />
        <meta property="og:title" content={planner.businessName} />
      </Head>

      <PageShell>
        {/* Hero — charcoal, intentional */}
        <div className="bg-charcoal h-44 md:h-52" />

        <div className="max-w-5xl mx-auto px-4">

          {/* Planner header — overlaps hero */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16 mb-8">

            {/* Avatar */}
            <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden
              border-4 border-white shadow-lg flex-shrink-0">
              {planner.profileImageUrl ? (
                <Image
                  src={planner.profileImageUrl}
                  alt={planner.businessName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-white text-3xl font-bold"
                  style={{ background: 'linear-gradient(135deg, #C1694F, #A85640)' }}
                >
                  {planner.businessName[0]}
                </div>
              )}
            </div>

            {/* Name + meta */}
            <div className="flex-1 pb-1">
              <h1 className="text-2xl font-bold text-charcoal leading-tight">
                {planner.businessName}
              </h1>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-stone-warm">
                {planner.location && (
                  <span>📍 {planner.location}</span>
                )}
                <span className="text-green-700 font-medium">✓ Verified</span>
                {planner.isAcceptingInquiries ? (
                  <span className="text-green-700 font-medium">· Accepting clients</span>
                ) : (
                  <span className="text-amber-600 font-medium">· Not accepting new clients</span>
                )}
              </div>

              {/* Specialties */}
              {planner.specialties.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {planner.specialties.map(s => (
                    <span
                      key={s}
                      className="px-2.5 py-0.5 bg-sand border border-cream rounded-full
                        text-xs font-medium text-charcoal"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pb-1">
              <ContactButton listings={listings} plannerId={planner.id} />
            </div>
          </div>

          {/* Stat strip */}
          {stats.length > 0 && (
            <div className="flex bg-white border border-cream rounded-xl mb-10 overflow-hidden">
              {stats.map((s, i) => (
                <div
                  key={i}
                  className="flex-1 py-5 text-center border-r border-cream last:border-r-0"
                >
                  <p className="text-2xl font-bold text-charcoal leading-none">{s.value}</p>
                  <p className="text-xs text-stone-warm mt-1.5">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Bio */}
          {planner.bio && (
            <section className="mb-10 border-t border-cream pt-8">
              <h2 className="text-xl font-semibold text-charcoal mb-3">About</h2>
              <p className="text-stone-warm leading-relaxed max-w-2xl">{planner.bio}</p>
            </section>
          )}

          {/* Services */}
          {listings.length > 0 && (
            <section className="mb-10 border-t border-cream pt-8">
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
            <section className="mb-10 border-t border-cream pt-8">
              <div className="flex items-baseline gap-2 mb-5">
                <h2 className="text-xl font-semibold text-charcoal">
                  Reviews
                </h2>
                {avgRating && (
                  <span className="text-charcoal font-semibold">★ {avgRating}</span>
                )}
                <span className="text-stone-warm text-sm">
                  · {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                </span>
              </div>
              <div className="max-w-2xl">
                {reviews.map(r => (
                  <ReviewCard key={r.id} review={r} />
                ))}
              </div>
            </section>
          )}

          {/* Bottom CTA */}
          {planner.isAcceptingInquiries && listings.length > 0 && (
            <section className="border-t border-cream pt-8 pb-14 text-center">
              <p className="text-lg font-semibold text-charcoal mb-1">Ready to start planning?</p>
              <p className="text-stone-warm text-sm mb-5 max-w-sm mx-auto">
                {planner.businessName} is currently accepting new clients.
              </p>
              <ContactButton listings={listings} plannerId={planner.id} />
            </section>
          )}

          {listings.length === 0 && reviews.length === 0 && !planner.bio && (
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

    const specialties: string[] = Array.isArray(profile.specialties)
      ? profile.specialties.map((s: { displayName?: string; name?: string }) => s.displayName ?? s.name ?? '').filter(Boolean)
      : []

    const planner: PlannerInfo = {
      id,
      businessName:         profile.businessName ?? 'Event Planner',
      profileImageUrl:      profile.profileImageUrl ?? null,
      location:             profile.location ?? null,
      averageRating:        profile.rating ?? null,
      reviewCount:          profile.reviewCount ?? reviews.length,
      bio:                  profile.bio ?? null,
      yearsOfExperience:    profile.yearsOfExperience ?? null,
      specialties,
      isAcceptingInquiries: profile.isAcceptingInquiries ?? true,
    }

    return { props: { planner, listings: allListings, reviews } }
  } catch {
    return { notFound: true }
  }
}
