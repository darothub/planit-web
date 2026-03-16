import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { BookingResponse, BookingStatus } from '@/lib/types'
import DashboardShell from '@/components/dashboard/DashboardShell'
import BookingCard from '@/components/bookings/BookingCard'
import { DEMO_BOOKINGS_CLIENT, DEMO_BOOKINGS_PLANNER } from '@/showcase/data'
import { cn } from '@/lib/utils'

type Tab = 'all' | 'active' | 'completed' | 'other'

const ACTIVE_STATUSES: BookingStatus[]    = ['REQUESTED', 'ACCEPTED']
const COMPLETED_STATUSES: BookingStatus[] = ['COMPLETED']
const OTHER_STATUSES: BookingStatus[]     = ['CANCELLED', 'DECLINED', 'REFUNDED', 'DISPUTED', 'AT_RISK']

function sortBookings(list: BookingResponse[]): BookingResponse[] {
  return [...list].sort((a, b) => {
    // Active/upcoming first, then by event date desc
    const aActive = ACTIVE_STATUSES.includes(a.status)
    const bActive = ACTIVE_STATUSES.includes(b.status)
    if (aActive !== bActive) return aActive ? -1 : 1
    return new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
  })
}

export default function BookingsPage() {
  const { token, user } = useAuthStore()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('all')

  useEffect(() => {
    if (!token) router.replace('/auth/login?redirect=/dashboard/bookings')
  }, [token, router])

  const isPlanner = user?.role === 'PLANNER'
  const endpoint   = isPlanner ? '/bookings/received' : '/bookings/my'
  const queryKey   = isPlanner ? 'received-bookings' : 'my-bookings'
  const DEMO       = isPlanner ? DEMO_BOOKINGS_PLANNER : DEMO_BOOKINGS_CLIENT

  const { data: bookings = DEMO, isLoading } = useQuery<BookingResponse[]>({
    queryKey: [queryKey],
    queryFn: () => api.get(endpoint).then(r => r.data.data),
    enabled: !!token,
    placeholderData: DEMO,
    retry: false,
  })

  if (!user) return null

  const active    = bookings.filter(b => ACTIVE_STATUSES.includes(b.status))
  const completed = bookings.filter(b => COMPLETED_STATUSES.includes(b.status))
  const other     = bookings.filter(b => OTHER_STATUSES.includes(b.status))

  const filtered = tab === 'all'       ? bookings
                 : tab === 'active'    ? active
                 : tab === 'completed' ? completed
                 : other

  const sorted = sortBookings(filtered)

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'all',       label: 'All',       count: bookings.length },
    { key: 'active',    label: 'Active',    count: active.length },
    { key: 'completed', label: 'Completed', count: completed.length },
    { key: 'other',     label: 'Other',     count: other.length },
  ]

  const emptyMessages: Record<Tab, string> = {
    all:       'No bookings yet.',
    active:    'No active bookings.',
    completed: 'No completed bookings yet.',
    other:     'No cancelled or declined bookings.',
  }

  return (
    <DashboardShell title={isPlanner ? 'Received Bookings' : 'Your Bookings'}>

      {/* Stats row */}
      {!isLoading && bookings.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-white border border-cream rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-charcoal">{bookings.length}</p>
            <p className="text-xs text-stone-warm mt-1">Total</p>
          </div>
          <div className="bg-white border border-cream rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-700">{active.length}</p>
            <p className="text-xs text-stone-warm mt-1">Active</p>
          </div>
          <div className="bg-white border border-cream rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-charcoal">{completed.length}</p>
            <p className="text-xs text-stone-warm mt-1">Completed</p>
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
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 bg-white border border-cream rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && sorted.length === 0 && (
        <div className="bg-white border border-cream rounded-xl p-8 text-center">
          <p className="text-stone-warm">{emptyMessages[tab]}</p>
        </div>
      )}

      {/* List */}
      {!isLoading && sorted.length > 0 && (
        <div className="flex flex-col gap-3">
          {sorted.map(b => (
            <BookingCard key={b.id} booking={b} role={user.role} />
          ))}
        </div>
      )}
    </DashboardShell>
  )
}
