/**
 * AgentChatLauncher — production wrapper for the AI agent.
 *
 * Renders a floating "Ask Planit" button bottom-right; clicking opens the
 * AgentChat panel. State is intentionally local — open/closed, message
 * history, conversation id all stay in this component, so navigation
 * between pages doesn't lose the conversation.
 *
 * Visibility rules:
 *   - Hidden until the auth store has hydrated (avoids SSR mismatch)
 *   - Hidden when no user is signed in (the backend requires JWT)
 *   - Audience derived from the user's role: CLIENT or PLANNER → that
 *     audience; ADMIN → CLIENT (admins generally chat in client mode)
 */

import { useEffect, useState } from 'react'
import { SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useAuthStore } from '@/store/authStore'
import AgentChat from './AgentChat'
import { useAiChat } from '@/hooks/useAiChat'
import { SUGGESTED_PROMPTS } from '@/showcase/ai/data'
import type { Audience, Message } from '@/showcase/ai/types'
import { GREETINGS } from '@/showcase/ai/data'

export default function AgentChatLauncher() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Avoid SSR / hydration mismatch — only mount after the auth store has
  // hydrated from localStorage.
  useEffect(() => { setMounted(true) }, [])

  const user = useAuthStore(s => s.user)
  const hasHydrated = useAuthStore(s => s._hasHydrated)

  const audience: Audience = user?.role === 'PLANNER' ? 'PLANNER' : 'CLIENT'
  const chat = useAiChat()

  if (!mounted || !hasHydrated || !user) return null

  // Show a static greeting message when the conversation is empty so the
  // panel never opens to a blank scroll area.
  const greeting: Message = {
    id: 'greeting',
    role: 'assistant',
    text: GREETINGS[audience][chat.language],
    timestamp: '',
  }
  const displayMessages = chat.messages.length > 0 ? chat.messages : [greeting]

  return (
    <>
      {/* Floating launcher — hidden when the panel is open */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open Planit assistant"
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-primary text-white shadow-lg hover:opacity-90 hover:scale-105 transition-all"
        >
          <SparklesIcon className="h-5 w-5" aria-hidden />
          <span className="text-sm font-semibold hidden sm:inline">
            {audience === 'CLIENT' ? 'Ask Planit' : 'Planit Assistant'}
          </span>
        </button>
      )}

      {/* Panel — bottom-right anchored, slides up */}
      {open && (
        <div className="fixed bottom-5 right-5 z-40 max-w-[calc(100vw-40px)]">
          <AgentChat
            audience={audience}
            messages={displayMessages}
            language={chat.language}
            onLanguageChange={chat.setLanguage}
            onSend={chat.send}
            suggestedPrompts={chat.messages.length === 0 ? SUGGESTED_PROMPTS[audience] : []}
            onClose={() => setOpen(false)}
            mode="panel"
            thinking={chat.thinking}
          />
          {/* Reset link below the panel — small, subtle, easy to ignore */}
          {chat.messages.length > 0 && (
            <div className="text-right mt-1.5 pr-2">
              <button
                type="button"
                onClick={chat.reset}
                className="text-xs text-stone-warm hover:text-charcoal underline underline-offset-2"
              >
                Start a new chat
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
