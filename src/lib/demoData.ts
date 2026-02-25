/**
 * Demo listings used to populate the homepage while the backend has no data.
 * All images are from Unsplash (free, no attribution required for display).
 * Once real listings exist the CategoryRows component automatically prefers API data.
 */

import { EventListingResponse } from './types'

type DemoCategory = {
  /** Matches EventType.name from the API */
  eventTypeName: string
  displayName: string
  listings: EventListingResponse[]
}

// Auto-decrement negative IDs so they never clash with real DB IDs
let _id = -1
const nextId = () => _id--

const u = (photoId: string) =>
  `https://images.unsplash.com/photo-${photoId}?w=600&h=400&fit=crop&auto=format&q=80`

// Required fields are destructured out; the rest are spread after defaults so they win.
function demo({
  eventTypeName,
  eventTypeDisplayName,
  eventTypeId,
  title,
  location,
  basePrice,
  coverImageUrl,
  ...rest
}: Partial<EventListingResponse> &
  Pick<EventListingResponse, 'title' | 'location' | 'basePrice' | 'coverImageUrl'> & {
    eventTypeName: string
    eventTypeDisplayName: string
    eventTypeId: number
  }): EventListingResponse {
  return {
    id: nextId(),
    title,
    description: '',
    location,
    basePrice,
    cancellationPolicy: 'MODERATE',
    minGuests: 20,
    maxGuests: 200,
    coverImageUrl,
    latitude: null,
    longitude: null,
    isPublished: true,
    isFeatured: false,
    averageRating: null,
    reviewCount: 0,
    eventType: { id: eventTypeId, name: eventTypeName, displayName: eventTypeDisplayName },
    planner: { id: 1, businessName: 'Planit Demo', profileImageUrl: null },
    createdAt: '2025-01-01T00:00:00Z',
    ...rest,
  }
}

