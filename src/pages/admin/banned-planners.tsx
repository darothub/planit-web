import Head from 'next/head'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import AdminShell from '@/components/admin/AdminShell'
import { api } from '@/lib/api'
import { BannedPlannerResponse } from '@/lib/types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function BannedPlannersPage() {
  const queryClient = useQueryClient()

  const { data: planners = [], isLoading } = useQuery<BannedPlannerResponse[]>({
    queryKey: ['admin-banned-planners'],
    queryFn: () => api.get('/admin/planners/banned').then(r => r.data.data),
    retry: false,
  })

  const unbanMutation = useMutation({
    mutationFn: (id: number) => api.put(`/admin/planners/${id}/unban`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banned-planners'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      queryClient.invalidateQueries({ queryKey: ['admin-verified-planners'] })
    },
  })

  return (
    <>
      <Head><title>Banned Planners — Planit Admin</title></Head>
      <AdminShell title="Banned Planners">

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-36 bg-white border border-cream rounded-xl animate-pulse" />
            ))}
          </div>
        ) : planners.length === 0 ? (
          <div className="text-center py-16 text-stone-warm">
            <p className="text-4xl mb-3">🚫</p>
            <p className="text-lg font-semibold text-charcoal">No banned planners</p>
            <p className="text-sm mt-1">Planners you ban will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-stone-warm">{planners.length} banned planner{planners.length !== 1 ? 's' : ''}</p>
            {planners.map(planner => (
              <div
                key={planner.id}
                className="bg-white border border-cream rounded-xl p-5 flex items-start gap-4"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-sm font-bold text-red-600">
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
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                      Banned {formatDate(planner.bannedAt)}
                    </span>
                  </div>
                  <p className="text-sm text-stone-warm mt-0.5">{planner.email}</p>
                  {planner.location && (
                    <p className="text-xs text-stone-warm mt-0.5">📍 {planner.location}</p>
                  )}

                  <div className="mt-3 space-y-2">
                    <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                      <p className="text-xs font-semibold text-red-700 uppercase tracking-wider mb-0.5">Ban reason</p>
                      <p className="text-sm text-charcoal">{planner.banReason}</p>
                    </div>
                    <div className="bg-sand border border-cream rounded-lg px-3 py-2">
                      <p className="text-xs font-semibold text-stone-warm uppercase tracking-wider mb-0.5">Mitigation message</p>
                      <p className="text-sm text-charcoal">{planner.banMitigationText}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {planner.specialties.map(s => (
                      <span key={s} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action */}
                <button
                  onClick={() => unbanMutation.mutate(planner.id)}
                  disabled={unbanMutation.isPending}
                  className="shrink-0 text-sm font-medium text-green-700 border border-green-200 rounded-lg px-3 py-1.5 hover:bg-green-50 transition-colors disabled:opacity-50"
                >
                  {unbanMutation.isPending ? 'Unbanning…' : 'Unban'}
                </button>
              </div>
            ))}
          </div>
        )}

      </AdminShell>
    </>
  )
}
