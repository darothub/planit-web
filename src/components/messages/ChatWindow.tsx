import { useEffect, useRef } from 'react'
import { InquiryMessageResponse } from '@/lib/types'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'

type Props = {
  messages: InquiryMessageResponse[]
  currentUserId: number
  onSend: (content: string) => void
  connected: boolean
  header?: React.ReactNode
}

function dateSeparatorLabel(iso: string): string {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function ChatWindow({ messages, currentUserId, onSend, connected, header }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Build a flat list with date separators inserted
  type Item = { type: 'msg'; msg: InquiryMessageResponse } | { type: 'sep'; label: string }
  const items: Item[] = []
  let lastLabel = ''
  for (const msg of messages) {
    const label = dateSeparatorLabel(msg.sentAt)
    if (label !== lastLabel) {
      items.push({ type: 'sep', label })
      lastLabel = label
    }
    items.push({ type: 'msg', msg })
  }

  return (
    <div className="flex-1 flex flex-col bg-white rounded-2xl border border-cream shadow-card overflow-hidden min-h-0">
      {/* Header */}
      {header && (
        <div className="px-5 py-3.5 border-b border-cream bg-sand flex-shrink-0">
          {header}
        </div>
      )}

      {/* Connection banner */}
      {!connected && (
        <div className="bg-yellow-50 border-b border-yellow-100 text-yellow-700 text-xs text-center py-1.5 flex-shrink-0">
          Connecting to chat…
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
        {messages.length === 0 && (
          <p className="text-center text-stone-warm text-sm mt-8">
            No messages yet. Say hello!
          </p>
        )}
        {items.map((item, i) =>
          item.type === 'sep' ? (
            <div key={`sep-${i}`} className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-cream" />
              <span className="text-xs text-stone-warm font-medium">{item.label}</span>
              <div className="flex-1 h-px bg-cream" />
            </div>
          ) : (
            <MessageBubble
              key={item.msg.clientMsgId ?? item.msg.id ?? i}
              message={item.msg}
              isMine={item.msg.senderId === currentUserId}
            />
          )
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0">
        <MessageInput onSend={onSend} disabled={!connected} />
      </div>
    </div>
  )
}
