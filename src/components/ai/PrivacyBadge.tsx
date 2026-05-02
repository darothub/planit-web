/**
 * PrivacyBadge — small chip in the AgentChat header telling users that PII
 * is redacted before being sent to the AI provider. Hover for a tooltip
 * with the longer explanation.
 */

import { useState } from 'react'
import { ShieldCheckIcon } from '@heroicons/react/24/outline'

export default function PrivacyBadge() {
  const [hovered, setHovered] = useState(false)

  return (
    <span
      className="relative inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100 cursor-default"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      tabIndex={0}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      aria-label="Privacy: phone numbers and emails are redacted before being sent to the AI provider"
    >
      <ShieldCheckIcon className="h-3.5 w-3.5" aria-hidden />
      Private
      {hovered && (
        <span
          role="tooltip"
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 px-3 py-2 bg-charcoal text-white text-xs leading-relaxed rounded-lg shadow-lg z-10"
        >
          Phone numbers, emails, and addresses are redacted from your messages
          before they reach the AI provider. Your real details are only ever
          shared with planners after you confirm a booking.
        </span>
      )}
    </span>
  )
}
