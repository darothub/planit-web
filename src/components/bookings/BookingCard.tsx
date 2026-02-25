import Link from 'next/link'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { BookingResponse, UserRole } from '@/lib/types'
import { formatPrice, formatShortDate } from '@/lib/utils'
import { api } from '@/lib/api'
import BookingStatusBadge from './BookingStatusBadge'

type Props = {
  booking: BookingResponse
  role: UserRole
}

export default function BookingCard({ booking, role }: Props) {
  const qc = useQueryClient()

  const respondMutation = useMutation({
    mutationFn: ({ accept, declineReason }: { accept: boolean; declineReason?: string }) =>
      api.patch(`/bookings/received/${booking.id}/respond`, { accept, declineReason }).then(r => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['received-bookings'] })
      qc.invalidateQueries({ queryKey: ['my-bookings'] })
    },
  })

  const cancelMutation = useMutation({
    mutationFn: () => api.patch(`/bookings/my/${booking.id}/cancel`).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-bookings'] }),
  })

  const confirmMutation = useMutation({
    mutationFn: () =>
      api.post(`/bookings/${role === 'CLIENT' ? 'my' : 'received'}/${booking.id}/confirm-completion`).then(r => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-bookings'] })
      qc.invalidateQueries({ queryKey: ['received-bookings'] })
    },
  })

  const handleDecline = () => {
    const reason = window.prompt('Reason for declining (optional):') ?? ''
    respondMutation.mutate({ accept: false, declineReason: reason || undefined })
  }

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this booking? This cannot be undone.')) {
      cancelMutation.mutate()
    }
  }

  return (
    <div className="bg-white border border-cream rounded-xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <p className="font-semibold text-charcoal">{booking.listing.title}</p>
          <p className="text-sm text-stone-warm mt-0.5">
            📅 {formatShortDate(booking.eventDate)} · 📍 {booking.eventLocation} · {booking.guestCount} guests
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-charcoal">{formatPrice(booking.agreedPrice)}</span>
          <BookingStatusBadge status={booking.status} />
        </div>
      </div>

      {/* Client info (planner view) */}
      {role === 'PLANNER' && (
        <p className="text-sm text-stone-warm mb-3">
          Client: {booking.client.firstName} {booking.client.lastName}
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-cream">
        <Link
          href={`/dashboard/bookings/${booking.id}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          View Details
        </Link>
        <Link
          href={`/messages/${booking.inquiryId}`}
          className="text-sm font-medium text-charcoal hover:text-primary transition-colors"
        >
          Messages
        </Link>

        {/* Planner: accept / decline when REQUESTED */}
        {role === 'PLANNER' && booking.status === 'REQUESTED' && (
          <>
            <button
              onClick={() => {
                if (window.confirm(`Accept this booking for ${formatPrice(booking.agreedPrice)}? The client's deposit will be captured.`)) {
                  respondMutation.mutate({ accept: true })
                }
              }}
              disabled={respondMutation.isPending}
              className="text-sm font-semibold text-green-700 hover:text-green-900 transition-colors disabled:opacity-50"
            >
              Accept ✓
            </button>
            <button
              onClick={handleDecline}
              disabled={respondMutation.isPending}
              className="text-sm font-semibold text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
            >
              Decline ✗
            </button>
          </>
        )}

        {/* Client: cancel when REQUESTED/ACCEPTED */}
        {role === 'CLIENT' && (booking.status === 'REQUESTED' || booking.status === 'ACCEPTED') && (
          <button
            onClick={handleCancel}
            disabled={cancelMutation.isPending}
            className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}

        {/* Both: confirm completion when ACCEPTED */}
        {booking.status === 'ACCEPTED' && (
          <button
            onClick={() => confirmMutation.mutate()}
            disabled={confirmMutation.isPending}
            className="text-sm font-semibold text-accent hover:text-accent-hover transition-colors disabled:opacity-50"
          >
            Confirm Completion
          </button>
        )}
      </div>
    </div>
  )
}
