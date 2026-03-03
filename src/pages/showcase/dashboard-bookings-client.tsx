import { useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ShowcaseShell from '@/showcase/ShowcaseShell'
import BookingsPage from '@/pages/dashboard/bookings/index'
import { DEMO_BOOKINGS_CLIENT } from '@/showcase/data'

export const getServerSideProps = () => {
  if (process.env.NODE_ENV === 'production') return { notFound: true }
  return { props: {} }
}

export default function ShowcaseBookingsClient() {
  const qc = useMemo(() => {
    const c = new QueryClient()
    c.setQueryData(['my-bookings'], DEMO_BOOKINGS_CLIENT)
    return c
  }, [])

  return (
    <QueryClientProvider client={qc}>
      <ShowcaseShell pageName="Client — Bookings" demoRole="CLIENT">
        <BookingsPage />
      </ShowcaseShell>
    </QueryClientProvider>
  )
}
