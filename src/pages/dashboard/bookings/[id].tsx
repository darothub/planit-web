import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { BookingResponse } from '@/lib/types'
import DashboardShell from '@/components/dashboard/DashboardShell'
import BookingStatusBadge from '@/components/bookings/BookingStatusBadge'
import ReviewForm from '@/components/reviews/ReviewForm'
import { formatPrice, formatShortDate } from '@/lib/utils'

export default function BookingDetailPage() {
  const { token, user } = useAuthStore()
  const router = useRouter()
  const { id } = router.query
  const qc = useQueryClient()

  useEffect(() => {
    if (!token) router.replace('/auth/login?redirect=/dashboard/bookings')
  }, [token, router])

  const isPlanner = user?.role === 'PLANNER'
  const endpoint = isPlanner ? `/bookings/received/${id}` : `/bookings/my/${id}`

  const { data: booking, isLoading } = useQuery<BookingResponse>({
    queryKey: ['booking', id],
    queryFn: () => api.get(endpoint).then(r => r.data.data),
    enabled: !!token && !!id,
    retry: false,
  })

  const respondMutation = useMutation({
    mutationFn: ({ accept, declineReason }: { accept: boolean; declineReason?: string }) =>
      api.patch(`/bookings/received/${id}/respond`, { accept, declineReason }).then(r => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['booking', id] })
      qc.invalidateQueries({ queryKey: ['received-bookings'] })
    },
  })

  const cancelMutation = useMutation({
    mutationFn: () => api.patch(`/bookings/my/${id}/cancel`).then(r => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['booking', id] })
      qc.invalidateQueries({ queryKey: ['my-bookings'] })
    },
  })

  const confirmMutation = useMutation({
    mutationFn: () =>
      api.post(`/bookings/${isPlanner ? 'received' : 'my'}/${id}/confirm-completion`).then(r => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['booking', id] })
      qc.invalidateQueries({ queryKey: ['my-bookings'] })
      qc.invalidateQueries({ queryKey: ['received-bookings'] })
    },
  })

  const actionError =
    (respondMutation.error as any)?.response?.data?.message ||
    (cancelMutation.error as any)?.response?.data?.message ||
    (confirmMutation.error as any)?.response?.data?.message

  const handleDecline = () => {
    const reason = window.prompt('Reason for declining (optional):') ?? ''
    respondMutation.mutate({ accept: false, declineReason: reason || undefined })
  }

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this booking? This cannot be undone.')) {
      cancelMutation.mutate()
    }
  }

  if (!user || isLoading) return (
    <DashboardShell title="Booking">
      <div className="h-64 bg-white border border-cream rounded-xl animate-pulse" />
    </DashboardShell>
  )

  if (!booking) return (
    <DashboardShell title="Booking">
      <p className="text-stone-warm">Booking not found.</p>
    </DashboardShell>
  )

  const hasConfirmed = isPlanner ? !!booking.plannerConfirmedAt : !!booking.clientConfirmedAt
  const otherConfirmed = isPlanner ? !!booking.clientConfirmedAt : !!booking.plannerConfirmedAt
  const isPending = respondMutation.isPending || cancelMutation.isPending || confirmMutation.isPending

  return (
    <DashboardShell title="Booking Details">
      <div className="bg-white border border-cream rounded-xl p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-charcoal">{booking.listing.title}</h2>
            <p className="text-stone-warm text-sm mt-1">
              {isPlanner
                ? `Client: ${booking.client.firstName} ${booking.client.lastName}`
                : `Planner: ${booking.planner.businessName ?? 'Planner'}`
              }
            </p>
          </div>
          <BookingStatusBadge status={booking.status} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs text-stone-warm">Event Date</p>
            <p className="font-medium text-charcoal">{formatShortDate(booking.eventDate)}</p>
          </div>
          <div>
            <p className="text-xs text-stone-warm">Location</p>
            <p className="font-medium text-charcoal">{booking.eventLocation}</p>
          </div>
          <div>
            <p className="text-xs text-stone-warm">Guests</p>
            <p className="font-medium text-charcoal">{booking.guestCount}</p>
          </div>
          <div>
            <p className="text-xs text-stone-warm">Agreed Price</p>
            <p className="font-semibold text-charcoal">{formatPrice(booking.agreedPrice)}</p>
          </div>
          {booking.clientNote && (
            <div className="col-span-2">
              <p className="text-xs text-stone-warm">Note</p>
              <p className="text-charcoal">{booking.clientNote}</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment schedule */}
      {booking.payments.length > 0 && (
        <div className="bg-white border border-cream rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-charcoal mb-4">Payment Schedule</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-stone-warm border-b border-cream">
                  <th className="pb-2 pr-4">Instalment</th>
                  <th className="pb-2 pr-4">Amount</th>
                  <th className="pb-2 pr-4">Due Date</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {booking.payments.map(p => (
                  <tr key={p.id} className="border-b border-cream last:border-0">
                    <td className="py-2.5 pr-4 text-charcoal">#{p.instalmentNumber}</td>
                    <td className="py-2.5 pr-4 font-medium text-charcoal">{formatPrice(p.amount)}</td>
                    <td className="py-2.5 pr-4 text-charcoal">
                      {p.paidAt ? `Paid ${formatShortDate(p.paidAt)}` : formatShortDate(p.dueDate)}
                    </td>
                    <td className="py-2.5">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        p.status === 'CAPTURED' ? 'bg-green-100 text-green-800' :
                        p.status === 'FAILED'   ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Actions — shown when booking is actionable */}
      {['REQUESTED', 'ACCEPTED'].includes(booking.status) && (
        <div className="bg-white border border-cream rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-charcoal mb-4">Actions</h3>

          {actionError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              {actionError}
            </p>
          )}

          <div className="flex flex-wrap gap-3 items-center">
            {/* Planner: accept / decline when REQUESTED */}
            {isPlanner && booking.status === 'REQUESTED' && (
              <>
                <button
                  onClick={() => {
                    if (window.confirm(`Accept this booking for ${formatPrice(booking.agreedPrice)}? The client's deposit will be captured.`)) {
                      respondMutation.mutate({ accept: true })
                    }
                  }}
                  disabled={isPending}
                  className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-btn transition-colors disabled:opacity-50"
                >
                  {respondMutation.isPending ? 'Accepting…' : 'Accept Booking'}
                </button>
                <button
                  onClick={handleDecline}
                  disabled={isPending}
                  className="px-5 py-2.5 border border-red-300 text-red-600 hover:bg-red-50 text-sm font-semibold rounded-btn transition-colors disabled:opacity-50"
                >
                  {respondMutation.isPending ? 'Declining…' : 'Decline'}
                </button>
              </>
            )}

            {/* Client: cancel when REQUESTED or ACCEPTED */}
            {!isPlanner && (booking.status === 'REQUESTED' || booking.status === 'ACCEPTED') && (
              <button
                onClick={handleCancel}
                disabled={isPending}
                className="px-5 py-2.5 border border-red-300 text-red-600 hover:bg-red-50 text-sm font-medium rounded-btn transition-colors disabled:opacity-50"
              >
                {cancelMutation.isPending ? 'Cancelling…' : 'Cancel Booking'}
              </button>
            )}

            {/* Both: confirm completion when ACCEPTED and haven't confirmed yet */}
            {booking.status === 'ACCEPTED' && !hasConfirmed && (
              <button
                onClick={() => confirmMutation.mutate()}
                disabled={isPending}
                className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-btn transition-colors disabled:opacity-50"
              >
                {confirmMutation.isPending ? 'Confirming…' : 'Confirm Completion'}
              </button>
            )}

            {booking.status === 'ACCEPTED' && hasConfirmed && (
              <p className="text-sm text-green-700">
                ✓ You have confirmed completion
                {!otherConfirmed && (
                  <span className="text-stone-warm"> — waiting for {isPlanner ? 'client' : 'planner'} to confirm</span>
                )}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Reviews — only shown when booking is COMPLETED */}
      {booking.status === 'COMPLETED' && (
        <div className="bg-white border border-cream rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-charcoal mb-4">Leave a Review</h3>
          <div className="flex flex-col gap-4">
            {isPlanner ? (
              <ReviewForm
                inquiryId={booking.inquiryId}
                targetType="CLIENT"
                targetLabel={`${booking.client.firstName} ${booking.client.lastName}`}
              />
            ) : (
              <>
                <ReviewForm
                  inquiryId={booking.inquiryId}
                  targetType="LISTING"
                  targetLabel={booking.listing.title}
                />
                <ReviewForm
                  inquiryId={booking.inquiryId}
                  targetType="PLANNER"
                  targetLabel={booking.planner.businessName ?? 'your planner'}
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/messages/${booking.inquiryId}`}
          className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-btn transition-colors"
        >
          Open Messages
        </Link>
        <Link
          href="/dashboard/bookings"
          className="px-5 py-2.5 border border-cream text-charcoal text-sm font-medium rounded-btn hover:bg-sand transition-colors"
        >
          Back to Bookings
        </Link>
      </div>
    </DashboardShell>
  )
}
