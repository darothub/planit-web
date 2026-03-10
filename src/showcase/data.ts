/**
 * Showcase mock fixtures — used exclusively by /showcase pages.
 * Never imported by production code.
 */

import {
  AuthResponse,
  BookingResponse,
  InquiryResponse,
  InquiryMessageResponse,
  PlannerStatsResponse,
  EventListingResponse,
  EventListingDetailResponse,
  CalendarBlockResponse,
  DateChangeRequestResponse,
  DisputeResponse,
  PendingPlannerResponse,
} from '@/lib/types'
import { getAllDemoListings } from '@/lib/demoData'

// ─── Users ────────────────────────────────────────────────────────────────────

export const DEMO_CLIENT_USER: AuthResponse = {
  token: 'showcase-demo-client',
  type: 'Bearer',
  userId: 1001,
  email: 'sarah.chen@example.com',
  firstName: 'Sarah',
  lastName: 'Chen',
  role: 'CLIENT',
  emailVerified: true,
}

export const DEMO_ADMIN_USER: AuthResponse = {
  token: 'showcase-demo-admin',
  type: 'Bearer',
  userId: 9001,
  email: 'admin@planit.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'ADMIN',
  emailVerified: true,
}

export const DEMO_PLANNER_USER: AuthResponse = {
  token: 'showcase-demo-planner',
  type: 'Bearer',
  userId: 2001,
  email: 'alex.rivera@eventsbyriv.com',
  firstName: 'Alex',
  lastName: 'Rivera',
  role: 'PLANNER',
  emailVerified: true,
}

// ─── Bookings ────────────────────────────────────────────────────────────────

export const DEMO_BOOKINGS_CLIENT: BookingResponse[] = [
  {
    id: 101,
    inquiryId: 201,
    status: 'ACCEPTED',
    agreedPrice: 8500,
    currency: 'GBP',
    eventDate: '2026-06-14',
    eventLocation: 'Surrey Hills Estate',
    guestCount: 120,
    clientNote: 'Please ensure the marquee is set up by midday.',
    reschedulingCount: 0,
    clientConfirmedAt: '2026-01-15T10:00:00Z',
    plannerConfirmedAt: '2026-01-15T11:00:00Z',
    fundsReleasedAt: null,
    createdAt: '2026-01-10T09:00:00Z',
    updatedAt: '2026-01-15T11:00:00Z',
    client: { id: 1001, firstName: 'Sarah', lastName: 'Chen' },
    planner: { id: 2001, businessName: 'Events by Rivera' },
    listing: { id: 1, title: 'Luxury Marquee Wedding' },
    payments: [
      {
        id: 1,
        instalmentNumber: 1,
        amount: 2550,
        currency: 'GBP',
        dueDate: '2026-01-20',
        paidAt: '2026-01-18T14:22:00Z',
        status: 'CAPTURED',
        isNonRefundable: true,
      },
      {
        id: 2,
        instalmentNumber: 2,
        amount: 5950,
        currency: 'GBP',
        dueDate: '2026-05-14',
        paidAt: null,
        status: 'SCHEDULED',
        isNonRefundable: false,
      },
    ],
  },
  {
    id: 102,
    inquiryId: 202,
    status: 'REQUESTED',
    agreedPrice: 1800,
    currency: 'GBP',
    eventDate: '2026-08-22',
    eventLocation: 'Shoreditch Rooftop, London',
    guestCount: 60,
    clientNote: null,
    reschedulingCount: 0,
    clientConfirmedAt: null,
    plannerConfirmedAt: null,
    fundsReleasedAt: null,
    createdAt: '2026-02-20T14:00:00Z',
    updatedAt: '2026-02-20T14:00:00Z',
    client: { id: 1001, firstName: 'Sarah', lastName: 'Chen' },
    planner: { id: 2002, businessName: 'TopDeck Events' },
    listing: { id: 2, title: 'Luxury Rooftop Birthday Bash' },
    payments: [],
  },
  {
    id: 103,
    inquiryId: 203,
    status: 'COMPLETED',
    agreedPrice: 2800,
    currency: 'GBP',
    eventDate: '2025-11-08',
    eventLocation: 'The Ivy Chelsea Garden',
    guestCount: 30,
    clientNote: null,
    reschedulingCount: 0,
    clientConfirmedAt: '2025-10-01T12:00:00Z',
    plannerConfirmedAt: '2025-10-01T13:00:00Z',
    fundsReleasedAt: '2025-11-10T00:00:00Z',
    createdAt: '2025-09-15T10:00:00Z',
    updatedAt: '2025-11-10T00:00:00Z',
    client: { id: 1001, firstName: 'Sarah', lastName: 'Chen' },
    planner: { id: 2003, businessName: 'Bloom & Co.' },
    listing: { id: 3, title: 'Silver Anniversary Dinner' },
    payments: [
      {
        id: 5,
        instalmentNumber: 1,
        amount: 2800,
        currency: 'GBP',
        dueDate: '2025-10-05',
        paidAt: '2025-10-04T10:00:00Z',
        status: 'CAPTURED',
        isNonRefundable: true,
      },
    ],
  },
]

