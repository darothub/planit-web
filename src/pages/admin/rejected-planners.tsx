import Head from 'next/head'
import { useQuery } from '@tanstack/react-query'
import AdminShell from '@/components/admin/AdminShell'
import { api } from '@/lib/api'
import { PendingPlannerResponse } from '@/lib/types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function RejectedPlannersPage() {
  const { data: planners = [], isLoading } = useQuery<PendingPlannerResponse[]>({
    queryKey: ['admin-rejected-planners'],
    queryFn: () => api.get('/admin/planners/rejected').then(r => r.data.data),
    retry: false,
  })

  return (
    <>
      <Head><title>Rejected Planners — Planit Admin</title></Head>
      <AdminShell title="Rejected Planners">

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 bg-white border border-cream rounded-xl animate-pulse" />
            ))}
          </div>
        ) : planners.length === 0 ? (
          <div className="text-center py-16 text-stone-warm">
            <p className="text-4xl mb-3">❌</p>
            <p className="text-lg font-semibold text-charcoal">No rejected planners</p>
            <p className="text-sm mt-1">Planners you reject will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-stone-warm">
              {planners.length} rejected planner{planners.length !== 1 ? 's' : ''} — email and phone blocked from re-registration
            </p>
            {planners.map(planner => (
              <div
                key={planner.id}
                className="bg-white border border-cream rounded-xl p-5 flex items-start gap-4"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0 text-sm font-bold text-rose-600">
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
                    <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-medium">
                      Rejected
                    </span>
                  </div>
                  <p className="text-sm text-stone-warm mt-0.5">{planner.email}</p>
                  {planner.phone && (
                    <p className="text-xs text-stone-warm mt-0.5">📞 {planner.phone}</p>
                  )}
                  {planner.location && (
                    <p className="text-xs text-stone-warm mt-0.5">📍 {planner.location}</p>
                  )}
                  <p className="text-xs text-stone-warm mt-1">
                    Applied {formatDate(planner.registeredAt)}
                  </p>

                  {planner.verificationNotes && (
                    <div className="mt-3 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
                      <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider mb-0.5">Rejection notes</p>
                      <p className="text-sm text-charcoal">{planner.verificationNotes}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {planner.specialties.map(s => (
                      <span key={s} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </AdminShell>
    </>
  )
}
