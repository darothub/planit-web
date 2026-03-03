import { useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ShowcaseShell from '@/showcase/ShowcaseShell'
import PlannerDashboard from '@/components/dashboard/PlannerDashboard'
import {
  DEMO_BOOKINGS_PLANNER,
  DEMO_INQUIRIES_PLANNER,
  DEMO_PLANNER_STATS,
} from '@/showcase/data'

export const getServerSideProps = () => {
  if (process.env.NODE_ENV === 'production') return { notFound: true }
  return { props: {} }
}

export default function ShowcaseDashboardPlanner() {
  const qc = useMemo(() => {
    const c = new QueryClient()
    c.setQueryData(['received-bookings'], DEMO_BOOKINGS_PLANNER)
    c.setQueryData(['received-inquiries'], DEMO_INQUIRIES_PLANNER)
    c.setQueryData(['planner-stats'], DEMO_PLANNER_STATS)
    return c
  }, [])

  return (
    <QueryClientProvider client={qc}>
      <ShowcaseShell pageName="Planner Dashboard" demoRole="PLANNER">
        <PlannerDashboard />
      </ShowcaseShell>
    </QueryClientProvider>
  )
}
