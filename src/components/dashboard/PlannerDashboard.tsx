import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { BookingResponse, InquiryResponse } from '@/lib/types'
import DashboardShell from './DashboardShell'
import PlannerStatsRow from './PlannerStatsRow'
import BookingCard from '@/components/bookings/BookingCard'
import InquiryCard from '@/components/inquiries/InquiryCard'

export default function PlannerDashboard() {
  const { user } = useAuthStore()

  const { data: bookings = [] } = useQuery<BookingResponse[]>({
    queryKey: ['received-bookings'],
    queryFn: () => api.get('/bookings/received').then(r => r.data.data),
    retry: false,
  })

  const { data: inquiries = [] } = useQuery<InquiryResponse[]>({
    queryKey: ['received-inquiries'],
    queryFn: () => api.get('/inquiries/received').then(r => r.data.data),
    retry: false,
  })

  const pendingBookings = bookings.filter(b => b.status === 'REQUESTED')

  return (
    <DashboardShell>
      <p className="text-stone-warm text-sm mb-4">
        Hello, <span className="font-semibold text-charcoal">{user?.firstName}</span> 👋
      </p>

      <PlannerStatsRow />

      {/* Pending booking requests */}
      {pendingBookings.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-charcoal mb-3">
            Booking Requests
            <span className="ml-2 bg-primary text-white text-xs font-bold rounded-full px-2 py-0.5">
              {pendingBookings.length}
            </span>
          </h2>
          <div className="flex flex-col gap-3">
            {pendingBookings.map(b => (
              <BookingCard key={b.id} booking={b} role="PLANNER" />
            ))}
          </div>
        </section>
      )}

      {/* Recent messages */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-charcoal">Recent Messages</h2>
          <Link href="/dashboard/inquiries" className="text-primary text-sm font-semibold hover:underline">
            See all
          </Link>
        </div>
        {inquiries.length === 0 ? (
          <div className="bg-white border border-cream rounded-xl p-6 text-center">
            <p className="text-stone-warm text-sm">No messages yet. Make sure your listings are published!</p>
            <Link href="/dashboard/listings" className="inline-block mt-3 text-primary text-sm font-semibold hover:underline">
              Manage listings →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {inquiries.slice(0, 5).map(i => (
              <InquiryCard key={i.id} inquiry={i} role="PLANNER" />
            ))}
          </div>
        )}
      </section>
    </DashboardShell>
  )
}
