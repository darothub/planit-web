import Link from 'next/link'
import Image from 'next/image'
import { InquiryResponse, UserRole } from '@/lib/types'
import { cn, getListingGradient, formatRelativeTime } from '@/lib/utils'

type Props = {
  inquiries: InquiryResponse[]
  selectedId: number
  role: UserRole
  className?: string
  makeHref?: (id: number) => string
}

const STATUS_DOT: Record<string, string> = {
  ACTIVE:  'bg-green-500',
  PENDING: 'bg-amber-400',
  CLOSED:  'bg-stone-300',
}

export default function InquiryList({ inquiries, selectedId, role, className, makeHref }: Props) {
  const href = makeHref ?? ((id: number) => `/messages/${id}`)

  return (
    <aside className={cn(
      'flex-col w-full md:w-72 flex-shrink-0 bg-white rounded-2xl border border-cream shadow-card overflow-hidden',
      className ?? 'hidden md:flex',
    )}>
      <div className="px-4 py-3.5 border-b border-cream flex items-center justify-between">
        <h2 className="font-semibold text-charcoal text-sm">Messages</h2>
        {inquiries.length > 0 && (
          <span className="text-xs text-stone-warm">{inquiries.length}</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {inquiries.length === 0 && (
          <p className="text-stone-warm text-sm text-center py-8 px-4">No conversations yet.</p>
        )}
        {inquiries.map(inq => {
          const other = role === 'CLIENT'
            ? (inq.planner.businessName ?? 'Planner')
            : `${inq.client.firstName} ${inq.client.lastName}`
          const dot = STATUS_DOT[inq.status] ?? 'bg-stone-300'

          return (
            <Link
              key={inq.id}
              href={href(inq.id)}
              className={cn(
                'flex gap-3 px-4 py-3.5 border-b border-cream hover:bg-sand transition-colors',
                inq.id === selectedId && 'bg-primary/5 border-l-2 border-l-primary',
              )}
            >
              {/* Thumbnail — gradient always as background */}
              <div
                className="relative w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden"
                style={{ background: getListingGradient(inq.listing.id) }}
              >
                {inq.listing.coverImageUrl && (
                  <Image
                    src={inq.listing.coverImageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-sm font-semibold text-charcoal truncate">{inq.listing.title}</p>
                  <span className="text-[11px] text-stone-warm flex-shrink-0">
                    {formatRelativeTime(inq.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dot)} />
                  <p className="text-xs text-stone-warm truncate">{other}</p>
                </div>
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
