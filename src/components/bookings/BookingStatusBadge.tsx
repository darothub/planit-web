import { BookingStatus } from '@/lib/types'

const colours: Record<BookingStatus, string> = {
  REQUESTED:  'bg-yellow-100 text-yellow-800',
  ACCEPTED:   'bg-green-100 text-green-800',
  DECLINED:   'bg-red-100 text-red-800',
  COMPLETED:  'bg-blue-100 text-blue-800',
  CANCELLED:  'bg-gray-100 text-gray-600',
  REFUNDED:   'bg-purple-100 text-purple-800',
  DISPUTED:   'bg-orange-100 text-orange-800',
  AT_RISK:    'bg-red-100 text-red-900',
}

const labels: Record<BookingStatus, string> = {
  REQUESTED:  'Requested',
  ACCEPTED:   'Accepted',
  DECLINED:   'Declined',
  COMPLETED:  'Completed',
  CANCELLED:  'Cancelled',
  REFUNDED:   'Refunded',
  DISPUTED:   'Disputed',
  AT_RISK:    'At Risk',
}

export default function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${colours[status]}`}>
      {labels[status]}
    </span>
  )
}
