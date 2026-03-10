import { useMemo } from 'react'
import type { GetServerSideProps } from 'next'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ShowcaseShell from '@/showcase/ShowcaseShell'
import BookingDetailPage from '@/pages/dashboard/bookings/[id]'
import { DEMO_DISPUTED_BOOKING, DEMO_DISPUTES } from '@/showcase/data'

export const getServerSideProps: GetServerSideProps = ({ query }) => {
  if (process.env.NODE_ENV === 'production') return Promise.resolve({ notFound: true })
  if (!query.id) {
    return Promise.resolve({
      redirect: { destination: '/showcase/dashboard-booking-detail-disputed?id=demo-d1', permanent: false },
    })
  }
  return Promise.resolve({ props: {} })
}

export default function ShowcaseBookingDetailDisputed() {
  const qc = useMemo(() => {
    const c = new QueryClient()
    c.setQueryData(['booking', 'demo-d1'], DEMO_DISPUTED_BOOKING)
    c.setQueryData(['dispute', 'demo-d1'], DEMO_DISPUTES[0])
    return c
  }, [])

  return (
    <QueryClientProvider client={qc}>
      <ShowcaseShell pageName="Booking Detail (Disputed)" demoRole="CLIENT">
        <BookingDetailPage />
      </ShowcaseShell>
    </QueryClientProvider>
  )
}