export const DEMO_BOOKINGS_PLANNER: BookingResponse[] = [
  {
    id: 201,
    inquiryId: 301,
    status: 'REQUESTED',
    agreedPrice: 9800,
    currency: 'GBP',
    eventDate: '2026-09-05',
    eventLocation: 'NEC Birmingham',
    guestCount: 350,
    clientNote: 'We need full AV setup including LED walls.',
    reschedulingCount: 0,
    clientConfirmedAt: null,
    plannerConfirmedAt: null,
    fundsReleasedAt: null,
    createdAt: '2026-02-22T11:00:00Z',
    updatedAt: '2026-02-22T11:00:00Z',
    client: { id: 1101, firstName: 'James', lastName: 'Whitfield' },
    planner: { id: 2001, businessName: 'Events by Rivera' },
    listing: { id: 4, title: 'Awards Ceremony Night' },
    payments: [],
  },
  {
    id: 202,
    inquiryId: 302,
    status: 'REQUESTED',
    agreedPrice: 5500,
    currency: 'GBP',
    eventDate: '2026-07-19',
    eventLocation: 'Grasmere, Lake District',
    guestCount: 80,
    clientNote: null,
    reschedulingCount: 0,
    clientConfirmedAt: null,
    plannerConfirmedAt: null,
    fundsReleasedAt: null,
    createdAt: '2026-02-18T09:30:00Z',
    updatedAt: '2026-02-18T09:30:00Z',
    client: { id: 1102, firstName: 'Priya', lastName: 'Nair' },
    planner: { id: 2001, businessName: 'Events by Rivera' },
    listing: { id: 5, title: 'Team Building Retreat' },
    payments: [],
  },
  {
    id: 203,
    inquiryId: 303,
    status: 'ACCEPTED',
    agreedPrice: 12000,
    currency: 'GBP',
    eventDate: '2026-05-30',
    eventLocation: 'The Shard, London',
    guestCount: 200,
    clientNote: 'Black tie. Live orchestra required.',
    reschedulingCount: 1,
    clientConfirmedAt: '2026-01-20T12:00:00Z',
    plannerConfirmedAt: '2026-01-20T13:30:00Z',
    fundsReleasedAt: null,
    createdAt: '2026-01-05T08:00:00Z',
    updatedAt: '2026-01-20T13:30:00Z',
    client: { id: 1103, firstName: 'Marcus', lastName: 'Evans' },
    planner: { id: 2001, businessName: 'Events by Rivera' },
    listing: { id: 6, title: 'Annual Company Gala Night' },
    payments: [
      {
        id: 10,
        instalmentNumber: 1,
        amount: 3600,
        currency: 'GBP',
        dueDate: '2026-01-25',
        paidAt: '2026-01-24T09:15:00Z',
        status: 'CAPTURED',
        isNonRefundable: true,
      },
    ],
  },
]

export const DEMO_BOOKING_DETAIL: BookingResponse = {
  ...DEMO_BOOKINGS_CLIENT[0],
  // Override so the showcase shows both Cancel and Confirm Completion buttons
  clientConfirmedAt: null,
  plannerConfirmedAt: null,
}

export const DEMO_COMPLETED_BOOKING: BookingResponse = DEMO_BOOKINGS_CLIENT[2]