export const demoCategories: DemoCategory[] = [
  // ── Weddings ──────────────────────────────────────────────────────────────
  {
    eventTypeName: 'WEDDING',
    displayName: 'Wedding',
    listings: [
      demo({
        title: 'Intimate Garden Ceremony',
        location: 'London',
        basePrice: 3500,
        averageRating: 4.9,
        reviewCount: 28,
        coverImageUrl: u('1519741347347-c3dc0ff1b1b4'),
        eventTypeName: 'WEDDING', eventTypeDisplayName: 'Wedding', eventTypeId: 1,
      }),
      demo({
        title: 'Luxury Marquee Wedding',
        location: 'Surrey',
        basePrice: 8500,
        averageRating: 5.0,
        reviewCount: 14,
        isFeatured: true,
        coverImageUrl: u('1465495976277-4387d4b0b4c6'),
        eventTypeName: 'WEDDING', eventTypeDisplayName: 'Wedding', eventTypeId: 1,
      }),
      demo({
        title: 'Romantic Vineyard Affair',
        location: 'Kent',
        basePrice: 5200,
        averageRating: 4.8,
        reviewCount: 19,
        coverImageUrl: u('1511795409834-ef04bbd61622'),
        eventTypeName: 'WEDDING', eventTypeDisplayName: 'Wedding', eventTypeId: 1,
      }),
      demo({
        title: 'Rustic Barn Celebration',
        location: 'Cotswolds',
        basePrice: 4800,
        averageRating: 4.7,
        reviewCount: 33,
        coverImageUrl: u('1519225421980-453cb4d3d18f'),
        eventTypeName: 'WEDDING', eventTypeDisplayName: 'Wedding', eventTypeId: 1,
      }),
      demo({
        title: 'City Rooftop Ceremony',
        location: 'Manchester',
        basePrice: 6000,
        averageRating: 4.6,
        reviewCount: 11,
        coverImageUrl: u('1606800052052-a08af7148866'),
        eventTypeName: 'WEDDING', eventTypeDisplayName: 'Wedding', eventTypeId: 1,
      }),
      demo({
        title: 'Seaside Sunset Vows',
        location: 'Cornwall',
        basePrice: 4200,
        averageRating: 4.9,
        reviewCount: 22,
        coverImageUrl: u('1587271339318-2e78a4ca2fd9'),
        eventTypeName: 'WEDDING', eventTypeDisplayName: 'Wedding', eventTypeId: 1,
      }),
    ],
  },

  // ── Birthdays ─────────────────────────────────────────────────────────────
  {
    eventTypeName: 'BIRTHDAY',
    displayName: 'Birthday',
    listings: [
      demo({
        title: 'Luxury Rooftop Birthday Bash',
        location: 'London',
        basePrice: 1800,
        averageRating: 4.8,
        reviewCount: 16,
        coverImageUrl: u('1530103862676-de4d9de8fa72'),
        eventTypeName: 'BIRTHDAY', eventTypeDisplayName: 'Birthday', eventTypeId: 2,
      }),
      demo({
        title: 'Garden Fiesta & Live Band',
        location: 'Birmingham',
        basePrice: 1200,
        averageRating: 4.6,
        reviewCount: 9,
        coverImageUrl: u('1527529482837-4698179dc6ce'),
        eventTypeName: 'BIRTHDAY', eventTypeDisplayName: 'Birthday', eventTypeId: 2,
      }),
      demo({
        title: 'Elegant 40th Dinner Party',
        location: 'Edinburgh',
        basePrice: 2200,
        averageRating: 4.9,
        reviewCount: 24,
        coverImageUrl: u('1464349095674-5274b382c6a5'),
        eventTypeName: 'BIRTHDAY', eventTypeDisplayName: 'Birthday', eventTypeId: 2,
      }),
      demo({
        title: 'Surprise Balloon Spectacular',
        location: 'Bristol',
        basePrice: 950,
        averageRating: 4.5,
        reviewCount: 7,
        coverImageUrl: u('1531058020387-3be344556be6'),
        eventTypeName: 'BIRTHDAY', eventTypeDisplayName: 'Birthday', eventTypeId: 2,
      }),
      demo({
        title: 'VIP Club Takeover Night',
        location: 'London',
        basePrice: 3500,
        averageRating: 4.7,
        reviewCount: 18,
        isFeatured: true,
        coverImageUrl: u('1558618666-fcd25c85cd64'),
        eventTypeName: 'BIRTHDAY', eventTypeDisplayName: 'Birthday', eventTypeId: 2,
      }),
      demo({
        title: 'Tropical Themed Pool Party',
        location: 'Leeds',
        basePrice: 1400,
        averageRating: 4.8,
        reviewCount: 12,
        coverImageUrl: u('1556125574-d7f27ec36a06'),
        eventTypeName: 'BIRTHDAY', eventTypeDisplayName: 'Birthday', eventTypeId: 2,
      }),
    ],
  },

  // ── Corporate ─────────────────────────────────────────────────────────────
  {
    eventTypeName: 'CORPORATE',
    displayName: 'Corporate',
    listings: [
      demo({
        title: 'Annual Company Gala Night',
        location: 'London',
        basePrice: 12000,
        averageRating: 4.8,
        reviewCount: 8,
        isFeatured: true,
        coverImageUrl: u('1511578314322-372d23d4d6ea'),
        eventTypeName: 'CORPORATE', eventTypeDisplayName: 'Corporate', eventTypeId: 3,
      }),
      demo({
        title: 'Product Launch Experience',
        location: 'London',
        basePrice: 8500,
        averageRating: 4.9,
        reviewCount: 6,
        coverImageUrl: u('1515187029135-18ee286d815b'),
        eventTypeName: 'CORPORATE', eventTypeDisplayName: 'Corporate', eventTypeId: 3,
      }),
      demo({
        title: 'Team Building Retreat',
        location: 'Lake District',
        basePrice: 5500,
        averageRating: 4.7,
        reviewCount: 11,
        coverImageUrl: u('1505373877841-8d25f7d46678'),
        eventTypeName: 'CORPORATE', eventTypeDisplayName: 'Corporate', eventTypeId: 3,
      }),
      demo({
        title: 'Awards Ceremony Night',
        location: 'Birmingham',
        basePrice: 9800,
        averageRating: 4.6,
        reviewCount: 5,
        coverImageUrl: u('1521737604082-09b0de17c01a'),
        eventTypeName: 'CORPORATE', eventTypeDisplayName: 'Corporate', eventTypeId: 3,
      }),
      demo({
        title: 'Autumn Client Dinner',
        location: 'Manchester',
        basePrice: 6200,
        averageRating: 4.8,
        reviewCount: 14,
        coverImageUrl: u('1475721027785-f74eccf877e2'),
        eventTypeName: 'CORPORATE', eventTypeDisplayName: 'Corporate', eventTypeId: 3,
      }),
    ],
  },

  // ── Anniversary ───────────────────────────────────────────────────────────
  {
    eventTypeName: 'ANNIVERSARY',
    displayName: 'Anniversary',
    listings: [
      demo({
        title: 'Silver Anniversary Dinner',
        location: 'London',
        basePrice: 2800,
        averageRating: 5.0,
        reviewCount: 9,
        coverImageUrl: u('1474552226712-ac0f0961a954'),
        eventTypeName: 'ANNIVERSARY', eventTypeDisplayName: 'Anniversary', eventTypeId: 4,
      }),
      demo({
        title: 'Romantic Candlelit Evening',
        location: 'Bath',
        basePrice: 1800,
        averageRating: 4.9,
        reviewCount: 17,
        coverImageUrl: u('1507003211169-0a1dd7228f2d'),
        eventTypeName: 'ANNIVERSARY', eventTypeDisplayName: 'Anniversary', eventTypeId: 4,
      }),
      demo({
        title: 'Private Wine Tasting Gala',
        location: 'Bordeaux',
        basePrice: 3200,
        averageRating: 4.8,
        reviewCount: 6,
        coverImageUrl: u('1602173574767-37ac01994b2a'),
        eventTypeName: 'ANNIVERSARY', eventTypeDisplayName: 'Anniversary', eventTypeId: 4,
      }),
      demo({
        title: 'Golden Jubilee Celebration',
        location: 'Surrey',
        basePrice: 4500,
        averageRating: 4.7,
        reviewCount: 13,
        isFeatured: true,
        coverImageUrl: u('1578345420975-b42d6dcbf4e4'),
        eventTypeName: 'ANNIVERSARY', eventTypeDisplayName: 'Anniversary', eventTypeId: 4,
      }),
    ],
  },

  // ── Graduation ────────────────────────────────────────────────────────────
  {
    eventTypeName: 'GRADUATION',
    displayName: 'Graduation',
    listings: [
      demo({
        title: 'Cap & Gown Garden Party',
        location: 'Oxford',
        basePrice: 1400,
        averageRating: 4.7,
        reviewCount: 21,
        coverImageUrl: u('1523050854058-8df90110c9f1'),
        eventTypeName: 'GRADUATION', eventTypeDisplayName: 'Graduation', eventTypeId: 5,
      }),
      demo({
        title: 'Class of 2025 Celebration',
        location: 'Cambridge',
        basePrice: 1800,
        averageRating: 4.8,
        reviewCount: 15,
        coverImageUrl: u('1541339907198-e08756dedf3f'),
        eventTypeName: 'GRADUATION', eventTypeDisplayName: 'Graduation', eventTypeId: 5,
      }),
      demo({
        title: 'Rooftop Grad Bash',
        location: 'London',
        basePrice: 2200,
        averageRating: 4.9,
        reviewCount: 8,
        isFeatured: true,
        coverImageUrl: u('1627556704302-624286467c65'),
        eventTypeName: 'GRADUATION', eventTypeDisplayName: 'Graduation', eventTypeId: 5,
      }),
      demo({
        title: 'Family Brunch Celebration',
        location: 'Bristol',
        basePrice: 980,
        averageRating: 4.6,
        reviewCount: 4,
        coverImageUrl: u('1606761568499-6d2451b23c66'),
        eventTypeName: 'GRADUATION', eventTypeDisplayName: 'Graduation', eventTypeId: 5,
      }),
    ],
  },

  // ── Baby Shower ───────────────────────────────────────────────────────────
  {
    eventTypeName: 'BABY_SHOWER',
    displayName: 'Baby Shower',
    listings: [
      demo({
        title: 'Pastel Afternoon Tea Shower',
        location: 'London',
        basePrice: 1200,
        averageRating: 4.9,
        reviewCount: 31,
        coverImageUrl: u('1555252333-9f8e92e65df9'),
        eventTypeName: 'BABY_SHOWER', eventTypeDisplayName: 'Baby Shower', eventTypeId: 6,
      }),
      demo({
        title: 'Garden Baby Shower Party',
        location: 'Surrey',
        basePrice: 900,
        averageRating: 4.8,
        reviewCount: 18,
        coverImageUrl: u('1578922745274-2ef0e86aac82'),
        eventTypeName: 'BABY_SHOWER', eventTypeDisplayName: 'Baby Shower', eventTypeId: 6,
      }),
      demo({
        title: 'Luxury Hotel Suite Shower',
        location: 'London',
        basePrice: 2200,
        averageRating: 4.7,
        reviewCount: 9,
        isFeatured: true,
        coverImageUrl: u('1567486937284-6e2a5e7f40d0'),
        eventTypeName: 'BABY_SHOWER', eventTypeDisplayName: 'Baby Shower', eventTypeId: 6,
      }),
      demo({
        title: 'Woodland Enchanted Shower',
        location: 'Cotswolds',
        basePrice: 1450,
        averageRating: 5.0,
        reviewCount: 7,
        coverImageUrl: u('1519741347347-c3dc0ff1b1b4'),
        eventTypeName: 'BABY_SHOWER', eventTypeDisplayName: 'Baby Shower', eventTypeId: 6,
      }),
    ],
  },

  // ── Engagement ────────────────────────────────────────────────────────────
  {
    eventTypeName: 'ENGAGEMENT',
    displayName: 'Engagement',
    listings: [
      demo({
        title: 'Surprise Rooftop Proposal Dinner',
        location: 'London',
        basePrice: 2500,
        averageRating: 5.0,
        reviewCount: 13,
        isFeatured: true,
        coverImageUrl: u('1474552226712-ac0f0961a954'),
        eventTypeName: 'ENGAGEMENT', eventTypeDisplayName: 'Engagement', eventTypeId: 7,
      }),
      demo({
        title: 'Intimate Garden Engagement',
        location: 'Bath',
        basePrice: 1800,
        averageRating: 4.9,
        reviewCount: 22,
        coverImageUrl: u('1519225421980-453cb4d3d18f'),
        eventTypeName: 'ENGAGEMENT', eventTypeDisplayName: 'Engagement', eventTypeId: 7,
      }),
      demo({
        title: 'Private Yacht Celebration',
        location: 'Brighton',
        basePrice: 4800,
        averageRating: 4.8,
        reviewCount: 6,
        coverImageUrl: u('1507003211169-0a1dd7228f2d'),
        eventTypeName: 'ENGAGEMENT', eventTypeDisplayName: 'Engagement', eventTypeId: 7,
      }),
    ],
  },
]

/** Look up demo listings for a given event type name, or return [] if not found. */
export function getDemoListings(eventTypeName: string): EventListingResponse[] {
  return demoCategories.find(d => d.eventTypeName === eventTypeName)?.listings ?? []
}

/** All demo listings across every category — used as fallback on the discovery page. */
export function getAllDemoListings(): EventListingResponse[] {
  return demoCategories.flatMap(d => d.listings)
}