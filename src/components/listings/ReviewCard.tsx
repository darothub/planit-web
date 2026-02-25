import { ReviewResponse } from '@/lib/types'
import { formatShortDate } from '@/lib/utils'

type Props = {
  review: ReviewResponse
}

export default function ReviewCard({ review }: Props) {
  return (
    <div className="border border-cream rounded-xl p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {review.reviewer.firstName[0]}{review.reviewer.lastName[0]}
          </div>
          <div>
            <p className="text-sm font-semibold text-charcoal leading-tight">
              {review.reviewer.firstName} {review.reviewer.lastName}
            </p>
            <p className="text-xs text-stone-warm">{formatShortDate(review.createdAt)}</p>
          </div>
        </div>
        <span className="text-sm font-medium text-charcoal flex-shrink-0">
          {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
        </span>
      </div>
      {review.comment && (
        <p className="text-sm text-charcoal leading-relaxed mt-1">{review.comment}</p>
      )}
    </div>
  )
}
