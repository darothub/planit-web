/**
 * LanguageSwitcher — compact pill row that lets the user pick the
 * conversation language. Used in the AgentChat header.
 *
 * Production behaviour: the chosen language is sent as a system-prompt hint
 * to Claude ("Respond in {language}"); the assistant always answers in the
 * picked language regardless of input language.
 *
 * Showcase behaviour: switching the language re-loads the corresponding
 * scripted conversation (see `findScript`).
 */

import { LANGUAGES, Language } from '@/showcase/ai/types'
import { cn } from '@/lib/utils'

type Props = {
  value: Language
  onChange: (lang: Language) => void
}

export default function LanguageSwitcher({ value, onChange }: Props) {
  return (
    <div
      role="radiogroup"
      aria-label="Conversation language"
      className="inline-flex items-center gap-0.5 bg-cream rounded-full p-0.5 border border-cream"
    >
      {LANGUAGES.map(lang => {
        const active = lang.code === value
        return (
          <button
            key={lang.code}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={lang.fullName}
            title={lang.fullName}
            onClick={() => onChange(lang.code)}
            className={cn(
              'px-2.5 py-1 rounded-full text-xs font-semibold transition-colors flex items-center gap-1',
              active
                ? 'bg-white text-charcoal shadow-sm'
                : 'text-stone-warm hover:text-charcoal',
            )}
          >
            <span aria-hidden>{lang.flag}</span>
            <span>{lang.label}</span>
          </button>
        )
      })}
    </div>
  )
}
