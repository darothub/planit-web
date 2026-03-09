import { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { api } from '@/lib/api'
import {
  EventAmenity,
  EventListingDetailResponse,
  EventListingImage,
  EventListingResponse,
  EventType,
  CancellationPolicy,
} from '@/lib/types'
import FormField from '@/components/ui/FormField'
import ImageUploadField from '@/components/ui/ImageUploadField'

const ALL_AMENITIES: { key: EventAmenity; label: string }[] = [
  { key: 'RED_CARPET',               label: 'Red carpet entrance' },
  { key: 'LIVE_BAND',                label: 'Live band' },
  { key: 'DJ_SERVICE',               label: 'DJ service' },
  { key: 'MC_HOST',                  label: 'Master of ceremonies' },
  { key: 'DANCE_FLOOR',              label: 'Dance floor' },
  { key: 'PHOTO_BOOTH',              label: 'Photo booth' },
  { key: 'PHOTOGRAPHY_STANDARD',     label: 'Standard photography' },
  { key: 'PHOTOGRAPHY_PROFESSIONAL', label: 'Professional photography (4K)' },
  { key: 'VIDEOGRAPHY_CINEMATIC',    label: 'Cinematic videography' },
  { key: 'DRONE_FOOTAGE',            label: 'Aerial drone footage' },
  { key: 'CATERING_BUFFET',          label: 'Buffet catering' },
  { key: 'CATERING_PLATED',          label: 'Plated meal service' },
  { key: 'OPEN_BAR',                 label: 'Open bar' },
  { key: 'WELCOME_DRINKS',           label: 'Welcome drinks' },
  { key: 'CAKE_INCLUDED',            label: 'Custom cake included' },
  { key: 'DESSERT_STATION',          label: 'Dessert station' },
  { key: 'FLORAL_ARRANGEMENTS',      label: 'Floral arrangements' },
  { key: 'BALLOON_DECOR',            label: 'Balloon décor' },
  { key: 'LIGHTING_PREMIUM',         label: 'Premium event lighting' },
  { key: 'THEMED_DECOR',             label: 'Custom themed décor' },
  { key: 'VALET_PARKING',            label: 'Valet parking' },
  { key: 'SECURITY',                 label: 'Security team' },
  { key: 'DEDICATED_COORDINATOR',    label: 'Dedicated event coordinator' },
  { key: 'OUTDOOR_SPACE',            label: 'Outdoor venue' },
  { key: 'AIR_CONDITIONING',         label: 'Air conditioning' },
]

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
  const qc = useQueryClient()
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

  const [amenities, setAmenities] = useState<Set<EventAmenity>>(
    () => new Set(initial?.amenities ?? [])
  )

  // Gallery state (edit mode only)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const [galleryUploading, setGalleryUploading] = useState(false)
  const [galleryError, setGalleryError] = useState<string | null>(null)

  const toggleAmenity = (key: EventAmenity) =>
    setAmenities(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })

  const { data: eventTypes = DEMO_TYPES } = useQuery<EventType[]>({
    queryKey: ['event-types'],
    queryFn: () => api.get('/event-types').then(r => r.data.data),
    staleTime: Infinity,
    retry: false,
  })

  // Fetch gallery images for the edit form — public endpoint returns images[]
  // Falls back to empty for draft listings (404 expected)
  const { data: listingDetail } = useQuery<EventListingDetailResponse>({
    queryKey: ['listing-detail', initial?.id],
    queryFn: () => api.get(`/listings/${initial!.id}`).then(r => r.data.data),
    enabled: isEdit && !!initial?.id,
    retry: false,
  })

  const galleryImages: EventListingImage[] = listingDetail?.images ?? []

  async function addGalleryImage(file: File) {
    setGalleryError(null)
    setGalleryUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'listings')
      const uploadRes = await api.post('/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const imageUrl: string = uploadRes.data.data.url
      const addRes = await api.post(`/planners/me/listings/${initial!.id}/images`, { imageUrl })
      const newImage = addRes.data.data as EventListingImage
      qc.setQueryData<EventListingDetailResponse>(['listing-detail', initial!.id], old =>
        old
          ? { ...old, images: [...old.images, newImage] }
          : { ...initial!, images: [newImage], recentReviews: [] }
      )
    } catch {
      setGalleryError('Upload failed. Please try again.')
    } finally {
      setGalleryUploading(false)
    }
  }

  async function removeGalleryImage(imageId: number) {
    try {
      await api.delete(`/planners/me/listings/${initial!.id}/images/${imageId}`)
      qc.setQueryData<EventListingDetailResponse>(['listing-detail', initial!.id], old =>
        old ? { ...old, images: old.images.filter(img => img.id !== imageId) } : old!
      )
    } catch {
      // silent — image stays in UI, user can retry
    }
  }

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
        amenities:          Array.from(amenities),
      }
      return isEdit
        ? api.put(`/planners/me/listings/${initial!.id}`, body).then(r => r.data.data)
        : api.post('/planners/me/listings', body).then(r => r.data.data)
    },
    onSuccess: () => router.push('/dashboard/listings'),
  })

  return (
    <>
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

        <FormField label="Cover Image">
          <ImageUploadField
            value={form.coverImageUrl}
            onChange={url => setForm(f => ({ ...f, coverImageUrl: url }))}
          />
        </FormField>

        <div>
          <p className="text-sm font-medium text-charcoal mb-3">What this event includes</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {ALL_AMENITIES.map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={amenities.has(key)}
                  onChange={() => toggleAmenity(key)}
                  className="w-4 h-4 rounded accent-primary"
                />
                <span className="text-sm text-charcoal group-hover:text-primary transition-colors">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

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

      {isEdit && (
        <div className="bg-white border border-cream rounded-xl p-6 flex flex-col gap-3 max-w-2xl mt-4">
          <p className="text-sm font-medium text-charcoal">Gallery Images</p>
          <div className="grid grid-cols-3 gap-2">
            {galleryImages.map(img => (
              <div key={img.id} className="relative aspect-video rounded-lg overflow-hidden bg-cream group">
                <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(img.id)}
                  className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove image"
                >
                  ✕
                </button>
              </div>
            ))}
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) addGalleryImage(file)
                e.target.value = ''
              }}
            />
            <button
              type="button"
              disabled={galleryUploading}
              onClick={() => galleryInputRef.current?.click()}
              className="aspect-video rounded-lg border-2 border-dashed border-cream hover:border-primary flex items-center justify-center text-stone-warm hover:text-primary text-sm transition-colors disabled:opacity-50"
            >
              {galleryUploading ? '…' : '+ Add photo'}
            </button>
          </div>
          {galleryError && <p className="text-xs text-red-500">{galleryError}</p>}
          <p className="text-xs text-stone-warm">
            These appear alongside your cover image in the listing gallery.
          </p>
        </div>
      )}
    </>
  )
}
