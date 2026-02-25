/**
 * SearchStrip — sticky bar that sits just below the Navbar.
 *
 * Top section: pill-shaped search form (event type | location | date | search button)
 * Bottom section: horizontal scrollable category emoji pills
 *   - Click a pill → smooth-scroll to that category's listing row
 *   - Active pill highlighted in terracotta
 */

import { useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { EventType } from '@/lib/types'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { demoCategories } from '@/lib/demoData'

const CATEGORY_ICONS: Record<string, string> = {
  WEDDING:     '💒',
  BIRTHDAY:    '🎂',
  CORPORATE:   '🏢',
  ANNIVERSARY: '💐',
  GRADUATION:  '🎓',
  BABY_SHOWER: '🍼',
  ENGAGEMENT:  '💍',
}

export default function SearchStrip() {
  const router = useRouter()
  const stripRef = useRef<HTMLDivElement>(null)
  const [eventTypeId, setEventTypeId] = useState('')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  // Demo event types used as both placeholder AND error fallback
  const DEMO_TYPES: EventType[] = demoCategories.map((d, i) => ({
    id: -(i + 1),
    name: d.eventTypeName,
    displayName: d.displayName,
    description: '',
    isActive: true,
  }))

  // Default value (= DEMO_TYPES) keeps pills visible even when the API errors
  const { data: eventTypes = DEMO_TYPES } = useQuery<EventType[]>({
    queryKey: ['event-types'],
    queryFn: () => api.get('/event-types').then(r => r.data.data as EventType[]),
    staleTime: Infinity,
    placeholderData: DEMO_TYPES,
    retry: false,
  })

  // Only real (positive-ID) event types go in the search dropdown
  const realEventTypes = eventTypes?.filter(et => et.id > 0) ?? []

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const query: Record<string, string> = {}
    if (eventTypeId) query.eventTypeId = eventTypeId
    if (location)    query.location = location
    if (date)        query.date = date
    router.push({ pathname: '/listings', query })
  }

  const handlePillClick = (et: EventType) => {
    setActiveCategory(et.name)
    const row = document.getElementById(`row-${et.name}`)
    if (!row) return
    // Use the actual bottom edge of the sticky strip as the offset.
    // getBoundingClientRect().bottom gives the real pixel position regardless
    // of how many pill rows are wrapping at this moment.
    const stickyBottom = stripRef.current?.getBoundingClientRect().bottom ?? 180
    const rowTop = row.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top: rowTop - stickyBottom - 12, behavior: 'smooth' })
  }

  return (
    <div ref={stripRef} className="sticky top-16 z-40 bg-white border-b border-cream shadow-sm">

      {/* ── Pill Search Bar ───────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 pt-4 pb-3">
        <form
          onSubmit={handleSearch}
          className="flex items-center bg-white border-2 border-cream rounded-full
            shadow-card hover:shadow-card-hover transition-shadow"
        >
          {/* Event type — only populated once real data loads */}
          <select
            value={eventTypeId}
            onChange={e => setEventTypeId(e.target.value)}
            className="flex-1 bg-transparent px-5 py-3 text-sm text-charcoal
              border-r border-cream focus:outline-none cursor-pointer min-w-0
              appearance-none"
          >
            <option value="">Any event type</option>
            {realEventTypes.map(et => (
              <option key={et.id} value={et.id}>{et.displayName}</option>
            ))}
          </select>

          {/* Location */}
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Location"
            className="flex-1 bg-transparent px-5 py-3 text-sm text-charcoal
              border-r border-cream focus:outline-none min-w-0
              placeholder:text-stone-warm"
          />

          {/* Date */}
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="flex-1 bg-transparent px-5 py-3 text-sm text-charcoal
              focus:outline-none min-w-0"
          />

          {/* Search button */}
          <button
            type="submit"
            aria-label="Search events"
            className="m-1.5 bg-primary hover:bg-primary-hover text-white
              w-10 h-10 rounded-full flex items-center justify-center
              transition-colors flex-shrink-0"
          >
            <MagnifyingGlassIcon className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* ── Category Filter Pills ─────────────────────────────────────── */}
      {/* No flex-wrap — pills scroll horizontally so the strip stays one consistent height */}
      <div className="pb-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex gap-2 justify-center px-4 min-w-max mx-auto">
        {eventTypes?.map(et => {
          const icon = CATEGORY_ICONS[et.name] ?? '🎪'
          const isActive = activeCategory === et.name
          return (
            <button
              key={et.id}
              onClick={() => handlePillClick(et)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5
                rounded-full text-sm font-medium border transition-colors
                whitespace-nowrap select-none
                ${isActive
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white text-charcoal border-cream hover:bg-parchment hover:border-sand-dark'
                }`}
            >
              <span>{icon}</span>
              <span>{et.displayName}</span>
            </button>
          )
        })}
      </div>
      </div>

    </div>
  )
}
