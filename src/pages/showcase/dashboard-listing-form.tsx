import { useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ShowcaseShell from '@/showcase/ShowcaseShell'
import NewListingPage from '@/pages/dashboard/listings/new'
import { EventType } from '@/lib/types'

export const getServerSideProps = () => {
  if (process.env.NODE_ENV === 'production') return { notFound: true }
  return { props: {} }
}

const DEMO_EVENT_TYPES: EventType[] = [
  { id: 1, name: 'WEDDING',     displayName: 'Wedding',     description: 'Wedding ceremonies and receptions', isActive: true },
  { id: 2, name: 'BIRTHDAY',    displayName: 'Birthday',    description: 'Birthday celebrations',             isActive: true },
  { id: 3, name: 'CORPORATE',   displayName: 'Corporate',   description: 'Corporate events and galas',        isActive: true },
  { id: 4, name: 'ANNIVERSARY', displayName: 'Anniversary', description: 'Anniversary celebrations',         isActive: true },
  { id: 5, name: 'GRADUATION',  displayName: 'Graduation',  description: 'Graduation parties',               isActive: true },
  { id: 6, name: 'BABY_SHOWER', displayName: 'Baby Shower', description: 'Baby shower events',               isActive: true },
  { id: 7, name: 'ENGAGEMENT',  displayName: 'Engagement',  description: 'Engagement celebrations',          isActive: true },
]

export default function ShowcaseDashboardListingForm() {
  const qc = useMemo(() => {
    const c = new QueryClient()
    c.setQueryData(['event-types'], DEMO_EVENT_TYPES)
    return c
  }, [])

  return (
    <QueryClientProvider client={qc}>
      <ShowcaseShell pageName="New Listing Form" demoRole="PLANNER">
        <NewListingPage />
      </ShowcaseShell>
    </QueryClientProvider>
  )
}
