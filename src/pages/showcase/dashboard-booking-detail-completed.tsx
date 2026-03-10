import { useMemo } from 'react'
import type { GetServerSideProps } from 'next'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ShowcaseShell from '@/showcase/ShowcaseShell'
import BookingDetailPage from '@/pages/dashboard/bookings/[id]'
import { DEMO_COMPLETED_BOOKING } from '@/showcase/data'

export const getServerSideProps: GetServerSideProps = ({ query }) => {
  if (process.env.NODE_ENV === 'production') return Promise.resolve({ notFound: true })
  if (!query.id) {
    return Promise.resolve({
      redirect: { destination: '/showcase/dashboard-booking-detail-completed?id=demo-c1', permanent: false },
    })
  }
  return Promise.resolve({ props: {} })
}

export default function ShowcaseBookingDetailCompleted() {
  const qc = useMemo(() => {
    const c = new QueryClient()
    c.setQueryData(['booking', 'demo-c1'], DEMO_COMPLETED_BOOKING)
    return c
  }, [])

  return (
    <QueryClientProvider client={qc}>
      <ShowcaseShell pageName="Booking Detail (Completed)" demoRole="CLIENT">
        <BookingDetailPage />
      </ShowcaseShell>
    </QueryClientProvider>
  )
}