export const DEMO_DISPUTED_BOOKING: BookingResponse = {
  ...DEMO_BOOKINGS_CLIENT[0],
  status: 'DISPUTED',
  eventDate: '2026-01-15',       // past date — dispute is already open
  clientConfirmedAt: null,
  plannerConfirmedAt: null,
}

// ─── Inquiries ────────────────────────────────────────────────────────────────

export const DEMO_INQUIRIES_CLIENT: InquiryResponse[] = [
  {
    id: -1,
    status: 'ACTIVE',
    eventDate: '2026-06-14',
    eventLocation: 'Surrey Hills Estate',
    guestCount: 120,
    budgetRange: 'LUXURY',
    listing: { id: 1, title: 'Luxury Marquee Wedding', coverImageUrl: null },
    client: { id: 1001, firstName: 'Sarah', lastName: 'Chen' },
    planner: { id: 2001, businessName: 'Events by Rivera' },
    lastMessage: 'I\'ll have the full menu proposal over to you by Friday.',
    createdAt: '2026-01-10T09:00:00Z',
  },
  {
    id: -2,
    status: 'PENDING',
    eventDate: '2026-08-22',
    eventLocation: 'Shoreditch, London',
    guestCount: 60,
    budgetRange: 'MID_RANGE',
    listing: { id: 2, title: 'Luxury Rooftop Birthday Bash', coverImageUrl: null },
    client: { id: 1001, firstName: 'Sarah', lastName: 'Chen' },
    planner: { id: 2002, businessName: 'TopDeck Events' },
    lastMessage: null,
    createdAt: '2026-02-20T14:00:00Z',
  },
  {
    id: -3,
    status: 'ACTIVE',
    eventDate: '2026-04-05',
    eventLocation: 'Bath, Somerset',
    guestCount: 40,
    budgetRange: 'MID_RANGE',
    listing: { id: 7, title: 'Intimate Garden Engagement', coverImageUrl: null },
    client: { id: 1001, firstName: 'Sarah', lastName: 'Chen' },
    planner: { id: 2003, businessName: 'Bloom & Co.' },
    lastMessage: 'Can you confirm the flower colour scheme?',
    createdAt: '2026-02-12T16:30:00Z',
  },
  {
    id: -4,
    status: 'CLOSED',
    eventDate: '2025-11-08',
    eventLocation: 'Chelsea, London',
    guestCount: 30,
    budgetRange: 'LUXURY',
    listing: { id: 3, title: 'Silver Anniversary Dinner', coverImageUrl: null },
    client: { id: 1001, firstName: 'Sarah', lastName: 'Chen' },
    planner: { id: 2003, businessName: 'Bloom & Co.' },
    lastMessage: 'Thank you, the evening was perfect!',
    createdAt: '2025-09-15T10:00:00Z',
  },
]

export const DEMO_INQUIRIES_PLANNER: InquiryResponse[] = [
  {
    id: -11,
    status: 'ACTIVE',
    eventDate: '2026-05-30',
    eventLocation: 'The Shard, London',
    guestCount: 200,
    budgetRange: 'LUXURY',
    listing: { id: 6, title: 'Annual Company Gala Night', coverImageUrl: null },
    client: { id: 1103, firstName: 'Marcus', lastName: 'Evans' },
    planner: { id: 2001, businessName: 'Events by Rivera' },
    lastMessage: 'Catering confirmed for 200 covers. Live orchestra briefed.',
    createdAt: '2026-01-05T08:00:00Z',
  },
  {
    id: -12,
    status: 'PENDING',
    eventDate: '2026-09-05',
    eventLocation: 'NEC Birmingham',
    guestCount: 350,
    budgetRange: 'LUXURY',
    listing: { id: 4, title: 'Awards Ceremony Night', coverImageUrl: null },
    client: { id: 1101, firstName: 'James', lastName: 'Whitfield' },
    planner: { id: 2001, businessName: 'Events by Rivera' },
    lastMessage: 'We need full AV setup including LED walls.',
    createdAt: '2026-02-22T11:00:00Z',
  },
  {
    id: -13,
    status: 'ACTIVE',
    eventDate: '2026-07-19',
    eventLocation: 'Lake District',
    guestCount: 80,
    budgetRange: 'MID_RANGE',
    listing: { id: 5, title: 'Team Building Retreat', coverImageUrl: null },
    client: { id: 1102, firstName: 'Priya', lastName: 'Nair' },
    planner: { id: 2001, businessName: 'Events by Rivera' },
    lastMessage: 'Looking forward to working with you!',
    createdAt: '2026-02-18T09:30:00Z',
  },
  {
    id: -14,
    status: 'CLOSED',
    eventDate: '2025-10-12',
    eventLocation: 'Mayfair, London',
    guestCount: 150,
    budgetRange: 'LUXURY',
    listing: { id: 6, title: 'Annual Company Gala Night', coverImageUrl: null },
    client: { id: 1104, firstName: 'Sophie', lastName: 'Laurent' },
    planner: { id: 2001, businessName: 'Events by Rivera' },
    lastMessage: 'Everything was exceptional. 5 stars!',
    createdAt: '2025-08-10T09:00:00Z',
  },
]

