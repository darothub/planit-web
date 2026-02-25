import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { ReviewResponse } from '@/lib/types'
import ReviewCard from './ReviewCard'

type Props = {
  reviews: ReviewResponse[]
  listingId: number
  totalCount: number
}

export default function ReviewList({ reviews: initial, listingId, totalCount }: Props) {
  const [showAll, setShowAll] = useState(false)

  const { data: allReviews, isLoading } = useQuery<ReviewResponse[]>({
    queryKey: ['reviews', listingId],
    queryFn: () => api.get(`/listings/${listingId}/reviews`).then(r => r.data.data),
    enabled: showAll,
    retry: false,
  })

  const displayed = showAll ? (allReviews ?? initial) : initial

  if (!totalCount) {
    return (
      <div>
        <h2 className="text-xl font-semibold text-charcoal mb-2">Reviews</h2>
        <p className="text-stone-warm text-sm">No reviews yet.</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-charcoal mb-4">
        ★ {displayed[0] ? (displayed.reduce((s, r) => s + r.rating, 0) / displayed.length).toFixed(1) : '—'}
        {' '}· {totalCount} {totalCount === 1 ? 'review' : 'reviews'}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {displayed.map(r => (
          <ReviewCard key={r.id} review={r} />
        ))}
      </div>

      {!showAll && totalCount > initial.length && (
        <button
          onClick={() => setShowAll(true)}
          disabled={isLoading}
          className="mt-6 px-6 py-2.5 border border-charcoal rounded-btn text-sm font-semibold
            text-charcoal hover:bg-sand transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Loading…' : `Show all ${totalCount} reviews`}
        </button>
      )}
    </div>
  )
}
