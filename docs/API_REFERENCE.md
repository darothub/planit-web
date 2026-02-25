# Planit API Reference

> Base URL: `http://localhost:8081/api/v1` (dev)
> All responses are wrapped in `ApiResponse<T>`: `{ success, message, data }`
> Auth: `Authorization: Bearer <token>` header on protected routes

---

## Standard Wrappers

```ts
// Every endpoint returns this
type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

// Paginated endpoints return this as T
type PageResponse<T> = {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}
```

---

## Enums

```ts
type UserRole = 'CLIENT' | 'PLANNER' | 'ADMIN'
type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED'
type BookingStatus = 'REQUESTED' | 'ACCEPTED' | 'DECLINED' | 'AT_RISK' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED' | 'DISPUTED'
type PaymentStatus = 'SCHEDULED' | 'AUTHORIZED' | 'CAPTURED' | 'FAILED' | 'REFUNDED'
type InquiryStatus = 'PENDING' | 'ACTIVE' | 'CLOSED'
type DisputeStatus = 'OPEN' | 'EVIDENCE_SUBMITTED' | 'UNDER_REVIEW' | 'RESOLVED'
type DisputeResolution = 'FULL_REFUND' | 'PARTIAL_REFUND' | 'RELEASED_TO_PLANNER'
type DateChangeStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED'
type CancellationPolicy = 'FLEXIBLE' | 'MODERATE' | 'STRICT'
type PriceRange = 'BUDGET' | 'MID_RANGE' | 'LUXURY'
type BlockScope = 'ALL' | 'SELECTED'
type ReviewTargetType = 'LISTING' | 'PLANNER' | 'CLIENT'
type BudgetRange = 'BUDGET' | 'MID_RANGE' | 'LUXURY'
type ListingSortBy = 'PRICE_ASC' | 'PRICE_DESC' | 'RATING' | 'NEWEST'
```

---

## Auth

### Register as Client
```
POST /auth/register/client
Body: { email, password, firstName, lastName, phone? }
Response: ApiResponse<AuthResponse>
```

### Register as Planner
```
POST /auth/register/planner
Body: { email, password, firstName, lastName, phone?, businessName? }
Response: ApiResponse<AuthResponse>
```

### Login
```
POST /auth/login
Body: { email, password }
Response: ApiResponse<AuthResponse>
```

### Verify Email
```
GET /auth/verify-email/{token}
Response: ApiResponse<null>
```

**AuthResponse shape:**
```ts
type AuthResponse = {
  token: string         // JWT — store in cookie
  type: 'Bearer'
  userId: number
  email: string
  firstName: string
  lastName: string
  role: UserRole
  emailVerified: boolean
}
```

---

## Event Types

### List All Event Types
```
GET /event-types
Auth: none
Response: ApiResponse<EventType[]>
```

```ts
type EventType = {
  id: number
  name: string          // enum name e.g. "WEDDING"
  displayName: string   // human-readable e.g. "Wedding"
  description: string
  isActive: boolean
}
```

---

## Listing Discovery (Public)

### Search Listings
```
GET /listings
Auth: none
Query params (all optional):
  q           string       free text search
  location    string
  eventTypeId number
  date        string       ISO date e.g. "2026-06-15"
  maxPrice    number
  guests      number
  lat         number       geo search
  lng         number
  radiusKm    number
  sortBy      ListingSortBy
  page        number       default 0
  size        number       default 12
Response: ApiResponse<PageResponse<EventListingResponse>>
```

### Get Listing Detail
```
GET /listings/{id}
Auth: none
Response: ApiResponse<EventListingDetailResponse>
```

### Get Listing Availability
```
GET /listings/{id}/availability?rangeStart=YYYY-MM-DD&rangeEnd=YYYY-MM-DD
Auth: none
Response: ApiResponse<BlockedPeriodResponse[]>
```

### Get Listing Reviews
```
GET /listings/{id}/reviews
Auth: none
Response: ApiResponse<ReviewResponse[]>
```

**EventListingResponse shape:**
```ts
type EventListingResponse = {
  id: number
  title: string
  description: string
  location: string
  basePrice: number
  cancellationPolicy: CancellationPolicy
  minGuests: number
  maxGuests: number
  coverImageUrl: string
  latitude: number
  longitude: number
  isPublished: boolean
  isFeatured: boolean
  averageRating: number
  reviewCount: number
  eventType: { id: number; name: string; displayName: string }
  planner: { id: number; businessName: string; profileImageUrl: string }
  createdAt: string
}

type EventListingDetailResponse = EventListingResponse & {
  images: { id: number; imageUrl: string; caption: string; displayOrder: number }[]
  recentReviews: ReviewResponse[]
}
```

---

## Planner Profile (Planner Auth Required)

### Get My Profile
```
GET /planners/me
Auth: PLANNER
Response: ApiResponse<PlannerProfileResponse>
```

### Update My Profile
```
PUT /planners/me
Auth: PLANNER
Body (all optional): { businessName, bio, location, priceRange, yearsOfExperience, portfolioDescription, profileImageUrl }
Response: ApiResponse<PlannerProfileResponse>
```

