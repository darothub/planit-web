import { useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ShowcaseShell from '@/showcase/ShowcaseShell'
import PlannersPage from '@/pages/planners/index'
import { DEMO_PLANNERS } from '@/showcase/data'
import { PageResponse, PlannerSummaryResponse } from '@/lib/types'

export const getServerSideProps = () => {
  if (process.env.NODE_ENV === 'production') return { notFound: true }
  return { props: {} }
}

const DEMO_PAGE: PageResponse<PlannerSummaryResponse> = {
  content: DEMO_PLANNERS,
  page: 0,
  size: 12,
  totalElements: DEMO_PLANNERS.length,
  totalPages: 1,
  first: true,
  last: true,
}

export default function ShowcasePlannersBrowse() {
  const qc = useMemo(() => {
    const c = new QueryClient()
    c.setQueryData(['planners', {}], DEMO_PAGE)
    c.setQueryData(['event-types'], [
      { id: 1, name: 'WEDDING',     displayName: 'Wedding',     description: '', isActive: true },
      { id: 2, name: 'BIRTHDAY',    displayName: 'Birthday',    description: '', isActive: true },
      { id: 3, name: 'CORPORATE',   displayName: 'Corporate',   description: '', isActive: true },
      { id: 4, name: 'ANNIVERSARY', displayName: 'Anniversary', description: '', isActive: true },
      { id: 5, name: 'GRADUATION',  displayName: 'Graduation',  description: '', isActive: true },
      { id: 6, name: 'BABY_SHOWER', displayName: 'Baby Shower', description: '', isActive: true },
      { id: 7, name: 'ENGAGEMENT',  displayName: 'Engagement',  description: '', isActive: true },
    ])
    return c
  }, [])

  return (
    <QueryClientProvider client={qc}>
      <ShowcaseShell pageName="Browse Planners">
        <PlannersPage />
      </ShowcaseShell>
    </QueryClientProvider>
  )
}
