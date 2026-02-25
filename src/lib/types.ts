// ─── Enums ───────────────────────────────────────────────────────────────────

export type UserRole = 'CLIENT' | 'PLANNER' | 'ADMIN'
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED'
export type BookingStatus =
  | 'REQUESTED' | 'ACCEPTED' | 'DECLINED' | 'AT_RISK'
  | 'COMPLETED' | 'CANCELLED' | 'REFUNDED' | 'DISPUTED'
export type PaymentStatus = 'SCHEDULED' | 'AUTHORIZED' | 'CAPTURED' | 'FAILED' | 'REFUNDED'
export type InquiryStatus = 'PENDING' | 'ACTIVE' | 'CLOSED'
export type DisputeStatus = 'OPEN' | 'EVIDENCE_SUBMITTED' | 'UNDER_REVIEW' | 'RESOLVED'
export type DisputeResolution = 'FULL_REFUND' | 'PARTIAL_REFUND' | 'RELEASED_TO_PLANNER'
export type DateChangeStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED'
export type CancellationPolicy = 'FLEXIBLE' | 'MODERATE' | 'STRICT'
export type PriceRange = 'BUDGET' | 'MID_RANGE' | 'LUXURY'
export type BlockScope = 'ALL' | 'SELECTED'
export type ReviewTargetType = 'LISTING' | 'PLANNER' | 'CLIENT'
export type BudgetRange = 'BUDGET' | 'MID_RANGE' | 'LUXURY'
export type ListingSortBy = 'PRICE_ASC' | 'PRICE_DESC' | 'RATING' | 'NEWEST'

// ─── API Wrapper ─────────────────────────────────────────────────────────────

export type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

