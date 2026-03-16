/**
 * Renders one horizontal scroll row per event category, preceded by a
 * category pill nav that smooth-scrolls to the matching row.
 *
 * Strategy:
 *  1. Show demo listings immediately (instant render, looks real on day 1).
 *  2. In the background, fetch real listings from the API per category.
 *  3. Once real listings arrive, swap demo → real silently.
 */

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { EventType, EventListingResponse, PageResponse } from '@/lib/types'
import { demoCategories, getDemoListings } from '@/lib/demoData'
import CategoryRow from './CategoryRow'

const CATEGORY_ICONS: Record<string, string> = {
  WEDDING:     '💒',
  BIRTHDAY:    '🎂',
  CORPORATE:   '🏢',
  ANNIVERSARY: '💐',
  GRADUATION:  '🎓',
  BABY_SHOWER: '🍼',
  ENGAGEMENT:  '💍',
}

const ROW_LABEL: Record<string, string> = {
  WEDDING:     'Popular Weddings',
  BIRTHDAY:    'Trending Birthday Parties',
  CORPORATE:   'Top Corporate Events',
  ANNIVERSARY: 'Romantic Anniversaries',
  GRADUATION:  'Graduation Celebrations',
  BABY_SHOWER: 'Baby Shower Inspirations',
  ENGAGEMENT:  'Engagement Moments',
}

// ── Single category row ───────────────────────────────────────────────────────

function CategoryRowWithData({ eventType }: { eventType: EventType }) {
  const demoFallback = getDemoListings(eventType.name)

  const { data: listings = [] } = useQuery<EventListingResponse[]>({
    queryKey: ['category-listings', eventType.id],
    queryFn: async () => {
      if (eventType.id < 0) return []
      const r = await api.get('/listings', {
        params: { eventTypeId: eventType.id, sortBy: 'RATING', size: 8, page: 0 },
      })
      const page = r.data.data as PageResponse<EventListingResponse>
      return page.content
    },
    staleTime: 1000 * 60 * 5,
    placeholderData: demoFallback,
    retry: false,
  })

  if (listings.length === 0) return null

  return (
    // scroll-mt accounts for sticky Navbar (64px) + SearchStrip (~56px) + gap
    <section id={`row-${eventType.name}`} className="scroll-mt-32">
      <CategoryRow
        title={ROW_LABEL[eventType.name] ?? eventType.displayName}
        seeAllHref={`/listings?eventTypeId=${eventType.id}`}
        listings={listings}
      />
    </section>
  )
}

// ── Stable demo types (placeholder + offline fallback) ────────────────────────

const DEMO_EVENT_TYPES: EventType[] = demoCategories.map((d, i) => ({
  id: -(i + 1),
  name: d.eventTypeName,
  displayName: d.displayName,
  description: '',
  isActive: true,
}))

// ── Section shell ─────────────────────────────────────────────────────────────

export default function CategoryRows() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const { data: eventTypes = DEMO_EVENT_TYPES } = useQuery<EventType[]>({
    queryKey: ['event-types'],
    queryFn: () => api.get('/event-types').then(r => r.data.data as EventType[]),
    staleTime: Infinity,
    placeholderData: DEMO_EVENT_TYPES,
    retry: false,
  })

  const handlePillClick = (et: EventType) => {
    setActiveCategory(et.name)
    const row = document.getElementById(`row-${et.name}`)
    if (!row) return
    // offset = Navbar (64px) + SearchStrip (~56px) + 12px breathing room
    const offset = 132
    const rowTop = row.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top: rowTop - offset, behavior: 'smooth' })
  }

  return (
    <main className="py-10">
      <div className="max-w-7xl mx-auto px-4">

        {/* Category pill nav */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-charcoal mb-4">Browse by category</h2>
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {eventTypes.map(et => {
              const isActive = activeCategory === et.name
              return (
                <button
                  key={et.id}
                  onClick={() => handlePillClick(et)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5
                    rounded-full text-sm font-medium border transition-colors whitespace-nowrap
                    ${isActive
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-charcoal border-cream hover:bg-sand hover:border-cream'
                    }`}
                >
                  <span>{CATEGORY_ICONS[et.name] ?? '🎪'}</span>
                  <span>{et.displayName}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* One row per category */}
        <div className="flex flex-col gap-14">
          {eventTypes.map(et => (
            <CategoryRowWithData key={et.id} eventType={et} />
          ))}
        </div>

      </div>
    </main>
  )
}
