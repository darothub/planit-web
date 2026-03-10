import type { GetServerSideProps } from 'next'
import ShowcaseShell from '@/showcase/ShowcaseShell'
import PlannerProfilePage from '@/pages/planners/[id]'
import { getAllDemoListings } from '@/lib/demoData'
import { EventListingResponse, ReviewResponse } from '@/lib/types'

export const getServerSideProps: GetServerSideProps = () => {
  if (process.env.NODE_ENV === 'production') return Promise.resolve({ notFound: true })

  const listings: EventListingResponse[] = getAllDemoListings().slice(0, 4)

  const reviews: ReviewResponse[] = [
    {
      id: 1,
      targetType: 'PLANNER',
      targetId: 2001,
      rating: 5,
      comment: 'Alex and the team made our wedding day absolutely perfect. Every detail was executed flawlessly — from the floral arrangements to the timing of the speeches.',
      createdAt: '2025-12-10T14:00:00Z',
      reviewer: { id: 999, firstName: 'Emma', lastName: 'Taylor', role: 'CLIENT' },
    },
    {
      id: 2,
      targetType: 'PLANNER',
      targetId: 2001,
      rating: 5,
      comment: 'Highly professional from start to finish. Our corporate gala was a huge success and our guests are still talking about the evening.',
      createdAt: '2025-11-22T10:30:00Z',
      reviewer: { id: 998, firstName: 'David', lastName: 'Park', role: 'CLIENT' },
    },
    {
      id: 3,
      targetType: 'PLANNER',
      targetId: 2001,
      rating: 4,
      comment: 'Great communication throughout the planning process. The event ran smoothly and the venue looked stunning.',
      createdAt: '2025-10-05T09:00:00Z',
      reviewer: { id: 997, firstName: 'Priya', lastName: 'Nair', role: 'CLIENT' },
    },
    {
      id: 4,
      targetType: 'PLANNER',
      targetId: 2001,
      rating: 5,
      comment: 'Would absolutely book again. Our birthday celebration exceeded every expectation.',
      createdAt: '2025-09-14T16:45:00Z',
      reviewer: { id: 996, firstName: 'Marcus', lastName: 'Evans', role: 'CLIENT' },
    },
  ]

  return Promise.resolve({
    props: {
      planner: {
        id: 2001,
        businessName: 'Events by Rivera',
        profileImageUrl: null,
        location: 'London, UK',
        averageRating: 4.9,
        reviewCount: 47,
        bio: 'With over a decade of experience crafting unforgettable events across London and the South East, Events by Rivera brings creative vision and meticulous attention to detail to every occasion. From intimate celebrations to large-scale corporate galas, we handle every element — venue sourcing, styling, catering coordination, and on-the-day management — so you can be fully present and enjoy the moment.',
        yearsOfExperience: 11,
        specialties: ['Weddings', 'Corporate Events', 'Birthday Celebrations', 'Galas & Fundraisers'],
        isAcceptingInquiries: true,
      },
      listings,
      reviews,
    },
  })
}

export default function ShowcasePlannerProfile(props: Parameters<typeof PlannerProfilePage>[0]) {
  return (
    <ShowcaseShell pageName="Planner Profile" demoRole="CLIENT">
      <PlannerProfilePage {...props} />
    </ShowcaseShell>
  )
}
