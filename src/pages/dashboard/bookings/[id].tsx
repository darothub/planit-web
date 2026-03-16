import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { BookingResponse, DateChangeRequestResponse, DisputeResponse, ReschedulingFeeQuoteResponse } from '@/lib/types'
import DashboardShell from '@/components/dashboard/DashboardShell'
import BookingStatusBadge from '@/components/bookings/BookingStatusBadge'
import ReviewForm from '@/components/reviews/ReviewForm'
import { formatPrice, formatShortDate, getListingGradient } from '@/lib/utils'

const disputeStatusColour: Record<string, string> = {
  OPEN:               'bg-orange-100 text-orange-800',
  EVIDENCE_SUBMITTED: 'bg-yellow-100 text-yellow-800',
  UNDER_REVIEW:       'bg-blue-100 text-blue-800',
  RESOLVED:           'bg-green-100 text-green-800',
}

function EvidenceUploadForm({ disputeId, onSuccess }: { disputeId: number; onSuccess: () => void }) {
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setError(null)
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'disputes')
      const uploadRes = await api.post('/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const fileUrl: string = uploadRes.data.data.url
      await api.post(`/disputes/${disputeId}/evidence`, {
        fileUrl,
        description: description || undefined,
      })
      setDescription('')
      onSuccess()
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="border-t border-cream pt-4 mt-2">
      <p className="text-xs font-semibold text-charcoal mb-2">Upload evidence</p>
      <input
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Description (optional)"
        className="input-base w-full mb-2 text-sm"
      />
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="w-full border-2 border-dashed border-cream hover:border-primary rounded-lg py-2 px-4 text-sm text-stone-warm hover:text-primary transition-colors disabled:opacity-50 text-center"
      >
        {uploading ? 'Uploading…' : '+ Add evidence file'}
      </button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

export default function BookingDetailPage() {
  const { token, user } = useAuthStore()
  const router = useRouter()
  const { id } = router.query
  const qc = useQueryClient()

  const [showDisputeModal, setShowDisputeModal] = useState(false)
  const [disputeReason, setDisputeReason] = useState('')
  const [showDeclineModal, setShowDeclineModal] = useState(false)
  const [declineReason, setDeclineReason] = useState('')

  const [showDateChangeModal, setShowDateChangeModal] = useState(false)
  const [dateChangeStep, setDateChangeStep] = useState<'form' | 'quote'>('form')
  const [requestedDate, setRequestedDate] = useState('')
  const [dateChangeReason, setDateChangeReason] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [quote, setQuote] = useState<ReschedulingFeeQuoteResponse | null>(null)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [quoteError, setQuoteError] = useState<string | null>(null)

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

  const { data: dateChangeRequests } = useQuery<DateChangeRequestResponse[]>({
    queryKey: ['date-changes', id],
    queryFn: () => api.get(`/bookings/${id}/date-change`).then(r => r.data.data),
    enabled: !!token && !!id && booking?.status === 'ACCEPTED',
    retry: false,
  })

  const { data: dispute } = useQuery<DisputeResponse>({
    queryKey: ['dispute', id],
    queryFn: () => api.get(`/disputes/${id}`).then(r => r.data.data),
    enabled: !!token && !!id && booking?.status === 'DISPUTED',
    retry: false,
  })

  const respondMutation = useMutation({
    mutationFn: ({ accept, declineReason }: { accept: boolean; declineReason?: string }) =>
      api.patch(`/bookings/received/${id}/respond`, { accept, declineReason }).then(r => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['booking', id] })
      qc.invalidateQueries({ queryKey: ['received-bookings'] })
      setShowDeclineModal(false)
      setDeclineReason('')
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

  const requestDateChangeMutation = useMutation({
    mutationFn: () =>
      api.post(`/bookings/${id}/date-change`, {
        bookingId: Number(id),
        requestedDate,
        reason: dateChangeReason.trim() || undefined,
        couponCode: couponCode.trim() || undefined,
      }).then(r => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['booking', id] })
      qc.invalidateQueries({ queryKey: ['date-changes', id] })
      setShowDateChangeModal(false)
      setDateChangeStep('form')
      setRequestedDate('')
      setDateChangeReason('')
      setCouponCode('')
      setQuote(null)
    },
  })

  const respondDateChangeMutation = useMutation({
    mutationFn: ({ requestId, accept }: { requestId: number; accept: boolean }) =>
      api.patch(`/bookings/${id}/date-change/${requestId}/respond`, { accept }).then(r => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['booking', id] })
      qc.invalidateQueries({ queryKey: ['date-changes', id] })
      qc.invalidateQueries({ queryKey: ['received-bookings'] })
    },
  })

  const raiseDisputeMutation = useMutation({
    mutationFn: ({ reason }: { reason: string }) =>
      api.post('/disputes', { bookingId: Number(id), reason }).then(r => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['booking', id] })
      qc.invalidateQueries({ queryKey: ['my-bookings'] })
      setShowDisputeModal(false)
      setDisputeReason('')
    },
  })

  async function fetchQuote() {
    if (!requestedDate) return
    setQuoteLoading(true)
    setQuoteError(null)
    try {
      const params = new URLSearchParams({ requestedDate })
      if (couponCode.trim()) params.set('couponCode', couponCode.trim())
      const res = await api.get(`/bookings/${id}/date-change/quote?${params}`)
      setQuote(res.data.data)
      setDateChangeStep('quote')
    } catch (e: any) {
      setQuoteError(e?.response?.data?.message ?? 'Could not fetch quote. Please try again.')
    } finally {
      setQuoteLoading(false)
    }
  }

  const actionError =
    (respondMutation.error as any)?.response?.data?.message ||
    (cancelMutation.error as any)?.response?.data?.message ||
    (confirmMutation.error as any)?.response?.data?.message

  const handleDecline = () => setShowDeclineModal(true)

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

  const canRequestDateChange =
    !isPlanner &&
    booking.status === 'ACCEPTED' &&
    new Date(booking.eventDate) > new Date()

  const pendingDateChange = dateChangeRequests?.find(r => r.status === 'PENDING')

  const canRaiseDispute =
    !isPlanner &&
    (booking.status === 'ACCEPTED' || booking.status === 'COMPLETED') &&
    new Date(booking.eventDate) < new Date()

  return (
    <DashboardShell title="Booking Details">
      {/* Back link */}
      <Link
        href="/dashboard/bookings"
        className="inline-flex items-center gap-1 text-sm text-stone-warm hover:text-charcoal transition-colors mb-4"
      >
        <ChevronLeftIcon className="w-4 h-4" />
        All Bookings
      </Link>

      {/* Booking summary */}
      <div className="bg-white border border-cream rounded-xl overflow-hidden mb-6">
        {/* Gradient accent */}
        <div className="h-1.5" style={{ background: getListingGradient(booking.listing.id) }} />
        <div className="p-6">
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

      {/* Booking actions */}
      {['REQUESTED', 'ACCEPTED'].includes(booking.status) && (
        <div className="bg-white border border-cream rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-charcoal mb-4">Actions</h3>

          {actionError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              {actionError}
            </p>
          )}

          <div className="flex flex-wrap gap-3 items-center">
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

            {!isPlanner && (booking.status === 'REQUESTED' || booking.status === 'ACCEPTED') && (
              <button
                onClick={handleCancel}
                disabled={isPending}
                className="px-5 py-2.5 border border-red-300 text-red-600 hover:bg-red-50 text-sm font-medium rounded-btn transition-colors disabled:opacity-50"
              >
                {cancelMutation.isPending ? 'Cancelling…' : 'Cancel Booking'}
              </button>
            )}

            {canRequestDateChange && !pendingDateChange && (
              <button
                onClick={() => setShowDateChangeModal(true)}
                disabled={isPending}
                className="px-5 py-2.5 border border-primary text-primary hover:bg-primary/5 text-sm font-medium rounded-btn transition-colors disabled:opacity-50"
              >
                Request Date Change
              </button>
            )}
            {canRequestDateChange && pendingDateChange && (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Date change requested for {formatShortDate(pendingDateChange.requestedDate)} — awaiting planner response
              </p>
            )}

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

      {/* Planner: pending date change request */}
      {isPlanner && pendingDateChange && (
        <div className="bg-white border border-cream rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-charcoal mb-1">Date Change Request</h3>
          <p className="text-xs text-stone-warm mb-4">The client has requested a new date for this booking.</p>

          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <p className="text-xs text-stone-warm">Current Date</p>
              <p className="font-medium text-charcoal">{formatShortDate(pendingDateChange.originalDate)}</p>
            </div>
            <div>
              <p className="text-xs text-stone-warm">Requested Date</p>
              <p className="font-medium text-primary">{formatShortDate(pendingDateChange.requestedDate)}</p>
            </div>
            <div>
              <p className="text-xs text-stone-warm">Rescheduling Fee</p>
              <p className="font-medium text-charcoal">
                {pendingDateChange.discountedFeeAmount === 0
                  ? 'Free'
                  : formatPrice(pendingDateChange.discountedFeeAmount)}
              </p>
            </div>
            {pendingDateChange.reason && (
              <div className="col-span-2">
                <p className="text-xs text-stone-warm">Reason</p>
                <p className="text-charcoal">{pendingDateChange.reason}</p>
              </div>
            )}
          </div>

          {respondDateChangeMutation.isError && (
            <p className="text-sm text-red-600 mb-3">
              {(respondDateChangeMutation.error as any)?.response?.data?.message ?? 'Something went wrong.'}
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => respondDateChangeMutation.mutate({ requestId: pendingDateChange.id, accept: true })}
              disabled={respondDateChangeMutation.isPending}
              className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-btn transition-colors disabled:opacity-50"
            >
              {respondDateChangeMutation.isPending ? 'Accepting…' : 'Accept Date Change'}
            </button>
            <button
              onClick={() => respondDateChangeMutation.mutate({ requestId: pendingDateChange.id, accept: false })}
              disabled={respondDateChangeMutation.isPending}
              className="px-5 py-2.5 border border-red-300 text-red-600 hover:bg-red-50 text-sm font-semibold rounded-btn transition-colors disabled:opacity-50"
            >
              {respondDateChangeMutation.isPending ? 'Declining…' : 'Decline'}
            </button>
          </div>
        </div>
      )}

      {/* Dispute panel — shown when booking is DISPUTED */}
      {booking.status === 'DISPUTED' && (
        <div className="bg-white border border-cream rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-charcoal">Dispute</h3>
            {dispute && (
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${disputeStatusColour[dispute.status] ?? 'bg-gray-100 text-gray-600'}`}>
                {dispute.status.replace(/_/g, ' ')}
              </span>
            )}
          </div>

          {dispute ? (
            <>
              <p className="text-sm text-charcoal mb-2">{dispute.reason}</p>
              <p className="text-xs text-stone-warm mb-4">
                Evidence deadline: {formatShortDate(dispute.evidenceDeadline)}
              </p>

              {dispute.resolution && (
                <div className="bg-green-50 border border-green-100 rounded-lg p-3 mb-4">
                  <p className="text-sm font-medium text-green-800">
                    Resolved: {dispute.resolution.replace(/_/g, ' ')}
                  </p>
                  {dispute.resolutionNote && (
                    <p className="text-xs text-green-700 mt-1">{dispute.resolutionNote}</p>
                  )}
                  {dispute.refundAmount && (
                    <p className="text-xs text-green-700 mt-0.5">Refund: {formatPrice(dispute.refundAmount)}</p>
                  )}
                </div>
              )}

              {dispute.evidence.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-semibold text-charcoal mb-2">Evidence submitted</p>
                  <div className="flex flex-col gap-2">
                    {dispute.evidence.map(e => (
                      <div key={e.id} className="flex items-start gap-3 text-sm border border-cream rounded-lg p-3">
                        <a
                          href={e.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline font-medium flex-1 truncate"
                        >
                          {e.fileUrl.split('/').pop() ?? 'File'}
                        </a>
                        {e.description && (
                          <p className="text-xs text-stone-warm shrink-0">{e.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {dispute.status !== 'RESOLVED' && (
                <EvidenceUploadForm
                  disputeId={dispute.id}
                  onSuccess={() => qc.invalidateQueries({ queryKey: ['dispute', id] })}
                />
              )}
            </>
          ) : (
            <p className="text-sm text-stone-warm">Loading dispute details…</p>
          )}
        </div>
      )}

      {/* Raise a Dispute — CLIENT only, past event date */}
      {canRaiseDispute && (
        <div className="bg-white border border-cream rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-charcoal mb-1">Raise a Dispute</h3>
          <p className="text-xs text-stone-warm mb-4">
            If something went wrong with your event, you can raise a dispute for admin review. Both parties will have 5 days to submit evidence.
          </p>
          <button
            type="button"
            onClick={() => setShowDisputeModal(true)}
            className="px-5 py-2.5 border border-red-300 text-red-600 hover:bg-red-50 text-sm font-medium rounded-btn transition-colors"
          >
            Raise a Dispute
          </button>
        </div>
      )}

      {/* Reviews — only when COMPLETED */}
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

      {/* Date Change modal */}
      {showDateChangeModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            {dateChangeStep === 'form' ? (
              <>
                <h3 className="font-semibold text-charcoal text-lg mb-2">Request Date Change</h3>
                <p className="text-sm text-stone-warm mb-4">
                  Choose a new date. A rescheduling fee may apply depending on how close the event is.
                </p>
                <div className="flex flex-col gap-3 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-charcoal mb-1">New Date</label>
                    <input
                      type="date"
                      value={requestedDate}
                      onChange={e => setRequestedDate(e.target.value)}
                      min={new Date(Date.now() + 86_400_000).toISOString().split('T')[0]}
                      className="input-base w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-charcoal mb-1">Reason (optional)</label>
                    <textarea
                      value={dateChangeReason}
                      onChange={e => setDateChangeReason(e.target.value)}
                      rows={3}
                      maxLength={500}
                      placeholder="Why do you need to change the date?"
                      className="input-base w-full resize-none"
                    />
                    <p className="text-xs text-stone-warm text-right">{dateChangeReason.length}/500</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-charcoal mb-1">Coupon Code (optional)</label>
                    <input
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value)}
                      placeholder="e.g. RESCHEDULE50"
                      className="input-base w-full"
                    />
                  </div>
                </div>
                {quoteError && <p className="text-sm text-red-600 mb-3">{quoteError}</p>}
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => { setShowDateChangeModal(false); setRequestedDate(''); setDateChangeReason(''); setCouponCode('') }}
                    className="px-4 py-2 border border-cream text-charcoal text-sm rounded-btn hover:bg-sand transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!requestedDate || quoteLoading}
                    onClick={fetchQuote}
                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-btn transition-colors disabled:opacity-50"
                  >
                    {quoteLoading ? 'Checking…' : 'Get Quote'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="font-semibold text-charcoal text-lg mb-4">Fee Breakdown</h3>
                {quote && (
                  <div className="bg-sand rounded-lg p-4 mb-4 text-sm flex flex-col gap-2">
                    <div className="flex justify-between">
                      <span className="text-stone-warm">Original date</span>
                      <span className="font-medium text-charcoal">{formatShortDate(quote.originalDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-warm">New date</span>
                      <span className="font-medium text-charcoal">{formatShortDate(quote.requestedDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-warm">Days until event</span>
                      <span className="text-charcoal">{quote.daysBeforeEvent} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-warm">Pricing tier</span>
                      <span className="text-charcoal">{quote.tierApplied}</span>
                    </div>
                    {quote.baseFeeAmount > 0 && quote.couponCode && (
                      <div className="flex justify-between text-green-700">
                        <span>Coupon ({quote.couponCode})</span>
                        <span>Applied</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-cream font-semibold text-charcoal">
                      <span>Total fee</span>
                      <span>{quote.discountedFeeAmount === 0 ? 'Free' : formatPrice(quote.discountedFeeAmount)}</span>
                    </div>
                  </div>
                )}
                {requestDateChangeMutation.isError && (
                  <p className="text-sm text-red-600 mb-3">
                    {(requestDateChangeMutation.error as any)?.response?.data?.message ?? 'Something went wrong. Please try again.'}
                  </p>
                )}
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => { setDateChangeStep('form'); setQuote(null) }}
                    className="px-4 py-2 border border-cream text-charcoal text-sm rounded-btn hover:bg-sand transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={requestDateChangeMutation.isPending}
                    onClick={() => requestDateChangeMutation.mutate()}
                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-btn transition-colors disabled:opacity-50"
                  >
                    {requestDateChangeMutation.isPending ? 'Submitting…' : 'Confirm Request'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Raise a Dispute modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h3 className="font-semibold text-charcoal text-lg mb-2">Raise a Dispute</h3>
            <p className="text-sm text-stone-warm mb-4">
              Describe what went wrong. Our team will review your dispute and both parties have 5 days to submit evidence.
            </p>
            <textarea
              value={disputeReason}
              onChange={e => setDisputeReason(e.target.value)}
              rows={5}
              maxLength={2000}
              placeholder="Describe the issue in detail…"
              className="input-base w-full resize-none mb-1"
            />
            <p className="text-xs text-stone-warm text-right mb-4">{disputeReason.length}/2000</p>
            {raiseDisputeMutation.isError && (
              <p className="text-sm text-red-600 mb-3">
                {(raiseDisputeMutation.error as any)?.response?.data?.message ?? 'Something went wrong. Please try again.'}
              </p>
            )}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => { setShowDisputeModal(false); setDisputeReason('') }}
                className="px-4 py-2 border border-cream text-charcoal text-sm rounded-btn hover:bg-sand transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!disputeReason.trim() || raiseDisputeMutation.isPending}
                onClick={() => raiseDisputeMutation.mutate({ reason: disputeReason.trim() })}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-btn transition-colors disabled:opacity-50"
              >
                {raiseDisputeMutation.isPending ? 'Submitting…' : 'Submit Dispute'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decline reason modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="font-semibold text-charcoal text-lg mb-2">Decline Booking</h3>
            <p className="text-sm text-stone-warm mb-4">
              Optionally add a reason. The client will be notified.
            </p>
            <textarea
              value={declineReason}
              onChange={e => setDeclineReason(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Reason for declining (optional)"
              className="input-base w-full resize-none mb-1"
            />
            <p className="text-xs text-stone-warm text-right mb-4">{declineReason.length}/500</p>
            {respondMutation.isError && (
              <p className="text-sm text-red-600 mb-3">
                {(respondMutation.error as any)?.response?.data?.message ?? 'Something went wrong.'}
              </p>
            )}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => { setShowDeclineModal(false); setDeclineReason('') }}
                className="px-4 py-2 border border-cream text-charcoal text-sm rounded-btn hover:bg-sand transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={respondMutation.isPending}
                onClick={() => respondMutation.mutate({ accept: false, declineReason: declineReason.trim() || undefined })}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-btn transition-colors disabled:opacity-50"
              >
                {respondMutation.isPending ? 'Declining…' : 'Confirm Decline'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  )
}
