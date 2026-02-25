import Link from 'next/link'
import Image from 'next/image'
import { InquiryResponse, UserRole } from '@/lib/types'
import { cn } from '@/lib/utils'

type Props = {
  inquiries: InquiryResponse[]
  selectedId: number
  role: UserRole
}

export default function InquiryList({ inquiries, selectedId, role }: Props) {
  return (
    <aside className="hidden md:flex flex-col w-72 flex-shrink-0 bg-white rounded-2xl border border-cream shadow-card overflow-hidden">
      <div className="px-4 py-3.5 border-b border-cream">
        <h2 className="font-semibold text-charcoal text-sm">Messages</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {inquiries.length === 0 && (
          <p className="text-stone-warm text-sm text-center py-8">No conversations.</p>
        )}
        {inquiries.map(inq => {
          const other = role === 'CLIENT'
            ? (inq.planner.businessName ?? 'Planner')
            : `${inq.client.firstName} ${inq.client.lastName}`

          return (
            <Link
              key={inq.id}
              href={`/messages/${inq.id}`}
              className={cn(
                'flex gap-3 px-4 py-3.5 border-b border-cream hover:bg-sand transition-colors',
                inq.id === selectedId && 'bg-primary/5 border-l-2 border-l-primary'
              )}
            >
              {/* Thumbnail */}
              {inq.listing.coverImageUrl ? (
                <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                  <Image src={inq.listing.coverImageUrl} alt="" fill className="object-cover" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-sand flex items-center justify-center flex-shrink-0 text-lg">🎪</div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-charcoal truncate">{inq.listing.title}</p>
                <p className="text-xs text-stone-warm truncate">{other}</p>
                {inq.lastMessage && (
                  <p className="text-xs text-stone-warm truncate mt-0.5">{inq.lastMessage}</p>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </aside>
  )
}