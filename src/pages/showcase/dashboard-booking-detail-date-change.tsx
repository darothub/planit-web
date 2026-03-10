import { useMemo } from 'react'
import type { GetServerSideProps } from 'next'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ShowcaseShell from '@/showcase/ShowcaseShell'
import BookingDetailPage from '@/pages/dashboard/bookings/[id]'
import { DEMO_BOOKINGS_PLANNER, DEMO_DATE_CHANGE_REQUESTS } from '@/showcase/data'

export const getServerSideProps: GetServerSideProps = ({ query }) => {
  if (process.env.NODE_ENV === 'production') return Promise.resolve({ notFound: true })
  if (!query.id) {
    return Promise.resolve({
      redirect: { destination: '/showcase/dashboard-booking-detail-date-change?id=demo-p3', permanent: false },
    })
  }
  return Promise.resolve({ props: {} })
}

export default function ShowcaseBookingDetailDateChange() {
  const qc = useMemo(() => {
    const c = new QueryClient()
    // ACCEPTED booking (index 2) — has a pending date change request from client
    c.setQueryData(['booking', 'demo-p3'], DEMO_BOOKINGS_PLANNER[2])
    c.setQueryData(['date-changes', 'demo-p3'], DEMO_DATE_CHANGE_REQUESTS)
    return c
  }, [])

  return (
    <QueryClientProvider client={qc}>
      <ShowcaseShell pageName="Booking Detail (Date Change)" demoRole="PLANNER">
        <BookingDetailPage />
      </ShowcaseShell>
    </QueryClientProvider>
  )
}
