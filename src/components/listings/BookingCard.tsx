import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { EventListingDetailResponse, InquiryResponse, BudgetRange } from '@/lib/types'
import { formatPrice, cancellationPolicyLabel } from '@/lib/utils'

type Props = {
  listing: EventListingDetailResponse
}

const budgetOptions: { label: string; value: BudgetRange }[] = [
  { label: 'Budget (under £2,000)',        value: 'BUDGET' },
  { label: 'Mid-range (£2,000 – £8,000)', value: 'MID_RANGE' },
  { label: 'Luxury (£8,000+)',             value: 'LUXURY' },
]

export default function BookingCard({ listing }: Props) {
  const { user } = useAuthStore()
  const router = useRouter()

  const [eventDate, setEventDate]     = useState('')
  const [eventLocation, setEventLocation] = useState(listing.location)
  const [guestCount, setGuestCount]   = useState(listing.minGuests)
  const [budgetRange, setBudgetRange] = useState<BudgetRange>('MID_RANGE')
  const [message, setMessage]         = useState('')

  const mutation = useMutation({
    mutationFn: () =>
      api.post<{ data: InquiryResponse }>('/inquiries', {
        listingId: listing.id,
        eventDate,
        eventLocation,
        guestCount,
        budgetRange,
        message,
      }).then(r => r.data.data),
    onSuccess: (inquiry) => {
      router.push(`/messages/${inquiry.id}`)
    },
  })

  const isDemo = listing.id < 0

  // ── Not logged in ────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="bg-white border border-cream rounded-2xl shadow-card p-6">
        <p className="text-2xl font-bold text-charcoal mb-1">
          {formatPrice(listing.basePrice)}
        </p>
        <p className="text-stone-warm text-sm mb-6">Starting price</p>
        <Link
          href={`/auth/login?redirect=/listings/${listing.id}`}
          className="block w-full text-center bg-primary hover:bg-primary-hover text-white
            font-semibold py-3 rounded-btn transition-colors"
        >
          Sign in to enquire
        </Link>
        <p className="text-xs text-stone-warm text-center mt-3">
          Free to message · No booking fees
        </p>
      </div>
    )
  }

  // ── Planner / Admin — can't book ─────────────────────────────────────────
  if (user.role !== 'CLIENT') {
    return (
      <div className="bg-white border border-cream rounded-2xl shadow-card p-6">
        <p className="text-2xl font-bold text-charcoal mb-1">
          {formatPrice(listing.basePrice)}
        </p>
        <p className="text-stone-warm text-sm mb-4">Starting price</p>
        <p className="text-sm text-stone-warm bg-sand rounded-xl p-3">
          Only clients can send enquiries and make bookings.
        </p>
      </div>
    )
  }

  // ── Client ───────────────────────────────────────────────────────────────
  return (
    <div className="bg-white border border-cream rounded-2xl shadow-card p-6">
      <p className="text-2xl font-bold text-charcoal mb-1">
        {formatPrice(listing.basePrice)}
      </p>
      <p className="text-stone-warm text-sm mb-5">Starting price</p>

      <div className="flex flex-col gap-3">
        {/* Date */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-stone-warm">Event date</label>
          <input
            type="date"
            value={eventDate}
            onChange={e => setEventDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="input-base py-2.5 text-sm"
          />
        </div>

        {/* Location */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-stone-warm">Event location</label>
          <input
            type="text"
            value={eventLocation}
            onChange={e => setEventLocation(e.target.value)}
            className="input-base py-2.5 text-sm"
          />
        </div>

        {/* Guests */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-stone-warm">Guests</label>
          <input
            type="number"
            value={guestCount}
            onChange={e => setGuestCount(Number(e.target.value))}
            min={listing.minGuests}
            max={listing.maxGuests}
            className="input-base py-2.5 text-sm"
          />
          <p className="text-xs text-stone-warm">
            {listing.minGuests}–{listing.maxGuests} guests
          </p>
        </div>

        {/* Budget */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-stone-warm">Budget range</label>
          <select
            value={budgetRange}
            onChange={e => setBudgetRange(e.target.value as BudgetRange)}
            className="input-base py-2.5 text-sm"
          >
            {budgetOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Message */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-stone-warm">Message</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={3}
            placeholder="Tell the planner about your event…"
            className="input-base py-2.5 text-sm resize-none"
          />
        </div>
      </div>

      {mutation.isError && (
        <p className="text-red-600 text-xs mt-3 text-center">
          Something went wrong. Please try again.
        </p>
      )}

      <button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending || !eventDate || !message || isDemo}
        className="w-full mt-5 bg-primary hover:bg-primary-hover text-white font-semibold
          py-3 rounded-btn transition-colors disabled:opacity-50"
      >
        {mutation.isPending ? 'Sending…' : 'Message Planner'}
      </button>

      {isDemo && (
        <p className="text-xs text-stone-warm text-center mt-2">
          Demo listing — messaging not available
        </p>
      )}

      <p className="text-xs text-stone-warm text-center mt-2">
        Free to message · No booking fees
      </p>

      {/* Cancellation policy */}
      <div className="mt-5 pt-4 border-t border-cream">
        <p className="text-xs font-semibold text-charcoal mb-0.5">Cancellation policy</p>
        <p className="text-xs text-stone-warm">
          {cancellationPolicyLabel[listing.cancellationPolicy]}
        </p>
      </div>
    </div>
  )
}
