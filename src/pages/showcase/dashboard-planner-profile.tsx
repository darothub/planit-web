import { useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ShowcaseShell from '@/showcase/ShowcaseShell'
import PlannerProfilePage from '@/pages/dashboard/profile'
import { EventType, PlannerProfileResponse } from '@/lib/types'

export const getServerSideProps = () => {
  if (process.env.NODE_ENV === 'production') return { notFound: true }
  return { props: {} }
}

const DEMO_PROFILE: PlannerProfileResponse = {
  id: 2001,
  userId: 1001,
  email: 'alex@eventsbyrivera.com',
  firstName: 'Alex',
  lastName: 'Rivera',
  phone: '+44 7700 123456',
  businessName: 'Events by Rivera',
  bio: 'With over a decade of experience crafting unforgettable events across London and the South East, Events by Rivera brings creative vision and meticulous attention to detail to every occasion.',
  location: 'London, UK',
  yearsOfExperience: 11,
  profileImageUrl: null,
  priceRange: 'MID_RANGE',
  portfolioDescription: null,
  verificationStatus: 'VERIFIED',
  verificationNotes: null,
  averageResponseTimeMinutes: 45,
  totalInquiries: 87,
  totalBookings: 47,
  rating: 4.9,
  reviewCount: 47,
  isAcceptingInquiries: true,
  specialties: [
    { id: 1, name: 'WEDDING',    displayName: 'Weddings'        },
    { id: 3, name: 'CORPORATE',  displayName: 'Corporate Events' },
  ],
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2026-01-10T12:00:00Z',
}

const DEMO_EVENT_TYPES: EventType[] = [
  { id: 1, name: 'WEDDING',       displayName: 'Weddings',            description: '', isActive: true },
  { id: 2, name: 'BIRTHDAY',      displayName: 'Birthdays',           description: '', isActive: true },
  { id: 3, name: 'CORPORATE',     displayName: 'Corporate Events',    description: '', isActive: true },
  { id: 4, name: 'ANNIVERSARY',   displayName: 'Anniversaries',       description: '', isActive: true },
  { id: 5, name: 'GRADUATION',    displayName: 'Graduations',         description: '', isActive: true },
  { id: 6, name: 'BABY_SHOWER',   displayName: 'Baby Showers',        description: '', isActive: true },
  { id: 7, name: 'GALA',          displayName: 'Galas & Fundraisers', description: '', isActive: true },
]

export default function ShowcasePlannerProfileEdit() {
  const qc = useMemo(() => {
    const c = new QueryClient()
    c.setQueryData(['planner-profile'], DEMO_PROFILE)
    c.setQueryData(['event-types'],    DEMO_EVENT_TYPES)
    return c
  }, [])

  return (
    <QueryClientProvider client={qc}>
      <ShowcaseShell pageName="Profile & Settings (Planner)" demoRole="PLANNER">
        <PlannerProfilePage />
      </ShowcaseShell>
    </QueryClientProvider>
  )
}
