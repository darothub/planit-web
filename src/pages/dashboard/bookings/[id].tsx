import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { BookingResponse } from '@/lib/types'
import DashboardShell from '@/components/dashboard/DashboardShell'
import BookingStatusBadge from '@/components/bookings/BookingStatusBadge'
import { formatPrice, formatShortDate } from '@/lib/utils'

export default function BookingDetailPage() {
  const { token, user } = useAuthStore()
  const router = useRouter()
  const { id } = router.query

  useEffect(() => {
    if (!token) router.replace('/auth/login?redirect=/dashboard/bookings')
  }, [token, router])

  const isPlanner = user?.role === 'PLANNER'
  const endpoint = isPlanner ? `/bookings/received/${id}` : `/bookings/my/${id}`

  const { data: booking, isLoading } = useQuery<BookingResponse>({
    queryKey: ['booking', id],
    queryFn: () => api.get(endpoint).then(r => r.data.data),
    enabled: !!token && !!id,
    retry: false,
  })

  if (!user || isLoading) return (
    <DashboardShell title="Booking">
      <div className="h-64 bg-white border border-cream rounded-xl animate-pulse" />
    </DashboardShell>
  )

  if (!booking) return (
    <DashboardShell title="Booking">
      <p className="text-stone-warm">Booking not found.</p>
    </DashboardShell>
  )

  return (
    <DashboardShell title="Booking Details">
      <div className="bg-white border border-cream rounded-xl p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-charcoal">{booking.listing.title}</h2>
            <p className="text-stone-warm text-sm mt-1">
              {isPlanner
                ? `Client: ${booking.client.firstName} ${booking.client.lastName}`
                : `Planner: ${booking.planner.businessName ?? 'Planner'}`
              }
            </p>
          </div>
          <BookingStatusBadge status={booking.status} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs text-stone-warm">Event Date</p>
            <p className="font-medium text-charcoal">{formatShortDate(booking.eventDate)}</p>
          </div>
          <div>
            <p className="text-xs text-stone-warm">Location</p>
            <p className="font-medium text-charcoal">{booking.eventLocation}</p>
          </div>
          <div>
            <p className="text-xs text-stone-warm">Guests</p>
            <p className="font-medium text-charcoal">{booking.guestCount}</p>
          </div>
          <div>
            <p className="text-xs text-stone-warm">Agreed Price</p>
            <p className="font-semibold text-charcoal">{formatPrice(booking.agreedPrice)}</p>
          </div>
          {booking.clientNote && (
            <div className="col-span-2">
              <p className="text-xs text-stone-warm">Note</p>
              <p className="text-charcoal">{booking.clientNote}</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment schedule */}
      {booking.payments.length > 0 && (
        <div className="bg-white border border-cream rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-charcoal mb-4">Payment Schedule</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-stone-warm border-b border-cream">
                  <th className="pb-2 pr-4">Instalment</th>
                  <th className="pb-2 pr-4">Amount</th>
                  <th className="pb-2 pr-4">Due Date</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {booking.payments.map(p => (
                  <tr key={p.id} className="border-b border-cream last:border-0">
                    <td className="py-2.5 pr-4 text-charcoal">#{p.instalmentNumber}</td>
                    <td className="py-2.5 pr-4 font-medium text-charcoal">{formatPrice(p.amount)}</td>
                    <td className="py-2.5 pr-4 text-charcoal">
                      {p.paidAt ? `Paid ${formatShortDate(p.paidAt)}` : formatShortDate(p.dueDate)}
                    </td>
                    <td className="py-2.5">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        p.status === 'CAPTURED' ? 'bg-green-100 text-green-800' :
                        p.status === 'FAILED'   ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/messages/${booking.inquiryId}`}
          className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-btn transition-colors"
        >
          Open Messages
        </Link>
        <Link
          href="/dashboard/bookings"
          className="px-5 py-2.5 border border-cream text-charcoal text-sm font-medium rounded-btn hover:bg-sand transition-colors"
        >
          Back to Bookings
        </Link>
      </div>
    </DashboardShell>
  )
}
