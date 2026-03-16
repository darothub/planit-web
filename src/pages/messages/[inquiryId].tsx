import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { InquiryResponse, InquiryMessageResponse } from '@/lib/types'
import { useStompChat } from '@/hooks/useStompChat'
import Navbar from '@/components/layout/Navbar'
import ChatWindow from '@/components/messages/ChatWindow'
import InquiryList from '@/components/messages/InquiryList'
import BookNowModal from '@/components/bookings/BookNowModal'
import { formatShortDate, getListingGradient } from '@/lib/utils'
import { DEMO_INQUIRIES_CLIENT, DEMO_INQUIRIES_RECEIVED, DEMO_MESSAGES } from '@/showcase/data'

export default function MessagesPage() {
  const router = useRouter()
  const { token, user } = useAuthStore()
  const inquiryId = Number(router.query.inquiryId)

  const [showBookNow, setShowBookNow] = useState(false)

  useEffect(() => {
    if (!token) router.replace('/auth/login')
  }, [token, router])

  const isPlanner = user?.role === 'PLANNER'
  const inboxEndpoint = isPlanner ? '/inquiries/received' : '/inquiries/my'
  const DEMO_INQUIRIES = isPlanner ? DEMO_INQUIRIES_RECEIVED : DEMO_INQUIRIES_CLIENT

  const { data: inquiries = DEMO_INQUIRIES } = useQuery<InquiryResponse[]>({
    queryKey: ['inquiries-inbox', user?.role],
    queryFn: () => api.get(inboxEndpoint).then(r => r.data.data),
    enabled: !!user,
    placeholderData: DEMO_INQUIRIES,
    retry: false,
  })

  const { data: history } = useQuery<InquiryMessageResponse[]>({
    queryKey: ['messages', inquiryId],
    queryFn: () => api.get(`/inquiries/${inquiryId}/messages`).then(r => r.data.data),
    enabled: !!inquiryId && !isNaN(inquiryId),
    placeholderData: DEMO_MESSAGES,
    retry: false,
  })

  const { messages, setMessages, connected, sendMessage } = useStompChat(inquiryId)

  useEffect(() => {
    if (history) setMessages(history)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history])

  const currentInquiry = inquiries.find(i => i.id === inquiryId)
  const canBook = !isPlanner && currentInquiry?.status === 'ACTIVE'
  const hasConversation = !!inquiryId && !isNaN(inquiryId)

  if (!token || !user) return null

  const chatHeader = currentInquiry && (
    <div className="flex items-center gap-3">
      {/* Back button — mobile only */}
      <button
        onClick={() => router.push('/messages')}
        className="md:hidden -ml-1 p-1 rounded-lg hover:bg-sand transition-colors flex-shrink-0"
        aria-label="Back to inbox"
      >
        <ChevronLeftIcon className="w-5 h-5 text-charcoal" />
      </button>

      {/* Listing thumbnail */}
      <div
        className="relative w-9 h-9 rounded-lg flex-shrink-0 overflow-hidden hidden sm:block"
        style={{ background: getListingGradient(currentInquiry.listing.id) }}
      >
        {currentInquiry.listing.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentInquiry.listing.coverImageUrl}
            alt=""
            className="w-full h-full object-cover"
            onError={e => { e.currentTarget.style.display = 'none' }}
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-charcoal text-sm leading-tight truncate">
          {currentInquiry.listing.title}
        </p>
        <p className="text-xs text-stone-warm mt-0.5">
          📅 {formatShortDate(currentInquiry.eventDate)} · 📍 {currentInquiry.eventLocation}
          {' · '}
          <span className={`font-medium ${
            currentInquiry.status === 'ACTIVE'  ? 'text-green-700' :
            currentInquiry.status === 'CLOSED'  ? 'text-stone-warm' :
            'text-yellow-700'
          }`}>
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

      <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 py-4 gap-4 min-h-0"
           style={{ height: 'calc(100vh - 64px)' }}>

        {/* Sidebar inbox — full-width on mobile when no conversation selected */}
        <InquiryList
          inquiries={inquiries}
          selectedId={inquiryId}
          role={user.role}
          className={hasConversation ? 'hidden md:flex' : 'flex'}
        />

        {/* Chat area — hidden on mobile when no conversation selected */}
        {hasConversation ? (
          <ChatWindow
            messages={messages}
            currentUserId={user.id}
            onSend={sendMessage}
            connected={connected}
            header={chatHeader}
          />
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-white rounded-2xl border border-cream shadow-card">
            <div className="text-center">
              <p className="text-4xl mb-3">💬</p>
              <p className="text-stone-warm text-sm">Select a conversation to start messaging</p>
              <Link href="/listings" className="inline-block mt-4 text-primary text-sm font-semibold hover:underline">
                Browse listings →
              </Link>
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
