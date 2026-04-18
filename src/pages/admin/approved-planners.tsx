import { useState } from 'react'
import Head from 'next/head'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import AdminShell from '@/components/admin/AdminShell'
import { api } from '@/lib/api'
import { VerifiedPlannerResponse } from '@/lib/types'
import { cn } from '@/lib/utils'

// ─── Ban Modal ────────────────────────────────────────────────────────────────

function BanModal({
  planner,
  onClose,
  onConfirm,
  isSubmitting,
  error,
}: {
  planner: VerifiedPlannerResponse
  onClose: () => void
  onConfirm: (reason: string, mitigationText: string) => void
  isSubmitting: boolean
  error: string | null
}) {
  const [reason, setReason] = useState('')
  const [mitigationText, setMitigationText] = useState('')

  const canSubmit = reason.trim().length > 0 && mitigationText.trim().length > 0

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-lg font-bold text-charcoal mb-1">Ban planner</h2>
          <p className="text-sm text-stone-warm mb-5">
            Banning <strong>{planner.firstName} {planner.lastName}</strong> will immediately hide all their listings
            from public search. They can be unbanned at any time.
          </p>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                maxLength={500}
                rows={2}
                placeholder="e.g. Fraudulent listings, terms of service violation…"
                className="w-full border border-cream rounded-lg px-3 py-2 text-sm text-charcoal placeholder:text-stone-warm/60 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
              <p className="text-xs text-stone-warm text-right mt-0.5">{reason.length}/500</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
                Mitigation message <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-stone-warm mb-1">
                Shown to the planner explaining what they can do (e.g. how to appeal).
              </p>
              <textarea
                value={mitigationText}
                onChange={e => setMitigationText(e.target.value)}
                maxLength={1000}
                rows={3}
                placeholder="e.g. Your account has been suspended. To appeal, contact support@planit.com within 30 days."
                className="w-full border border-cream rounded-lg px-3 py-2 text-sm text-charcoal placeholder:text-stone-warm/60 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
              <p className="text-xs text-stone-warm text-right mt-0.5">{mitigationText.length}/1000</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 border border-cream rounded-lg py-2.5 text-sm font-medium text-charcoal hover:bg-sand transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason.trim(), mitigationText.trim())}
            disabled={!canSubmit || isSubmitting}
            className="flex-1 bg-red-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-40"
          >
            {isSubmitting ? 'Banning…' : 'Confirm ban'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ApprovedPlannersPage() {
  const queryClient = useQueryClient()
  const [banTarget, setBanTarget] = useState<VerifiedPlannerResponse | null>(null)
  const [banError, setBanError]   = useState<string | null>(null)

  const { data: planners = [], isLoading } = useQuery<VerifiedPlannerResponse[]>({
    queryKey: ['admin-verified-planners'],
    queryFn: () => api.get('/admin/planners/verified').then(r => r.data.data),
    retry: false,
  })

  const banMutation = useMutation({
    mutationFn: ({ id, reason, mitigationText }: { id: number; reason: string; mitigationText: string }) =>
      api.put(`/admin/planners/${id}/ban`, { reason, mitigationText }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-verified-planners'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      queryClient.invalidateQueries({ queryKey: ['admin-banned-planners'] })
      setBanTarget(null)
      setBanError(null)
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setBanError(msg ?? 'Failed to ban planner. Please try again.')
    },
  })

  return (
    <>
      <Head><title>Approved Planners — Planit Admin</title></Head>
      <AdminShell title="Approved Planners">

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 bg-white border border-cream rounded-xl animate-pulse" />
            ))}
          </div>
        ) : planners.length === 0 ? (
          <div className="text-center py-16 text-stone-warm">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-lg font-semibold text-charcoal">No approved planners yet</p>
            <p className="text-sm mt-1">Planners you approve will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-stone-warm">{planners.length} approved planner{planners.length !== 1 ? 's' : ''}</p>
            {planners.map(planner => (
              <div
                key={planner.id}
                className="bg-white border border-cream rounded-xl p-5 flex items-start gap-4"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-bold text-primary">
                  {planner.firstName.charAt(0)}{planner.lastName.charAt(0)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <span className="font-semibold text-charcoal">
                      {planner.firstName} {planner.lastName}
                    </span>
                    {planner.businessName && (
                      <span className="text-xs text-stone-warm bg-sand px-2 py-0.5 rounded-full">
                        {planner.businessName}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-stone-warm mt-0.5">{planner.email}</p>
                  {planner.location && (
                    <p className="text-xs text-stone-warm mt-0.5">📍 {planner.location}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {planner.specialties.map(s => (
                      <span key={s} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-stone-warm mt-2">
                    {planner.totalBookings} booking{planner.totalBookings !== 1 ? 's' : ''} · {planner.reviewCount} review{planner.reviewCount !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Action */}
                <button
                  onClick={() => { setBanTarget(planner); setBanError(null) }}
                  className="shrink-0 text-sm font-medium text-red-600 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 transition-colors"
                >
                  Ban
                </button>
              </div>
            ))}
          </div>
        )}

      </AdminShell>

      {banTarget && (
        <BanModal
          planner={banTarget}
          onClose={() => { setBanTarget(null); setBanError(null) }}
          onConfirm={(reason, mitigationText) =>
            banMutation.mutate({ id: banTarget.id, reason, mitigationText })
          }
          isSubmitting={banMutation.isPending}
          error={banError}
        />
      )}
    </>
  )
}
