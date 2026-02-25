import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { PlannerStatsResponse } from '@/lib/types'
import { formatPrice } from '@/lib/utils'

function StatCard({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div className="bg-white border border-cream rounded-xl p-4 flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-xl font-bold text-charcoal leading-tight">{value}</p>
        <p className="text-xs text-stone-warm">{label}</p>
      </div>
    </div>
  )
}

export default function PlannerStatsRow() {
  const { data: stats } = useQuery<PlannerStatsResponse>({
    queryKey: ['planner-stats'],
    queryFn: () => api.get('/planners/me/stats').then(r => r.data.data),
    retry: false,
  })

  if (!stats) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      <StatCard icon="📋" value={String(stats.totalBookings)} label="Bookings" />
      <StatCard icon="💬" value={String(stats.activeConversations)} label="Active chats" />
      <StatCard icon="★" value={stats.rating ? stats.rating.toFixed(1) : '—'} label="Rating" />
      <StatCard icon="⏱" value={stats.averageResponseTimeDisplay ?? '—'} label="Avg response" />
    </div>
  )
}
