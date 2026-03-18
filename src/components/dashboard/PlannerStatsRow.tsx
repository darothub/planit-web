import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { BookingResponse, PlannerStatsResponse } from '@/lib/types'
import { formatShortDate } from '@/lib/utils'
import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
} from '@heroicons/react/24/outline'
type StatCardProps = {
  label: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  accent?: boolean
}

function StatCard({ label, value, subtitle, icon: Icon, accent }: StatCardProps) {
  return (
    <div className={`bg-white border rounded-xl p-4 flex flex-col gap-1 ${accent ? 'border-amber-300' : 'border-cream'}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-warm">{label}</span>
        <Icon className={`w-4 h-4 ${accent ? 'text-amber-500' : 'text-stone-warm'}`} />
      </div>
      <p className={`text-3xl font-bold leading-tight ${accent ? 'text-amber-600' : 'text-charcoal'}`}>{value}</p>
      {subtitle && <p className="text-xs text-stone-warm">{subtitle}</p>}
    </div>
  )
}

function StatCardSkeleton() {
  return (
    <div className="bg-white border border-cream rounded-xl p-4 flex flex-col gap-2 animate-pulse">
      <div className="h-3 w-20 bg-sand rounded" />
      <div className="h-8 w-12 bg-sand rounded" />
      <div className="h-3 w-24 bg-sand rounded" />
    </div>
  )
}

export default function PlannerStatsRow() {
  const { data: stats } = useQuery<PlannerStatsResponse>({
    queryKey: ['planner-stats'],
    queryFn: () => api.get('/planners/me/stats').then(r => r.data.data),
    retry: false,
  })

  const { data: bookings = [] } = useQuery<BookingResponse[]>({
    queryKey: ['received-bookings'],
    queryFn: () => api.get('/bookings/received').then(r => r.data.data),
    retry: false,
  })

  if (!stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[1, 2, 3, 4].map(i => <StatCardSkeleton key={i} />)}
      </div>
    )
  }

  const nextBooking = [...bookings]
    .filter(b => b.status === 'ACCEPTED' || b.status === 'REQUESTED')
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())[0]

  const nextSubtitle = nextBooking
    ? `Next: ${formatShortDate(nextBooking.eventDate)}`
    : 'No upcoming bookings'

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <StatCard
        label="Total Bookings"
        value={stats.totalBookings}
        subtitle={nextSubtitle}
        icon={ClipboardDocumentListIcon}
      />
      <StatCard
        label="Active Convos"
        value={stats.activeConversations}
        subtitle="In progress"
        icon={CheckCircleIcon}
      />
      <StatCard
        label="Pending Inquiries"
        value={stats.pendingResponses}
        subtitle="Need reply"
        icon={ChatBubbleLeftRightIcon}
        accent={stats.pendingResponses > 0}
      />
      <StatCard
        label="Your Rating"
        value={stats.rating ? stats.rating.toFixed(1) : '—'}
        subtitle={`${stats.reviewCount} reviews`}
        icon={StarIcon}
      />
    </div>
  )
}
