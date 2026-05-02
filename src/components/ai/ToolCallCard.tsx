/**
 * ToolCallCard — small status pill rendered above an assistant bubble to
 * show the user what the agent is doing ("🔍 Searching listings…").
 *
 * In production the `status` flips from "running" → "completed" / "failed"
 * as Claude streams the tool result. The detail line ("3 matches") is the
 * tool's own summary string.
 *
 * Multiple tool calls render as a stacked column.
 */

import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/20/solid'
import type { ToolCall } from '@/showcase/ai/types'
import { cn } from '@/lib/utils'

const TOOL_LABELS: Record<string, { icon: string; label: string }> = {
  search_listings:        { icon: '🔍', label: 'Searching listings' },
  fetch_inquiry:          { icon: '✉️', label: 'Reading inquiry' },
  check_calendar:         { icon: '📅', label: 'Checking calendar' },
  compose_decline_draft:  { icon: '✍️', label: 'Drafting reply' },
  block_calendar:         { icon: '⛔', label: 'Blocking calendar' },
  summarise_inquiries:    { icon: '📋', label: 'Summarising inquiries' },
  // Default fallback applied in the render fn
}

export default function ToolCallList({ calls }: { calls: ToolCall[] }) {
  return (
    <div className="flex flex-col gap-1.5 mb-1.5">
      {calls.map(call => (
        <ToolPill key={call.id} call={call} />
      ))}
    </div>
  )
}

function ToolPill({ call }: { call: ToolCall }) {
  const meta = TOOL_LABELS[call.name] ?? { icon: '⚙️', label: call.name }

  const statusBg =
    call.status === 'completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
    call.status === 'failed'    ? 'bg-rose-50 border-rose-100 text-rose-700' :
                                  'bg-blue-50 border-blue-100 text-blue-700'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium w-fit',
        statusBg,
      )}
    >
      <span aria-hidden>{meta.icon}</span>
      <span>{meta.label}</span>
      {call.detail && <span className="opacity-70">· {call.detail}</span>}
      {call.status === 'running' && (
        <span className="ml-1 inline-flex gap-0.5" aria-hidden>
          <Dot delay={0}    />
          <Dot delay={150}  />
          <Dot delay={300}  />
        </span>
      )}
      {call.status === 'completed' && (
        <CheckCircleIcon className="h-3.5 w-3.5" aria-label="completed" />
      )}
      {call.status === 'failed' && (
        <XCircleIcon className="h-3.5 w-3.5" aria-label="failed" />
      )}
    </span>
  )
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="block w-1 h-1 rounded-full bg-current animate-bounce"
      style={{ animationDelay: `${delay}ms`, animationDuration: '900ms' }}
    />
  )
}
