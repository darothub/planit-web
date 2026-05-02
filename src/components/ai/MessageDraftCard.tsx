/**
 * MessageDraftCard — inline card for the planner-side scenario where the
 * agent drafted a reply to a client. The planner can:
 *   - "Use this reply"   → in production, would post to the inquiry thread
 *   - "Edit"             → in production, would open the composer pre-filled
 *
 * In the showcase both buttons just acknowledge with a toast-style state
 * change, since there's no inquiry thread to write to.
 */

import { useState } from 'react'
import { PencilSquareIcon, PaperAirplaneIcon, CheckIcon } from '@heroicons/react/24/outline'
import type { MessageDraftCard as Card } from '@/showcase/ai/types'
import { cn } from '@/lib/utils'

const TONE_LABELS: Record<Card['tone'], { icon: string; label: string }> = {
  warm:         { icon: '🤗', label: 'Warm' },
  professional: { icon: '💼', label: 'Professional' },
  apologetic:   { icon: '🙏', label: 'Apologetic' },
}

export default function MessageDraftCard({ card }: { card: Card }) {
  const [used, setUsed] = useState(false)
  const tone = TONE_LABELS[card.tone]

  return (
    <div className="rounded-xl bg-white border border-cream p-3.5 space-y-3">
      {/* Header: To + tone */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-warm">
            Reply to
          </p>
          <p className="text-sm font-semibold text-charcoal mt-0.5 truncate">
            {card.to}
          </p>
        </div>
        <span className="flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-cream text-stone-warm border border-cream font-medium">
          {tone.icon} {tone.label}
        </span>
      </div>

      {/* Context */}
      <p className="text-xs text-stone-warm italic border-l-2 border-cream pl-2">
        {card.context}
      </p>

      {/* Draft body */}
      <div className="rounded-lg bg-sand p-3 text-sm text-charcoal leading-relaxed whitespace-pre-line">
        {card.draftBody}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setUsed(true)}
          disabled={used}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold transition-colors',
            used
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 cursor-default'
              : 'bg-primary text-white hover:opacity-90',
          )}
        >
          {used
            ? <><CheckIcon className="h-4 w-4" aria-hidden /> Sent</>
            : <><PaperAirplaneIcon className="h-4 w-4" aria-hidden /> Use this reply</>
          }
        </button>
        <button
          type="button"
          onClick={() => alert('Showcase only — would open the message composer pre-filled.')}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold border border-cream text-charcoal hover:bg-cream transition-colors"
        >
          <PencilSquareIcon className="h-4 w-4" aria-hidden /> Edit
        </button>
      </div>
    </div>
  )
}
