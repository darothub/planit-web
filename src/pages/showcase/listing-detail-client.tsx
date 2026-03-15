import type { GetServerSideProps } from 'next'
import { EventListingDetailResponse, PlannerSummaryResponse } from '@/lib/types'
import { getAllDemoListings } from '@/lib/demoData'
import ShowcaseShell from '@/showcase/ShowcaseShell'
import ListingDetailPage from '@/pages/listings/[id]'

type Props = { listing: EventListingDetailResponse; plannerProfile: PlannerSummaryResponse }

const demoPlannerProfile: PlannerSummaryResponse = {
  id: 1,
  businessName: 'Surrey Hills Events',
  firstName: 'Alexandra',
  profileImageUrl: null,
  location: 'Guildford, Surrey',
  bio: 'Award-winning wedding and events specialist with 9 years of experience crafting unforgettable celebrations across the South East.',
  rating: 4.8,
  reviewCount: 48,
  totalBookings: 34,
  isAcceptingInquiries: true,
  specialties: [
    { id: 1, name: 'WEDDING', displayName: 'Wedding' },
    { id: 2, name: 'ANNIVERSARY', displayName: 'Anniversary' },
  ],
}

export const getServerSideProps: GetServerSideProps<Props> = () => {
  if (process.env.NODE_ENV === 'production') return Promise.resolve({ notFound: true })

  const base = getAllDemoListings()[0]
  const listing: EventListingDetailResponse = {
    ...base,
    description: 'An extraordinary outdoor celebration set in the Surrey Hills. A stunning marquee draped with fairy lights and floral arrangements creates the perfect backdrop for your special day.\n\nOur dedicated team handles every detail — from the floral centrepieces to the bespoke menu — so you can be fully present in every moment. We work with only the finest local suppliers to ensure every element reflects your unique vision and style.',
    amenities: [
      'RED_CARPET', 'LIVE_BAND', 'DJ_SERVICE', 'MC_HOST',
      'PHOTOGRAPHY_PROFESSIONAL', 'VIDEOGRAPHY_CINEMATIC', 'DRONE_FOOTAGE',
      'CATERING_BUFFET', 'OPEN_BAR', 'FLORAL_ARRANGEMENTS', 'VALET_PARKING', 'DEDICATED_COORDINATOR',
    ],
    images: [],
    recentReviews: [
      {
        id: 1, targetType: 'LISTING', targetId: base.id, rating: 5,
        comment: 'Alex and the team made our wedding day absolutely perfect. Every detail was executed flawlessly and beyond our expectations.',
        createdAt: '2025-12-10T14:00:00Z',
        reviewer: { id: 101, firstName: 'Emma', lastName: 'Taylor', role: 'CLIENT' },
      },
      {
        id: 2, targetType: 'LISTING', targetId: base.id, rating: 5,
        comment: 'Highly professional from start to finish. Our guests are still talking about the evening!',
        createdAt: '2025-11-22T10:30:00Z',
        reviewer: { id: 102, firstName: 'David', lastName: 'Park', role: 'CLIENT' },
      },
      {
        id: 3, targetType: 'LISTING', targetId: base.id, rating: 4,
        comment: 'Beautiful event, everything ran smoothly. The floral arrangements were stunning.',
        createdAt: '2025-10-08T09:15:00Z',
        reviewer: { id: 103, firstName: 'Sophie', lastName: 'Chen', role: 'CLIENT' },
      },
      {
        id: 4, targetType: 'LISTING', targetId: base.id, rating: 4,
        comment: 'Great experience overall. Would have liked slightly more communication beforehand.',
        createdAt: '2025-09-14T16:45:00Z',
        reviewer: { id: 104, firstName: 'James', lastName: 'Wilson', role: 'CLIENT' },
      },
      {
        id: 5, targetType: 'LISTING', targetId: base.id, rating: 3,
        comment: 'Good event but a couple of small things didn\'t go to plan. The team handled it well.',
        createdAt: '2025-08-30T11:00:00Z',
        reviewer: { id: 105, firstName: 'Priya', lastName: 'Sharma', role: 'CLIENT' },
      },
    ],
  }

  return Promise.resolve({ props: { listing, plannerProfile: demoPlannerProfile } })
}

export default function ShowcaseListingDetailClient({ listing, plannerProfile }: Props) {
  return (
    <ShowcaseShell pageName="Listing Detail (Client)" demoRole="CLIENT">
      <ListingDetailPage listing={listing} plannerProfile={plannerProfile} />
    </ShowcaseShell>
  )
}
