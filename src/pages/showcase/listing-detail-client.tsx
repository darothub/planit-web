import type { GetServerSideProps } from 'next'
import { EventListingDetailResponse } from '@/lib/types'
import { getAllDemoListings } from '@/lib/demoData'
import ShowcaseShell from '@/showcase/ShowcaseShell'
import ListingDetailPage from '@/pages/listings/[id]'

type Props = { listing: EventListingDetailResponse }

export const getServerSideProps: GetServerSideProps<Props> = () => {
  if (process.env.NODE_ENV === 'production') return Promise.resolve({ notFound: true })

  const base = getAllDemoListings()[0]
  const listing: EventListingDetailResponse = {
    ...base,
    description: 'An extraordinary outdoor celebration set in the Surrey Hills. A stunning marquee draped with fairy lights and floral arrangements creates the perfect backdrop for your special day. Our dedicated team handles every detail — from the floral centrepieces to the bespoke menu — so you can be fully present in every moment.',
    amenities: [
      'RED_CARPET', 'LIVE_BAND', 'DJ_SERVICE', 'MC_HOST',
      'PHOTOGRAPHY_PROFESSIONAL', 'VIDEOGRAPHY_CINEMATIC', 'DRONE_FOOTAGE',
      'CATERING_BUFFET', 'OPEN_BAR', 'FLORAL_ARRANGEMENTS', 'VALET_PARKING', 'DEDICATED_COORDINATOR',
    ],
    images: [],
    recentReviews: [
      {
        id: 1,
        targetType: 'LISTING',
        targetId: base.id,
        rating: 5,
        comment: 'Alex and the team made our wedding day absolutely perfect. Every detail was executed flawlessly.',
        createdAt: '2025-12-10T14:00:00Z',
        reviewer: { id: 999, firstName: 'Emma', lastName: 'Taylor', role: 'CLIENT' },
      },
      {
        id: 2,
        targetType: 'LISTING',
        targetId: base.id,
        rating: 5,
        comment: 'Highly professional from start to finish. Our guests are still talking about the evening!',
        createdAt: '2025-11-22T10:30:00Z',
        reviewer: { id: 998, firstName: 'David', lastName: 'Park', role: 'CLIENT' },
      },
    ],
  }

  return Promise.resolve({ props: { listing } })
}

export default function ShowcaseListingDetailClient({ listing }: Props) {
  return (
    <ShowcaseShell pageName="Listing Detail (Client)" demoRole="CLIENT">
      <ListingDetailPage listing={listing} plannerProfile={null} />
    </ShowcaseShell>
  )
}
