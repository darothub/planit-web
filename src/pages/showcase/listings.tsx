import { useState, useMemo } from 'react'
import { AdjustmentsHorizontalIcon, XMarkIcon } from '@heroicons/react/24/outline'
import ShowcaseShell from '@/showcase/ShowcaseShell'
import PageShell from '@/components/layout/PageShell'
import ListingGrid from '@/components/listings/ListingGrid'
import { cn } from '@/lib/utils'
import { getAllDemoListings } from '@/lib/demoData'
import { EventType } from '@/lib/types'

export const getServerSideProps = () => {
  if (process.env.NODE_ENV === 'production') return { notFound: true }
  return { props: {} }
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

const ALL_LISTINGS = getAllDemoListings()

export default function ShowcaseListings() {
  const [eventTypeId, setEventTypeId] = useState('')
  const [location,    setLocation]    = useState('')
  const [maxPrice,    setMaxPrice]    = useState('')
  const [sortBy,      setSortBy]      = useState('')
  const [mobileOpen,  setMobileOpen]  = useState(false)

  const filtered = useMemo(() => {
    let result = [...ALL_LISTINGS]
    if (eventTypeId) result = result.filter(l => l.eventType.id === Number(eventTypeId))
    if (location)    result = result.filter(l => l.location.toLowerCase().includes(location.toLowerCase()))
    if (maxPrice)    result = result.filter(l => l.basePrice <= Number(maxPrice))
    if (sortBy === 'RATING')     result.sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0))
    if (sortBy === 'PRICE_ASC')  result.sort((a, b) => a.basePrice - b.basePrice)
    if (sortBy === 'PRICE_DESC') result.sort((a, b) => b.basePrice - a.basePrice)
    if (sortBy === 'NEWEST')     result.sort((a, b) => a.id - b.id)
    return result
  }, [eventTypeId, location, maxPrice, sortBy])

  const hasFilters = !!(eventTypeId || location || maxPrice || sortBy)
  const clear = () => { setEventTypeId(''); setLocation(''); setMaxPrice(''); setSortBy('') }

  const filterContent = (
    <div className="flex flex-wrap gap-3 items-end">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-stone-warm">Event type</label>
        <select
          value={eventTypeId}
          onChange={e => setEventTypeId(e.target.value)}
          className="input-base py-2 pr-8 text-sm min-w-[140px]"
        >
          <option value="">All types</option>
          {DEMO_TYPES.map(et => (
            <option key={et.id} value={et.id}>{et.displayName}</option>
          ))}
        </select>
      </div>

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

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-stone-warm">Sort by</label>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="input-base py-2 pr-8 text-sm min-w-[130px]"
        >
          <option value="">Recommended</option>
          <option value="RATING">Top rated</option>
          <option value="PRICE_ASC">Price: low to high</option>
          <option value="PRICE_DESC">Price: high to low</option>
          <option value="NEWEST">Newest</option>
        </select>
      </div>

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
    <ShowcaseShell pageName="Browse Events">
      <PageShell>
        {/* Filter bar — mirrors FilterBar.tsx but uses local state */}
        <div className="bg-white border-b border-cream">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="hidden md:block">{filterContent}</div>
            <div className="md:hidden">
              <button
                onClick={() => setMobileOpen(o => !o)}
                className={cn(
                  'flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-btn border transition-colors',
                  mobileOpen || hasFilters
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-cream text-charcoal',
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
              {mobileOpen && <div className="mt-3 pb-1">{filterContent}</div>}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-charcoal">Browse Events</h1>
            <p className="text-stone-warm text-sm mt-0.5">
              {filtered.length} {filtered.length === 1 ? 'event' : 'events'} found
            </p>
          </div>
          <ListingGrid listings={filtered} isLoading={false} />
        </div>
      </PageShell>
    </ShowcaseShell>
  )
}
