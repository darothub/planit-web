import { useEffect, useRef, useState, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import Cookies from 'js-cookie'
import { InquiryMessageResponse } from '@/lib/types'

export function useStompChat(inquiryId: number) {
  const [messages, setMessages]   = useState<InquiryMessageResponse[]>([])
  const [connected, setConnected] = useState(false)
  const clientRef = useRef<Client | null>(null)

  useEffect(() => {
    if (!inquiryId) return
    const token = Cookies.get('planit_token')
    if (!token) return

    const wsBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') ?? ''

    const stompClient = new Client({
      webSocketFactory: () => new SockJS(`${wsBase}/ws`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,

      onConnect: () => {
        setConnected(true)
        stompClient.subscribe(
          `/user/queue/inquiry/${inquiryId}/messages`,
          (frame) => {
            const msg: InquiryMessageResponse = JSON.parse(frame.body)
            setMessages(prev => {
              // Drop echo of our own optimistic message
              if (msg.clientMsgId && prev.some(m => m.clientMsgId === msg.clientMsgId && m.id === -1)) {
                return prev.map(m => m.clientMsgId === msg.clientMsgId ? msg : m)
              }
              // Drop genuine duplicate
              if (msg.clientMsgId && prev.some(m => m.clientMsgId === msg.clientMsgId)) return prev
              return [...prev, msg]
            })
          }
        )
      },

      onDisconnect: () => setConnected(false),
    })

    stompClient.activate()
    clientRef.current = stompClient

    return () => { stompClient.deactivate() }
  }, [inquiryId])

  const sendMessage = useCallback((content: string) => {
    if (!clientRef.current?.connected) return
    const clientMsgId = crypto.randomUUID()

    // Optimistic bubble
    setMessages(prev => [...prev, {
      id: -1,
      content,
      sentAt: new Date().toISOString(),
      senderId: 0,
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
