import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { DisputeResponse, DisputeStatus } from '@/lib/types'
import DashboardShell from '@/components/dashboard/DashboardShell'
import { formatShortDate, formatPrice, cn } from '@/lib/utils'
import { DEMO_DISPUTES } from '@/showcase/data'

// ── Display helpers ────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<DisputeStatus, string> = {
  OPEN:               'Open',
  EVIDENCE_SUBMITTED: 'Evidence Submitted',
  UNDER_REVIEW:       'Under Review',
  RESOLVED:           'Resolved',
}

const STATUS_BADGE: Record<DisputeStatus, string> = {
  OPEN:               'bg-orange-100 text-orange-800',
  EVIDENCE_SUBMITTED: 'bg-yellow-100 text-yellow-800',
  UNDER_REVIEW:       'bg-blue-100 text-blue-800',
  RESOLVED:           'bg-green-100 text-green-800',
}

const STATUS_BORDER: Record<DisputeStatus, string> = {
  OPEN:               'border-l-orange-400',
  EVIDENCE_SUBMITTED: 'border-l-yellow-400',
  UNDER_REVIEW:       'border-l-blue-400',
  RESOLVED:           'border-l-green-500',
}

const RESOLUTION_LABEL: Record<string, string> = {
  FULL_REFUND:          'Full refund issued',
  PARTIAL_REFUND:       'Partial refund issued',
  RELEASED_TO_PLANNER:  'Payment released to planner',
}

type Tab = 'all' | 'active' | 'resolved'

function isActive(status: DisputeStatus) {
  return status !== 'RESOLVED'
}

