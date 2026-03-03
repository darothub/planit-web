import { useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ShowcaseShell from '@/showcase/ShowcaseShell'
import ClientDashboard from '@/components/dashboard/ClientDashboard'
import {
  DEMO_BOOKINGS_CLIENT,
  DEMO_INQUIRIES_CLIENT,
} from '@/showcase/data'

export const getServerSideProps = () => {
  if (process.env.NODE_ENV === 'production') return { notFound: true }
  return { props: {} }
}

export default function ShowcaseDashboardClient() {
  const qc = useMemo(() => {
    const c = new QueryClient()
    c.setQueryData(['my-bookings'], DEMO_BOOKINGS_CLIENT)
    c.setQueryData(['my-inquiries'], DEMO_INQUIRIES_CLIENT)
    return c
  }, [])

  return (
    <QueryClientProvider client={qc}>
      <ShowcaseShell pageName="Client Dashboard" demoRole="CLIENT">
        <ClientDashboard />
      </ShowcaseShell>
    </QueryClientProvider>
  )
}
