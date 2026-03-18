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
  const { data: listings = [] } = useQuery<EventListingResponse[]>({
    queryKey: ['category-listings', eventType.id],
    queryFn: async () => {
      const r = await api.get('/listings', {
        params: { eventTypeId: eventType.id, sortBy: 'RATING', size: 8, page: 0 },
      })
      const page = r.data.data as PageResponse<EventListingResponse>
      return page.content
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  })

  if (listings.length === 0) return null

  return (
    // scroll-mt accounts for sticky Navbar (64px) + SearchStrip (~56px) + gap
    <section>
      <CategoryRow
        title={ROW_LABEL[eventType.name] ?? eventType.displayName}
        seeAllHref={`/listings?eventTypeId=${eventType.id}`}
        listings={listings}
      />
    </section>
  )
}

// ── Section shell ─────────────────────────────────────────────────────────────

export default function CategoryRows() {
  // null = show all categories
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const { data: eventTypes = [] } = useQuery<EventType[]>({
    queryKey: ['event-types'],
    queryFn: () => api.get('/event-types').then(r => r.data.data as EventType[]),
    staleTime: Infinity,
    retry: false,
  })

  const visibleTypes = activeCategory
    ? eventTypes.filter(et => et.name === activeCategory)
    : eventTypes

  return (
    <main className="py-10">
      <div className="max-w-7xl mx-auto px-4">

        {/* Category filter pills */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-charcoal mb-4">Browse by category</h2>
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

            {/* All pill */}
            <button
              onClick={() => setActiveCategory(null)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors whitespace-nowrap
                ${activeCategory === null
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-charcoal border-cream hover:bg-sand'
                }`}
            >
              All
            </button>

            {eventTypes.map(et => (
              <button
                key={et.id}
                onClick={() => setActiveCategory(et.name)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5
                  rounded-full text-sm font-medium border transition-colors whitespace-nowrap
                  ${activeCategory === et.name
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-charcoal border-cream hover:bg-sand'
                  }`}
              >
                <span>{CATEGORY_ICONS[et.name] ?? '🎪'}</span>
                <span>{et.displayName}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filtered rows */}
        <div className="flex flex-col gap-14">
          {visibleTypes.map(et => (
            <CategoryRowWithData key={et.id} eventType={et} />
          ))}
        </div>

      </div>
    </main>
  )
}
