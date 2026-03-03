import { useMemo } from 'react'
import type { GetServerSideProps } from 'next'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ShowcaseShell from '@/showcase/ShowcaseShell'
import BookingDetailPage from '@/pages/dashboard/bookings/[id]'
import { DEMO_BOOKING_DETAIL } from '@/showcase/data'

export const getServerSideProps: GetServerSideProps = ({ query }) => {
  if (process.env.NODE_ENV === 'production') return Promise.resolve({ notFound: true })
  // BookingDetailPage reads router.query.id to form the query key.
  // Redirect to inject a stable demo id so the seeded cache key matches.
  if (!query.id) {
    return Promise.resolve({
      redirect: { destination: '/showcase/dashboard-booking-detail?id=demo-1', permanent: false },
    })
  }
  return Promise.resolve({ props: {} })
}

export default function ShowcaseBookingDetail() {
  const qc = useMemo(() => {
    const c = new QueryClient()
    c.setQueryData(['booking', 'demo-1'], DEMO_BOOKING_DETAIL)
    return c
  }, [])

  return (
    <QueryClientProvider client={qc}>
      <ShowcaseShell pageName="Booking Detail" demoRole="CLIENT">
        <BookingDetailPage />
      </ShowcaseShell>
    </QueryClientProvider>
  )
}