### Get My Stats
```
GET /planners/me/stats
Auth: PLANNER
Response: ApiResponse<PlannerStatsResponse>
```

### Get My Analytics
```
GET /planners/me/analytics
Auth: PLANNER
Response: ApiResponse<PlannerAnalyticsResponse>
```

### Update Specialties
```
PUT /planners/me/specialties
Auth: PLANNER
Body: { eventTypeIds: number[] }
Response: ApiResponse<PlannerProfileResponse>
```

### Portfolio Images
```
GET    /planners/me/portfolio              → ApiResponse<PortfolioImageResponse[]>
POST   /planners/me/portfolio              Body: { imageUrl, caption?, displayOrder? }
DELETE /planners/me/portfolio/{imageId}
```

**PlannerProfileResponse shape:**
```ts
type PlannerProfileResponse = {
  id: number
  userId: number
  email: string
  firstName: string
  lastName: string
  phone: string
  businessName: string
  bio: string
  location: string
  priceRange: PriceRange
  yearsOfExperience: number
  portfolioDescription: string
  profileImageUrl: string
  verificationStatus: VerificationStatus
  verificationNotes: string
  averageResponseTimeMinutes: number
  totalInquiries: number
  totalBookings: number
  rating: number
  reviewCount: number
  isAcceptingInquiries: boolean
  specialties: { id: number; name: string; displayName: string }[]
  createdAt: string
  updatedAt: string
}
```

---

## Planner Listings (Planner Auth Required)

### CRUD
```
POST   /planners/me/listings
  Body: { title, description?, eventTypeId, location?, basePrice, cancellationPolicy?,
          minGuests?, maxGuests?, coverImageUrl?, latitude?, longitude? }
  Response: ApiResponse<EventListingResponse> — 201

GET    /planners/me/listings              → ApiResponse<EventListingResponse[]>
GET    /planners/me/listings/{id}         → ApiResponse<EventListingResponse>
PUT    /planners/me/listings/{id}         Body: same fields, all optional
DELETE /planners/me/listings/{id}
```

### Publish / Unpublish
```
PATCH /planners/me/listings/{id}/publish
Auth: PLANNER
Response: ApiResponse<EventListingResponse>
```

### Listing Images
```
POST   /planners/me/listings/{id}/images   Body: { imageUrl, caption?, displayOrder? } → 201
DELETE /planners/me/listings/{id}/images/{imageId}
```

### Payment Schedule
```
GET /planners/me/listings/{listingId}/payment-schedule
PUT /planners/me/listings/{listingId}/payment-schedule
  Body: {
    instalments: 1-4,
    depositPercentage: 1-100,
    secondPercentage?, secondDaysBeforeEvent?,
    thirdPercentage?, thirdDaysBeforeEvent?,
    fourthPercentage?, fourthDaysBeforeEvent?,
    nonRefundableWindowHours?
  }
  Note: all percentages must sum to 100
```

---

## Calendar Blocks (Planner Auth Required)

```
POST   /planners/me/calendar/blocks
  Body: { startDate, endDate, reason?, scope: 'ALL'|'SELECTED', listingIds?: number[] }
  Response: ApiResponse<CalendarBlockResponse> — 201

GET    /planners/me/calendar/blocks        → ApiResponse<CalendarBlockResponse[]>
DELETE /planners/me/calendar/blocks/{id}
```

---

## File Upload

```
POST /upload
Auth: CLIENT or PLANNER
Content-Type: multipart/form-data
Body: file (jpeg/png/webp/gif, max 10MB), folder? (string)
Response: ApiResponse<{ url: string }> — 201
```

---

## Inquiries & Messaging

### Client Endpoints
```
POST /inquiries
  Body: { listingId, eventDate, eventLocation, guestCount, budgetRange, message }
  Response: ApiResponse<InquiryResponse> — 201

GET  /inquiries/my          → ApiResponse<InquiryResponse[]>
GET  /inquiries/my/{id}     → ApiResponse<InquiryResponse>
PATCH /inquiries/my/{id}/close → ApiResponse<InquiryResponse>
```

### Planner Endpoints
```
GET /inquiries/received       → ApiResponse<InquiryResponse[]>
GET /inquiries/received/{id}  → ApiResponse<InquiryResponse>
```

### Messages (CLIENT or PLANNER)
```
GET  /inquiries/{id}/messages?afterId={lastId}  → ApiResponse<InquiryMessageResponse[]>
POST /inquiries/{id}/messages
  Body: { content, clientMsgId? }
  Response: ApiResponse<InquiryMessageResponse> — 201
```

**InquiryResponse shape:**
```ts
type InquiryResponse = {
  id: number
  status: InquiryStatus
  eventDate: string
  eventLocation: string
  guestCount: number
  budgetRange: BudgetRange
  listing: { id: number; title: string; coverImageUrl: string }
  client: { id: number; firstName: string; lastName: string }
  planner: { id: number; businessName: string }
  lastMessage: string
  createdAt: string
}

type InquiryMessageResponse = {
  id: number
  content: string
  sentAt: string
  senderId: number
  senderName: string
  senderRole: UserRole
  clientMsgId?: string
}
```

