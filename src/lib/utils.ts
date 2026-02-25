import { CancellationPolicy } from './types'

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