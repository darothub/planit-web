/**
 * Frontend wire types + API call for the AI agent.
 *
 * Mirrors the backend ChatRequest / ChatResponse DTOs in
 * com.darothub.planit.ai.dto. Keep these in sync — they're the contract
 * across the network boundary.
 */

import { api } from './api'

// ─── Wire types ────────────────────────────────────────────────────────────

export type AiLanguage = 'EN' | 'PCM' | 'FR' | 'YO'

export type AiToolCallStatus = 'running' | 'completed' | 'failed'

export type AiToolCall = {
  name: string
  status: AiToolCallStatus
  detail?: string
}

/**
 * Inline cards sit alongside the assistant's text reply. The backend
 * tags each with a `kind`; the UI picks the right component.
 *
 * Phase 1 backend always returns an empty array. Phase 2 backend will start
 * emitting `planner_recommendation` cards from search_listings results.
 */
export type AiCardKind = 'planner_recommendation' | 'message_draft' | 'calendar_block'

export type AiCard = {
  kind: AiCardKind
  data: Record<string, unknown>
}

export type AiChatRequest = {
  conversationId?: string
  message: string
  language?: AiLanguage
}

export type AiChatResponse = {
  conversationId: string
  language: AiLanguage
  reply: string
  toolCalls: AiToolCall[]
  cards: AiCard[]
  redactionsApplied: string[]    // categories: EMAIL | PHONE | POSTCODE
}

// Backend wraps everything in ApiResponse<T> = { success, message, data }
type ApiEnvelope<T> = { success: boolean; message: string; data: T }

// ─── Calls ─────────────────────────────────────────────────────────────────

export async function sendAiMessage(req: AiChatRequest): Promise<AiChatResponse> {
  const res = await api.post<ApiEnvelope<AiChatResponse>>('/ai/chat', req)
  return res.data.data
}
