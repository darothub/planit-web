import { useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ShowcaseShell from '@/showcase/ShowcaseShell'
import CalendarPage from '@/pages/dashboard/calendar/index'
import { DEMO_CALENDAR_BLOCKS } from '@/showcase/data'

export const getServerSideProps = () => {
  if (process.env.NODE_ENV === 'production') return { notFound: true }
  return { props: {} }
}

export default function ShowcaseDashboardCalendar() {
  const qc = useMemo(() => {
    const c = new QueryClient()
    c.setQueryData(['calendar-blocks'], DEMO_CALENDAR_BLOCKS)
    return c
  }, [])

  return (
    <QueryClientProvider client={qc}>
      <ShowcaseShell pageName="Planner — Availability Calendar" demoRole="PLANNER">
        <CalendarPage />
      </ShowcaseShell>
    </QueryClientProvider>
  )
}
