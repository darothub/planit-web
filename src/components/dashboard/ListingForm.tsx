import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { api } from '@/lib/api'
import { EventListingResponse, EventType, CancellationPolicy } from '@/lib/types'
import FormField from '@/components/ui/FormField'

type FormValues = {
  title: string
  description: string
  eventTypeId: string
  location: string
  basePrice: string
  minGuests: string
  maxGuests: string
  cancellationPolicy: CancellationPolicy
  coverImageUrl: string
}

type Props = {
  initial?: EventListingResponse
}

const DEMO_TYPES: EventType[] = [
  { id: 1, name: 'WEDDING',     displayName: 'Wedding',     description: '', isActive: true },
  { id: 2, name: 'BIRTHDAY',    displayName: 'Birthday',    description: '', isActive: true },
  { id: 3, name: 'CORPORATE',   displayName: 'Corporate',   description: '', isActive: true },
  { id: 4, name: 'ANNIVERSARY', displayName: 'Anniversary', description: '', isActive: true },
  { id: 5, name: 'GRADUATION',  displayName: 'Graduation',  description: '', isActive: true },
  { id: 6, name: 'BABY_SHOWER', displayName: 'Baby Shower', description: '', isActive: true },
  { id: 7, name: 'ENGAGEMENT',  displayName: 'Engagement',  description: '', isActive: true },
]

export default function ListingForm({ initial }: Props) {
  const router = useRouter()
  const isEdit = !!initial

  const [form, setForm] = useState<FormValues>({
    title:               initial?.title ?? '',
    description:         initial?.description ?? '',
    eventTypeId:         String(initial?.eventType.id ?? ''),
    location:            initial?.location ?? '',
    basePrice:           String(initial?.basePrice ?? ''),
    minGuests:           String(initial?.minGuests ?? 20),
    maxGuests:           String(initial?.maxGuests ?? 200),
    cancellationPolicy:  initial?.cancellationPolicy ?? 'MODERATE',
    coverImageUrl:       initial?.coverImageUrl ?? '',
  })

  const { data: eventTypes = DEMO_TYPES } = useQuery<EventType[]>({
    queryKey: ['event-types'],
    queryFn: () => api.get('/event-types').then(r => r.data.data),
    staleTime: Infinity,
    retry: false,
  })

  const set = (key: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  const mutation = useMutation({
    mutationFn: () => {
      const body = {
        title:              form.title,
        description:        form.description,
        eventTypeId:        Number(form.eventTypeId),
        location:           form.location,
        basePrice:          Number(form.basePrice),
        minGuests:          Number(form.minGuests),
        maxGuests:          Number(form.maxGuests),
        cancellationPolicy: form.cancellationPolicy,
        coverImageUrl:      form.coverImageUrl || undefined,
      }
      return isEdit
        ? api.put(`/planners/me/listings/${initial!.id}`, body).then(r => r.data.data)
        : api.post('/planners/me/listings', body).then(r => r.data.data)
    },
    onSuccess: () => router.push('/dashboard/listings'),
  })

  return (
    <form
      onSubmit={e => { e.preventDefault(); mutation.mutate() }}
      className="bg-white border border-cream rounded-xl p-6 flex flex-col gap-4 max-w-2xl"
    >
      <FormField label="Title">
        <input value={form.title} onChange={set('title')} required className="input-base" placeholder="e.g. Elegant Garden Wedding" />
      </FormField>

      <FormField label="Description">
        <textarea value={form.description} onChange={set('description')} rows={4} className="input-base resize-none" placeholder="Describe your service…" />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Event Type">
          <select value={form.eventTypeId} onChange={set('eventTypeId')} required className="input-base">
            <option value="">Select…</option>
            {eventTypes.map(et => <option key={et.id} value={et.id}>{et.displayName}</option>)}
          </select>
        </FormField>
        <FormField label="Location">
          <input value={form.location} onChange={set('location')} required className="input-base" placeholder="London" />
        </FormField>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <FormField label="Base Price (£)">
          <input type="number" value={form.basePrice} onChange={set('basePrice')} required min={1} className="input-base" placeholder="1500" />
        </FormField>
        <FormField label="Min Guests">
          <input type="number" value={form.minGuests} onChange={set('minGuests')} required min={1} className="input-base" />
        </FormField>
        <FormField label="Max Guests">
          <input type="number" value={form.maxGuests} onChange={set('maxGuests')} required min={1} className="input-base" />
        </FormField>
      </div>

      <FormField label="Cancellation Policy">
        <select value={form.cancellationPolicy} onChange={set('cancellationPolicy')} className="input-base">
          <option value="FLEXIBLE">Flexible — full refund &gt;14 days before event</option>
          <option value="MODERATE">Moderate — 50% refund &gt;7 days before event</option>
          <option value="STRICT">Strict — no refund after booking accepted</option>
        </select>
      </FormField>

      <FormField label="Cover Image URL (optional)">
        <input value={form.coverImageUrl} onChange={set('coverImageUrl')} className="input-base" placeholder="https://…" />
      </FormField>

      {mutation.isError && (
        <p className="text-red-600 text-sm">Something went wrong. Please try again.</p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-2.5 rounded-btn transition-colors disabled:opacity-50"
        >
          {mutation.isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Listing'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/dashboard/listings')}
          className="px-6 py-2.5 border border-cream text-charcoal rounded-btn hover:bg-sand transition-colors text-sm font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
