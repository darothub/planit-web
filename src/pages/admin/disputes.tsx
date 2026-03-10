import { useState } from 'react'
import Head from 'next/head'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import AdminShell from '@/components/admin/AdminShell'
import { api } from '@/lib/api'
import { DisputeResolution, DisputeResponse } from '@/lib/types'
import { formatPrice, formatShortDate } from '@/lib/utils'

const STATUS_COLOUR: Record<string, string> = {
  OPEN:               'bg-orange-100 text-orange-800',
  EVIDENCE_SUBMITTED: 'bg-yellow-100 text-yellow-800',
  UNDER_REVIEW:       'bg-blue-100 text-blue-800',
  RESOLVED:           'bg-green-100 text-green-800',
}

const RESOLUTION_LABELS: { value: DisputeResolution; label: string }[] = [
  { value: 'FULL_REFUND',          label: 'Full Refund to Client' },
  { value: 'PARTIAL_REFUND',       label: 'Partial Refund to Client' },
  { value: 'RELEASED_TO_PLANNER',  label: 'Release Funds to Planner' },
]

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

export default function AdminDisputesPage() {
  const qc = useQueryClient()
  const [resolveTarget, setResolveTarget] = useState<DisputeResponse | null>(null)
  const [resolveError, setResolveError] = useState<string | null>(null)

  const { data: disputes = [], isLoading } = useQuery<DisputeResponse[]>({
    queryKey: ['admin-disputes'],
    queryFn: () => api.get('/disputes').then(r => r.data.data),
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
    },
    onError: (e: any) => {
      setResolveError(e?.response?.data?.message ?? 'Something went wrong. Please try again.')
    },
  })

  return (
    <>
      <Head><title>Disputes — Planit Admin</title></Head>
      <AdminShell title="Open Disputes">
        {isLoading && (
          <div className="flex flex-col gap-4">
            {[1, 2].map(i => (
              <div key={i} className="h-40 bg-white border border-cream rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && disputes.length === 0 && (
          <div className="bg-white border border-cream rounded-xl p-16 text-center">
            <p className="text-stone-warm text-sm">No open disputes — all caught up!</p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {disputes.map(d => (
            <div key={d.id} className="bg-white border border-cream rounded-xl p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-semibold text-charcoal">
                    Dispute #{d.id} · Booking #{d.bookingId}
                  </p>
                  <p className="text-xs text-stone-warm mt-0.5">
                    Raised by {d.raisedBy.firstName} {d.raisedBy.lastName} · {formatShortDate(d.createdAt)}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_COLOUR[d.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {d.status.replace(/_/g, ' ')}
                </span>
              </div>

              <p className="text-sm text-charcoal mb-3 line-clamp-3">{d.reason}</p>

              <div className="flex flex-wrap gap-4 text-xs text-stone-warm mb-4">
                <span>Evidence deadline: {formatShortDate(d.evidenceDeadline)}</span>
                <span>{d.evidence.length} evidence item{d.evidence.length !== 1 ? 's' : ''}</span>
              </div>

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
                        {e.description && <p>{e.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => { setResolveError(null); setResolveTarget(d) }}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-btn transition-colors"
              >
                Resolve
              </button>
            </div>
          ))}
        </div>

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
