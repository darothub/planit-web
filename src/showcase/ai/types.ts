/**
 * Types for the AI agent showcase.
 *
 * Mirrors the shape we'll use in production with real Claude API responses,
 * so the UI components built against these types can be reused unchanged.
 */

export type Audience = 'CLIENT' | 'PLANNER'

export type Language = 'EN' | 'PCM' | 'FR' | 'YO'

export type LanguageMeta = {
  code: Language
  label: string         // Display in switcher chip
  fullName: string      // Tooltip
  flag: string          // Emoji flag
}

export const LANGUAGES: LanguageMeta[] = [
  { code: 'EN',  label: 'EN',     fullName: 'English',         flag: '🇬🇧' },
  { code: 'PCM', label: 'Pidgin', fullName: 'Nigerian Pidgin', flag: '🇳🇬' },
  { code: 'FR',  label: 'FR',     fullName: 'Français',        flag: '🇫🇷' },
  { code: 'YO',  label: 'Yorùbá', fullName: 'Yorùbá',          flag: '🇳🇬' },
]

// ─── Tool calls (visible to the user as transient status pills) ──────────

export type ToolCall = {
  id: string
  name: string         // Shown in the pill
  status: 'running' | 'completed' | 'failed'
  detail?: string      // e.g. "3 results found"
}

// ─── Inline result cards (richer than text) ──────────────────────────────

export type PlannerRecommendationCard = {
  kind: 'planner_recommendation'
  id: number
  title: string
  planner: string
  city: string
  rating: number
  reviewCount: number
  basePrice: number
  matchReasons: string[]    // Bullet points why this matched
  imageUrl: string
  ctaHref: string
}

export type MessageDraftCard = {
  kind: 'message_draft'
  to: string                // e.g. "Sarah (client)"
  context: string           // What inquiry this responds to
  draftBody: string         // The suggested reply text
  tone: 'warm' | 'professional' | 'apologetic'
}

export type CalendarBlockCard = {
  kind: 'calendar_block'
  startDate: string         // ISO date
  endDate: string
  reason: string
  scope: 'ALL' | 'SELECTED'
}

export type Card =
  | PlannerRecommendationCard
  | MessageDraftCard
  | CalendarBlockCard

// ─── Messages ─────────────────────────────────────────────────────────────

export type UserMessage = {
  id: string
  role: 'user'
  text: string
  timestamp: string         // "2:14 PM"
}

export type AssistantMessage = {
  id: string
  role: 'assistant'
  text: string
  timestamp: string
  toolCalls?: ToolCall[]    // Shown above the text bubble
  cards?: Card[]            // Shown below the text bubble
  redactedFromUser?: string // Original user text before PII redaction (privacy demo)
}

export type Message = UserMessage | AssistantMessage

// ─── Suggested prompts (chips above composer when conversation is empty) ─

export type SuggestedPrompt = {
  id: string
  text: string
  // Optional: which conversation flow this triggers in the demo
  triggers?: string
}
