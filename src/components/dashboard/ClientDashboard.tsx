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

  const activeBookings = bookings.filter(b => b.status === 'REQUESTED' || b.status === 'ACCEPTED')

  return (
    <DashboardShell>
      <p className="text-stone-warm text-sm mb-6">
        Hello, <span className="font-semibold text-charcoal">{user?.firstName}</span> 👋
      </p>

      {/* Bookings */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-charcoal">Your Bookings</h2>
          <Link href="/dashboard/bookings" className="text-primary text-sm font-semibold hover:underline">
            See all
          </Link>
        </div>
        {activeBookings.length === 0 ? (
          <div className="bg-white border border-cream rounded-xl p-6 text-center">
            <p className="text-stone-warm text-sm">No active bookings yet.</p>
            <Link href="/listings" className="inline-block mt-3 text-primary text-sm font-semibold hover:underline">
              Browse events →
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

      {/* Recent messages */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-charcoal">Recent Messages</h2>
          <Link href="/dashboard/inquiries" className="text-primary text-sm font-semibold hover:underline">
            See all
          </Link>
        </div>
        {inquiries.length === 0 ? (
          <div className="bg-white border border-cream rounded-xl p-6 text-center">
            <p className="text-stone-warm text-sm">No conversations yet.</p>
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
