import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { EventListingDetailResponse, InquiryResponse, BudgetRange, PlannerSummaryResponse } from '@/lib/types'
import { formatPrice, formatShortDate, cancellationPolicyLabel } from '@/lib/utils'
import AvailabilityCalendar from '@/components/listings/AvailabilityCalendar'

type Props = {
  listing: EventListingDetailResponse
  plannerProfile?: PlannerSummaryResponse | null
}

const budgetOptions: { label: string; value: BudgetRange }[] = [
  { label: 'Budget (under £2,000)',        value: 'BUDGET' },
  { label: 'Mid-range (£2,000 – £8,000)', value: 'MID_RANGE' },
  { label: 'Luxury (£8,000+)',             value: 'LUXURY' },
]

function InfoRows({ listing }: { listing: EventListingDetailResponse }) {
  return (
    <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-cream text-sm text-stone-warm">
      <div className="flex items-start gap-2">
        <span className="flex-shrink-0 mt-0.5">📍</span>
        <span>{listing.location}</span>
      </div>
      <div className="flex items-start gap-2">
        <span className="flex-shrink-0 mt-0.5">👥</span>
        <span>{listing.minGuests}–{listing.maxGuests} guests</span>
      </div>
    </div>
  )
}

function PrivacyNotice() {
  return (
    <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-2">
      <span className="text-base flex-shrink-0 mt-0.5">🔒</span>
      <p className="text-xs text-blue-700 leading-relaxed">
        Your contact details are kept private until a booking is confirmed.
      </p>
    </div>
  )
}

function VerifiedChecklist() {
  const items = ['Verified planner', 'Secure payments', 'Free to message']
  return (
    <div className="mt-3 bg-green-50 border border-green-100 rounded-xl p-3 flex flex-col gap-1.5">
      {items.map(item => (
        <div key={item} className="flex items-center gap-2">
          <span className="text-green-600 text-sm font-bold flex-shrink-0">✓</span>
          <span className="text-xs text-green-700">{item}</span>
        </div>
      ))}
    </div>
  )
}

function InquiryForm({
  listing,
  onSuccess,
}: {
  listing: EventListingDetailResponse
  onSuccess: (inquiry: InquiryResponse) => void
}) {
  const [eventDate, setEventDate]         = useState('')
  const [showCalendar, setShowCalendar]   = useState(false)
  const [eventLocation, setEventLocation] = useState(listing.location)
  const [guestCount, setGuestCount]       = useState(listing.minGuests)
  const [budgetRange, setBudgetRange]     = useState<BudgetRange>('MID_RANGE')
  const [message, setMessage]             = useState('')
  const calendarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showCalendar) return
    function handleClick(e: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setShowCalendar(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showCalendar])

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
    onSuccess,
  })

  const isDemo = listing.id < 0

  return (
    <div className="mt-4 pt-4 border-t border-cream flex flex-col gap-3">
      {/* Date picker */}
      <div className="flex flex-col gap-1 relative" ref={calendarRef}>
        <label className="text-xs font-medium text-stone-warm">Event date</label>
        <button
          type="button"
          onClick={() => setShowCalendar(s => !s)}
          className={[
            'input-base py-2.5 text-sm text-left transition-colors',
            eventDate ? 'text-charcoal' : 'text-stone-400',
          ].join(' ')}
        >
          {eventDate ? formatShortDate(eventDate) : 'Select a date'}
        </button>
        {showCalendar && (
          <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-cream rounded-xl shadow-xl p-4">
            <AvailabilityCalendar
              listingId={listing.id}
              selectedDate={eventDate}
              onSelectDate={(date) => { setEventDate(date); setShowCalendar(false) }}
            />
          </div>
        )}
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

      {mutation.isError && (
        <p className="text-red-600 text-xs text-center">
          Something went wrong. Please try again.
        </p>
      )}

      <button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending || !eventDate || !message || isDemo}
        className="w-full bg-primary hover:bg-primary-hover text-white font-semibold
          py-3 rounded-btn transition-colors disabled:opacity-50"
      >
        {mutation.isPending ? 'Sending…' : 'Send Enquiry'}
      </button>

      {isDemo && (
        <p className="text-xs text-stone-warm text-center">
          Demo listing — messaging not available
        </p>
      )}
    </div>
  )
}

export default function BookingCard({ listing, plannerProfile }: Props) {
  const { user } = useAuthStore()
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)

  const avg = listing.averageRating
  const isClient = user?.role === 'CLIENT'

  return (
    <div className="bg-white border border-cream rounded-2xl shadow-card p-6">
      {/* Price + rating header */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <p className="text-xs text-stone-warm mb-0.5">From</p>
          <p className="text-2xl font-bold text-charcoal leading-none">
            {formatPrice(listing.basePrice)}
          </p>
        </div>
        {avg != null && (
          <div className="text-right">
            <p className="text-sm font-semibold text-charcoal">★ {avg.toFixed(1)}</p>
            <p className="text-xs text-stone-warm">
              {listing.reviewCount} {listing.reviewCount === 1 ? 'review' : 'reviews'}
            </p>
          </div>
        )}
      </div>

      {/* CTA */}
      {!user ? (
        <Link
          href={`/auth/login?redirect=/listings/${listing.id}`}
          className="block w-full text-center bg-primary hover:bg-primary-hover text-white
            font-semibold py-3 rounded-btn transition-colors"
        >
          Sign in to enquire
        </Link>
      ) : !isClient ? (
        <p className="text-sm text-stone-warm bg-sand rounded-xl p-3 text-center">
          Only clients can send enquiries.
        </p>
      ) : (
        <>
          <button
            onClick={() => setShowForm(v => !v)}
            className="w-full bg-primary hover:bg-primary-hover text-white font-semibold
              py-3 rounded-btn transition-colors"
          >
            {showForm ? 'Hide form' : 'Message Planner'}
          </button>
          {showForm && (
            <InquiryForm
              listing={listing}
              onSuccess={(inquiry) => router.push(`/messages/${inquiry.id}`)}
            />
          )}
        </>
      )}

      <InfoRows listing={listing} />
      <PrivacyNotice />
      <VerifiedChecklist />

      {/* Cancellation policy */}
      <div className="mt-4 pt-4 border-t border-cream">
        <p className="text-xs font-semibold text-charcoal mb-0.5">Cancellation policy</p>
        <p className="text-xs text-stone-warm">
          {cancellationPolicyLabel[listing.cancellationPolicy]}
        </p>
      </div>
    </div>
  )
}
