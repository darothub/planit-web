# Page 07 — Messages / Chat (`/messages/[inquiryId]`)

> **Goal:** Real-time chat between client and planner on an inquiry thread.
> Messages appear instantly without page refresh using STOMP/WebSocket.

**Status:** ⬜ Not started
**Depends on:** Page 04 Auth (must be logged in), Page 05/06 Dashboard

---

## Next.js Concept — WebSocket + STOMP
*This page uses real-time communication, not standard HTTP fetch*

The backend exposes a STOMP over WebSocket endpoint:
```
Connect:    ws://localhost:8081/ws
Subscribe:  /user/queue/inquiry/{inquiryId}/messages
Publish to: /app/inquiry/{inquiryId}/send
```

The STOMP auth works by sending the JWT in the CONNECT frame headers.

Install the STOMP client library:
```bash
npm install @stomp/stompjs sockjs-client
npm install -D @types/sockjs-client
```

---

## Wireframe

```
┌─────────────────────────────────────────────────────────┐
│  NAVBAR                                                 │
├──────────────┬──────────────────────────────────────────┤
│              │  Elegant Garden Ceremonies               │
│  INBOX       │  (inquiry for event: Jun 15 · Lisbon)    │
│              ├──────────────────────────────────────────┤
│  [Thread 1]  │                                          │
│  [Thread 2]  │  10:30  Hi, I'm interested in...        │
│  [Thread 3]  │                                          │
│              │           Thanks for reaching out!  10:32│
│              │                                          │
│              │  10:45  Can we discuss pricing?          │
│              │                                          │
│              ├──────────────────────────────────────────┤
│              │  [Type a message...          ] [Send →]  │
└──────────────┴──────────────────────────────────────────┘
```

---

## Components Needed

| Component | Path | Notes |
|---|---|---|
| `ChatWindow` | `components/messages/ChatWindow.tsx` | Main chat area |
| `MessageBubble` | `components/messages/MessageBubble.tsx` | Single message |
| `MessageInput` | `components/messages/MessageInput.tsx` | Text input + send button |
| `InquiryList` | `components/messages/InquiryList.tsx` | Left panel thread list |
| `useStompChat` | `hooks/useStompChat.ts` | WebSocket connection hook |

---

## API Calls

```ts
// Load existing messages
GET /inquiries/{id}/messages  → ApiResponse<InquiryMessageResponse[]>

// Send via HTTP (fallback or on first load)
POST /inquiries/{id}/messages  Body: { content, clientMsgId? }

// Real-time via STOMP (preferred for subsequent messages)
SUBSCRIBE /user/queue/inquiry/{inquiryId}/messages
PUBLISH   /app/inquiry/{inquiryId}/send  Body: { content, clientMsgId }
```

---

## Step-by-Step Build

### Step 1 — STOMP Hook

This is the core of real-time chat. Create a custom hook that:
1. Connects to the WebSocket on mount
2. Subscribes to the inquiry's message queue
3. Appends incoming messages to local state
4. Exposes a `sendMessage` function
5. Cleans up on unmount

```ts
// src/hooks/useStompChat.ts
import { useEffect, useRef, useState, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { InquiryMessageResponse } from '@/lib/types'
import Cookies from 'js-cookie'

export function useStompChat(inquiryId: number) {
  const [messages, setMessages] = useState<InquiryMessageResponse[]>([])
  const [connected, setConnected] = useState(false)
  const clientRef = useRef<Client | null>(null)

  useEffect(() => {
    const token = Cookies.get('planit_token')
    if (!token) return

    const stompClient = new Client({
      // SockJS is needed because browsers block raw WebSockets to some servers
      webSocketFactory: () =>
        new SockJS(`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}/ws`),

      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      onConnect: () => {
        setConnected(true)

        // Subscribe to this inquiry's message queue
        stompClient.subscribe(
          `/user/queue/inquiry/${inquiryId}/messages`,
          (frame) => {
            const msg: InquiryMessageResponse = JSON.parse(frame.body)
            setMessages(prev => {
              // Deduplicate by clientMsgId (echoes from our own sends)
              if (msg.clientMsgId && prev.some(m => m.clientMsgId === msg.clientMsgId)) {
                return prev
              }
              return [...prev, msg]
            })
          }
        )
      },

      onDisconnect: () => setConnected(false),

      // Reconnect automatically if connection drops
      reconnectDelay: 5000,
    })

    stompClient.activate()
    clientRef.current = stompClient

    // Cleanup on unmount or when inquiryId changes
    return () => {
      stompClient.deactivate()
    }
  }, [inquiryId])

  const sendMessage = useCallback((content: string) => {
    if (!clientRef.current?.connected) return

    const clientMsgId = crypto.randomUUID()

    // Optimistic update — show message immediately before server confirms
    setMessages(prev => [...prev, {
      id: -1,           // temporary ID
      content,
      sentAt: new Date().toISOString(),
      senderId: 0,      // will be replaced by server echo
      senderName: 'You',
      senderRole: 'CLIENT',
      clientMsgId,
    }])

    clientRef.current.publish({
      destination: `/app/inquiry/${inquiryId}/send`,
      body: JSON.stringify({ content, clientMsgId }),
    })
  }, [inquiryId])

  return { messages, setMessages, connected, sendMessage }
}
```

