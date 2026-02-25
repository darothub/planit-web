/**
 * Renders one horizontal scroll row per event category.
 *
 * Strategy:
 *  1. Show demo listings immediately (instant render, looks real on day 1).
 *  2. In the background, fetch real listings from the API per category.
 *  3. Once real listings arrive, swap demo → real silently.
 *
 * This means the page always looks populated without any spinner or empty state.
 */

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { EventType, EventListingResponse, PageResponse } from '@/lib/types'
import { demoCategories, getDemoListings } from '@/lib/demoData'
import CategoryRow from './CategoryRow'

// Prefix labels per category for a polished feel
const rowLabel: Record<string, string> = {
  WEDDING:     'Popular Weddings',
  BIRTHDAY:    'Trending Birthday Parties',
  CORPORATE:   'Top Corporate Events',
  ANNIVERSARY: 'Romantic Anniversaries',
  GRADUATION:  'Graduation Celebrations',
  BABY_SHOWER: 'Baby Shower Inspirations',
  ENGAGEMENT:  'Engagement Moments',
}

function categoryLabel(eventType: EventType) {
  return rowLabel[eventType.name] ?? eventType.displayName
}

// ── Single category row (fetches its own slice) ──────────────────────────────

function CategoryRowWithData({ eventType }: { eventType: EventType }) {
  const demoFallback = getDemoListings(eventType.name)

  // Default value (= demoFallback) ensures cards are NEVER empty:
  //   pending  → placeholderData (demo)
  //   success  → real API data (or demo if empty)
  //   error    → default value = demoFallback (API down / no connection)
  const { data: listings = demoFallback } = useQuery<EventListingResponse[]>({
    queryKey: ['category-listings', eventType.id],
    queryFn: async () => {
      // Skip API call for placeholder (negative) event type IDs
      if (eventType.id < 0) return demoFallback
      const r = await api.get('/listings', {
        params: { eventTypeId: eventType.id, sortBy: 'RATING', size: 8, page: 0 },
      })
      const page = r.data.data as PageResponse<EventListingResponse>
      return page.content.length > 0 ? page.content : demoFallback
    },
    staleTime: 1000 * 60 * 5,
    placeholderData: demoFallback,
    retry: false, // fail fast → default value kicks in immediately
  })

  if (listings.length === 0) return null

  return (
    // id="row-{NAME}" lets category pills in SearchStrip smooth-scroll here
    <section id={`row-${eventType.name}`} className="scroll-mt-44">
      <CategoryRow
        title={categoryLabel(eventType)}
        seeAllHref={`/listings?eventTypeId=${eventType.id}`}
        listings={listings}
      />
    </section>
  )
}

// ── Section shell ─────────────────────────────────────────────────────────────

// Stable demo event-type list derived from demoData (used as both placeholderData
// AND the default value — so the rows never disappear even when the API is down).
const DEMO_EVENT_TYPES: EventType[] = demoCategories.map((d, i) => ({
  id: -(i + 1),
  name: d.eventTypeName,
  displayName: d.displayName,
  description: '',
  isActive: true,
}))

export default function CategoryRows() {
  // Default value (= DEMO_EVENT_TYPES) is the critical safety net:
  //   pending → placeholderData (demo types, renders immediately)
  //   success → real event types from API
  //   error   → DEMO_EVENT_TYPES (API unreachable → rows stay visible)
  const { data: eventTypes = DEMO_EVENT_TYPES } = useQuery<EventType[]>({
    queryKey: ['event-types'],
    queryFn: () => api.get('/event-types').then(r => r.data.data as EventType[]),
    staleTime: Infinity,
    placeholderData: DEMO_EVENT_TYPES,
    retry: false,
  })

  return (
    <main className="py-10">
      <div className="max-w-7xl mx-auto px-4">

        {/* One row per category — gap between rows */}
        <div className="flex flex-col gap-14">
          {eventTypes?.map(et => (
            <CategoryRowWithData key={et.id} eventType={et} />
          ))}
        </div>

      </div>
    </main>
  )
}
