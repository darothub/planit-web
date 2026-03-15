import { useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ShowcaseShell from '@/showcase/ShowcaseShell'
import PlannerDashboard from '@/components/dashboard/PlannerDashboard'
import {
  DEMO_PLANNER_PROFILE_PENDING,
} from '@/showcase/data'

export const getServerSideProps = () => {
  if (process.env.NODE_ENV === 'production') return { notFound: true }
  return { props: {} }
}

export default function ShowcaseDashboardOnboarding() {
  const qc = useMemo(() => {
    const c = new QueryClient()
    c.setQueryData(['planner-profile'], DEMO_PLANNER_PROFILE_PENDING)
    c.setQueryData(['my-listings'], [])
    return c
  }, [])

  return (
    <QueryClientProvider client={qc}>
      <ShowcaseShell pageName="Planner Onboarding" demoRole="PLANNER">
        <PlannerDashboard />
      </ShowcaseShell>
    </QueryClientProvider>
  )
}