### Step 2 — Page file

```tsx
// src/pages/messages/[inquiryId].tsx
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useStompChat } from '@/hooks/useStompChat'
import { useAuthStore } from '@/store/authStore'
import ChatWindow from '@/components/messages/ChatWindow'
import InquiryList from '@/components/messages/InquiryList'
import Navbar from '@/components/layout/Navbar'

export default function MessagesPage() {
  const router = useRouter()
  const inquiryId = Number(router.query.inquiryId)
  const { token, user } = useAuthStore()

  // Redirect if not logged in
  useEffect(() => {
    if (!token) router.replace('/auth/login')
  }, [token, router])

  // Load inquiry list for sidebar
  const inboxEndpoint = user?.role === 'CLIENT' ? '/inquiries/my' : '/inquiries/received'
  const { data: inquiries } = useQuery({
    queryKey: ['inquiries', user?.role],
    queryFn: () => api.get(inboxEndpoint).then(r => r.data.data),
    enabled: !!user,
  })

  // Load existing message history
  const { data: history } = useQuery({
    queryKey: ['messages', inquiryId],
    queryFn: () =>
      api.get(`/inquiries/${inquiryId}/messages`).then(r => r.data.data),
    enabled: !!inquiryId,
  })

  // Connect STOMP and get real-time messages
  const { messages, setMessages, connected, sendMessage } = useStompChat(inquiryId)

  // Merge history into STOMP messages on load
  useEffect(() => {
    if (history) setMessages(history)
  }, [history])

  if (!token || !user) return null

  return (
    <div className="min-h-screen bg-sand flex flex-col">
      <Navbar />
      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 py-4 gap-4">
        <InquiryList inquiries={inquiries} selectedId={inquiryId} />
        <ChatWindow
          messages={messages}
          currentUserId={user.id}
          onSend={sendMessage}
          connected={connected}
        />
      </div>
    </div>
  )
}
```

### Step 3 — ChatWindow

```tsx
// src/components/messages/ChatWindow.tsx
import { useEffect, useRef } from 'react'
import { InquiryMessageResponse } from '@/lib/types'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'

type Props = {
  messages: InquiryMessageResponse[]
  currentUserId: number
  onSend: (content: string) => void
  connected: boolean
}

export default function ChatWindow({ messages, currentUserId, onSend, connected }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex-1 flex flex-col bg-parchment rounded-card shadow-card overflow-hidden">
      {/* Connection status */}
      {!connected && (
        <div className="bg-yellow-50 text-yellow-700 text-xs text-center py-1">
          Connecting...
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
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
      <MessageInput onSend={onSend} disabled={!connected} />
    </div>
  )
}
```

### Step 4 — MessageBubble

```tsx
// src/components/messages/MessageBubble.tsx
import { InquiryMessageResponse } from '@/lib/types'
import { formatDate } from '@/lib/utils'

type Props = {
  message: InquiryMessageResponse
  isMine: boolean
}

export default function MessageBubble({ message, isMine }: Props) {
  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        {/* Sender name for others' messages */}
        {!isMine && (
          <span className="text-xs text-stone-warm font-medium">{message.senderName}</span>
        )}

        {/* Bubble */}
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isMine
            ? 'bg-primary text-white rounded-br-sm'
            : 'bg-white text-charcoal rounded-bl-sm shadow-sm'
        }`}>
          {message.content}
        </div>

        {/* Timestamp */}
        <span className="text-xs text-stone-warm">
          {new Date(message.sentAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  )
}
```

### Step 5 — MessageInput

```tsx
// src/components/messages/MessageInput.tsx
import { useState, KeyboardEvent } from 'react'

type Props = { onSend: (content: string) => void; disabled: boolean }

export default function MessageInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState('')

  const send = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="p-4 border-t border-cream flex gap-3">
      <textarea
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
        className="flex-1 resize-none rounded-btn border border-cream px-4 py-2.5
          text-sm focus:outline-none focus:ring-2 focus:ring-primary
          disabled:opacity-50 max-h-32"
        rows={1}
      />
      <button
        onClick={send}
        disabled={disabled || !value.trim()}
        className="bg-primary hover:bg-primary-hover text-white font-semibold
          px-5 rounded-btn transition-colors disabled:opacity-50"
      >
        Send
      </button>
    </div>
  )
}
```

---

## Done Checklist

- [ ] `npm install @stomp/stompjs sockjs-client` done
- [ ] `useStompChat` hook with connect, subscribe, optimistic send, cleanup
- [ ] Message history loaded from `GET /inquiries/{id}/messages` on mount
- [ ] STOMP messages merged with history (no duplicates via clientMsgId)
- [ ] Auto-scroll to bottom on new messages
- [ ] `ChatWindow` with message list and input
- [ ] `MessageBubble` — mine (terracotta right) vs theirs (white left)
- [ ] `MessageInput` — Enter sends, Shift+Enter newline
- [ ] `InquiryList` sidebar — shows all threads, highlights current
- [ ] Protected — redirect to login if unauthenticated
- [ ] Connection status indicator
- [ ] Update status in `FRONTEND_PLAN.md`