function deadlineUrgency(deadline: string): 'past' | 'soon' | 'ok' {
  const ms  = new Date(deadline).getTime() - Date.now()
  const days = ms / 86_400_000
  if (days < 0)  return 'past'
  if (days <= 3) return 'soon'
  return 'ok'
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function DisputesPage() {
  const { token, user } = useAuthStore()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('all')

  useEffect(() => {
    if (!token) router.replace('/auth/login?redirect=/dashboard/disputes')
  }, [token, router])

  const { data: disputes = DEMO_DISPUTES, isLoading } = useQuery<DisputeResponse[]>({
    queryKey: ['disputes'],
    queryFn: () => {
      const url = user?.role === 'ADMIN' ? '/disputes' : '/disputes/my'
      return api.get(url).then(r => r.data.data)
    },
    enabled: !!token,
    placeholderData: DEMO_DISPUTES,
    retry: false,
  })

  if (!user) return null

  const active   = disputes.filter(d => isActive(d.status))
  const resolved = disputes.filter(d => d.status === 'RESOLVED')

  const filtered =
    tab === 'active'   ? active :
    tab === 'resolved' ? resolved :
    disputes

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'all',      label: 'All',      count: disputes.length },
    { key: 'active',   label: 'Active',   count: active.length },
    { key: 'resolved', label: 'Resolved', count: resolved.length },
  ]

  return (
    <DashboardShell title="Disputes">

      {/* Stats */}
      {disputes.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-white border border-cream rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-charcoal">{disputes.length}</p>
            <p className="text-xs text-stone-warm mt-1">Total</p>
          </div>
          <div className={cn(
            'bg-white border rounded-xl p-4 text-center',
            active.length > 0 ? 'border-orange-300' : 'border-cream',
          )}>
            <p className={cn('text-2xl font-bold', active.length > 0 ? 'text-orange-600' : 'text-charcoal')}>
              {active.length}
            </p>
            <p className="text-xs text-stone-warm mt-1">Active</p>
          </div>
          <div className="bg-white border border-cream rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-700">{resolved.length}</p>
            <p className="text-xs text-stone-warm mt-1">Resolved</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-white border border-cream rounded-xl p-1 w-fit">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              tab === t.key
                ? 'bg-primary text-white'
                : 'text-stone-warm hover:text-charcoal hover:bg-sand',
            )}
          >
            {t.label}
            {t.count > 0 && (
              <span className={cn(
                'ml-1.5 text-xs px-1.5 py-0.5 rounded-full',
                tab === t.key ? 'bg-white/20 text-white' : 'bg-sand text-stone-warm',
              )}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Skeleton */}
      {isLoading && (
        <div className="flex flex-col gap-3">
          {[1, 2].map(i => (
            <div key={i} className="h-32 bg-white border border-cream rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && filtered.length === 0 && (
        <div className="bg-white border border-cream rounded-xl p-10 text-center">
          {disputes.length === 0 ? (
            <>
              <p className="text-2xl mb-2">✅</p>
              <p className="font-medium text-charcoal mb-1">No disputes</p>
              <p className="text-sm text-stone-warm">Great news — you have no disputes on your account.</p>
            </>
          ) : (
            <p className="text-stone-warm text-sm">No {tab} disputes.</p>
          )}
        </div>
      )}

      {/* List */}
      {!isLoading && filtered.length > 0 && (
        <div className="flex flex-col gap-3">
          {[...filtered]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map(d => {
              const urgency = isActive(d.status) ? deadlineUrgency(d.evidenceDeadline) : null
              return (
                <div
                  key={d.id}
                  className={cn(
                    'bg-white border border-cream border-l-4 rounded-xl p-5',
                    STATUS_BORDER[d.status] ?? 'border-l-transparent',
                  )}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="font-semibold text-charcoal text-sm">
                        Dispute #{d.id}
                        <span className="text-stone-warm font-normal"> · Booking #{d.bookingId}</span>
                      </p>
                      <p className="text-xs text-stone-warm mt-0.5">
                        Opened {formatShortDate(d.createdAt)}
                        {' · '}Raised by {d.raisedBy.firstName} {d.raisedBy.lastName}
                      </p>
                    </div>
                    <span className={cn(
                      'text-xs font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0',
                      STATUS_BADGE[d.status] ?? 'bg-gray-100 text-gray-600',
                    )}>
                      {STATUS_LABEL[d.status] ?? d.status}
                    </span>
                  </div>

                  {/* Reason */}
                  <p className="text-sm text-charcoal line-clamp-2 mb-3">{d.reason}</p>

                  {/* Active dispute meta */}
                  {isActive(d.status) && (
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      {/* Evidence deadline */}
                      <span className={cn(
                        'text-xs px-2.5 py-1 rounded-full font-medium',
                        urgency === 'past' ? 'bg-red-100 text-red-700' :
                        urgency === 'soon' ? 'bg-orange-100 text-orange-700' :
                        'bg-sand text-stone-warm',
                      )}>
                        📋 Evidence due {formatShortDate(d.evidenceDeadline)}
                        {urgency === 'past' && ' (overdue)'}
                        {urgency === 'soon' && ' (soon)'}
                      </span>

                      {/* Evidence count */}
                      {d.evidence.length > 0 && (
                        <span className="text-xs text-stone-warm">
                          {d.evidence.length} piece{d.evidence.length !== 1 ? 's' : ''} of evidence submitted
                        </span>
                      )}
                    </div>
                  )}

                  {/* Resolution block */}
                  {d.status === 'RESOLVED' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-3">
                      <p className="text-xs font-semibold text-green-800 mb-0.5">
                        ✓ {d.resolution ? RESOLUTION_LABEL[d.resolution] ?? d.resolution : 'Resolved'}
                        {d.refundAmount != null && (
                          <> · {formatPrice(d.refundAmount)}</>
                        )}
                      </p>
                      {d.resolutionNote && (
                        <p className="text-xs text-green-700">{d.resolutionNote}</p>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <Link
                    href={`/dashboard/bookings/${d.bookingId}`}
                    className="text-sm text-primary font-medium hover:underline"
                  >
                    View booking →
                  </Link>
                </div>
              )
            })}
        </div>
      )}

    </DashboardShell>
  )
}
