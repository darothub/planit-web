/**
 * SearchStrip — sticky bar that sits just below the Navbar.
 * Pill-shaped search form: event type | location | date | search button.
 * Category navigation pills have moved to the CategoryRows section header.
 */

import { useState } from 'react'
import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { EventType } from '@/lib/types'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { demoCategories } from '@/lib/demoData'

export default function SearchStrip() {
  const router = useRouter()
  const [eventTypeId, setEventTypeId] = useState('')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState('')

  const DEMO_TYPES: EventType[] = demoCategories.map((d, i) => ({
    id: -(i + 1),
    name: d.eventTypeName,
    displayName: d.displayName,
    description: '',
    isActive: true,
  }))

  const { data: eventTypes = DEMO_TYPES } = useQuery<EventType[]>({
    queryKey: ['event-types'],
    queryFn: () => api.get('/event-types').then(r => r.data.data as EventType[]),
    staleTime: Infinity,
    placeholderData: DEMO_TYPES,
    retry: false,
  })

  const realEventTypes = eventTypes?.filter(et => et.id > 0) ?? []

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const query: Record<string, string> = {}
    if (eventTypeId) query.eventTypeId = eventTypeId
    if (location)    query.location = location
    if (date)        query.date = date
    router.push({ pathname: '/listings', query })
  }

  return (
    <div className="sticky top-16 z-40 bg-white border-b border-cream shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <form
          onSubmit={handleSearch}
          className="flex items-center bg-white border-2 border-cream rounded-full
            shadow-card hover:shadow-card-hover transition-shadow"
        >
          {/* Event type */}
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
    </div>
  )
}
