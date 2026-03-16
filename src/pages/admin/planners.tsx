import { useState } from 'react'
import Head from 'next/head'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import AdminShell from '@/components/admin/AdminShell'
import { api } from '@/lib/api'
import { PendingPlannerResponse } from '@/lib/types'
import { formatShortDate } from '@/lib/utils'
import { DEMO_PENDING_PLANNERS } from '@/showcase/data'

function RejectModal({
  planner,
  isPending,
  onConfirm,
  onClose,
}: {
  planner: PendingPlannerResponse
  isPending: boolean
  onConfirm: (notes: string) => void
  onClose: () => void
}) {
  const [notes, setNotes] = useState('')
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
        <h3 className="font-semibold text-charcoal text-lg mb-2">Reject Application</h3>
        <p className="text-sm text-stone-warm mb-4">
          Provide feedback for {planner.firstName} {planner.lastName}. This will be emailed to them.
        </p>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={4}
          maxLength={1000}
          placeholder="Explain why the application is being rejected…"
          className="input-base w-full resize-none mb-1"
        />
        <p className="text-xs text-stone-warm text-right mb-4">{notes.length}/1000</p>
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
            disabled={!notes.trim() || isPending}
            onClick={() => onConfirm(notes.trim())}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-btn transition-colors disabled:opacity-50"
          >
            {isPending ? 'Rejecting…' : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  )
}

const PRICE_RANGE_LABEL: Record<string, string> = {
  BUDGET:    'Budget',
  MID_RANGE: 'Mid-range',
  LUXURY:    'Luxury',
}

export default function AdminPlannersPage() {
  const qc = useQueryClient()
  const [rejectTarget, setRejectTarget]       = useState<PendingPlannerResponse | null>(null)
  const [confirmApproveId, setConfirmApproveId] = useState<number | null>(null)
  const [approvingId, setApprovingId]         = useState<number | null>(null)
  const [actionError, setActionError]         = useState<string | null>(null)

  const { data: planners = DEMO_PENDING_PLANNERS, isLoading } = useQuery<PendingPlannerResponse[]>({
    queryKey: ['admin-pending-planners'],
    queryFn: () => api.get('/admin/planners/pending').then(r => r.data.data),
    placeholderData: DEMO_PENDING_PLANNERS,
  })

  const approveMutation = useMutation({
    mutationFn: (plannerId: number) => api.put(`/admin/planners/${plannerId}/approve`),
    onSuccess: () => {
      setActionError(null)
      setApprovingId(null)
      qc.invalidateQueries({ queryKey: ['admin-pending-planners'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
    },
    onError: (e: any) => {
      setApprovingId(null)
      setActionError(e?.response?.data?.message ?? 'Approval failed. Please try again.')
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ plannerId, notes }: { plannerId: number; notes: string }) =>
      api.put(`/admin/planners/${plannerId}/reject`, { notes }),
    onSuccess: () => {
      setActionError(null)
      setRejectTarget(null)
      qc.invalidateQueries({ queryKey: ['admin-pending-planners'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
    },
    onError: (e: any) => {
      setActionError(e?.response?.data?.message ?? 'Rejection failed. Please try again.')
    },
  })

  return (
    <>
      <Head><title>Planner Queue — Planit Admin</title></Head>
      <AdminShell title="Planner Applications">

        {actionError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            {actionError}
          </p>
        )}

        {/* Skeleton */}
        {isLoading && (
          <div className="flex flex-col gap-4">
            {[1, 2].map(i => (
              <div key={i} className="h-48 bg-white border border-cream rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && planners.length === 0 && (
          <div className="bg-white border border-cream rounded-xl p-16 text-center">
            <p className="text-3xl mb-3">✅</p>
            <p className="font-medium text-charcoal mb-1">All caught up!</p>
            <p className="text-sm text-stone-warm">No pending planner applications to review.</p>
          </div>
        )}

        {/* List */}
        {!isLoading && planners.length > 0 && (
          <div className="flex flex-col gap-4">
            {planners.map(p => {
              const isApproving      = approvingId === p.id
              const showConfirm      = confirmApproveId === p.id
              const anyBusy          = rejectMutation.isPending
              return (
                <div key={p.id} className="bg-white border border-cream rounded-xl p-6">

                  {/* Header */}
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="font-semibold text-charcoal text-lg">
                        {p.firstName} {p.lastName}
                      </p>
                      <p className="text-xs text-stone-warm">{p.email}</p>
                      {p.businessName && (
                        <p className="text-sm text-charcoal mt-0.5 font-medium">{p.businessName}</p>
                      )}
                    </div>
                    <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2.5 py-0.5 rounded-full shrink-0">
                      Applied {formatShortDate(p.registeredAt)}
                    </span>
                  </div>

                  {/* Meta grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-4">
                    {p.location && (
                      <div>
                        <p className="text-xs text-stone-warm">Location</p>
                        <p className="text-charcoal">{p.location}</p>
                      </div>
                    )}
                    {p.yearsExperience != null && (
                      <div>
                        <p className="text-xs text-stone-warm">Experience</p>
                        <p className="text-charcoal">{p.yearsExperience} yr{p.yearsExperience !== 1 ? 's' : ''}</p>
                      </div>
                    )}
                    {p.priceRange && (
                      <div>
                        <p className="text-xs text-stone-warm">Price Range</p>
                        <p className="text-charcoal">{PRICE_RANGE_LABEL[p.priceRange] ?? p.priceRange}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-stone-warm">Portfolio Images</p>
                      <p className="text-charcoal">{p.portfolioImageCount}</p>
                    </div>
                    {p.phone && (
                      <div>
                        <p className="text-xs text-stone-warm">Phone</p>
                        <p className="text-charcoal">{p.phone}</p>
                      </div>
                    )}
                  </div>

                  {/* Specialties */}
                  {p.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {p.specialties.map(s => (
                        <span key={s} className="text-xs bg-sand border border-cream text-charcoal px-2 py-0.5 rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Bio */}
                  {p.bio && (
                    <p className="text-sm text-stone-warm mb-4 line-clamp-3">{p.bio}</p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3 flex-wrap pt-4 border-t border-cream">
                    {showConfirm ? (
                      <>
                        <span className="text-sm text-stone-warm">
                          Approve {p.firstName} {p.lastName}? They&apos;ll be notified by email.
                        </span>
                        <button
                          onClick={() => {
                            setApprovingId(p.id)
                            setConfirmApproveId(null)
                            approveMutation.mutate(p.id)
                          }}
                          disabled={isApproving}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-btn transition-colors disabled:opacity-50"
                        >
                          {isApproving ? 'Approving…' : 'Yes, Approve'}
                        </button>
                        <button
                          onClick={() => setConfirmApproveId(null)}
                          className="px-4 py-2 border border-cream text-charcoal text-sm rounded-btn hover:bg-sand transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setConfirmApproveId(p.id)}
                          disabled={isApproving || anyBusy}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-btn transition-colors disabled:opacity-50"
                        >
                          {isApproving ? 'Approving…' : 'Approve'}
                        </button>
                        <button
                          onClick={() => setRejectTarget(p)}
                          disabled={isApproving || anyBusy}
                          className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 text-sm font-semibold rounded-btn transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>

                </div>
              )
            })}
          </div>
        )}

        {rejectTarget && (
          <RejectModal
            planner={rejectTarget}
            isPending={rejectMutation.isPending}
            onConfirm={notes => rejectMutation.mutate({ plannerId: rejectTarget.id, notes })}
            onClose={() => setRejectTarget(null)}
          />
        )}

      </AdminShell>
    </>
  )
}
