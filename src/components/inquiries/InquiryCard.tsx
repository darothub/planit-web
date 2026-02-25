import Link from 'next/link'
import Image from 'next/image'
import { InquiryResponse, UserRole } from '@/lib/types'
import { formatShortDate } from '@/lib/utils'

const statusColour: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACTIVE:  'bg-green-100 text-green-800',
  CLOSED:  'bg-gray-100 text-gray-600',
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
    <Link href={`/messages/${inquiry.id}`} className="block bg-white border border-cream rounded-xl p-4 hover:border-primary/40 transition-colors">
      <div className="flex gap-3">
        {/* Listing thumbnail */}
        {inquiry.listing.coverImageUrl ? (
          <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
            <Image src={inquiry.listing.coverImageUrl} alt={inquiry.listing.title} fill className="object-cover" />
          </div>
        ) : (
          <div className="w-14 h-14 rounded-lg bg-sand flex items-center justify-center flex-shrink-0 text-xl">🎪</div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-charcoal text-sm truncate">{inquiry.listing.title}</p>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${statusColour[inquiry.status]}`}>
              {inquiry.status}
            </span>
          </div>
          <p className="text-xs text-stone-warm mt-0.5">{otherParty} · {formatShortDate(inquiry.eventDate)}</p>
          {inquiry.lastMessage && (
            <p className="text-xs text-stone-warm mt-1 truncate">{inquiry.lastMessage}</p>
          )}
        </div>
      </div>
    </Link>
  )
}
