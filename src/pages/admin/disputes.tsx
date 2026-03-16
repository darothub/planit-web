import { useState } from 'react'
import Head from 'next/head'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import AdminShell from '@/components/admin/AdminShell'
import { api } from '@/lib/api'
import { DisputeResolution, DisputeResponse, DisputeStatus } from '@/lib/types'
import { formatPrice, formatShortDate, cn } from '@/lib/utils'
import { DEMO_ADMIN_DISPUTES } from '@/showcase/data'

const STATUS_LABEL: Record<DisputeStatus, string> = {
  OPEN:               'Open',
  EVIDENCE_SUBMITTED: 'Evidence Submitted',
  UNDER_REVIEW:       'Under Review',
  RESOLVED:           'Resolved',
}

const STATUS_COLOUR: Record<DisputeStatus, string> = {
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

const RESOLUTION_LABELS: { value: DisputeResolution; label: string }[] = [
  { value: 'FULL_REFUND',          label: 'Full Refund to Client' },
  { value: 'PARTIAL_REFUND',       label: 'Partial Refund to Client' },
  { value: 'RELEASED_TO_PLANNER',  label: 'Release Funds to Planner' },
]

const RESOLUTION_DISPLAY: Record<DisputeResolution, string> = {
  FULL_REFUND:         'Full Refund to Client',
  PARTIAL_REFUND:      'Partial Refund to Client',
  RELEASED_TO_PLANNER: 'Released to Planner',
}

function deadlineUrgency(deadline: string): 'past' | 'soon' | 'ok' {
  const days = (new Date(deadline).getTime() - Date.now()) / 86_400_000
  if (days < 0) return 'past'
  if (days <= 3) return 'soon'
  return 'ok'
}

function ResolveModal({
  dispute,
  isPending,
  onConfirm,
  onClose,
  error,
}: {
  dispute: DisputeResponse
  isPending: boolean
  onConfirm: (data: { resolution: DisputeResolution; refundAmount?: number; resolutionNote: string }) => void
  onClose: () => void
  error: string | null
}) {
  const [resolution, setResolution] = useState<DisputeResolution>('FULL_REFUND')
  const [refundAmount, setRefundAmount] = useState('')
  const [resolutionNote, setResolutionNote] = useState('')

  const isPartial = resolution === 'PARTIAL_REFUND'
  const canSubmit = resolutionNote.trim() && (!isPartial || (refundAmount && Number(refundAmount) > 0))

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
        <h3 className="font-semibold text-charcoal text-lg mb-1">Resolve Dispute #{dispute.id}</h3>
        <p className="text-xs text-stone-warm mb-4">
          Raised by {dispute.raisedBy.firstName} {dispute.raisedBy.lastName} · Booking #{dispute.bookingId}
        </p>

        <div className="flex flex-col gap-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-charcoal mb-1">Resolution</label>
            <select
              value={resolution}
              onChange={e => setResolution(e.target.value as DisputeResolution)}
              className="input-base w-full"
            >
              {RESOLUTION_LABELS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {isPartial && (
            <div>
              <label className="block text-xs font-medium text-charcoal mb-1">Refund Amount (£)</label>
              <input
                type="number"
                value={refundAmount}
                onChange={e => setRefundAmount(e.target.value)}
                min={0.01}
                step={0.01}
                placeholder="e.g. 250.00"
                className="input-base w-full"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-charcoal mb-1">Resolution Note</label>
            <textarea
              value={resolutionNote}
              onChange={e => setResolutionNote(e.target.value)}
              rows={4}
              maxLength={2000}
              placeholder="Explain the decision to both parties…"
              className="input-base w-full resize-none"
            />
            <p className="text-xs text-stone-warm text-right">{resolutionNote.length}/2000</p>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-cream text-charcoal text-sm rounded-btn hover:bg-sand transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit || isPending}
            onClick={() =>
              onConfirm({
                resolution,
                refundAmount: isPartial ? Number(refundAmount) : undefined,
                resolutionNote: resolutionNote.trim(),
              })
            }
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-btn transition-colors disabled:opacity-50"
          >
            {isPending ? 'Resolving…' : 'Resolve Dispute'}
          </button>
        </div>
      </div>
    </div>
  )
}

type Tab = 'all' | 'active' | 'resolved'

export default function AdminDisputesPage() {
  const qc = useQueryClient()
  const [resolveTarget, setResolveTarget] = useState<DisputeResponse | null>(null)
  const [resolveError, setResolveError]   = useState<string | null>(null)
  const [tab, setTab]                     = useState<Tab>('all')

  const { data: disputes = DEMO_ADMIN_DISPUTES, isLoading } = useQuery<DisputeResponse[]>({
    queryKey: ['admin-disputes'],
    queryFn: () => api.get('/disputes').then(r => r.data.data),
    placeholderData: DEMO_ADMIN_DISPUTES,
    retry: false,
  })

  const resolveMutation = useMutation({
    mutationFn: ({
      disputeId,
      resolution,
      refundAmount,
      resolutionNote,
    }: {
      disputeId: number
      resolution: DisputeResolution
      refundAmount?: number
      resolutionNote: string
    }) =>
      api.patch(`/disputes/${disputeId}/resolve`, { resolution, refundAmount, resolutionNote })
        .then(r => r.data.data),
    onSuccess: () => {
      setResolveError(null)
      setResolveTarget(null)
      qc.invalidateQueries({ queryKey: ['admin-disputes'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
    },
    onError: (e: any) => {
      setResolveError(e?.response?.data?.message ?? 'Something went wrong. Please try again.')
    },
  })

  const active   = disputes.filter(d => d.status !== 'RESOLVED')
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
    <>
      <Head><title>Disputes — Planit Admin</title></Head>
      <AdminShell title="Disputes">

        {/* Stats */}
        {!isLoading && disputes.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-white border border-cream rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-charcoal">{disputes.length}</p>
              <p className="text-xs text-stone-warm mt-1">Total</p>
            </div>
            <div className="bg-white border border-cream rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-orange-600">{active.length}</p>
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
          <div className="flex flex-col gap-4">
            {[1, 2].map(i => (
              <div key={i} className="h-40 bg-white border border-cream rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && filtered.length === 0 && (
          <div className="bg-white border border-cream rounded-xl p-16 text-center">
            <p className="text-3xl mb-3">✅</p>
            <p className="font-medium text-charcoal mb-1">All caught up!</p>
            <p className="text-sm text-stone-warm">
              {tab === 'all' ? 'No disputes on record.' : `No ${tab} disputes.`}
            </p>
          </div>
        )}

        {/* List */}
        {!isLoading && filtered.length > 0 && (
          <div className="flex flex-col gap-4">
            {filtered.map(d => (
              <div
                key={d.id}
                className={cn(
                  'bg-white border border-cream border-l-4 rounded-xl p-6',
                  STATUS_BORDER[d.status] ?? 'border-l-gray-300',
                )}
              >
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-semibold text-charcoal">
                      Dispute #{d.id}
                      <span className="text-stone-warm font-normal"> · Booking #{d.bookingId}</span>
                    </p>
                    <p className="text-xs text-stone-warm mt-0.5">
                      Raised by {d.raisedBy.firstName} {d.raisedBy.lastName} · {formatShortDate(d.createdAt)}
                    </p>
                  </div>
                  <span className={cn(
                    'text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0',
                    STATUS_COLOUR[d.status] ?? 'bg-gray-100 text-gray-600',
                  )}>
                    {STATUS_LABEL[d.status] ?? d.status}
                  </span>
                </div>

                {/* Reason */}
                <p className="text-sm text-charcoal mb-3 line-clamp-3">{d.reason}</p>

                {/* Meta */}
                {d.status !== 'RESOLVED' && (
                  <div className="flex flex-wrap gap-3 mb-4">
                    {(() => {
                      const urgency = deadlineUrgency(d.evidenceDeadline)
                      return (
                        <span className={cn(
                          'text-xs px-2.5 py-0.5 rounded-full font-medium',
                          urgency === 'past' ? 'bg-red-100 text-red-700' :
                          urgency === 'soon' ? 'bg-amber-100 text-amber-700' :
                          'bg-sand text-stone-warm',
                        )}>
                          Evidence deadline: {formatShortDate(d.evidenceDeadline)}
                        </span>
                      )
                    })()}
                    <span className="text-xs text-stone-warm px-2.5 py-0.5 bg-sand rounded-full">
                      {d.evidence.length} evidence item{d.evidence.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}

                {/* Evidence list */}
                {d.evidence.length > 0 && (
                  <div className="flex flex-col gap-2 mb-4">
                    {d.evidence.map(e => (
                      <div key={e.id} className="flex items-start gap-3 text-sm border border-cream rounded-lg p-3">
                        <a
                          href={e.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline font-medium flex-1 truncate"
                        >
                          {e.fileUrl.split('/').pop() ?? 'Evidence file'}
                        </a>
                        <div className="text-xs text-stone-warm text-right shrink-0">
                          <p>{e.uploadedBy.firstName} {e.uploadedBy.lastName}</p>
                          {e.description && <p className="mt-0.5 italic">{e.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Resolution block (resolved disputes) */}
                {d.status === 'RESOLVED' && d.resolution && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <p className="text-xs font-semibold text-green-800 mb-1">Resolution</p>
                    <p className="text-sm text-charcoal font-medium mb-1">
                      {RESOLUTION_DISPLAY[d.resolution] ?? d.resolution}
                    </p>
                    {d.resolutionNote && (
                      <p className="text-xs text-stone-warm">{d.resolutionNote}</p>
                    )}
                    {d.refundAmount != null && (
                      <p className="text-xs text-green-700 font-semibold mt-1">
                        Refund: {formatPrice(d.refundAmount)}
                      </p>
                    )}
                  </div>
                )}

                {/* Action */}
                {d.status !== 'RESOLVED' && (
                  <div className="pt-4 border-t border-cream">
                    <button
                      onClick={() => { setResolveError(null); setResolveTarget(d) }}
                      className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-btn transition-colors"
                    >
                      Resolve Dispute
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {resolveTarget && (
          <ResolveModal
            dispute={resolveTarget}
            isPending={resolveMutation.isPending}
            error={resolveError}
            onConfirm={({ resolution, refundAmount, resolutionNote }) =>
              resolveMutation.mutate({
                disputeId: resolveTarget.id,
                resolution,
                refundAmount,
                resolutionNote,
              })
            }
            onClose={() => { setResolveTarget(null); setResolveError(null) }}
          />
        )}
      </AdminShell>
    </>
  )
}
