/**
 * Showcase: AI agent — Stream B Phase 1.
 *
 * Lets the user explore the assistant UX without a backend. Picker controls:
 *   - Audience    Client (concierge) | Planner (assistant)
 *   - Language    EN / Pidgin / FR / Yoruba
 *   - Scenario    Predefined scripted conversations from `data.ts`
 *
 * Two viewing modes:
 *   - Faux-page panel  — slide-up panel pinned bottom-right of a faded
 *                        homepage backdrop (closer to production)
 *   - Embedded full    — fills the visible area for design review
 *
 * Dev-only.
 */

import { useState, useMemo } from 'react'
import Head from 'next/head'
import ShowcaseShell from '@/showcase/ShowcaseShell'
import AgentChat from '@/components/ai/AgentChat'
import {
  GREETINGS,
  SUGGESTED_PROMPTS,
  SCRIPTS,
  findScript,
  listScriptsForAudience,
} from '@/showcase/ai/data'
import type { Audience, Language, Message } from '@/showcase/ai/types'
import { cn } from '@/lib/utils'

type ViewMode = 'panel' | 'embedded'

export const getServerSideProps = () => {
  if (process.env.NODE_ENV === 'production') return { notFound: true }
  return { props: {} }
}

export default function ShowcaseAIAgent() {
  const [audience, setAudience]   = useState<Audience>('CLIENT')
  const [language, setLanguage]   = useState<Language>('EN')
  const [viewMode, setViewMode]   = useState<ViewMode>('panel')
  const [scriptId, setScriptId]   = useState<string>('client-search-en')
  const [resetCount, setResetCount] = useState(0)   // bump to clear messages

  // Resolve which script to play based on audience+language. If user picks
  // a scenario by id directly, that wins.
  const script = useMemo(() => {
    const explicit = SCRIPTS.find(s => s.id === scriptId)
    if (explicit && explicit.audience === audience) return explicit
    return findScript(audience, language)
  }, [scriptId, audience, language])

  // Synthesise a starting messages array — empty conversation shows greeting
  // + prompts; "Play scenario" loads the scripted conversation.
  const messages: Message[] = useMemo(() => {
    if (resetCount === 0 && script) return script.messages
    return []
  }, [script, resetCount])

  // Greeting shown above the empty-state suggested prompts (rendered in
  // the chat scroll area as if it were the assistant's first message)
  const greetingMessage: Message = {
    id: 'greeting',
    role: 'assistant',
    text: GREETINGS[audience][language],
    timestamp: '',
  }

  // What we render in the chat panel:
  //   - if a script is "played" → its messages
  //   - if reset / empty → just the greeting
  const displayMessages: Message[] = messages.length > 0 ? messages : [greetingMessage]

  // Switching audience changes the default script; switching language changes
  // greeting and finds the matching language script if one exists.
  const handleAudienceChange = (next: Audience) => {
    setAudience(next)
    const fallback = findScript(next, language)
    setScriptId(fallback?.id ?? listScriptsForAudience(next)[0]?.id ?? '')
    setResetCount(0)
  }

  const handleLanguageChange = (next: Language) => {
    setLanguage(next)
    const fallback = findScript(audience, next)
    if (fallback) setScriptId(fallback.id)
    setResetCount(0)
  }

  // "Send" in the showcase is non-functional — clicking just appends the
  // user's message and a canned ack so the composer feels real.
  const handleSend = (text: string) => {
    // No-op for now; future: route to Claude API and stream back
    // Showcase fakes it by alerting so the design review stays focused.
    console.log('[showcase] would send to AI:', text)
  }

  const scenariosForAudience = listScriptsForAudience(audience)

  return (
    <ShowcaseShell pageName="AI Agent — Stream B Phase 1">
      <Head>
        <title>Showcase — AI Agent</title>
      </Head>

      {/* ── Picker bar ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-cream">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
          {/* Audience toggle */}
          <PickerGroup label="Audience">
            <Toggle
              options={[
                { value: 'CLIENT',  label: '👤 Client'   },
                { value: 'PLANNER', label: '🎯 Planner'  },
              ]}
              value={audience}
              onChange={v => handleAudienceChange(v as Audience)}
            />
          </PickerGroup>

          {/* View mode */}
          <PickerGroup label="View">
            <Toggle
              options={[
                { value: 'panel',    label: '📱 Panel'    },
                { value: 'embedded', label: '🖥 Embedded' },
              ]}
              value={viewMode}
              onChange={v => setViewMode(v as ViewMode)}
            />
          </PickerGroup>

          {/* Scenario selector */}
          <PickerGroup label="Scenario">
            <select
              value={scriptId}
              onChange={e => { setScriptId(e.target.value); setResetCount(0) }}
              className="px-3 py-1.5 rounded-full border border-cream bg-white text-sm font-medium text-charcoal focus:outline-none focus:border-primary"
            >
              {scenariosForAudience.map(s => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </PickerGroup>

          {/* Reset to greeting */}
          <button
            type="button"
            onClick={() => setResetCount(c => c + 1)}
            className="ml-auto text-xs text-stone-warm hover:text-charcoal underline underline-offset-2"
          >
            Reset to greeting
          </button>
        </div>

        {/* Scenario description */}
        {script && (
          <div className="max-w-7xl mx-auto px-4 pb-3">
            <p className="text-xs text-stone-warm">
              <span className="font-semibold text-charcoal">{script.title}:</span>{' '}
              {script.description}
            </p>
          </div>
        )}
      </div>

      {/* ── Stage ──────────────────────────────────────────────────────── */}
      {viewMode === 'panel'
        ? <FauxPageStage>
            <AgentChat
              audience={audience}
              messages={displayMessages}
              language={language}
              onLanguageChange={handleLanguageChange}
              onSend={handleSend}
              suggestedPrompts={messages.length === 0 ? SUGGESTED_PROMPTS[audience] : []}
              onClose={() => alert('Showcase only — would dismiss the panel.')}
              mode="panel"
            />
          </FauxPageStage>
        : <EmbeddedStage>
            <AgentChat
              audience={audience}
              messages={displayMessages}
              language={language}
              onLanguageChange={handleLanguageChange}
              onSend={handleSend}
              suggestedPrompts={messages.length === 0 ? SUGGESTED_PROMPTS[audience] : []}
              mode="embedded"
            />
          </EmbeddedStage>
      }
    </ShowcaseShell>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────

function PickerGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-stone-warm">
        {label}
      </span>
      {children}
    </div>
  )
}

function Toggle<T extends string>({
  options, value, onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="inline-flex items-center bg-cream rounded-full p-0.5">
      {options.map(o => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            'px-3 py-1 rounded-full text-xs font-semibold transition-colors',
            o.value === value
              ? 'bg-white text-charcoal shadow-sm'
              : 'text-stone-warm hover:text-charcoal',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/**
 * FauxPageStage — a faded homepage backdrop with the chat panel anchored
 * bottom-right, mimicking how the agent will look in production.
 */
function FauxPageStage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-[calc(100vh-180px)] bg-sand overflow-hidden">
      {/* Faux backdrop: blurred grid of category-like blocks */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] rounded-xl bg-gradient-to-br from-cream to-stone-warm/30" />
          ))}
        </div>
      </div>

      {/* Chat panel anchored bottom-right */}
      <div className="absolute bottom-6 right-6 z-10">
        {children}
      </div>
    </div>
  )
}

/**
 * EmbeddedStage — fills the visible area for high-fidelity design review.
 */
function EmbeddedStage({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-sand min-h-[calc(100vh-180px)] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl h-[640px] max-h-[80vh]">
        {children}
      </div>
    </div>
  )
}
