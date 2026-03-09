import { useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ShowcaseShell from '@/showcase/ShowcaseShell'
import DashboardShell from '@/components/dashboard/DashboardShell'
import ListingForm from '@/components/dashboard/ListingForm'
import { DEMO_PLANNER_LISTINGS, DEMO_LISTING_DETAIL } from '@/showcase/data'
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

const demoListing = DEMO_PLANNER_LISTINGS[0]

export default function ShowcaseDashboardListingForm() {
  const qc = useMemo(() => {
    const c = new QueryClient()
    c.setQueryData(['event-types'], DEMO_EVENT_TYPES)
    c.setQueryData(['listing-detail', demoListing.id], DEMO_LISTING_DETAIL)
    return c
  }, [])

  return (
    <QueryClientProvider client={qc}>
      <ShowcaseShell pageName="Listing Form (Edit)" demoRole="PLANNER">
        <DashboardShell title="Edit Listing">
          <ListingForm initial={demoListing} />
        </DashboardShell>
      </ShowcaseShell>
    </QueryClientProvider>
  )
}
