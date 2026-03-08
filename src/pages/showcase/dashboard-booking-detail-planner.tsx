import { useMemo } from 'react'
import type { GetServerSideProps } from 'next'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ShowcaseShell from '@/showcase/ShowcaseShell'
import BookingDetailPage from '@/pages/dashboard/bookings/[id]'
import { DEMO_BOOKINGS_PLANNER } from '@/showcase/data'

export const getServerSideProps: GetServerSideProps = ({ query }) => {
  if (process.env.NODE_ENV === 'production') return Promise.resolve({ notFound: true })
  if (!query.id) {
    return Promise.resolve({
      redirect: { destination: '/showcase/dashboard-booking-detail-planner?id=demo-p1', permanent: false },
    })
  }
  return Promise.resolve({ props: {} })
}

export default function ShowcaseBookingDetailPlanner() {
  const qc = useMemo(() => {
    const c = new QueryClient()
    c.setQueryData(['booking', 'demo-p1'], DEMO_BOOKINGS_PLANNER[0])
    return c
  }, [])

  return (
    <QueryClientProvider client={qc}>
      <ShowcaseShell pageName="Booking Detail (Planner)" demoRole="PLANNER">
        <BookingDetailPage />
      </ShowcaseShell>
    </QueryClientProvider>
  )
}
