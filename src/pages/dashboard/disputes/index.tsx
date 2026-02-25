import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { DisputeResponse } from '@/lib/types'
import DashboardShell from '@/components/dashboard/DashboardShell'
import { formatShortDate } from '@/lib/utils'

const statusColour: Record<string, string> = {
  OPEN:               'bg-orange-100 text-orange-800',
  EVIDENCE_SUBMITTED: 'bg-yellow-100 text-yellow-800',
  UNDER_REVIEW:       'bg-blue-100 text-blue-800',
  RESOLVED:           'bg-green-100 text-green-800',
}

export default function DisputesPage() {
  const { token, user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!token) router.replace('/auth/login?redirect=/dashboard/disputes')
  }, [token, router])

  const { data: disputes = [], isLoading } = useQuery<DisputeResponse[]>({
    queryKey: ['disputes'],
    queryFn: () => {
      const url = user?.role === 'ADMIN' ? '/disputes' : '/disputes/my'
      return api.get(url).then(r => r.data.data)
    },
    enabled: !!token,
    retry: false,
  })

  if (!user) return null

  return (
    <DashboardShell title="Disputes">
      {isLoading && (
        <div className="flex flex-col gap-3">
          {[1,2].map(i => <div key={i} className="h-24 bg-white border border-cream rounded-xl animate-pulse" />)}
        </div>
      )}
      {!isLoading && disputes.length === 0 && (
        <div className="bg-white border border-cream rounded-xl p-8 text-center">
          <p className="text-stone-warm">No disputes.</p>
        </div>
      )}
      <div className="flex flex-col gap-3">
        {disputes.map(d => (
          <div key={d.id} className="bg-white border border-cream rounded-xl p-5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <p className="font-semibold text-charcoal text-sm">Booking #{d.bookingId}</p>
                <p className="text-xs text-stone-warm mt-0.5">Opened {formatShortDate(d.createdAt)}</p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusColour[d.status] ?? 'bg-gray-100 text-gray-600'}`}>
                {d.status.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-sm text-charcoal line-clamp-2 mb-3">{d.reason}</p>
            <Link
              href={`/dashboard/bookings/${d.bookingId}`}
              className="text-sm text-primary font-medium hover:underline"
            >
              View booking →
            </Link>
          </div>
        ))}
      </div>
    </DashboardShell>
  )
}
