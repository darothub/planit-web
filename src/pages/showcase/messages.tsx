/**
 * Showcase: Messages
 *
 * Does NOT use MessagesPage directly. InquiryList (used internally by MessagesPage)
 * links to /messages/[id] — navigating outside the showcase and losing auth.
 * Instead, this page composes the same UI using sub-components and routes to
 * /showcase/messages?inquiryId=X so navigation stays within the showcase.
 */
import { useState } from 'react'
import { useRouter } from 'next/router'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import Navbar from '@/components/layout/Navbar'
import ChatWindow from '@/components/messages/ChatWindow'
import InquiryList from '@/components/messages/InquiryList'
import BookNowModal from '@/components/bookings/BookNowModal'
import ShowcaseShell from '@/showcase/ShowcaseShell'
import {
  DEMO_INQUIRIES_CLIENT,
  DEMO_MESSAGES,
  DEMO_CLIENT_USER,
} from '@/showcase/data'
import { InquiryResponse } from '@/lib/types'
import { formatShortDate, getListingGradient } from '@/lib/utils'
import { cn } from '@/lib/utils'

export const getServerSideProps = () => {
  if (process.env.NODE_ENV === 'production') return { notFound: true }
  return { props: {} }
}

function MessagesContent() {
  const router = useRouter()
  const inquiryId = router.query.inquiryId ? Number(router.query.inquiryId) : null
  const currentInquiry: InquiryResponse | null =
    DEMO_INQUIRIES_CLIENT.find(i => i.id === inquiryId) ?? null
  const [showBookNow, setShowBookNow] = useState(false)

  const hasConversation = inquiryId !== null
  const canBook = currentInquiry?.status === 'ACTIVE'

  const chatHeader = currentInquiry && (
    <div className="flex items-center gap-3">
      {/* Back button — mobile only */}
      <button
        onClick={() => router.push('/showcase/messages')}
        className="md:hidden -ml-1 p-1 rounded-lg hover:bg-sand transition-colors flex-shrink-0"
        aria-label="Back to inbox"
      >
        <ChevronLeftIcon className="w-5 h-5 text-charcoal" />
      </button>

      {/* Listing thumbnail */}
      <div
        className="relative w-9 h-9 rounded-lg flex-shrink-0 overflow-hidden hidden sm:block"
        style={{ background: getListingGradient(currentInquiry.listing.id) }}
      />

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-charcoal text-sm leading-tight truncate">
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

      {canBook && (
        <button
          onClick={() => setShowBookNow(true)}
          className="shrink-0 px-4 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-btn transition-colors"
        >
          Book Now
        </button>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-sand flex flex-col">
      <Navbar />
      <div
        className="flex-1 flex max-w-7xl mx-auto w-full px-4 py-4 gap-4 min-h-0"
        style={{ height: 'calc(100vh - 64px)' }}
      >
        <InquiryList
          inquiries={DEMO_INQUIRIES_CLIENT}
          selectedId={inquiryId ?? -1}
          role="CLIENT"
          makeHref={id => `/showcase/messages?inquiryId=${id}`}
          className={hasConversation ? 'hidden md:flex' : 'flex'}
        />

        {hasConversation ? (
          <ChatWindow
            messages={DEMO_MESSAGES}
            currentUserId={DEMO_CLIENT_USER.userId}
            onSend={() => {}}
            connected={false}
            header={chatHeader}
          />
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-white rounded-2xl border border-cream shadow-card">
            <div className="text-center">
              <p className="text-4xl mb-3">💬</p>
              <p className="text-stone-warm text-sm">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {showBookNow && currentInquiry && (
        <BookNowModal
          inquiry={currentInquiry}
          onClose={() => setShowBookNow(false)}
        />
      )}
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
