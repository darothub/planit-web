import { useState } from 'react'
import { useRouter } from 'next/router'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { InquiryResponse, BookingResponse } from '@/lib/types'
import { formatPrice, formatShortDate } from '@/lib/utils'

// Load Stripe once at module level.
// Guard against partial keys (e.g. "pk_test_" with no secret appended).
const _stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const stripePromise = _stripeKey && _stripeKey.length > 20
  ? loadStripe(_stripeKey)
  : null

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '14px',
      color: '#2C2C2C',
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      '::placeholder': { color: '#a8a29e' },
    },
    invalid: { color: '#dc2626' },
  },
}

// ─── Inner form (needs Elements context) ─────────────────────────────────────

function BookNowForm({
  inquiry,
  isDemo,
  inline = false,
  onClose,
}: {
  inquiry: InquiryResponse
  isDemo: boolean
  inline?: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const stripe = useStripe()
  const elements = useElements()

  const [agreedPrice, setAgreedPrice] = useState('')
  const [clientNote, setClientNote] = useState('')
  const [cardError, setCardError] = useState<string | null>(null)

  const depositAmount = agreedPrice ? Math.round(Number(agreedPrice) * 0.3 * 100) / 100 : 0
  const canSubmit = !isDemo && !!stripe && !!elements && !!agreedPrice && Number(agreedPrice) > 0

  const bookingMutation = useMutation({
    mutationFn: async () => {
      const cardElement = elements!.getElement(CardElement)!
      const { paymentMethod, error } = await stripe!.createPaymentMethod({
        type: 'card',
        card: cardElement,
      })
      if (error) throw new Error(error.message)

      const res = await api.post<{ data: BookingResponse }>('/bookings', {
        inquiryId: inquiry.id,
        agreedPrice: Number(agreedPrice),
        eventDate: inquiry.eventDate,
        eventLocation: inquiry.eventLocation,
        guestCount: inquiry.guestCount,
        stripePaymentMethodId: paymentMethod!.id,
        clientNote: clientNote.trim() || undefined,
      })
      return res.data.data
    },
    onSuccess: (booking) => {
      router.push(`/dashboard/bookings/${booking.id}`)
    },
    onError: (e: any) => {
      setCardError(e?.response?.data?.message ?? e?.message ?? 'Something went wrong.')
    },
  })

  const card = (
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-cream">
          <h2 className="font-semibold text-charcoal text-lg">Confirm Booking</h2>
          <p className="text-sm text-stone-warm mt-0.5">{inquiry.listing.title}</p>
          <p className="text-xs text-stone-warm mt-1">
            📅 {formatShortDate(inquiry.eventDate)}
            &ensp;·&ensp;
            📍 {inquiry.eventLocation}
            &ensp;·&ensp;
            👥 {inquiry.guestCount} guests
          </p>
        </div>

        {/* Form */}
        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Agreed price */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-stone-warm">Agreed price (£)</label>
            <input
              type="number"
              value={agreedPrice}
              onChange={e => { setAgreedPrice(e.target.value); setCardError(null) }}
              min={1}
              step={0.01}
              placeholder="e.g. 3500.00"
              className="input-base py-2.5 text-sm"
              disabled={isDemo}
            />
          </div>

          {/* Deposit */}
          <div className="flex items-center justify-between bg-sand rounded-xl px-4 py-3">
            <div>
              <p className="text-xs text-stone-warm">Deposit due now (30%)</p>
              <p className="text-sm font-semibold text-charcoal">
                {depositAmount > 0 ? formatPrice(depositAmount) : '—'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-stone-warm">Remaining balance</p>
              <p className="text-sm font-semibold text-charcoal">
                {agreedPrice && Number(agreedPrice) > 0
                  ? formatPrice(Number(agreedPrice) - depositAmount)
                  : '—'}
              </p>
            </div>
          </div>

          {/* Card */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-stone-warm">Payment card</label>
            {isDemo || !stripePromise ? (
              <div className="input-base py-3 text-sm text-stone-400 bg-sand cursor-not-allowed select-none">
                Card input — demo mode
              </div>
            ) : (
              <div className="input-base py-3">
                <CardElement options={CARD_ELEMENT_OPTIONS} />
              </div>
            )}
          </div>

          {/* Client note */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-stone-warm">Note to planner (optional)</label>
            <textarea
              value={clientNote}
              onChange={e => setClientNote(e.target.value)}
              maxLength={1000}
              rows={2}
              placeholder="Any final details or requests…"
              className="input-base py-2.5 text-sm resize-none"
              disabled={isDemo}
            />
          </div>

          {/* Error */}
          {cardError && (
            <p className="text-sm text-red-600">{cardError}</p>
          )}

          {isDemo && (
            <p className="text-xs text-stone-warm bg-sand rounded-lg px-3 py-2 text-center">
              Demo inquiry — booking not available
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={bookingMutation.isPending}
            className="px-4 py-2 border border-cream text-charcoal text-sm rounded-btn hover:bg-sand transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit || bookingMutation.isPending}
            onClick={() => bookingMutation.mutate()}
            className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-btn transition-colors disabled:opacity-50"
          >
            {bookingMutation.isPending
              ? 'Processing…'
              : depositAmount > 0
              ? `Pay Deposit ${formatPrice(depositAmount)}`
              : 'Pay Deposit'}
          </button>
        </div>
      </div>
  )

  if (inline) return card

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      {card}
    </div>
  )
}

// ─── Public export wraps with Elements provider ───────────────────────────────

type Props = {
  inquiry: InquiryResponse
  onClose: () => void
  inline?: boolean
}

export default function BookNowModal({ inquiry, onClose, inline }: Props) {
  const isDemo = inquiry.id < 0
  return (
    <Elements stripe={stripePromise}>
      <BookNowForm inquiry={inquiry} isDemo={isDemo} inline={inline} onClose={onClose} />
    </Elements>
  )
}