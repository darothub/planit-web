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

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-1">
            Top rated
          </p>
          <h2 className="text-3xl font-bold text-charcoal">Handpicked for you</h2>
        </div>
        <Link
          href="/listings"
          className="text-primary font-medium hover:underline text-sm hidden sm:block"
        >
          View all →
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

      <div className="text-center mt-10 sm:hidden">
        <Link
          href="/listings"
          className="inline-block bg-primary hover:bg-primary-hover text-white font-semibold
            px-8 py-3 rounded-btn transition-colors"
        >
          Browse all planners
        </Link>
      </div>
    </section>
  )
}
