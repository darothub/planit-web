import { useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ShowcaseShell from '@/showcase/ShowcaseShell'
import BookingsPage from '@/pages/dashboard/bookings/index'
import { DEMO_BOOKINGS_PLANNER } from '@/showcase/data'

export const getServerSideProps = () => {
  if (process.env.NODE_ENV === 'production') return { notFound: true }
  return { props: {} }
}

export default function ShowcaseBookingsPlanner() {
  const qc = useMemo(() => {
    const c = new QueryClient()
    c.setQueryData(['received-bookings'], DEMO_BOOKINGS_PLANNER)
    return c
  }, [])

  return (
    <QueryClientProvider client={qc}>
      <ShowcaseShell pageName="Planner — Received Bookings" demoRole="PLANNER">
        <BookingsPage />
      </ShowcaseShell>
    </QueryClientProvider>
  )
}
