import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { EventListingResponse, PageResponse } from '@/lib/types'
import ListingCard from '@/components/listings/ListingCard'
import Link from 'next/link'

const SkeletonCard = () => (
  <div className="animate-pulse">
    <div className="bg-cream rounded-card aspect-[3/2] mb-3" />
    <div className="bg-cream h-3 rounded w-1/3 mb-2" />
    <div className="bg-cream h-4 rounded w-3/4 mb-2" />
    <div className="bg-cream h-3 rounded w-1/2" />
  </div>
)

export default function FeaturedListings() {
  const { data, isLoading } = useQuery<PageResponse<EventListingResponse>>({
    queryKey: ['featured-listings'],
    queryFn: () =>
      api.get('/listings', { params: { sortBy: 'RATING', size: 8 } }).then(r => r.data.data),
    staleTime: 1000 * 60 * 5,
  })

  const hasResults = !isLoading && data && data.content.length > 0

  return (
    <section className="bg-parchment py-16">
      <div className="max-w-7xl mx-auto px-4">

        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-1">
              Inspiring ideas
            </p>
            <h2 className="text-3xl font-bold text-charcoal">
              Events that wow
            </h2>
            <p className="text-stone-warm mt-1">
              Real events from verified planners, ready to make yours unforgettable.
            </p>
          </div>
          <Link
            href="/listings"
            className="text-primary font-medium hover:underline text-sm hidden sm:block whitespace-nowrap"
          >
            Explore all →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : data?.content.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))
          }
        </div>

        {/* Empty state (no listings yet) */}
        {!isLoading && !hasResults && (
          <div className="text-center py-16 text-stone-warm">
            <p className="text-5xl mb-4">🎪</p>
            <p className="text-lg font-medium">Events coming soon</p>
            <p className="text-sm mt-1">Be the first planner to list your events.</p>
            <Link
              href="/auth/register"
              className="inline-block mt-6 bg-primary text-white font-semibold px-6 py-3 rounded-btn"
            >
              List your events
            </Link>
          </div>
        )}

        {hasResults && (
          <div className="text-center mt-10 sm:hidden">
            <Link
              href="/listings"
              className="inline-block bg-primary hover:bg-primary-hover text-white
                font-semibold px-8 py-3 rounded-btn transition-colors"
            >
              Explore all events
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
