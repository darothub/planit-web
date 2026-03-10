import { useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ShowcaseShell from '@/showcase/ShowcaseShell'
import AdminPlannersPage from '@/pages/admin/planners'
import { DEMO_PENDING_PLANNERS } from '@/showcase/data'

export const getServerSideProps = () => {
  if (process.env.NODE_ENV === 'production') return { notFound: true }
  return { props: {} }
}

export default function ShowcaseAdminPlanners() {
  const qc = useMemo(() => {
    const c = new QueryClient()
    c.setQueryData(['admin-pending-planners'], DEMO_PENDING_PLANNERS)
    return c
  }, [])

  return (
    <QueryClientProvider client={qc}>
      <ShowcaseShell pageName="Admin — Planner Queue" demoRole="ADMIN">
        <AdminPlannersPage />
      </ShowcaseShell>
    </QueryClientProvider>
  )
}
