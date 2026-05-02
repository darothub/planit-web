/**
 * Mock data for the AI agent showcase.
 *
 * Hardcoded conversation flows, recommendations, and language samples.
 * Production will replace this with streamed responses from Claude.
 *
 * Naming: every record carries a stable id so React keys behave; avoid
 * Date.now()-style ids that re-render unnecessarily.
 */

import type {
  Audience,
  Language,
  Message,
  SuggestedPrompt,
  PlannerRecommendationCard,
  MessageDraftCard,
} from './types'

// ─── Greetings per audience × language ───────────────────────────────────

export const GREETINGS: Record<Audience, Record<Language, string>> = {
  CLIENT: {
    EN:  "Hi! I'm Planit's assistant. Tell me about the event you're planning and I'll help you find the right planner.",
    PCM: "How far! Na me be Planit assistant. Talk wetin you wan plan, I go help you find correct planner.",
    FR:  "Salut ! Je suis l'assistant Planit. Parlez-moi de votre événement et je vous aiderai à trouver le bon organisateur.",
    YO:  "Ẹ káàbọ̀! Èmi ni olùrànlọ́wọ́ Planit. Sọ̀rọ̀ nípa ìṣẹ̀lẹ̀ tí o fẹ́ ṣètò, màá ràn ọ́ lọ́wọ́ láti rí olùṣètò tó dára.",
  },
  PLANNER: {
    EN:  "Hi! I'm your Planit assistant. I can help draft replies, manage your calendar, and summarise client inquiries.",
    PCM: "How far! Na me be your Planit assistant. I fit help you write reply, arrange your calendar, and summarise wetin client dey ask.",
    FR:  "Salut ! Je suis votre assistant Planit. Je peux rédiger des réponses, gérer votre calendrier et résumer les demandes clients.",
    YO:  "Ẹ káàbọ̀! Èmi ni olùrànlọ́wọ́ Planit yín. Mo lè ràn yín lọ́wọ́ láti kọ ìdáhùn, ṣètò kàlẹ́ńdà, kí n sì ṣàkójọ ìbéèrè àwọn oníbàárà.",
  },
}

// ─── Suggested prompts per audience ──────────────────────────────────────

export const SUGGESTED_PROMPTS: Record<Audience, SuggestedPrompt[]> = {
  CLIENT: [
    { id: 'c1', text: 'I need a wedding planner in London for £5,000',     triggers: 'search_planners' },
    { id: 'c2', text: 'Compare two planners side by side' },
    { id: 'c3', text: 'What questions should I ask before booking?' },
    { id: 'c4', text: 'Show me birthday planners under £2k near me' },
  ],
  PLANNER: [
    { id: 'p1', text: 'Draft a polite decline for a date I cannot do',     triggers: 'draft_decline' },
    { id: 'p2', text: 'Block out next Friday for personal time' },
    { id: 'p3', text: 'Summarise my newest 3 inquiries' },
    { id: 'p4', text: 'How busy is my next month?' },
  ],
}

// ─── Demo planner recommendations (client scenario result) ───────────────

const RECOMMENDATIONS: PlannerRecommendationCard[] = [
  {
    kind: 'planner_recommendation',
    id: 9001,
    title: 'Intimate Garden Wedding',
    planner: 'Events by Rivera',
    city: 'London',
    rating: 4.9,
    reviewCount: 28,
    basePrice: 4800,
    matchReasons: ['Within £5k budget', 'Specialises in weddings', 'Available your date'],
    imageUrl: 'https://images.unsplash.com/photo-1519741347347-c3dc0ff1b1b4?w=600&q=80',
    ctaHref: '#',
  },
  {
    kind: 'planner_recommendation',
    id: 9002,
    title: 'Classic Registry Office Wedding',
    planner: 'Mayfair Moments',
    city: 'London',
    rating: 4.8,
    reviewCount: 42,
    basePrice: 3500,
    matchReasons: ['£1.5k under budget', '8 yrs wedding experience', 'Top-rated coordinator'],
    imageUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=600&q=80',
    ctaHref: '#',
  },
  {
    kind: 'planner_recommendation',
    id: 9003,
    title: 'Vineyard Wedding Package',
    planner: 'Kent Country Weddings',
    city: 'Kent',
    rating: 5.0,
    reviewCount: 15,
    basePrice: 4950,
    matchReasons: ['Within £5k budget', 'Outdoor specialist', 'Includes catering'],
    imageUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80',
    ctaHref: '#',
  },
]

