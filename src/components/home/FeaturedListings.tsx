import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { EventListingResponse, PageResponse } from '@/lib/types'
import { getAllDemoListings } from '@/lib/demoData'
import ListingCard from '@/components/listings/ListingCard'

// 6 highest-rated demo listings — placeholder while API loads, fallback when offline
const DEMO_FEATURED: EventListingResponse[] = getAllDemoListings()
  .filter(l => l.averageRating != null)
  .sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0))
  .slice(0, 6)

export default function FeaturedListings() {
  const { data: listings = DEMO_FEATURED } = useQuery<EventListingResponse[]>({
    queryKey: ['featured-listings'],
    queryFn: async () => {
      const r = await api.get('/listings', {
        params: { sortBy: 'RATING', size: 6, page: 0 },
      })
      const page = r.data.data as PageResponse<EventListingResponse>
      return page.content.length > 0 ? page.content : DEMO_FEATURED
    },
    placeholderData: DEMO_FEATURED,
    staleTime: 1000 * 60 * 5,
    retry: false,
  })

  return (
    <section className="py-12 border-b border-cream">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-charcoal">Featured Events</h2>
            <p className="text-stone-warm text-sm mt-1">
              Top-rated planners ready to make your occasion unforgettable.
            </p>
          </div>
          <Link
            href="/listings"
            className="text-primary text-sm font-semibold hover:underline underline-offset-2 whitespace-nowrap shrink-0"
          >
            View all →
          </Link>
        </div>

        {/* 3-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>

        {/* Mobile "View all" CTA */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/listings"
            className="inline-block bg-primary hover:bg-primary-hover text-white font-semibold px-8 py-3 rounded-btn transition-colors"
          >
            View all events
          </Link>
        </div>

      </div>
    </section>
  )
}
