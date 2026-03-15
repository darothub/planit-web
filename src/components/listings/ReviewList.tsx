import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { ReviewResponse } from '@/lib/types'
import ReviewCard from './ReviewCard'

type Props = {
  reviews: ReviewResponse[]
  listingId: number
  totalCount: number
  averageRating?: number | null
}

function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-stone-warm w-4 text-right flex-shrink-0">{star}</span>
      <span className="text-amber-400 flex-shrink-0">★</span>
      <div className="flex-1 bg-cream rounded-full h-1.5 overflow-hidden">
        <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-stone-warm w-5 text-right flex-shrink-0">{count}</span>
    </div>
  )
}

export default function ReviewList({ reviews: initial, listingId, totalCount, averageRating }: Props) {
  const [showAll, setShowAll] = useState(false)

  const { data: allReviews, isLoading } = useQuery<ReviewResponse[]>({
    queryKey: ['reviews', listingId],
    queryFn: () => api.get(`/listings/${listingId}/reviews`).then(r => r.data.data),
    enabled: showAll,
    retry: false,
  })

  const displayed = showAll ? (allReviews ?? initial) : initial

  const avg = averageRating ?? (
    displayed.length > 0
      ? displayed.reduce((s, r) => s + r.rating, 0) / displayed.length
      : null
  )

  const distribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: displayed.filter(r => r.rating === star).length,
  }))

  return (
    <div>
      <h2 className="text-xl font-semibold text-charcoal mb-5">Reviews</h2>

      {totalCount === 0 ? (
        <p className="text-stone-warm text-sm">No reviews yet.</p>
      ) : (
        <>
          {/* Rating summary */}
          <div className="flex gap-8 mb-6">
            <div className="flex flex-col items-center justify-center flex-shrink-0">
              <p className="text-4xl font-bold text-charcoal leading-none">
                {avg != null ? avg.toFixed(1) : '—'}
              </p>
              <div className="flex gap-0.5 my-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={`text-sm ${avg != null && i < Math.round(avg) ? 'text-amber-400' : 'text-stone-200'}`}>★</span>
                ))}
              </div>
              <p className="text-xs text-stone-warm">{totalCount} {totalCount === 1 ? 'review' : 'reviews'}</p>
            </div>
            <div className="flex-1 flex flex-col justify-center gap-1.5">
              {distribution.map(({ star, count }) => (
                <RatingBar key={star} star={star} count={count} total={displayed.length} />
              ))}
            </div>
          </div>

          {/* Review cards */}
          <div>
            {displayed.map(r => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>

          {!showAll && totalCount > initial.length && (
            <button
              onClick={() => setShowAll(true)}
              disabled={isLoading}
              className="mt-5 px-6 py-2.5 border border-charcoal rounded-btn text-sm font-semibold
                text-charcoal hover:bg-sand transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Loading…' : `Show all ${totalCount} reviews`}
            </button>
          )}
        </>
      )}
    </div>
  )
}
