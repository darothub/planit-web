import { useRouter } from 'next/router'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { EventListingResponse, PageResponse } from '@/lib/types'
import { getAllDemoListings } from '@/lib/demoData'
import PageShell from '@/components/layout/PageShell'
import FilterBar from '@/components/listings/FilterBar'
import ListingGrid from '@/components/listings/ListingGrid'
import Pagination from '@/components/ui/Pagination'

const DEMO_PAGE: PageResponse<EventListingResponse> = {
  content: getAllDemoListings(),
  page: 0,
  size: 30,
  totalElements: getAllDemoListings().length,
  totalPages: 1,
  first: true,
  last: true,
}

export default function DiscoveryPage() {
  const router = useRouter()

  const { data = DEMO_PAGE, isLoading } = useQuery<PageResponse<EventListingResponse>>({
    queryKey: ['listings', router.query],
    queryFn: () =>
      api.get('/listings', { params: router.query }).then(r => r.data.data),
    placeholderData: keepPreviousData,
    enabled: router.isReady,
    retry: false,
  })

  return (
    <PageShell>
      <FilterBar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-stone-warm text-sm mb-6">
          {data.totalElements} {data.totalElements === 1 ? 'planner' : 'planners'} found
        </p>
        <ListingGrid listings={data.content} isLoading={isLoading && !data.content.length} />
        <Pagination page={data.page} totalPages={data.totalPages} />
      </div>
    </PageShell>
  )
}
