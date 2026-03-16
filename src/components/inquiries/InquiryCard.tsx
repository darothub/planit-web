import Link from 'next/link'
import Image from 'next/image'
import { InquiryResponse, UserRole } from '@/lib/types'
import { formatShortDate, formatRelativeTime, getListingGradient } from '@/lib/utils'
import { cn } from '@/lib/utils'

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Awaiting reply',
  ACTIVE:  'Active',
  CLOSED:  'Closed',
}

const STATUS_BADGE: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  ACTIVE:  'bg-green-100 text-green-800',
  CLOSED:  'bg-gray-100 text-gray-500',
}

const STATUS_BORDER: Record<string, string> = {
  PENDING: 'border-l-amber-400',
  ACTIVE:  'border-l-green-500',
  CLOSED:  'border-l-transparent',
}

type Props = {
  inquiry: InquiryResponse
  role: UserRole
}

export default function InquiryCard({ inquiry, role }: Props) {
  const otherParty = role === 'CLIENT'
    ? (inquiry.planner.businessName ?? 'Planner')
    : `${inquiry.client.firstName} ${inquiry.client.lastName}`

  return (
    <Link
      href={`/messages/${inquiry.id}`}
      className={cn(
        'block bg-white border border-cream border-l-4 rounded-xl p-4 hover:border-primary/40 transition-colors',
        STATUS_BORDER[inquiry.status] ?? 'border-l-transparent',
      )}
    >
      <div className="flex gap-3">
        {/* Listing thumbnail — gradient always as background */}
        <div
          className="relative w-14 h-14 rounded-lg flex-shrink-0 overflow-hidden"
          style={{ background: getListingGradient(inquiry.listing.id) }}
        >
          {inquiry.listing.coverImageUrl && (
            <Image
              src={inquiry.listing.coverImageUrl}
              alt={inquiry.listing.title}
              fill
              className="object-cover"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-charcoal text-sm truncate">{inquiry.listing.title}</p>
            <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0', STATUS_BADGE[inquiry.status])}>
              {STATUS_LABEL[inquiry.status] ?? inquiry.status}
            </span>
          </div>

          {/* Meta row */}
          <p className="text-xs text-stone-warm mt-0.5">
            {otherParty}
            {' · '}📅 {formatShortDate(inquiry.eventDate)}
            {' · '}{inquiry.guestCount} guests
          </p>

          {/* Last message preview */}
          {inquiry.lastMessage && (
            <p className="text-xs text-stone-warm mt-1.5 line-clamp-1">{inquiry.lastMessage}</p>
          )}

          {/* Timestamp */}
          <p className="text-[11px] text-stone-warm/70 mt-1">{formatRelativeTime(inquiry.createdAt)}</p>
        </div>
      </div>
    </Link>
  )
}
