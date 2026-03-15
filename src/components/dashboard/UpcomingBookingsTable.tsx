import { useRouter } from 'next/router'
import { BookingResponse } from '@/lib/types'
import { formatShortDate, formatPrice } from '@/lib/utils'
import BookingStatusBadge from '@/components/bookings/BookingStatusBadge'

const AVATAR_COLOURS = ['bg-charcoal', 'bg-primary', 'bg-accent']

type Props = { bookings: BookingResponse[] }

export default function UpcomingBookingsTable({ bookings }: Props) {
  const router = useRouter()

  const upcoming = [...bookings]
    .filter(b => b.status === 'ACCEPTED' || b.status === 'REQUESTED')
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
    .slice(0, 5)

  return (
    <div className="bg-white border border-cream rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-cream">
        <h2 className="text-base font-semibold text-charcoal">Upcoming Bookings</h2>
      </div>

      {upcoming.length === 0 ? (
        <div className="px-5 py-10 text-center text-stone-warm text-sm">
          No upcoming bookings
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cream bg-sand/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-stone-warm uppercase tracking-wider">Client</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-warm uppercase tracking-wider whitespace-nowrap">Event Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-warm uppercase tracking-wider hidden md:table-cell">Listing</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-warm uppercase tracking-wider hidden sm:table-cell">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-warm uppercase tracking-wider">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-cream">
              {upcoming.map(booking => {
                const colourIdx = Math.abs(booking.id) % AVATAR_COLOURS.length
                const colour = AVATAR_COLOURS[colourIdx]
                const initials = `${booking.client.firstName[0]}${booking.client.lastName[0]}`
                return (
                  <tr key={booking.id} className="hover:bg-sand/30 transition-colors">
                    {/* Client */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${colour}`}>
                          <span className="text-white text-xs font-bold">{initials}</span>
                        </div>
                        <div>
                          <p className="font-medium text-charcoal">
                            {booking.client.firstName} {booking.client.lastName}
                          </p>
                          <p className="text-xs text-stone-warm">{booking.eventLocation}</p>
                        </div>
                      </div>
                    </td>
                    {/* Date */}
                    <td className="px-4 py-3 text-charcoal whitespace-nowrap">
                      {formatShortDate(booking.eventDate)}
                    </td>
                    {/* Listing */}
                    <td className="px-4 py-3 text-stone-warm hidden md:table-cell max-w-[180px] truncate">
                      {booking.listing.title}
                    </td>
                    {/* Amount */}
                    <td className="px-4 py-3 font-medium text-charcoal hidden sm:table-cell whitespace-nowrap">
                      {formatPrice(booking.agreedPrice, booking.currency)}
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3">
                      <BookingStatusBadge status={booking.status} />
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => router.push(`/messages?bookingId=${booking.id}`)}
                          className="text-xs font-medium text-primary hover:underline whitespace-nowrap"
                        >
                          Message
                        </button>
                        <button
                          onClick={() => router.push(`/dashboard/bookings/${booking.id}`)}
                          className="text-xs font-medium text-stone-warm hover:text-charcoal whitespace-nowrap"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
