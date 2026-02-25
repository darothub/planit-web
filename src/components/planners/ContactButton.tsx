import { useState } from 'react'
import { useRouter } from 'next/router'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { EventListingResponse, InquiryResponse, BudgetRange } from '@/lib/types'
import FormField from '@/components/ui/FormField'
import { cn } from '@/lib/utils'

type Props = {
  listings: EventListingResponse[]
  plannerId: number
}

const budgetOptions: { label: string; value: BudgetRange }[] = [
  { label: 'Budget (under £2,000)',        value: 'BUDGET' },
  { label: 'Mid-range (£2,000 – £8,000)', value: 'MID_RANGE' },
  { label: 'Luxury (£8,000+)',             value: 'LUXURY' },
]

export default function ContactButton({ listings, plannerId }: Props) {
  const { user } = useAuthStore()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const [listingId,  setListingId]  = useState(listings[0]?.id ?? 0)
  const [eventDate,  setEventDate]  = useState('')
  const [eventLoc,   setEventLoc]   = useState('')
  const [guestCount, setGuestCount] = useState(20)
  const [budget,     setBudget]     = useState<BudgetRange>('MID_RANGE')
  const [message,    setMessage]    = useState('')

  const mutation = useMutation({
    mutationFn: () =>
      api.post<{ data: InquiryResponse }>('/inquiries', {
        listingId,
        eventDate,
        eventLocation: eventLoc,
        guestCount,
        budgetRange: budget,
        message,
      }).then(r => r.data.data),
    onSuccess: (inquiry) => router.push(`/messages/${inquiry.id}`),
  })

  const handleClick = () => {
    if (!user) {
      router.push(`/auth/login?redirect=/planners/${plannerId}`)
      return
    }
    if (user.role !== 'CLIENT') return
    setOpen(true)
  }

  return (
    <>
      {(!user || user.role === 'CLIENT') && (
        <button
          onClick={handleClick}
          className="bg-primary hover:bg-primary-hover text-white font-semibold
            px-6 py-2.5 rounded-btn transition-colors"
        >
          Contact Planner
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-modal max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-charcoal text-lg mb-5">Send an enquiry</h3>

            <div className="flex flex-col gap-4">
              {listings.length > 1 && (
                <FormField label="Service">
                  <select
                    value={listingId}
                    onChange={e => setListingId(Number(e.target.value))}
                    className="input-base"
                  >
                    {listings.map(l => (
                      <option key={l.id} value={l.id}>{l.title}</option>
                    ))}
                  </select>
                </FormField>
              )}

              <FormField label="Event date">
                <input
                  type="date"
                  value={eventDate}
                  onChange={e => setEventDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="input-base"
                />
              </FormField>

              <FormField label="Event location">
                <input
                  type="text"
                  value={eventLoc}
                  onChange={e => setEventLoc(e.target.value)}
                  placeholder="London"
                  className="input-base"
                />
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Guests">
                  <input
                    type="number"
                    value={guestCount}
                    onChange={e => setGuestCount(Number(e.target.value))}
                    min={1}
                    className="input-base"
                  />
                </FormField>
                <FormField label="Budget">
                  <select value={budget} onChange={e => setBudget(e.target.value as BudgetRange)} className="input-base">
                    {budgetOptions.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </FormField>
              </div>

              <FormField label="Message">
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={3}
                  placeholder="Tell the planner about your event…"
                  className="input-base resize-none"
                />
              </FormField>
            </div>

            {mutation.isError && (
              <p className="text-red-600 text-sm mt-3">Something went wrong. Please try again.</p>
            )}

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending || !eventDate || !message || !eventLoc}
                className="flex-1 bg-primary hover:bg-primary-hover text-white font-semibold
                  py-2.5 rounded-btn transition-colors disabled:opacity-50"
              >
                {mutation.isPending ? 'Sending…' : 'Send Enquiry'}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="flex-1 border border-cream text-charcoal py-2.5 rounded-btn hover:bg-sand transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}