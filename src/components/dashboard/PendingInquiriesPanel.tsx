import { useState } from 'react'
import { useRouter } from 'next/router'
import { InquiryResponse } from '@/lib/types'
import { formatRelativeTime } from '@/lib/utils'

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #C1694F, #A85640)',
  'linear-gradient(135deg, #2C2C2C, #4A5240)',
  'linear-gradient(135deg, #4A5240, #7A8B70)',
]

type Props = { inquiries: InquiryResponse[] }

export default function PendingInquiriesPanel({ inquiries }: Props) {
  const router = useRouter()
  const [confirmDeclineId, setConfirmDeclineId] = useState<number | null>(null)
  const pending = inquiries.filter(i => i.status === 'PENDING')

  return (
    <div className="bg-white border border-cream rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-cream flex items-center justify-between">
        <h2 className="text-base font-semibold text-charcoal">Pending Inquiries</h2>
        {pending.length > 0 && (
          <span className="bg-amber-100 text-amber-700 text-xs font-bold rounded-full px-2 py-0.5">
            {pending.length}
          </span>
        )}
      </div>

      {pending.length === 0 ? (
        <div className="px-5 py-10 text-center text-stone-warm text-sm">
          No pending inquiries
        </div>
      ) : (
        <div className="divide-y divide-cream">
          {pending.map(inquiry => {
            const grad = AVATAR_GRADIENTS[Math.abs(inquiry.id) % AVATAR_GRADIENTS.length]
            const initials = `${inquiry.client.firstName[0]}${inquiry.client.lastName[0]}`
            const isConfirming = confirmDeclineId === inquiry.id
            return (
              <div key={inquiry.id} className="px-5 py-4">
                {/* Header row */}
                <div className="flex items-start gap-3 mb-2">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: grad }}
                  >
                    <span className="text-white text-xs font-bold">{initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-charcoal text-sm">
                        {inquiry.client.firstName} {inquiry.client.lastName}
                      </span>
                      <span className="text-xs text-stone-warm">
                        {formatRelativeTime(inquiry.createdAt)}
                      </span>
                    </div>
                    <span className="inline-block bg-sand text-charcoal text-xs px-2 py-0.5 rounded-full mt-1">
                      {inquiry.listing.title}
                    </span>
                  </div>
                </div>

                {/* Message preview */}
                {inquiry.lastMessage && (
                  <p className="text-sm text-stone-warm line-clamp-2 mb-3 pl-12">
                    {inquiry.lastMessage}
                  </p>
                )}

                {/* Actions */}
                {isConfirming ? (
                  <div className="flex items-center gap-3 pl-12">
                    <span className="text-xs text-stone-warm">Decline this inquiry?</span>
                    <button
                      onClick={() => router.push(`/messages/${inquiry.id}`)}
                      className="text-xs font-semibold text-red-600 hover:text-red-800"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setConfirmDeclineId(null)}
                      className="text-xs text-stone-warm hover:text-charcoal"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 pl-12">
                    <button
                      onClick={() => router.push(`/messages/${inquiry.id}`)}
                      className="flex-1 bg-primary text-white text-xs font-semibold py-2 rounded-btn hover:bg-primary-hover transition-colors"
                    >
                      Reply
                    </button>
                    <button
                      onClick={() => setConfirmDeclineId(inquiry.id)}
                      className="flex-1 bg-sand text-stone-warm text-xs font-semibold py-2 rounded-btn hover:bg-cream transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
