import { ReviewResponse } from '@/lib/types'
import { formatShortDate } from '@/lib/utils'

const AVATAR_COLORS = [
  'bg-primary', 'bg-accent', 'bg-green-600', 'bg-orange-500', 'bg-purple-600',
]

type Props = {
  review: ReviewResponse
}

export default function ReviewCard({ review }: Props) {
  const initials = `${review.reviewer.firstName[0]}${review.reviewer.lastName[0]}`
  const colorIdx = (review.reviewer.id ?? 0) % AVATAR_COLORS.length

  return (
    <div className="py-4 border-b border-cream last:border-b-0">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${AVATAR_COLORS[colorIdx]}`}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-charcoal leading-tight">
            {review.reviewer.firstName} {review.reviewer.lastName}
          </p>
          <p className="text-xs text-stone-warm">{formatShortDate(review.createdAt)}</p>
        </div>
        <div className="flex gap-0.5 flex-shrink-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={`text-sm ${i < review.rating ? 'text-amber-400' : 'text-stone-200'}`}>★</span>
          ))}
        </div>
      </div>
      {review.comment && (
        <p className="text-sm text-charcoal leading-relaxed ml-12">{review.comment}</p>
      )}
    </div>
  )
}