### Real-Time via STOMP/WebSocket

```
Connect:    ws://localhost:8081/ws
Subscribe:  /user/queue/inquiry/{inquiryId}/messages
Publish:    /app/inquiry/{inquiryId}/send
  Body: { content, clientMsgId? }
```
Auth header required on STOMP CONNECT frame.

---

## Reviews

```
POST /reviews
  Body: { inquiryId, targetType: 'LISTING'|'PLANNER'|'CLIENT', rating: 1-5, comment? }
  Response: ApiResponse<ReviewResponse> — 201

GET /listings/{id}/reviews   → ApiResponse<ReviewResponse[]>
GET /planners/{id}/reviews   → ApiResponse<ReviewResponse[]>   (public)
GET /clients/{id}/reviews    → ApiResponse<ReviewResponse[]>   (PLANNER only)
```

**ReviewResponse shape:**
```ts
type ReviewResponse = {
  id: number
  targetType: ReviewTargetType
  targetId: number
  rating: number
  comment: string
  createdAt: string
  reviewer: { id: number; firstName: string; lastName: string; role: UserRole }
}
```

---

## Bookings

### Client Endpoints
```
POST /bookings
  Body: { inquiryId, agreedPrice, eventDate, eventLocation, guestCount, clientNote?, stripePaymentMethodId }
  Response: ApiResponse<BookingResponse> — 201

GET   /bookings/my           → ApiResponse<BookingResponse[]>
GET   /bookings/my/{id}      → ApiResponse<BookingResponse>
POST  /bookings/my/{id}/confirm-completion → ApiResponse<BookingResponse>
PATCH /bookings/my/{id}/cancel → ApiResponse<BookingResponse>
```

### Planner Endpoints
```
GET   /bookings/received           → ApiResponse<BookingResponse[]>
GET   /bookings/received/{id}      → ApiResponse<BookingResponse>
PATCH /bookings/received/{id}/respond
  Body: { accept: boolean, declineReason? }
  Response: ApiResponse<BookingResponse>
POST  /bookings/received/{id}/confirm-completion → ApiResponse<BookingResponse>
```

**BookingResponse shape:**
```ts
type BookingResponse = {
  id: number
  inquiryId: number
  status: BookingStatus
  agreedPrice: number
  currency: string
  eventDate: string
  eventLocation: string
  guestCount: number
  clientNote: string
  reschedulingCount: number
  clientConfirmedAt: string | null
  plannerConfirmedAt: string | null
  fundsReleasedAt: string | null
  createdAt: string
  updatedAt: string
  client: { id: number; firstName: string; lastName: string }
  planner: { id: number; businessName: string }
  listing: { id: number; title: string }
  payments: BookingPaymentResponse[]
}

type BookingPaymentResponse = {
  id: number
  instalmentNumber: number
  amount: number
  currency: string
  dueDate: string
  paidAt: string | null
  status: PaymentStatus
  isNonRefundable: boolean
}
```

---

## Date Change Requests

```
GET  /bookings/{bookingId}/date-change/quote?requestedDate=YYYY-MM-DD&couponCode=?
     → ApiResponse<ReschedulingFeeQuoteResponse>

POST /bookings/{bookingId}/date-change
  Body: { bookingId, requestedDate, reason?, couponCode? }
  Response: ApiResponse<DateChangeRequestResponse> — 201

PATCH /bookings/{bookingId}/date-change/{requestId}/respond
  Body: { accept: boolean }
  Response: ApiResponse<DateChangeRequestResponse>

GET  /bookings/{bookingId}/date-change → ApiResponse<DateChangeRequestResponse[]>
```

---

## Disputes

```
POST  /disputes
  Body: { bookingId, reason }
  Response: ApiResponse<DisputeResponse> — 201

POST  /disputes/{id}/evidence
  Body: { fileUrl, description? }
  Response: ApiResponse<DisputeResponse> — 201

GET   /disputes/{bookingId}   → ApiResponse<DisputeResponse>  (CLIENT or PLANNER)
GET   /disputes               → ApiResponse<DisputeResponse[]> (ADMIN only)

PATCH /disputes/{id}/resolve  (ADMIN only)
  Body: { resolution: DisputeResolution, refundAmount?, resolutionNote }
  Response: ApiResponse<DisputeResponse>
```

---

## Admin

```
GET /admin/planners/pending           → ApiResponse<PendingPlannerResponse[]>
PUT /admin/planners/{id}/approve
PUT /admin/planners/{id}/reject       Body: { notes }
PATCH /admin/listings/{id}/feature    → toggles featured status
```

---

## Error Responses

| HTTP Status | Meaning |
|---|---|
| 400 | Bad request / validation failure |
| 401 | Unauthenticated — no/invalid token |
| 403 | Forbidden — wrong role |
| 404 | Resource not found |
| 409 | Conflict — duplicate resource |
| 500 | Server error |

Error response shape:
```ts
type ErrorResponse = {
  success: false
  message: string
  errors?: Record<string, string>  // field-level validation errors
}
```