// ─── Planner Stats ────────────────────────────────────────────────────────────

export const DEMO_PLANNER_STATS: PlannerStatsResponse = {
  totalInquiries: 34,
  totalBookings: 12,
  conversionRate: 35.3,
  averageResponseTimeMinutes: 47,
  averageResponseTimeDisplay: '47 min',
  rating: 4.8,
  reviewCount: 9,
  activeConversations: 3,
  pendingResponses: 2,
}

// ─── Planner Listings ─────────────────────────────────────────────────────────

const allDemo = getAllDemoListings()

export const DEMO_PLANNER_LISTINGS: EventListingResponse[] = [
  {
    ...allDemo[0],
    id: -101,
    isPublished: true,
    isFeatured: false,
    averageRating: 4.9,
    reviewCount: 28,
    planner: { id: 2001, businessName: 'Events by Rivera', profileImageUrl: null },
  },
  {
    ...allDemo[1],
    id: -102,
    isPublished: true,
    isFeatured: true,
    averageRating: 5.0,
    reviewCount: 14,
    planner: { id: 2001, businessName: 'Events by Rivera', profileImageUrl: null },
  },
  {
    ...allDemo[6],
    id: -103,
    isPublished: false,
    isFeatured: false,
    averageRating: null,
    reviewCount: 0,
    planner: { id: 2001, businessName: 'Events by Rivera', profileImageUrl: null },
  },
  {
    ...allDemo[12],
    id: -104,
    isPublished: false,
    isFeatured: false,
    averageRating: null,
    reviewCount: 0,
    planner: { id: 2001, businessName: 'Events by Rivera', profileImageUrl: null },
  },
]

// ─── Listing Detail (with gallery) ────────────────────────────────────────────

