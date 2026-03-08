import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { ReviewTargetType } from '@/lib/types'

type Props = {
  inquiryId: number
  targetType: ReviewTargetType
  targetLabel: string
}

type Status = 'idle' | 'success' | 'already-reviewed'

export default function ReviewForm({ inquiryId, targetType, targetLabel }: Props) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [status, setStatus] = useState<Status>('idle')

  const mutation = useMutation({
    mutationFn: () =>
      api.post('/reviews', { inquiryId, targetType, rating, comment: comment || undefined }),
    onSuccess: () => setStatus('success'),
    onError: (err: unknown) => {
      const code = (err as { response?: { status?: number } })?.response?.status
      if (code === 409) setStatus('already-reviewed')
    },
  })

  if (status === 'success') {
    return (
      <div className="flex items-center gap-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <span className="text-base">✓</span>
        <span>Thank you — your review for <strong>{targetLabel}</strong> has been submitted.</span>
      </div>
    )
  }

  if (status === 'already-reviewed') {
    return (
      <div className="flex items-center gap-3 text-sm text-stone-warm bg-sand border border-cream rounded-xl px-4 py-3">
        <span className="text-base">★</span>
        <span>You&apos;ve already reviewed <strong>{targetLabel}</strong>.</span>
      </div>
    )
  }

  return (
    <div className="border border-cream rounded-xl p-5">
      <p className="font-medium text-charcoal mb-3">
        Rate <span className="text-primary">{targetLabel}</span>
      </p>

      {/* Star rating */}
      <div
        className="flex gap-1 mb-4"
        onMouseLeave={() => setHovered(0)}
      >
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            className={`text-3xl leading-none transition-colors ${
              star <= (hovered || rating) ? 'text-amber-400' : 'text-cream'
            }`}
          >
            ★
          </button>
        ))}
      </div>

      {/* Comment */}
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        rows={3}
        placeholder="Share your experience (optional)"
        maxLength={2000}
        className="input-base w-full resize-none text-sm mb-3"
      />

      {mutation.isError && (status as string) === 'idle' && (
        <p className="text-red-600 text-xs mb-3">Something went wrong. Please try again.</p>
      )}

      <button
        onClick={() => mutation.mutate()}
        disabled={rating === 0 || mutation.isPending}
        className="bg-primary hover:bg-primary-hover text-white text-sm font-semibold
          px-5 py-2 rounded-btn transition-colors disabled:opacity-50"
      >
        {mutation.isPending ? 'Submitting…' : 'Submit Review'}
      </button>

      {rating === 0 && (
        <p className="text-xs text-stone-warm mt-2">Select a star rating to continue.</p>
      )}
    </div>
  )
}
