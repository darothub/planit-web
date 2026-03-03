/**
 * Showcase: Messages
 *
 * Does NOT use MessagesPage directly. InquiryList (used internally by MessagesPage)
 * links to /messages/[id] — navigating outside the showcase and losing auth.
 * Instead, this page composes the same UI using sub-components and routes to
 * /showcase/messages?inquiryId=X so navigation stays within the showcase.
 */
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import ChatWindow from '@/components/messages/ChatWindow'
import ShowcaseShell from '@/showcase/ShowcaseShell'
import {
  DEMO_INQUIRIES_CLIENT,
  DEMO_MESSAGES,
  DEMO_CLIENT_USER,
} from '@/showcase/data'
import { InquiryResponse } from '@/lib/types'
import { formatShortDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

export const getServerSideProps = () => {
  if (process.env.NODE_ENV === 'production') return { notFound: true }
  return { props: {} }
}

function ShowcaseInquiryList({
  inquiries,
  selectedId,
}: {
  inquiries: InquiryResponse[]
  selectedId: number | null
}) {
  return (
    <aside className="hidden md:flex flex-col w-72 flex-shrink-0 bg-white rounded-2xl border border-cream shadow-card overflow-hidden">
      <div className="px-4 py-3.5 border-b border-cream">
        <h2 className="font-semibold text-charcoal text-sm">Messages</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {inquiries.map(inq => {
          const other = inq.planner.businessName ?? 'Planner'
          return (
            // Link stays within the showcase — avoids /messages/[id] redirect-to-login
            <Link
              key={inq.id}
              href={`/showcase/messages?inquiryId=${inq.id}`}
              scroll={false}
              shallow
              className={cn(
                'flex gap-3 px-4 py-3.5 border-b border-cream hover:bg-sand transition-colors',
                inq.id === selectedId && 'bg-primary/5 border-l-2 border-l-primary'
              )}
            >
              <div className="w-10 h-10 rounded-lg bg-sand flex items-center justify-center flex-shrink-0 text-lg">
                🎪
              </div>
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

function MessagesContent() {
  const router = useRouter()
  const inquiryId = router.query.inquiryId ? Number(router.query.inquiryId) : null
  const currentInquiry = DEMO_INQUIRIES_CLIENT.find(i => i.id === inquiryId) ?? null

  const chatHeader = currentInquiry && (
    <div>
      <p className="font-semibold text-charcoal text-sm leading-tight">
        {currentInquiry.listing.title}
      </p>
      <p className="text-xs text-stone-warm mt-0.5">
        📅 {formatShortDate(currentInquiry.eventDate)} · 📍 {currentInquiry.eventLocation}
        {' · '}
        <span className={cn(
          'font-medium',
          currentInquiry.status === 'ACTIVE'  ? 'text-green-700' :
          currentInquiry.status === 'CLOSED'  ? 'text-stone-warm' :
          'text-yellow-700'
        )}>
          {currentInquiry.status}
        </span>
      </p>
    </div>
  )

  return (
    <div className="min-h-screen bg-sand flex flex-col">
      <Navbar />
      <div
        className="flex-1 flex max-w-7xl mx-auto w-full px-4 py-4 gap-4 min-h-0"
        style={{ height: 'calc(100vh - 64px)' }}
      >
        <ShowcaseInquiryList
          inquiries={DEMO_INQUIRIES_CLIENT}
          selectedId={inquiryId}
        />

        {inquiryId !== null ? (
          <ChatWindow
            messages={DEMO_MESSAGES}
            currentUserId={DEMO_CLIENT_USER.userId}
            onSend={() => {}}
            connected={false}
            header={chatHeader}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white rounded-2xl border border-cream shadow-card">
            <div className="text-center">
              <p className="text-4xl mb-3">💬</p>
              <p className="text-stone-warm text-sm">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ShowcaseMessages() {
  return (
    <ShowcaseShell pageName="Messages" demoRole="CLIENT">
      <MessagesContent />
    </ShowcaseShell>
  )
}
