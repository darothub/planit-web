import { useState } from 'react'
import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { EventType } from '@/lib/types'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export default function HeroSearch() {
  const router = useRouter()
  const [eventTypeId, setEventTypeId] = useState('')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState('')

  const { data: eventTypes } = useQuery<EventType[]>({
    queryKey: ['event-types'],
    queryFn: () => api.get('/event-types').then(r => r.data.data),
    staleTime: Infinity,
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const query: Record<string, string> = {}
    if (eventTypeId) query.eventTypeId = eventTypeId
    if (location)    query.location = location
    if (date)        query.date = date
    router.push({ pathname: '/listings', query })
  }

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">

      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent via-accent-hover to-charcoal" />

      {/* Warm overlay texture */}
      <div className="absolute inset-0 opacity-20"
        style={{ backgroundImage: 'radial-gradient(circle at 30% 60%, #C1694F 0%, transparent 60%)' }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-4 w-full max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-4">
          Find the perfect planner
          <br />
          <span className="text-primary-light">for your perfect day.</span>
        </h1>
        <p className="text-white/70 text-lg md:text-xl mb-10">
          Browse verified event planners and book with confidence.
        </p>

        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className="bg-parchment rounded-card shadow-modal p-2 flex flex-col md:flex-row gap-2"
        >
          {/* What */}
          <select
            value={eventTypeId}
            onChange={e => setEventTypeId(e.target.value)}
            className="flex-1 bg-white rounded-btn px-4 py-3 text-sm text-charcoal
              border border-cream focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Any event type</option>
            {eventTypes?.map(et => (
              <option key={et.id} value={et.id}>{et.displayName}</option>
            ))}
          </select>

          {/* Where */}
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Where? (city or region)"
            className="flex-1 bg-white rounded-btn px-4 py-3 text-sm text-charcoal
              border border-cream focus:outline-none focus:ring-2 focus:ring-primary
              placeholder:text-stone-warm"
          />

          {/* When */}
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="flex-1 bg-white rounded-btn px-4 py-3 text-sm text-charcoal
              border border-cream focus:outline-none focus:ring-2 focus:ring-primary"
          />

          {/* Search button */}
          <button
            type="submit"
            className="bg-primary hover:bg-primary-hover text-white font-semibold
              px-8 py-3 rounded-btn transition-colors flex items-center justify-center gap-2
              whitespace-nowrap"
          >
            <MagnifyingGlassIcon className="w-4 h-4" />
            Search
          </button>
        </form>

        {/* Quick category pills */}
        {eventTypes && (
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {eventTypes.slice(0, 6).map(et => (
              <button
                key={et.id}
                type="button"
                onClick={() => router.push({ pathname: '/listings', query: { eventTypeId: et.id } })}
                className="bg-white/15 hover:bg-white/25 text-white text-sm font-medium
                  px-4 py-1.5 rounded-full backdrop-blur-sm transition-colors border border-white/20"
              >
                {et.displayName}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}