/**
 * AgentChat — the slide-up chat panel.
 *
 * Contract:
 *   - `messages`           controlled by parent (showcase passes mock messages,
 *                          production will pass live state from a store/hook)
 *   - `onSend`             called when the user hits send
 *   - `language`/`onLanguageChange`   wired to LanguageSwitcher
 *   - `suggestedPrompts`   shown as chips above the composer when messages.length === 0
 *   - `audience`           drives the header label (Concierge / Assistant)
 *   - `onClose`            optional dismiss button (not used on showcase fullscreen mode)
 *   - `mode`               'panel' (anchored bottom-right, ~400px) or 'embedded' (fills parent)
 *
 * Auto-scroll: bumps to the bottom whenever messages change.
 */

import { useEffect, useRef, useState } from 'react'
import { XMarkIcon, PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/outline'
import type { Audience, Language, Message, SuggestedPrompt } from '@/showcase/ai/types'
import LanguageSwitcher from './LanguageSwitcher'
import PrivacyBadge from './PrivacyBadge'
import MessageBubble from './MessageBubble'
import { cn } from '@/lib/utils'

type Props = {
  audience: Audience
  messages: Message[]
  language: Language
  onLanguageChange: (lang: Language) => void
  onSend: (text: string) => void
  suggestedPrompts?: SuggestedPrompt[]
  onClose?: () => void
  mode?: 'panel' | 'embedded'
  thinking?: boolean              // shows a typing indicator below the last message
}

const HEADER_LABEL: Record<Audience, string> = {
  CLIENT:  'Planit Concierge',
  PLANNER: 'Planit Assistant',
}

const HEADER_SUBTITLE: Record<Audience, string> = {
  CLIENT:  'Find the right planner — fast.',
  PLANNER: 'Drafts, calendar, summaries.',
}

export default function AgentChat({
  audience,
  messages,
  language,
  onLanguageChange,
  onSend,
  suggestedPrompts = [],
  onClose,
  mode = 'panel',
  thinking = false,
}: Props) {
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, thinking])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return
    onSend(trimmed)
    setInput('')
  }

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter to send, Shift+Enter for newline
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col bg-white border border-cream shadow-2xl overflow-hidden',
        mode === 'panel'
          ? 'rounded-2xl w-full max-w-md h-[640px] max-h-[90vh]'
          : 'rounded-2xl w-full h-full',
      )}
    >
      {/* ── Header ────────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 px-4 py-3 bg-charcoal text-white">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              aria-hidden
              className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center"
            >
              <SparklesIcon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight truncate">
                {HEADER_LABEL[audience]}
              </p>
              <p className="text-[11px] text-white/70 leading-tight truncate">
                {HEADER_SUBTITLE[audience]}
              </p>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close chat"
              className="flex-shrink-0 p-1 rounded-full hover:bg-white/10 text-white/80 hover:text-white"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Language switcher + privacy badge row */}
        <div className="mt-2.5 flex items-center justify-between gap-2 flex-wrap">
          <LanguageSwitcher value={language} onChange={onLanguageChange} />
          <PrivacyBadge />
        </div>
      </header>

      {/* ── Scroll area ───────────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-sand"
      >
        {messages.map(m => <MessageBubble key={m.id} message={m} />)}
        {thinking && <ThinkingBubble />}
      </div>

      {/* ── Suggested prompts (only when conversation is empty) ───────── */}
      {messages.length === 0 && suggestedPrompts.length > 0 && (
        <div className="flex-shrink-0 px-3 py-2 border-t border-cream bg-white">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-warm mb-2">
            Try asking
          </p>
          <div className="flex flex-wrap gap-1.5">
            {suggestedPrompts.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => onSend(p.text)}
                className="text-xs px-2.5 py-1.5 rounded-full bg-cream text-charcoal hover:bg-primary hover:text-white transition-colors text-left"
              >
                {p.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Composer ──────────────────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        className="flex-shrink-0 flex items-end gap-2 px-3 py-2.5 border-t border-cream bg-white"
      >
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask anything…"
          rows={1}
          className="flex-1 resize-none px-3 py-2 rounded-2xl border border-cream focus:border-primary focus:outline-none text-sm leading-relaxed max-h-32"
          aria-label="Message"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          aria-label="Send message"
          className={cn(
            'flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors',
            input.trim()
              ? 'bg-primary text-white hover:opacity-90'
              : 'bg-cream text-stone-warm cursor-not-allowed',
          )}
        >
          <PaperAirplaneIcon className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
}

// ─── Thinking bubble ──────────────────────────────────────────────────────

function ThinkingBubble() {
  return (
    <div className="flex gap-2 justify-start">
      <div
        aria-hidden
        className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center mt-0.5"
      >
        AI
      </div>
      <div className="px-3.5 py-3 rounded-2xl bg-cream rounded-bl-md">
        <span className="inline-flex gap-1" aria-label="Assistant is thinking">
          <Dot delay={0}   />
          <Dot delay={150} />
          <Dot delay={300} />
        </span>
      </div>
    </div>
  )
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="block w-1.5 h-1.5 rounded-full bg-stone-warm animate-bounce"
      style={{ animationDelay: `${delay}ms`, animationDuration: '900ms' }}
    />
  )
}
