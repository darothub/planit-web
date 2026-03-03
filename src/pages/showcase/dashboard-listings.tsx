import { useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ShowcaseShell from '@/showcase/ShowcaseShell'
import PlannerListingsPage from '@/pages/dashboard/listings/index'
import { DEMO_PLANNER_LISTINGS } from '@/showcase/data'

export const getServerSideProps = () => {
  if (process.env.NODE_ENV === 'production') return { notFound: true }
  return { props: {} }
}

export default function ShowcaseDashboardListings() {
  const qc = useMemo(() => {
    const c = new QueryClient()
    c.setQueryData(['my-listings'], DEMO_PLANNER_LISTINGS)
    return c
  }, [])

  return (
    <QueryClientProvider client={qc}>
      <ShowcaseShell pageName="Planner — My Listings" demoRole="PLANNER">
        <PlannerListingsPage />
      </ShowcaseShell>
    </QueryClientProvider>
  )
}
