import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'
import { AdjustmentsHorizontalIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { api } from '@/lib/api'
import { EventType } from '@/lib/types'
import { cn } from '@/lib/utils'

const DEMO_TYPES: EventType[] = [
  { id: 1, name: 'WEDDING',     displayName: 'Wedding',     description: '', isActive: true },
  { id: 2, name: 'BIRTHDAY',    displayName: 'Birthday',    description: '', isActive: true },
  { id: 3, name: 'CORPORATE',   displayName: 'Corporate',   description: '', isActive: true },
  { id: 4, name: 'ANNIVERSARY', displayName: 'Anniversary', description: '', isActive: true },
  { id: 5, name: 'GRADUATION',  displayName: 'Graduation',  description: '', isActive: true },
  { id: 6, name: 'BABY_SHOWER', displayName: 'Baby Shower', description: '', isActive: true },
  { id: 7, name: 'ENGAGEMENT',  displayName: 'Engagement',  description: '', isActive: true },
]

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export default function FilterBar() {
  const router = useRouter()
  const query = router.query

  const [location, setLocation]   = useState((query.location as string) ?? '')
  const [maxPrice, setMaxPrice]   = useState((query.maxPrice as string) ?? '')
  const [mobileOpen, setMobileOpen] = useState(false)

  const debouncedLocation = useDebounce(location, 400)
  const debouncedMaxPrice = useDebounce(maxPrice, 400)

  const { data: eventTypes = DEMO_TYPES } = useQuery<EventType[]>({
    queryKey: ['event-types'],
    queryFn: () => api.get('/event-types').then(r => r.data.data),
    staleTime: Infinity,
    retry: false,
  })

  const update = (key: string, value: string) => {
    const next = { ...query, [key]: value, page: '0' }
    if (!value) delete next[key]
    router.push({ pathname: '/listings', query: next }, undefined, { shallow: true })
  }

  const clear = () => {
    setLocation('')
    setMaxPrice('')
    router.push('/listings', undefined, { shallow: true })
  }

  const hasFilters = !!(query.eventTypeId || query.location || query.date ||
                        query.maxPrice || query.guests || query.sortBy)

  // Sync debounced text fields to URL
  useEffect(() => {
    if (router.isReady) update('location', debouncedLocation)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedLocation])

  useEffect(() => {
    if (router.isReady) update('maxPrice', debouncedMaxPrice)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedMaxPrice])

  const filterContent = (
    <div className="flex flex-wrap gap-3 items-end">

      {/* Event type */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-stone-warm">Event type</label>
        <select
          value={(query.eventTypeId as string) ?? ''}
          onChange={e => update('eventTypeId', e.target.value)}
          className="input-base py-2 pr-8 text-sm min-w-[140px]"
        >
          <option value="">All types</option>
          {eventTypes.map(et => (
            <option key={et.id} value={et.id}>{et.displayName}</option>
          ))}
        </select>
      </div>

      {/* Location */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-stone-warm">Location</label>
        <input
          type="text"
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder="City or area"
          className="input-base py-2 text-sm min-w-[140px]"
        />
      </div>

      {/* Date */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-stone-warm">Date</label>
        <input
          type="date"
          value={(query.date as string) ?? ''}
          onChange={e => update('date', e.target.value)}
          className="input-base py-2 text-sm"
        />
      </div>

      {/* Max price */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-stone-warm">Max price (£)</label>
        <input
          type="number"
          value={maxPrice}
          onChange={e => setMaxPrice(e.target.value)}
          placeholder="Any"
          min={0}
          className="input-base py-2 text-sm w-28"
        />
      </div>

      {/* Guests */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-stone-warm">Guests</label>
        <input
          type="number"
          value={(query.guests as string) ?? ''}
          onChange={e => update('guests', e.target.value)}
          placeholder="Any"
          min={1}
          className="input-base py-2 text-sm w-24"
        />
      </div>

      {/* Sort */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-stone-warm">Sort by</label>
        <select
          value={(query.sortBy as string) ?? ''}
          onChange={e => update('sortBy', e.target.value)}
          className="input-base py-2 pr-8 text-sm min-w-[130px]"
        >
          <option value="">Recommended</option>
          <option value="RATING">Top rated</option>
          <option value="PRICE_ASC">Price: low to high</option>
          <option value="PRICE_DESC">Price: high to low</option>
          <option value="NEWEST">Newest</option>
        </select>
      </div>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={clear}
          className="flex items-center gap-1.5 text-sm font-medium text-stone-warm
            hover:text-primary transition-colors pb-0.5 self-end"
        >
          <XMarkIcon className="w-4 h-4" />
          Clear
        </button>
      )}
    </div>
  )

  return (
    <div className="bg-white border-b border-cream">
      <div className="max-w-7xl mx-auto px-4 py-3">

        {/* Desktop */}
        <div className="hidden md:block">
          {filterContent}
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileOpen(o => !o)}
            className={cn(
              'flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-btn border transition-colors',
              mobileOpen || hasFilters
                ? 'border-primary text-primary bg-primary/5'
                : 'border-cream text-charcoal'
            )}
          >
            <AdjustmentsHorizontalIcon className="w-4 h-4" />
            Filters
            {hasFilters && (
              <span className="bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                •
              </span>
            )}
          </button>

          {mobileOpen && (
            <div className="mt-3 pb-1">
              {filterContent}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
