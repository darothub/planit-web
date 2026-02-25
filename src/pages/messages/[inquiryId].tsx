import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { InquiryResponse, InquiryMessageResponse } from '@/lib/types'
import { useStompChat } from '@/hooks/useStompChat'
import Navbar from '@/components/layout/Navbar'
import ChatWindow from '@/components/messages/ChatWindow'
import InquiryList from '@/components/messages/InquiryList'
import { formatShortDate } from '@/lib/utils'

export default function MessagesPage() {
  const router = useRouter()
  const { token, user } = useAuthStore()
  const inquiryId = Number(router.query.inquiryId)

  useEffect(() => {
    if (!token) router.replace('/auth/login')
  }, [token, router])

  const isPlanner = user?.role === 'PLANNER'
  const inboxEndpoint = isPlanner ? '/inquiries/received' : '/inquiries/my'

  const { data: inquiries = [] } = useQuery<InquiryResponse[]>({
    queryKey: ['inquiries-inbox', user?.role],
    queryFn: () => api.get(inboxEndpoint).then(r => r.data.data),
    enabled: !!user,
    retry: false,
  })

  const { data: history } = useQuery<InquiryMessageResponse[]>({
    queryKey: ['messages', inquiryId],
    queryFn: () => api.get(`/inquiries/${inquiryId}/messages`).then(r => r.data.data),
    enabled: !!inquiryId && !isNaN(inquiryId),
    retry: false,
  })

  const { messages, setMessages, connected, sendMessage } = useStompChat(inquiryId)

  // Seed STOMP state with HTTP history once loaded
  useEffect(() => {
    if (history) setMessages(history)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history])

  const currentInquiry = inquiries.find(i => i.id === inquiryId)

  if (!token || !user) return null

  const chatHeader = currentInquiry && (
    <div>
      <p className="font-semibold text-charcoal text-sm leading-tight">
        {currentInquiry.listing.title}
      </p>
      <p className="text-xs text-stone-warm mt-0.5">
        📅 {formatShortDate(currentInquiry.eventDate)} · 📍 {currentInquiry.eventLocation}
        {' '}·{' '}
        <span className={`font-medium ${
          currentInquiry.status === 'ACTIVE'  ? 'text-green-700' :
          currentInquiry.status === 'CLOSED'  ? 'text-stone-warm' :
          'text-yellow-700'
        }`}>
          {currentInquiry.status}
        </span>
      </p>
    </div>
  )

  return (
    <div className="min-h-screen bg-sand flex flex-col">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 py-4 gap-4 min-h-0"
           style={{ height: 'calc(100vh - 64px)' }}>

        {/* Sidebar inbox */}
        <InquiryList
          inquiries={inquiries}
          selectedId={inquiryId}
          role={user.role}
        />

        {/* Chat area */}
        {inquiryId && !isNaN(inquiryId) ? (
          <ChatWindow
            messages={messages}
            currentUserId={user.id}
            onSend={sendMessage}
            connected={connected}
            header={chatHeader}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white rounded-2xl border border-cream shadow-card">
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
    </div>
  )
}
