import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { BookingResponse, InquiryResponse } from '@/lib/types'
import DashboardShell from './DashboardShell'
import BookingCard from '@/components/bookings/BookingCard'
import InquiryCard from '@/components/inquiries/InquiryCard'
export default function ClientDashboard() {
  const { user } = useAuthStore()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const { data: bookings = [] } = useQuery<BookingResponse[]>({
    queryKey: ['my-bookings'],
    queryFn: () => api.get('/bookings/my').then(r => r.data.data),
    retry: false,
  })

  const { data: inquiries = [] } = useQuery<InquiryResponse[]>({
    queryKey: ['my-inquiries'],
    queryFn: () => api.get('/inquiries/my').then(r => r.data.data),
    retry: false,
  })

  const activeBookings   = bookings.filter(b => b.status === 'REQUESTED' || b.status === 'ACCEPTED')
  const pendingInquiries = inquiries.filter(i => i.status === 'PENDING')

  return (
    <DashboardShell>

      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-charcoal">
          {greeting}, {user?.firstName} 👋
        </h1>
        <p className="text-stone-warm text-sm mt-1">Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-cream rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-charcoal">{bookings.length}</p>
          <p className="text-xs text-stone-warm mt-1">Total Bookings</p>
        </div>
        <div className="bg-white border border-cream rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{activeBookings.length}</p>
          <p className="text-xs text-stone-warm mt-1">Active</p>
        </div>
        <div className={`bg-white border rounded-xl p-4 text-center ${pendingInquiries.length > 0 ? 'border-amber-300' : 'border-cream'}`}>
          <p className={`text-2xl font-bold ${pendingInquiries.length > 0 ? 'text-amber-600' : 'text-charcoal'}`}>
            {pendingInquiries.length}
          </p>
          <p className="text-xs text-stone-warm mt-1">Awaiting Reply</p>
        </div>
      </div>

      {/* Active Bookings */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-charcoal">Active Bookings</h2>
          <Link href="/dashboard/bookings" className="text-primary text-sm font-semibold hover:underline">
            See all
          </Link>
        </div>
        {activeBookings.length === 0 ? (
          <div className="bg-white border border-cream rounded-xl p-8 text-center">
            <p className="text-stone-warm text-sm mb-3">No active bookings yet.</p>
            <Link href="/listings" className="inline-block text-primary text-sm font-semibold hover:underline">
              Browse listings →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {activeBookings.slice(0, 3).map(b => (
              <BookingCard key={b.id} booking={b} role="CLIENT" />
            ))}
          </div>
        )}
      </section>

      {/* Recent Messages */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-charcoal">Recent Messages</h2>
          <Link href="/dashboard/inquiries" className="text-primary text-sm font-semibold hover:underline">
            See all
          </Link>
        </div>
        {inquiries.length === 0 ? (
          <div className="bg-white border border-cream rounded-xl p-8 text-center">
            <p className="text-stone-warm text-sm mb-3">No conversations yet.</p>
            <Link href="/planners" className="inline-block text-primary text-sm font-semibold hover:underline">
              Find a planner →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {inquiries.slice(0, 5).map(i => (
              <InquiryCard key={i.id} inquiry={i} role="CLIENT" />
            ))}
          </div>
        )}
      </section>

    </DashboardShell>
  )
}
