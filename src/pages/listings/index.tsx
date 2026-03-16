import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { api } from '@/lib/api'
import { EventListingResponse, EventType, PageResponse } from '@/lib/types'
import { getAllDemoListings } from '@/lib/demoData'
import PageShell from '@/components/layout/PageShell'
import FilterBar from '@/components/listings/FilterBar'
import ListingGrid from '@/components/listings/ListingGrid'
import Pagination from '@/components/ui/Pagination'

const ALL_DEMO = getAllDemoListings()

const DEMO_PAGE: PageResponse<EventListingResponse> = {
  content: ALL_DEMO,
  page: 0,
  size: ALL_DEMO.length,
  totalElements: ALL_DEMO.length,
  totalPages: 1,
  first: true,
  last: true,
}

export default function DiscoveryPage() {
  const router = useRouter()

  const { data: eventTypes = [] } = useQuery<EventType[]>({
    queryKey: ['event-types'],
    queryFn: () => api.get('/event-types').then(r => r.data.data),
    staleTime: Infinity,
    retry: false,
  })

  const { data = DEMO_PAGE, isLoading } = useQuery<PageResponse<EventListingResponse>>({
    queryKey: ['listings', router.query],
    queryFn: () =>
      api.get('/listings', { params: router.query }).then(r => r.data.data),
    placeholderData: (prev) => prev ?? DEMO_PAGE,
    enabled: router.isReady,
    retry: false,
  })

  const query = router.query

  const removeFilter = (key: string) => {
    const next = { ...query }
    delete next[key]
    delete next.page
    router.push({ pathname: '/listings', query: next }, undefined, { shallow: true })
  }

  const activeType = eventTypes.find(et => String(et.id) === (query.eventTypeId as string))

  const chips: { label: string; key: string }[] = []
  if (activeType)       chips.push({ label: activeType.displayName,          key: 'eventTypeId' })
  if (query.location)   chips.push({ label: `${query.location as string}`,   key: 'location'    })
  if (query.date)       chips.push({ label: `${query.date as string}`,       key: 'date'        })
  if (query.maxPrice)   chips.push({ label: `Max £${query.maxPrice as string}`, key: 'maxPrice' })
  if (query.guests)     chips.push({ label: `${query.guests as string}+ guests`, key: 'guests'  })

  return (
    <PageShell>
      <FilterBar />
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Page heading */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-charcoal">Browse Events</h1>
          <p className="text-stone-warm text-sm mt-0.5">
            {data.totalElements} {data.totalElements === 1 ? 'event' : 'events'} found
          </p>
        </div>

        {/* Active filter chips */}
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {chips.map(chip => (
              <button
                key={chip.key}
                onClick={() => removeFilter(chip.key)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-charcoal text-white
                  text-xs font-medium rounded-full hover:bg-charcoal/80 transition-colors"
              >
                {chip.label}
                <XMarkIcon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        )}

        <ListingGrid listings={data.content} isLoading={isLoading && !data.content.length} />
        <Pagination page={data.page} totalPages={data.totalPages} />
      </div>
    </PageShell>
  )
}
