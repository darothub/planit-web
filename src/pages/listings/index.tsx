import Head from 'next/head'
import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { api } from '@/lib/api'
import { EventListingResponse, EventType, PageResponse } from '@/lib/types'
import PageShell from '@/components/layout/PageShell'
import FilterBar from '@/components/listings/FilterBar'
import ListingGrid from '@/components/listings/ListingGrid'
import Pagination from '@/components/ui/Pagination'
import { cn } from '@/lib/utils'

const EMPTY_PAGE: PageResponse<EventListingResponse> = {
  content: [], page: 0, size: 10,
  totalElements: 0, totalPages: 0, first: true, last: true,
}

export default function DiscoveryPage() {
  const router = useRouter()
  const query = router.query

  const { data: eventTypes = [] } = useQuery<EventType[]>({
    queryKey: ['event-types'],
    queryFn: () => api.get('/event-types').then(r => r.data.data),
    staleTime: Infinity,
    retry: false,
  })

  const { data = EMPTY_PAGE, isLoading, isPlaceholderData } = useQuery<PageResponse<EventListingResponse>>({
    queryKey: ['listings', query],
    queryFn: () =>
      api.get('/listings', { params: query }).then(r => r.data.data),
    placeholderData: (prev) => prev,
    enabled: router.isReady,
    retry: false,
  })

  const activeType = eventTypes.find(et => String(et.id) === (query.eventTypeId as string))

  // Dynamic heading
  const heading = activeType ? activeType.displayName : 'Browse Events'

  // Result count label
  const { page, size, totalElements, totalPages } = data
  const hasResults = totalElements > 0
  const countLabel = (() => {
    if (!hasResults) return 'No events found'
    if (totalPages > 1) {
      const from = page * size + 1
      const to = Math.min((page + 1) * size, totalElements)
      return `Showing ${from}–${to} of ${totalElements} events`
    }
    return `${totalElements} ${totalElements === 1 ? 'event' : 'events'}`
  })()

  // Active filter chips
  const chips: { label: string; key: string }[] = []
  if (activeType)     chips.push({ label: activeType.displayName,            key: 'eventTypeId' })
  if (query.location) chips.push({ label: query.location as string,          key: 'location'    })
  if (query.date)     chips.push({ label: query.date as string,              key: 'date'        })
  if (query.maxPrice) chips.push({ label: `Max £${query.maxPrice as string}`, key: 'maxPrice'   })
  if (query.guests)   chips.push({ label: `${query.guests as string}+ guests`, key: 'guests'   })

  const removeFilter = (key: string) => {
    const next = { ...query }
    delete next[key]
    delete next.page
    router.push({ pathname: '/listings', query: next }, undefined, { shallow: true })
  }

  const clearAll = () =>
    router.push('/listings', undefined, { shallow: true })

  // Page title
  const titleParts: string[] = []
  if (activeType)     titleParts.push(activeType.displayName)
  if (query.location) titleParts.push(query.location as string)
  const pageTitle = titleParts.length
    ? `${titleParts.join(' in ')} — Planit`
    : 'Browse Events — Planit'

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta
          name="description"
          content="Browse curated event listings from verified planners — weddings, birthdays, corporate gatherings and more."
        />
      </Head>
      <PageShell>
        <FilterBar />

        <div className="max-w-7xl mx-auto px-4 py-8">

          {/* Page heading */}
          <div className="mb-5">
            <h1 className="text-2xl font-bold text-charcoal">{heading}</h1>
            <p className={cn(
              'text-sm mt-0.5 transition-opacity',
              isLoading ? 'text-stone-warm/40' : 'text-stone-warm',
            )}>
              {countLabel}
            </p>
          </div>

          {/* Active filter chips */}
          {chips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-5">
              {chips.map(chip => (
                <button
                  key={chip.key}
                  onClick={() => removeFilter(chip.key)}
                  className="flex items-center gap-1.5 px-3 py-1.5
                    bg-primary/10 border border-primary/30 text-primary
                    text-xs font-medium rounded-full
                    hover:bg-primary hover:text-white hover:border-primary
                    transition-colors"
                >
                  {chip.label}
                  <XMarkIcon className="w-3.5 h-3.5" />
                </button>
              ))}
              {chips.length > 1 && (
                <button
                  onClick={clearAll}
                  className="text-xs font-medium text-stone-warm hover:text-primary transition-colors px-1"
                >
                  Clear all
                </button>
              )}
            </div>
          )}

          {/* Results — dimmed during refetch when we already have data */}
          <div className={cn(
            'transition-opacity duration-200',
            isLoading && !isPlaceholderData ? 'opacity-50 pointer-events-none' : 'opacity-100',
          )}>
            <ListingGrid
              listings={data.content}
              isLoading={isPlaceholderData}
            />
          </div>

          <Pagination page={data.page} totalPages={data.totalPages} />
        </div>
      </PageShell>
    </>
  )
}
