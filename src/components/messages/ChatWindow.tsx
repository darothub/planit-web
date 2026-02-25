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

export default function ChatWindow({ messages, currentUserId, onSend, connected, header }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex-1 flex flex-col bg-white rounded-2xl border border-cream shadow-card overflow-hidden min-h-0">
      {/* Header */}
      {header && (
        <div className="px-5 py-3.5 border-b border-cream bg-parchment flex-shrink-0">
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
        {messages.map((msg, i) => (
          <MessageBubble
            key={msg.clientMsgId ?? msg.id ?? i}
            message={msg}
            isMine={msg.senderId === currentUserId}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0">
        <MessageInput onSend={onSend} disabled={!connected} />
      </div>
    </div>
  )
}
