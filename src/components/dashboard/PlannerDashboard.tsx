import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { BookingResponse, InquiryResponse, PlannerProfileResponse } from '@/lib/types'
import DashboardShell from './DashboardShell'
import PlannerStatsRow from './PlannerStatsRow'
import UpcomingBookingsTable from './UpcomingBookingsTable'
import PendingInquiriesPanel from './PendingInquiriesPanel'
import PlannerOnboarding from './PlannerOnboarding'
import {
  DEMO_BOOKINGS_PLANNER,
  DEMO_INQUIRIES_RECEIVED,
  DEMO_PLANNER_PROFILE_VERIFIED,
} from '@/showcase/data'

export default function PlannerDashboard() {
  const { user } = useAuthStore()

  const { data: plannerProfile } = useQuery<PlannerProfileResponse>({
    queryKey: ['planner-profile'],
    queryFn: () => api.get('/planners/me').then(r => r.data.data),
    placeholderData: DEMO_PLANNER_PROFILE_VERIFIED,
    retry: false,
  })

  const { data: bookings = DEMO_BOOKINGS_PLANNER } = useQuery<BookingResponse[]>({
    queryKey: ['received-bookings'],
    queryFn: () => api.get('/bookings/received').then(r => r.data.data),
    placeholderData: DEMO_BOOKINGS_PLANNER,
    retry: false,
  })

  const { data: inquiries = DEMO_INQUIRIES_RECEIVED } = useQuery<InquiryResponse[]>({
    queryKey: ['received-inquiries'],
    queryFn: () => api.get('/inquiries/received').then(r => r.data.data),
    placeholderData: DEMO_INQUIRIES_RECEIVED,
    retry: false,
  })

  if (plannerProfile?.verificationStatus === 'PENDING') {
    return (
      <DashboardShell>
        <PlannerOnboarding profile={plannerProfile} />
      </DashboardShell>
    )
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const profileIncomplete = plannerProfile && (!plannerProfile.bio || !plannerProfile.businessName)

  return (
    <DashboardShell>

      {/* Incomplete profile alert */}
      {profileIncomplete && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-5 py-3 mb-5 flex items-center justify-between gap-4">
          <p className="text-sm text-orange-800 font-medium">
            Your profile is incomplete — fill in your details to attract more clients.
          </p>
          <Link
            href="/dashboard/profile"
            className="text-sm font-semibold text-orange-700 hover:text-orange-900 whitespace-nowrap underline shrink-0"
          >
            Complete profile
          </Link>
        </div>
      )}

      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-charcoal">
          {greeting}, {user?.firstName} 👋
        </h1>
        <p className="text-stone-warm text-sm mt-1">Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Stats row */}
      <PlannerStatsRow />

      {/* Two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] lg:grid-cols-[1fr_320px] gap-5">
        <UpcomingBookingsTable bookings={bookings} />
        <PendingInquiriesPanel inquiries={inquiries} />
      </div>

    </DashboardShell>
  )
}
