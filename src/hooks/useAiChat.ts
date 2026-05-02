/**
 * useAiChat — drives one live chat session with the backend AI agent.
 *
 * Owns:
 *   - the conversation messages (user + assistant turns + tool-call status)
 *   - the conversationId (minted server-side on first turn, echoed back after)
 *   - in-flight `thinking` flag
 *   - latest error
 *   - the language switcher state (initially EN, user can override)
 *
 * Consumers (e.g. the production AgentChat panel) just call `send(text)` and
 * render `messages` + `thinking`.
 *
 * Network behaviour: one POST /api/v1/ai/chat per send; non-streaming for now
 * (Phase 2 keeps it simple). The hook shows the user's bubble immediately,
 * then a thinking bubble until the response lands, then swaps in the
 * assistant's reply with any tool-call pills + cards.
 */

import { useCallback, useRef, useState } from 'react'
import {
  sendAiMessage,
  type AiCard,
  type AiLanguage,
  type AiToolCall,
} from '@/lib/aiClient'
import type { Card, Message } from '@/showcase/ai/types'

type Status = 'idle' | 'thinking' | 'error'

type UseAiChatResult = {
  messages: Message[]
  status: Status
  thinking: boolean
  error: string | null
  language: AiLanguage
  setLanguage: (lang: AiLanguage) => void
  conversationId: string | null
  send: (text: string) => Promise<void>
  reset: () => void
}

let nextLocalId = 1
const localId = (prefix: string) => `${prefix}-${Date.now()}-${nextLocalId++}`

const formatTimestamp = (d: Date) =>
  d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

export function useAiChat(initialLanguage: AiLanguage = 'EN'): UseAiChatResult {
  const [messages,        setMessages]       = useState<Message[]>([])
  const [status,          setStatus]         = useState<Status>('idle')
  const [error,           setError]          = useState<string | null>(null)
  const [language,        setLanguage]       = useState<AiLanguage>(initialLanguage)
  const [conversationId,  setConversationId] = useState<string | null>(null)

  // Stable ref so concurrent sends don't race the closure
  const conversationIdRef = useRef<string | null>(null)
  conversationIdRef.current = conversationId

  const reset = useCallback(() => {
    setMessages([])
    setStatus('idle')
    setError(null)
    setConversationId(null)
    conversationIdRef.current = null
  }, [])

  const send = useCallback(async (rawText: string) => {
    const text = rawText.trim()
    if (!text) return

    // Optimistically append the user's bubble
    const userMsg: Message = {
      id: localId('u'),
      role: 'user',
      text,
      timestamp: formatTimestamp(new Date()),
    }
    setMessages(prev => [...prev, userMsg])
    setStatus('thinking')
    setError(null)

    try {
      const res = await sendAiMessage({
        conversationId: conversationIdRef.current ?? undefined,
        message: text,
        language,
      })

      // Persist the conversation id from the first turn
      if (!conversationIdRef.current) {
        conversationIdRef.current = res.conversationId
        setConversationId(res.conversationId)
      }

      // Sync the language to whatever the backend actually used —
      // matters when we auto-detected and user hadn't picked one.
      if (res.language && res.language !== language) {
        setLanguage(res.language)
      }

      const assistantMsg: Message = {
        id: localId('a'),
        role: 'assistant',
        text: res.reply,
        timestamp: formatTimestamp(new Date()),
        toolCalls: res.toolCalls?.length
          ? res.toolCalls.map<Required<Pick<AiToolCall, 'name' | 'status'>> & AiToolCall & { id: string }>(t => ({
              id: localId('t'),
              ...t,
            }))
          : undefined,
        cards: res.cards?.length ? mapCards(res.cards) : undefined,
        // Surface what was redacted so the UI can show the privacy reveal
        redactedFromUser: res.redactionsApplied?.length
          ? `${res.redactionsApplied.length} item(s) redacted before send: ${res.redactionsApplied.join(', ')}`
          : undefined,
      }
      setMessages(prev => [...prev, assistantMsg])
      setStatus('idle')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
                ?? (err as Error)?.message
                ?? 'Something went wrong. Try again.'
      setError(msg)
      setStatus('error')
      // Append an inline error bubble so the user sees what happened
      setMessages(prev => [...prev, {
        id: localId('a'),
        role: 'assistant',
        text: `⚠️ ${msg}`,
        timestamp: formatTimestamp(new Date()),
      }])
    }
  }, [language])

  return {
    messages,
    status,
    thinking: status === 'thinking',
    error,
    language,
    setLanguage,
    conversationId,
    send,
    reset,
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────

/**
 * Maps the wire `AiCard[]` (kind + free-form data) into the typed Card union
 * the UI components expect. Unknown kinds are dropped silently — better than
 * blowing up the chat over a backend rev mismatch.
 */
function mapCards(cards: AiCard[]): Card[] {
  const known = new Set(['planner_recommendation', 'message_draft', 'calendar_block'])
  return cards
    .filter(c => known.has(c.kind))
    // Trust the contract: backend serialises a CardDto whose `data` matches
    // the kind. The runtime shape mirrors the showcase Card union.
    .map(c => ({ kind: c.kind, ...c.data } as unknown as Card))
}
