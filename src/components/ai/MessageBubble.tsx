/**
 * MessageBubble — renders a single chat message with the right alignment,
 * background, and any attached tool-call status pills + result cards.
 *
 * Markdown-lite: we render **bold** sequences as <strong> and split paragraphs
 * on blank lines. Real markdown isn't worth a dependency for an MVP chat UI;
 * if we end up needing tables, code, or links, swap in `react-markdown`.
 */

import type { Message, Card } from '@/showcase/ai/types'
import ToolCallList from './ToolCallCard'
import PlannerRecommendationCard from './PlannerRecommendationCard'
import MessageDraftCard from './MessageDraftCard'
import PrivacyBadge from './PrivacyBadge'
import { cn } from '@/lib/utils'

export default function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex gap-2', isUser ? 'justify-end' : 'justify-start')}>
      {/* Avatar (assistant only) */}
      {!isUser && (
        <div
          aria-hidden
          className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center mt-0.5"
        >
          AI
        </div>
      )}

      <div className={cn('flex flex-col gap-1.5 min-w-0', isUser ? 'items-end max-w-[80%]' : 'items-start max-w-[85%]')}>
        {/* Tool calls (assistant) */}
        {!isUser && message.role === 'assistant' && message.toolCalls && message.toolCalls.length > 0 && (
          <ToolCallList calls={message.toolCalls} />
        )}

        {/* Text bubble */}
        {message.text && (
          <div
            className={cn(
              'px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line',
              isUser
                ? 'bg-primary text-white rounded-br-md'
                : 'bg-cream text-charcoal rounded-bl-md',
            )}
          >
            <RenderInline text={message.text} />
          </div>
        )}

        {/* Privacy redaction reveal (assistant only, when present) */}
        {!isUser && message.role === 'assistant' && message.redactedFromUser && (
          <details className="text-xs text-stone-warm">
            <summary className="cursor-pointer flex items-center gap-1 hover:text-charcoal">
              <PrivacyBadge /> See what was sent to the AI
            </summary>
            <div className="mt-1.5 px-3 py-2 rounded-lg bg-sand border border-cream font-mono text-[11px] leading-relaxed">
              {message.redactedFromUser}
            </div>
          </details>
        )}

        {/* Result cards (assistant) */}
        {!isUser && message.role === 'assistant' && message.cards && message.cards.length > 0 && (
          <div className="flex flex-col gap-2 w-full">
            {message.cards.map((c, i) => <RenderCard key={i} card={c} />)}
          </div>
        )}

        {/* Timestamp */}
        <span className={cn('text-[10px] text-stone-warm', isUser ? 'pr-1' : 'pl-1')}>
          {message.timestamp}
        </span>
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function RenderCard({ card }: { card: Card }) {
  switch (card.kind) {
    case 'planner_recommendation': return <PlannerRecommendationCard card={card} />
    case 'message_draft':          return <MessageDraftCard card={card} />
    case 'calendar_block':         return null   // not used in Phase 1 showcase
    default:                       return null
  }
}

/**
 * Lightweight inline renderer: turns **bold** into <strong>.
 * Splits on `**` and bolds every other chunk, which is the standard
 * markdown convention. Blank-line paragraphs are preserved by the parent's
 * `whitespace-pre-line`.
 */
function RenderInline({ text }: { text: string }) {
  const parts = text.split('**')
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>,
      )}
    </>
  )
}
