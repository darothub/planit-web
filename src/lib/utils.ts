import { CancellationPolicy } from './types'

// ── Image placeholder gradients ───────────────────────────────────────────────

/** 5-colour palette for listing thumbnail placeholders. Cycle by listing id. */
export const LISTING_GRADIENTS = [
  'linear-gradient(135deg, #C1694F, #8B4513)',
  'linear-gradient(135deg, #4A5240, #2C3520)',
  'linear-gradient(135deg, #8B6F47, #6B4F2A)',
  'linear-gradient(135deg, #5C7A6B, #3D5C4F)',
  'linear-gradient(135deg, #7A5C78, #5C3F5A)',
]

/** Returns the listing gradient for a given id (cycles through 5 colours). */
export function getListingGradient(id: number): string {
  return LISTING_GRADIENTS[Math.abs(id) % LISTING_GRADIENTS.length]
}

/** Terra gradient used for planner/user avatar placeholders. */
export const TERRA_GRADIENT = 'linear-gradient(135deg, #C1694F, #A85640)'

/** Merge class names, filtering out falsy values */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

/** Format a price as GBP currency */
export function formatPrice(amount: number, currency = 'GBP'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Format an ISO date string to a readable date */
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** Format an ISO date to a short form: "15 Jun 2026" */
export function formatShortDate(date: string): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** Get number of days between two dates */
export function daysBetween(from: string, to: string): number {
  const ms = new Date(to).getTime() - new Date(from).getTime()
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}

/** Human-readable cancellation policy */
export const cancellationPolicyLabel: Record<CancellationPolicy, string> = {
  FLEXIBLE: 'Full refund up to 14 days before event',
  MODERATE: '50% refund up to 7 days before event',
  STRICT:   'No refund after booking is accepted',
}

/** Truncate a string to a max length */
export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '…' : str
}

/** Format an ISO date string as relative time: "5m ago", "3h ago", "2d ago" */
export function formatRelativeTime(dateStr: string): string {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}