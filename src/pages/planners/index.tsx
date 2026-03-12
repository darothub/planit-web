import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { AdjustmentsHorizontalIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { api } from '@/lib/api'
import { EventType, PageResponse, PlannerSummaryResponse } from '@/lib/types'
import PageShell from '@/components/layout/PageShell'
import PlannerCard from '@/components/planners/PlannerCard'
import Pagination from '@/components/ui/Pagination'

const DEMO_TYPES: EventType[] = [
  { id: 1, name: 'WEDDING',     displayName: 'Wedding',     description: '', isActive: true },
  { id: 2, name: 'BIRTHDAY',    displayName: 'Birthday',    description: '', isActive: true },
  { id: 3, name: 'CORPORATE',   displayName: 'Corporate',   description: '', isActive: true },
  { id: 4, name: 'ANNIVERSARY', displayName: 'Anniversary', description: '', isActive: true },
  { id: 5, name: 'GRADUATION',  displayName: 'Graduation',  description: '', isActive: true },
  { id: 6, name: 'BABY_SHOWER', displayName: 'Baby Shower', description: '', isActive: true },
  { id: 7, name: 'ENGAGEMENT',  displayName: 'Engagement',  description: '', isActive: true },
]

const DEMO_PAGE: PageResponse<PlannerSummaryResponse> = {
  content: [],
  page: 0,
  size: 12,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export default function PlannersPage() {
  const router = useRouter()
  const query = router.query

  const [location, setLocation] = useState((query.location as string) ?? '')
  const debouncedLocation = useDebounce(location, 400)

  const update = (key: string, value: string) => {
    const next = { ...query, [key]: value, page: '0' }
    if (!value) delete next[key]
    router.push({ pathname: '/planners', query: next }, undefined, { shallow: true })
  }

  const clear = () => {
    setLocation('')
    router.push('/planners', undefined, { shallow: true })
  }

  const hasFilters = !!(query.location || query.eventTypeId || query.sort)

  useEffect(() => {
    if (router.isReady) update('location', debouncedLocation)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedLocation])

  const { data: eventTypes = DEMO_TYPES } = useQuery<EventType[]>({
    queryKey: ['event-types'],
    queryFn: () => api.get('/event-types').then(r => r.data.data),
    staleTime: Infinity,
    retry: false,
  })

  const { data = DEMO_PAGE, isLoading } = useQuery<PageResponse<PlannerSummaryResponse>>({
    queryKey: ['planners', query],
    queryFn: () =>
      api.get('/planners', { params: query }).then(r => r.data.data),
    placeholderData: keepPreviousData,
    enabled: router.isReady,
    retry: false,
  })

  return (
    <PageShell>
      {/* Filter bar */}
      <div className="bg-white border-b border-cream">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap gap-3 items-end">

          {/* Location */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-stone-warm">Location</label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="City or area"
              className="input-base py-2 text-sm min-w-[160px]"
            />
          </div>

          {/* Specialty */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-stone-warm">Specialty</label>
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

          {/* Sort */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-stone-warm">Sort by</label>
            <select
              value={(query.sort as string) ?? ''}
              onChange={e => update('sort', e.target.value)}
              className="input-base py-2 pr-8 text-sm min-w-[130px]"
            >
              <option value="">Top rated</option>
              <option value="newest">Newest</option>
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
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-stone-warm text-sm mb-6">
          {data.totalElements} {data.totalElements === 1 ? 'planner' : 'planners'} found
        </p>

        {isLoading && !data.content.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square rounded-card bg-sand" />
                <div className="mt-2.5 space-y-1.5">
                  <div className="h-3 bg-sand rounded w-3/4" />
                  <div className="h-3 bg-sand rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : data.content.length === 0 ? (
          <div className="py-24 text-center">
            <AdjustmentsHorizontalIcon className="w-10 h-10 text-stone-warm/40 mx-auto mb-3" />
            <p className="text-charcoal font-medium">No planners found</p>
            <p className="text-stone-warm text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {data.content.map(p => (
              <PlannerCard key={p.id} planner={p} />
            ))}
          </div>
        )}

        <Pagination page={data.page} totalPages={data.totalPages} />
      </div>
    </PageShell>
  )
}
