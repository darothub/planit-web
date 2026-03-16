import { useState } from 'react'
import Link from 'next/link'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { BookingResponse, UserRole } from '@/lib/types'
import { formatPrice, formatShortDate, getListingGradient, TERRA_GRADIENT } from '@/lib/utils'
import { api } from '@/lib/api'
import BookingStatusBadge from './BookingStatusBadge'

type Props = {
  booking: BookingResponse
  role: UserRole
}

function Initials({ name }: { name: string }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div
      className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
      style={{ background: TERRA_GRADIENT }}
    >
      {initials}
    </div>
  )
}

export default function BookingCard({ booking, role }: Props) {
  const qc = useQueryClient()
  const [showDeclineForm, setShowDeclineForm] = useState(false)
  const [declineReason, setDeclineReason] = useState('')

  const respondMutation = useMutation({
    mutationFn: ({ accept, declineReason }: { accept: boolean; declineReason?: string }) =>
      api.patch(`/bookings/received/${booking.id}/respond`, { accept, declineReason }).then(r => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['received-bookings'] })
      qc.invalidateQueries({ queryKey: ['my-bookings'] })
      setShowDeclineForm(false)
      setDeclineReason('')
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

  const counterpartyName = role === 'PLANNER'
    ? `${booking.client.firstName} ${booking.client.lastName}`
    : (booking.planner.businessName ?? 'Planner')

  const isPast = new Date(booking.eventDate) < new Date()

  return (
    <div className="bg-white border border-cream rounded-xl overflow-hidden">
      {/* Gradient accent top strip */}
      <div className="h-1" style={{ background: getListingGradient(booking.listing.id) }} />

      {/* Clickable card body → booking detail */}
      <Link
        href={`/dashboard/bookings/${booking.id}`}
        className="block px-5 pt-5 pb-3 hover:bg-sand/40 transition-colors"
      >
        {/* Top row */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <Initials name={counterpartyName} />
            <div className="min-w-0">
              <p className="font-semibold text-charcoal truncate">{booking.listing.title}</p>
              <p className="text-xs text-stone-warm mt-0.5">{counterpartyName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="font-semibold text-charcoal">{formatPrice(booking.agreedPrice)}</span>
            <BookingStatusBadge status={booking.status} />
          </div>
        </div>

        {/* Meta row */}
        <p className="text-sm text-stone-warm">
          <span className={isPast ? 'line-through opacity-60' : ''}>
            📅 {formatShortDate(booking.eventDate)}
          </span>
          {' · '}📍 {booking.eventLocation} · {booking.guestCount} guests
        </p>
      </Link>

      {/* Inline decline form */}
      {showDeclineForm && (
        <div className="px-5 pb-3 border-t border-cream pt-3">
          <textarea
            value={declineReason}
            onChange={e => setDeclineReason(e.target.value)}
            placeholder="Reason for declining (optional)"
            rows={2}
            className="w-full border border-cream rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
          />
          {respondMutation.isError && (
            <p className="text-xs text-red-600 mt-1">
              {(respondMutation.error as any)?.response?.data?.message ?? 'Something went wrong.'}
            </p>
          )}
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => respondMutation.mutate({ accept: false, declineReason: declineReason.trim() || undefined })}
              disabled={respondMutation.isPending}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {respondMutation.isPending ? 'Declining…' : 'Confirm Decline'}
            </button>
            <button
              onClick={() => { setShowDeclineForm(false); setDeclineReason('') }}
              className="px-3 py-1.5 border border-cream text-charcoal text-xs rounded-lg hover:bg-sand transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Action row */}
      <div className="flex flex-wrap gap-3 px-5 py-3 border-t border-cream items-center">
        <Link
          href={`/messages/${booking.inquiryId}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          Messages
        </Link>

        {/* Planner: accept / decline when REQUESTED */}
        {role === 'PLANNER' && booking.status === 'REQUESTED' && !showDeclineForm && (
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
              onClick={() => setShowDeclineForm(true)}
              className="text-sm font-semibold text-red-600 hover:text-red-800 transition-colors"
            >
              Decline ✗
            </button>
          </>
        )}

        {/* Client: cancel when REQUESTED/ACCEPTED */}
        {role === 'CLIENT' && (booking.status === 'REQUESTED' || booking.status === 'ACCEPTED') && (
          <button
            onClick={() => {
              if (window.confirm('Cancel this booking? This cannot be undone.')) {
                cancelMutation.mutate()
              }
            }}
            disabled={cancelMutation.isPending}
            className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors disabled:opacity-50 ml-auto"
          >
            {cancelMutation.isPending ? 'Cancelling…' : 'Cancel'}
          </button>
        )}

        {/* Both: confirm completion */}
        {booking.status === 'ACCEPTED' && !(role === 'PLANNER' ? booking.plannerConfirmedAt : booking.clientConfirmedAt) && (
          <button
            onClick={() => confirmMutation.mutate()}
            disabled={confirmMutation.isPending}
            className="text-sm font-semibold text-accent hover:text-accent-hover transition-colors disabled:opacity-50"
          >
            {confirmMutation.isPending ? 'Confirming…' : 'Confirm Completion'}
          </button>
        )}
      </div>
    </div>
  )
}