// ─── Demo message draft (planner scenario result) ────────────────────────

const DRAFT: MessageDraftCard = {
  kind: 'message_draft',
  to: 'Sarah Wilson (client)',
  context: 'Inquiry about a 100-guest wedding on 14 June (you are already booked that weekend)',
  draftBody:
    "Hi Sarah, thanks so much for reaching out about your June wedding — congratulations! Unfortunately, I'm already booked for the weekend of 14 June, so I won't be able to take this on. If you're flexible on the date, I'd love to chat — otherwise I'm happy to recommend two trusted planners in London who specialise in weddings of your size. Either way, wishing you a wonderful day.",
  tone: 'warm',
}

// ─── Scripted conversations (drives the showcase walkthrough) ────────────

export type Script = {
  id: string
  audience: Audience
  language: Language
  title: string             // Shown in the scenario picker
  description: string       // One-line scenario summary
  messages: Message[]
}

export const SCRIPTS: Script[] = [
  // ── Client × English: search for a wedding planner ──────────────────────
  {
    id: 'client-search-en',
    audience: 'CLIENT',
    language: 'EN',
    title: 'Find a wedding planner',
    description: 'Client asks for £5k wedding planners in London → 3 inline recommendations',
    messages: [
      {
        id: 'm1',
        role: 'user',
        text: 'I need a wedding planner in London for £5,000',
        timestamp: '2:14 PM',
      },
      {
        id: 'm2',
        role: 'assistant',
        text: "Got it — wedding, London, around £5k. I found 3 planners that match. They all have availability and stay within budget:",
        timestamp: '2:14 PM',
        toolCalls: [
          { id: 't1', name: 'search_listings', status: 'completed', detail: '3 matches' },
        ],
        cards: RECOMMENDATIONS,
      },
      {
        id: 'm3',
        role: 'user',
        text: 'What makes Events by Rivera different from Mayfair Moments?',
        timestamp: '2:15 PM',
      },
      {
        id: 'm4',
        role: 'assistant',
        text:
          "**Events by Rivera** specialises in intimate outdoor settings (gardens, marquees) — they have a 4.9★ rating from 28 weddings and the package includes floral arrangements, photography, and a dedicated coordinator.\n\n**Mayfair Moments** focuses on classic registry-office weddings — £1,300 less, 8 years of experience, 4.8★ from 42 weddings. The package skews more traditional and includes welcome drinks + cake.\n\nIf you're picturing an outdoor garden ceremony → Rivera. If you want a tighter budget and registry-office classic → Mayfair.",
        timestamp: '2:15 PM',
      },
    ],
  },

  // ── Planner × English: draft a polite decline ───────────────────────────
  {
    id: 'planner-decline-en',
    audience: 'PLANNER',
    language: 'EN',
    title: 'Draft a polite decline',
    description: 'Planner is double-booked → assistant drafts a warm decline reply',
    messages: [
      {
        id: 'm1',
        role: 'user',
        text: "I can't do Sarah's June 14 wedding — already booked. Draft a polite reply that suggests alternatives.",
        timestamp: '10:42 AM',
      },
      {
        id: 'm2',
        role: 'assistant',
        text: "Here's a warm decline that keeps the door open. Tap **Use this reply** to drop it into your message thread, or **Edit** to tweak.",
        timestamp: '10:42 AM',
        toolCalls: [
          { id: 't1', name: 'fetch_inquiry',          status: 'completed', detail: 'Sarah Wilson' },
          { id: 't2', name: 'check_calendar',         status: 'completed', detail: '14 Jun blocked' },
          { id: 't3', name: 'compose_decline_draft',  status: 'completed' },
        ],
        cards: [DRAFT],
      },
    ],
  },

  // ── Client × Pidgin: shorter sample (greeting + reply) ──────────────────
  {
    id: 'client-greeting-pcm',
    audience: 'CLIENT',
    language: 'PCM',
    title: 'Greeting in Pidgin',
    description: 'Showcase how the assistant adapts to Nigerian Pidgin',
    messages: [
      {
        id: 'm1',
        role: 'user',
        text: 'I wan plan birthday for my pikin, e go reach 100 guest',
        timestamp: '4:01 PM',
      },
      {
        id: 'm2',
        role: 'assistant',
        text:
          "Sweet! 100 guest birthday — make I sabi small thing first. Wetin be the age of your pikin, and which city you dey? I go fit recommend planners wey fit your style and budget.",
        timestamp: '4:01 PM',
      },
    ],
  },

  // ── Client × French: shorter sample ─────────────────────────────────────
  {
    id: 'client-greeting-fr',
    audience: 'CLIENT',
    language: 'FR',
    title: 'Bonjour en français',
    description: 'Showcase how the assistant adapts to French',
    messages: [
      {
        id: 'm1',
        role: 'user',
        text: 'Bonjour, je cherche un organisateur pour un mariage à Paris',
        timestamp: '11:30',
      },
      {
        id: 'm2',
        role: 'assistant',
        text:
          "Bonjour ! Avec plaisir. Pour vous proposer les bons organisateurs, j'ai trois petites questions : quelle est la date du mariage, le nombre d'invités, et votre budget approximatif ?",
        timestamp: '11:30',
      },
    ],
  },

  // ── Client × Yoruba: shorter sample ─────────────────────────────────────
  {
    id: 'client-greeting-yo',
    audience: 'CLIENT',
    language: 'YO',
    title: 'Ìkíni ní Yorùbá',
    description: 'Showcase how the assistant adapts to Yorùbá',
    messages: [
      {
        id: 'm1',
        role: 'user',
        text: 'Mo fẹ́ ṣètò ìgbéyàwó ní Èkó',
        timestamp: '3:22 PM',
      },
      {
        id: 'm2',
        role: 'assistant',
        text:
          "Ẹ kú àárọ̀! Inú mi dùn pé o yàn Planit. Jọ̀wọ́ sọ fún mi ọjọ́ ìgbéyàwó, iye àlejò tí o ń retí, àti ìnáwó tí o gbé kalẹ̀, kí n lè dá kàn olùṣètò tó dára.",
        timestamp: '3:22 PM',
      },
    ],
  },

  // ── Privacy demo: PII redaction ─────────────────────────────────────────
  {
    id: 'client-privacy-en',
    audience: 'CLIENT',
    language: 'EN',
    title: 'Privacy: PII redaction',
    description: 'Phone number + email auto-redacted before send to Claude',
    messages: [
      {
        id: 'm1',
        role: 'user',
        text: 'My phone is +44 7700 900123 and email is sarah@example.com — please save these for the planner.',
        timestamp: '5:08 PM',
      },
      {
        id: 'm2',
        role: 'assistant',
        text:
          "I noticed you shared a phone number and an email — I've **redacted both** before sending your message to the AI provider so they're never exposed beyond Planit. The planner will receive your real contact details only after you've confirmed a booking. Anything else I can help with?",
        timestamp: '5:08 PM',
        redactedFromUser:
          'My phone is [PHONE_REDACTED] and email is [EMAIL_REDACTED] — please save these for the planner.',
      },
    ],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────

export function findScript(
  audience: Audience,
  language: Language,
): Script | undefined {
  // Prefer a script that matches both axes; fall back to English script for the audience.
  return (
    SCRIPTS.find(s => s.audience === audience && s.language === language) ??
    SCRIPTS.find(s => s.audience === audience && s.language === 'EN')
  )
}

export function listScriptsForAudience(audience: Audience): Script[] {
  return SCRIPTS.filter(s => s.audience === audience)
}
