import { useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ShowcaseShell from '@/showcase/ShowcaseShell'
import InquiriesPage from '@/pages/dashboard/inquiries/index'
import { DEMO_INQUIRIES_PLANNER } from '@/showcase/data'

export const getServerSideProps = () => {
  if (process.env.NODE_ENV === 'production') return { notFound: true }
  return { props: {} }
}

export default function ShowcaseDashboardInquiriesPlanner() {
  const qc = useMemo(() => {
    const c = new QueryClient()
    // InquiriesPage uses queryKey ['received-inquiries'] for PLANNER role
    c.setQueryData(['received-inquiries'], DEMO_INQUIRIES_PLANNER)
    return c
  }, [])

  return (
    <QueryClientProvider client={qc}>
      <ShowcaseShell pageName="Planner — Inquiries" demoRole="PLANNER">
        <InquiriesPage />
      </ShowcaseShell>
    </QueryClientProvider>
  )
}
