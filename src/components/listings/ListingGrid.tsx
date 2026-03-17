import ListingCard from './ListingCard'
import EmptyState from '@/components/ui/EmptyState'
import { EventListingResponse } from '@/lib/types'

type Props = {
  listings?: EventListingResponse[]
  isLoading: boolean
}

function SkeletonCard() {
  return (
    <div>
      <div className="shimmer rounded-card aspect-[15/16] mb-3" />
      <div className="shimmer h-3.5 rounded-full w-3/4 mb-2" />
      <div className="shimmer h-3 rounded-full w-1/2 mb-2" />
      <div className="shimmer h-3 rounded-full w-1/3" />
    </div>
  )
}

export default function ListingGrid({ listings, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (!listings?.length) {
    return <EmptyState message="No events found. Try adjusting your filters." />
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
      {listings.map(listing => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  )
}