export const DEMO_LISTING_DETAIL: EventListingDetailResponse = {
  ...DEMO_PLANNER_LISTINGS[0],
  images: [
    {
      id: 101,
      imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&h=400&fit=crop&q=80',
      caption: null,
      displayOrder: 1,
    },
    {
      id: 102,
      imageUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&h=400&fit=crop&q=80',
      caption: null,
      displayOrder: 2,
    },
    {
      id: 103,
      imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&h=400&fit=crop&q=80',
      caption: null,
      displayOrder: 3,
    },
  ],
  recentReviews: [],
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export const DEMO_MESSAGES: InquiryMessageResponse[] = [
  {
    id: 1,
    content: 'Hi! I came across your Luxury Marquee Wedding package and I\'m very interested. We\'re planning for June 14th — is that date available?',
    sentAt: '2026-01-10T09:00:00Z',
    senderId: 1001,
    senderName: 'Sarah Chen',
    senderRole: 'CLIENT',
  },
  {
    id: 2,
    content: 'Hello Sarah! Great to hear from you. June 14th is currently available. We\'d love to work with you. How many guests are you expecting?',
    sentAt: '2026-01-10T09:35:00Z',
    senderId: 2001,
    senderName: 'Alex Rivera',
    senderRole: 'PLANNER',
  },
  {
    id: 3,
    content: 'Wonderful! We\'re looking at around 100–130 guests. Formal ceremony with a seated dinner reception.',
    sentAt: '2026-01-10T10:12:00Z',
    senderId: 1001,
    senderName: 'Sarah Chen',
    senderRole: 'CLIENT',
  },
  {
    id: 4,
    content: 'Perfect — our marquee comfortably seats up to 150. I\'ll send you a full proposal including catering options and the breakdown for your guest count.',
    sentAt: '2026-01-10T10:44:00Z',
    senderId: 2001,
    senderName: 'Alex Rivera',
    senderRole: 'PLANNER',
  },
  {
    id: 5,
    content: 'Thank you! Could you also let me know whether drone footage is included in the base package, or is that an add-on?',
    sentAt: '2026-01-11T08:20:00Z',
    senderId: 1001,
    senderName: 'Sarah Chen',
    senderRole: 'CLIENT',
  },
  {
    id: 6,
    content: 'Drone footage is an add-on at £400. However, if you book before the end of the month, I can include it complimentary as we have availability.',
    sentAt: '2026-01-11T09:05:00Z',
    senderId: 2001,
    senderName: 'Alex Rivera',
    senderRole: 'PLANNER',
  },
  {
    id: 7,
    content: 'That sounds amazing! We\'d love that. Can we schedule a call to go over the final details?',
    sentAt: '2026-01-11T11:30:00Z',
    senderId: 1001,
    senderName: 'Sarah Chen',
    senderRole: 'CLIENT',
  },
  {
    id: 8,
    content: 'Absolutely! I\'ll have the full menu proposal over to you by Friday. Let\'s schedule a call for next Monday at 10am — does that work?',
    sentAt: '2026-01-11T12:15:00Z',
    senderId: 2001,
    senderName: 'Alex Rivera',
    senderRole: 'PLANNER',
  },
]

// ─── Calendar Blocks ──────────────────────────────────────────────────────────

export const DEMO_CALENDAR_BLOCKS: CalendarBlockResponse[] = [
  {
    id: 1,
    startDate: '2026-03-10',
    endDate: '2026-03-14',
    reason: 'Family holiday',
    scope: 'ALL',
    affectedListingIds: [],
    createdAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 2,
    startDate: '2026-04-18',
    endDate: '2026-04-20',
    reason: null,
    scope: 'ALL',
    affectedListingIds: [],
    createdAt: '2026-02-05T14:00:00Z',
  },
  {
    id: 3,
    startDate: '2026-05-01',
    endDate: '2026-05-04',
    reason: 'Bank holiday break',
    scope: 'ALL',
    affectedListingIds: [],
    createdAt: '2026-02-10T09:00:00Z',
  },
]

// ─── Disputes ─────────────────────────────────────────────────────────────────

// ─── Date Change Requests ──────────────────────────────────────────────────────

export const DEMO_DATE_CHANGE_REQUESTS: DateChangeRequestResponse[] = [
  {
    id: 1,
    bookingId: 203,
    originalDate: '2026-05-30',
    requestedDate: '2026-07-12',
    reason: 'A family emergency has come up on the original date. We would greatly appreciate moving the event to July if possible.',
    reschedulingFeeAmount: 1200,
    couponCode: null,
    discountedFeeAmount: 1200,
    status: 'PENDING',
    createdAt: '2026-03-08T14:00:00Z',
  },
]

export const DEMO_DISPUTES: DisputeResponse[] = [
  {
    id: 1,
    bookingId: 101,
    reason: 'The catering quality was significantly below what was agreed in the contract. Several dietary requirements were not met and the buffet ran out before all guests were served.',
    status: 'UNDER_REVIEW',
    resolution: null,
    resolutionNote: null,
    refundAmount: null,
    evidenceDeadline: '2026-03-15T00:00:00Z',
    createdAt: '2026-02-20T10:00:00Z',
    raisedBy: { id: 1001, firstName: 'Sarah', lastName: 'Chen', role: 'CLIENT' },
    evidence: [],
  },
  {
    id: 2,
    bookingId: 103,
    reason: 'Venue was double-booked and event had to be relocated at short notice. Client is seeking a partial refund for the inconvenience.',
    status: 'RESOLVED',
    resolution: 'PARTIAL_REFUND',
    resolutionNote: 'A partial refund of £400 has been issued to the client.',
    refundAmount: 400,
    evidenceDeadline: '2025-12-10T00:00:00Z',
    createdAt: '2025-11-28T14:00:00Z',
    raisedBy: { id: 1001, firstName: 'Sarah', lastName: 'Chen', role: 'CLIENT' },
    evidence: [],
  },
]

// ─── Admin: Pending Planners ───────────────────────────────────────────────────

export const DEMO_PENDING_PLANNERS: PendingPlannerResponse[] = [
  {
    id: 3001,
    email: 'jasmine.okafor@blossomevents.co.uk',
    firstName: 'Jasmine',
    lastName: 'Okafor',
    phone: '+44 7700 900123',
    businessName: 'Blossom & Bloom Events',
    bio: 'Specialist in luxury weddings and corporate galas. 8 years experience across London and the South East. Known for bespoke floral arrangements and seamless coordination.',
    location: 'London',
    priceRange: 'LUXURY',
    yearsExperience: 8,
    portfolioDescription: 'My portfolio showcases 60+ events from intimate garden weddings to 500-guest corporate dinners.',
    verificationStatus: 'PENDING',
    specialties: ['Wedding', 'Corporate', 'Engagement'],
    portfolioImageCount: 12,
    registeredAt: '2026-03-01T10:30:00Z',
    profileImageUrl: null,
  },
  {
    id: 3002,
    email: 'david.mensah@mensahcelebrations.com',
    firstName: 'David',
    lastName: 'Mensah',
    phone: '+44 7911 223344',
    businessName: 'Mensah Celebrations',
    bio: 'I bring a vibrant, cultural touch to every event — from traditional African ceremonies to modern birthday bashes. Based in Manchester.',
    location: 'Manchester',
    priceRange: 'MID_RANGE',
    yearsExperience: 4,
    portfolioDescription: null,
    verificationStatus: 'PENDING',
    specialties: ['Birthday', 'Wedding', 'Baby Shower'],
    portfolioImageCount: 5,
    registeredAt: '2026-03-03T14:15:00Z',
    profileImageUrl: null,
  },
  {
    id: 3003,
    email: 'sophie.wright@wrightmoments.co.uk',
    firstName: 'Sophie',
    lastName: 'Wright',
    phone: null,
    businessName: null,
    bio: 'Freelance event coordinator with a passion for creating memorable graduation parties and anniversary celebrations.',
    location: 'Bristol',
    priceRange: 'BUDGET',
    yearsExperience: 2,
    portfolioDescription: null,
    verificationStatus: 'PENDING',
    specialties: ['Graduation', 'Anniversary'],
    portfolioImageCount: 0,
    registeredAt: '2026-03-07T09:00:00Z',
    profileImageUrl: null,
  },
]

// ─── Admin: Open Disputes ─────────────────────────────────────────────────────

export const DEMO_ADMIN_DISPUTES: DisputeResponse[] = [
  {
    id: 10,
    bookingId: 501,
    reason: 'The venue was not cleaned or set up before guests arrived. We had to spend the first 45 minutes arranging tables ourselves. This was not what we agreed upon.',
    status: 'OPEN',
    resolution: null,
    resolutionNote: null,
    refundAmount: null,
    evidenceDeadline: '2026-03-15T00:00:00Z',
    createdAt: '2026-03-10T08:00:00Z',
    raisedBy: { id: 1005, firstName: 'Tom', lastName: 'Bradley', role: 'CLIENT' },
    evidence: [],
  },
  {
    id: 11,
    bookingId: 502,
    reason: 'The DJ arrived over 2 hours late and only performed for 90 minutes instead of the agreed 4 hours. Guests left early and the event was ruined.',
    status: 'UNDER_REVIEW',
    resolution: null,
    resolutionNote: null,
    refundAmount: null,
    evidenceDeadline: '2026-03-12T00:00:00Z',
    createdAt: '2026-03-05T11:30:00Z',
    raisedBy: { id: 1006, firstName: 'Emma', lastName: 'Davis', role: 'CLIENT' },
    evidence: [
      {
        id: 101,
        fileUrl: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800',
        description: 'Screenshot of messages confirming 4-hour DJ set',
        createdAt: '2026-03-06T10:00:00Z',
        uploadedBy: { id: 1006, firstName: 'Emma', lastName: 'Davis', role: 'CLIENT' },
      },
    ],
  },
]
