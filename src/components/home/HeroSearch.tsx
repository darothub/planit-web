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
    <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden">

      {/* Deep atmospheric background */}
      <div className="absolute inset-0 bg-gradient-to-br from-charcoal via-accent-hover to-accent" />

      {/* Warm terracotta glow — bottom left */}
      <div className="absolute inset-0 opacity-30"
        style={{ backgroundImage: 'radial-gradient(ellipse at 20% 80%, #C1694F 0%, transparent 55%)' }}
      />
      {/* Sand glow — top right */}
      <div className="absolute inset-0 opacity-15"
        style={{ backgroundImage: 'radial-gradient(ellipse at 80% 10%, #F5ECD7 0%, transparent 50%)' }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-4 w-full max-w-4xl mx-auto py-16">

        <p className="text-primary-light text-sm font-semibold uppercase tracking-widest mb-4">
          Thousands of extraordinary events
        </p>

        <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.1] mb-6">
          Your event,
          <br />
          <span className="text-primary-light">beautifully planned.</span>
        </h1>

        <p className="text-white/60 text-lg md:text-xl mb-10 max-w-xl mx-auto">
          Browse curated events from verified planners — weddings, birthdays,
          corporate gatherings and more.
        </p>

        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className="bg-parchment/95 backdrop-blur-md rounded-card shadow-modal p-2
            flex flex-col md:flex-row gap-2"
        >
          <select
            value={eventTypeId}
            onChange={e => setEventTypeId(e.target.value)}
            className="flex-1 bg-white rounded-btn px-4 py-3.5 text-sm text-charcoal
              border border-cream focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Any event type</option>
            {eventTypes?.map(et => (
              <option key={et.id} value={et.id}>{et.displayName}</option>
            ))}
          </select>

          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Location"
            className="flex-1 bg-white rounded-btn px-4 py-3.5 text-sm text-charcoal
              border border-cream focus:outline-none focus:ring-2 focus:ring-primary
              placeholder:text-stone-warm"
          />

          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="flex-1 bg-white rounded-btn px-4 py-3.5 text-sm text-charcoal
              border border-cream focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <button
            type="submit"
            className="bg-primary hover:bg-primary-hover text-white font-semibold
              px-8 py-3.5 rounded-btn transition-colors flex items-center justify-center gap-2
              whitespace-nowrap"
          >
            <MagnifyingGlassIcon className="w-4 h-4" />
            Search
          </button>
        </form>

        {/* Stats row */}
        <div className="flex justify-center gap-8 mt-10 text-white/50 text-sm">
          <span><strong className="text-white">500+</strong> events</span>
          <span><strong className="text-white">200+</strong> verified planners</span>
          <span><strong className="text-white">50+</strong> cities</span>
        </div>
      </div>
    </section>
  )
}