export type PageResponse<T> = {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export type AuthResponse = {
  token: string
  type: 'Bearer'
  userId: number
  email: string
  firstName: string
  lastName: string
  role: UserRole
  emailVerified: boolean
}

// ─── Event Types ─────────────────────────────────────────────────────────────

export type EventType = {
  id: number
  name: string
  displayName: string
  description: string
  isActive: boolean
}

// ─── Listings ────────────────────────────────────────────────────────────────

export type EventListingResponse = {
  id: number
  title: string
  description: string
  location: string
  basePrice: number
  cancellationPolicy: CancellationPolicy
  minGuests: number
  maxGuests: number
  coverImageUrl: string
  latitude: number | null
  longitude: number | null
  isPublished: boolean
  isFeatured: boolean
  averageRating: number | null
  reviewCount: number
  eventType: { id: number; name: string; displayName: string }
  planner: { id: number; businessName: string | null; profileImageUrl: string | null }
  createdAt: string
}

export type EventListingImage = {
  id: number
  imageUrl: string
  caption: string | null
  displayOrder: number
}

export type EventListingDetailResponse = EventListingResponse & {
  images: EventListingImage[]
  recentReviews: ReviewResponse[]
}

// ─── Planner ─────────────────────────────────────────────────────────────────

export type PlannerProfileResponse = {
  id: number
  userId: number
  email: string
  firstName: string
  lastName: string
  phone: string | null
  businessName: string | null
  bio: string | null
  location: string | null
  priceRange: PriceRange | null
  yearsOfExperience: number | null
  portfolioDescription: string | null
  profileImageUrl: string | null
  verificationStatus: VerificationStatus
  verificationNotes: string | null
  averageResponseTimeMinutes: number | null
  totalInquiries: number
  totalBookings: number
  rating: number | null
  reviewCount: number
  isAcceptingInquiries: boolean
  specialties: { id: number; name: string; displayName: string }[]
  createdAt: string
  updatedAt: string
}

export type PlannerStatsResponse = {
  totalInquiries: number
  totalBookings: number
  conversionRate: number
  averageResponseTimeMinutes: number | null
  averageResponseTimeDisplay: string
  rating: number | null
  reviewCount: number
  activeConversations: number
  pendingResponses: number
}

export type PortfolioImageResponse = {
  id: number
  imageUrl: string
  caption: string | null
  displayOrder: number
  createdAt: string
}

// ─── Inquiries ────────────────────────────────────────────────────────────────

export type InquiryResponse = {
  id: number
  status: InquiryStatus
  eventDate: string
  eventLocation: string
  guestCount: number
  budgetRange: BudgetRange
  listing: { id: number; title: string; coverImageUrl: string | null }
  client: { id: number; firstName: string; lastName: string }
  planner: { id: number; businessName: string | null }
  lastMessage: string | null
  createdAt: string
}

export type InquiryMessageResponse = {
  id: number
  content: string
  sentAt: string
  senderId: number
  senderName: string
  senderRole: UserRole
  clientMsgId?: string
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export type ReviewResponse = {
  id: number
  targetType: ReviewTargetType
  targetId: number
  rating: number
  comment: string | null
  createdAt: string
  reviewer: { id: number; firstName: string; lastName: string; role: UserRole }
}

// ─── Bookings ────────────────────────────────────────────────────────────────

export type BookingPaymentResponse = {
  id: number
  instalmentNumber: number
  amount: number
  currency: string
  dueDate: string
  paidAt: string | null
  status: PaymentStatus
  isNonRefundable: boolean
}

export type BookingResponse = {
  id: number
  inquiryId: number
  status: BookingStatus
  agreedPrice: number
  currency: string
  eventDate: string
  eventLocation: string
  guestCount: number
  clientNote: string | null
  reschedulingCount: number
  clientConfirmedAt: string | null
  plannerConfirmedAt: string | null
  fundsReleasedAt: string | null
  createdAt: string
  updatedAt: string
  client: { id: number; firstName: string; lastName: string }
  planner: { id: number; businessName: string | null }
  listing: { id: number; title: string }
  payments: BookingPaymentResponse[]
}

// ─── Disputes ────────────────────────────────────────────────────────────────

export type DisputeEvidenceResponse = {
  id: number
  fileUrl: string
  description: string | null
  createdAt: string
  uploadedBy: { id: number; firstName: string; lastName: string; role: UserRole }
}

export type DisputeResponse = {
  id: number
  bookingId: number
  reason: string
  status: DisputeStatus
  resolution: DisputeResolution | null
  resolutionNote: string | null
  refundAmount: number | null
  evidenceDeadline: string
  createdAt: string
  raisedBy: { id: number; firstName: string; lastName: string; role: UserRole }
  evidence: DisputeEvidenceResponse[]
}

// ─── Date Change ──────────────────────────────────────────────────────────────

export type ReschedulingFeeQuoteResponse = {
  bookingId: number
  originalDate: string
  requestedDate: string
  baseFeeAmount: number
  couponCode: string | null
  discountedFeeAmount: number
  daysBeforeEvent: number
  tierApplied: string
}

export type DateChangeRequestResponse = {
  id: number
  bookingId: number
  originalDate: string
  requestedDate: string
  reason: string | null
  reschedulingFeeAmount: number
  couponCode: string | null
  discountedFeeAmount: number
  status: DateChangeStatus
  createdAt: string
}

// ─── Payment Schedule ─────────────────────────────────────────────────────────

export type PaymentScheduleTemplateResponse = {
  listingId: number
  instalments: number
  depositPercentage: number
  secondPercentage: number | null
  secondDaysBeforeEvent: number | null
  thirdPercentage: number | null
  thirdDaysBeforeEvent: number | null
  fourthPercentage: number | null
  fourthDaysBeforeEvent: number | null
  nonRefundableWindowHours: number
}

// ─── Calendar ────────────────────────────────────────────────────────────────

export type CalendarBlockResponse = {
  id: number
  startDate: string
  endDate: string
  reason: string | null
  scope: BlockScope
  affectedListingIds: number[]
  createdAt: string
}

// ─── Upload ──────────────────────────────────────────────────────────────────

export type UploadResponse = {
  url: string
}