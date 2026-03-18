import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'
import { AdjustmentsHorizontalIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { api } from '@/lib/api'
import { EventType, PageResponse, PlannerSummaryResponse } from '@/lib/types'
import { cn } from '@/lib/utils'
import PageShell from '@/components/layout/PageShell'
import PlannerCard from '@/components/planners/PlannerCard'
import Pagination from '@/components/ui/Pagination'

const EMPTY_PAGE: PageResponse<PlannerSummaryResponse> = {
  content: [], page: 0, size: 10,
  totalElements: 0, totalPages: 0, first: true, last: true,
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
  const [mobileOpen, setMobileOpen] = useState(false)
  const debouncedLocation = useDebounce(location, 400)

  const update = (key: string, value: string) => {
    const next = { ...query, [key]: value, page: '0' }
    if (!value) delete next[key]
    router.push({ pathname: '/planners', query: next }, undefined, { shallow: true })
  }

  const removeFilter = (key: string) => {
    const next = { ...query }
    delete next[key]
    delete next.page
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

  const { data: eventTypes = [] } = useQuery<EventType[]>({
    queryKey: ['event-types'],
    queryFn: () => api.get('/event-types').then(r => r.data.data),
    staleTime: Infinity,
    retry: false,
  })

  const { data = EMPTY_PAGE, isLoading, isPlaceholderData } = useQuery<PageResponse<PlannerSummaryResponse>>({
    queryKey: ['planners', query],
    queryFn: () =>
      api.get('/planners', { params: query }).then(r => r.data.data),
    placeholderData: (prev) => prev,
    enabled: router.isReady,
    retry: false,
  })

  const activeType = eventTypes.find(et => String(et.id) === (query.eventTypeId as string))

  const chips: { label: string; key: string }[] = []
  if (activeType)     chips.push({ label: activeType.displayName,         key: 'eventTypeId' })
  if (query.location) chips.push({ label: query.location as string,       key: 'location'    })
  if (query.sort)     chips.push({ label: 'Newest',                       key: 'sort'        })

  const filterContent = (
    <div className="flex flex-wrap gap-3 items-end">

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
            <option key={et.id} value={et.id > 0 ? et.id : ''}>{et.displayName}</option>
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
  )

  return (
    <PageShell>

      {/* Sticky filter bar */}
      <div className="sticky top-16 z-40 bg-white border-b border-cream">
        <div className="max-w-7xl mx-auto px-4 py-3">

          {/* Desktop */}
          <div className="hidden md:block">{filterContent}</div>

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
            {mobileOpen && <div className="mt-3 pb-1">{filterContent}</div>}
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Page heading */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-charcoal">Browse Planners</h1>
          <p className="text-stone-warm text-sm mt-0.5">
            {data.totalElements} {data.totalElements === 1 ? 'planner' : 'planners'} found
          </p>
        </div>

        {/* Active filter chips */}
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {chips.map(chip => (
              <button
                key={chip.key}
                onClick={() => removeFilter(chip.key)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/30
                  text-primary text-xs font-medium rounded-full hover:bg-primary/20 transition-colors"
              >
                {chip.label}
                <XMarkIcon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        {isPlaceholderData ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <div className="shimmer aspect-square rounded-card" />
                <div className="mt-2.5 space-y-1.5">
                  <div className="shimmer h-3.5 rounded-full w-3/4" />
                  <div className="shimmer h-3 rounded-full w-1/2" />
                  <div className="shimmer h-3 rounded-full w-2/3" />
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
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
