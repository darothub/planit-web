import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { InquiryResponse, InquiryStatus } from '@/lib/types'
import DashboardShell from '@/components/dashboard/DashboardShell'
import InquiryCard from '@/components/inquiries/InquiryCard'
import { DEMO_INQUIRIES_CLIENT, DEMO_INQUIRIES_RECEIVED } from '@/showcase/data'
import { cn } from '@/lib/utils'

type Tab = 'all' | 'pending' | 'active' | 'closed'

const STATUS_ORDER: Record<InquiryStatus, number> = { PENDING: 0, ACTIVE: 1, CLOSED: 2 }

function sortInquiries(list: InquiryResponse[]): InquiryResponse[] {
  return [...list].sort((a, b) => {
    const statusDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
    if (statusDiff !== 0) return statusDiff
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

export default function InquiriesPage() {
  const { token, user } = useAuthStore()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('all')

  useEffect(() => {
    if (!token) router.replace('/auth/login?redirect=/dashboard/inquiries')
  }, [token, router])

  const isPlanner = user?.role === 'PLANNER'
  const endpoint   = isPlanner ? '/inquiries/received' : '/inquiries/my'
  const queryKey   = isPlanner ? 'received-inquiries' : 'my-inquiries'
  const DEMO       = isPlanner ? DEMO_INQUIRIES_RECEIVED : DEMO_INQUIRIES_CLIENT

  const { data: inquiries = DEMO, isLoading } = useQuery<InquiryResponse[]>({
    queryKey: [queryKey],
    queryFn: () => api.get(endpoint).then(r => r.data.data),
    enabled: !!token,
    placeholderData: DEMO,
    retry: false,
  })

  if (!user) return null

  const pending = inquiries.filter(i => i.status === 'PENDING')
  const active  = inquiries.filter(i => i.status === 'ACTIVE')
  const closed  = inquiries.filter(i => i.status === 'CLOSED')

  const filtered = tab === 'all'     ? inquiries
                 : tab === 'pending' ? pending
                 : tab === 'active'  ? active
                 : closed

  const sorted = sortInquiries(filtered)

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'all',     label: 'All',     count: inquiries.length },
    { key: 'pending', label: 'Pending', count: pending.length },
    { key: 'active',  label: 'Active',  count: active.length },
    { key: 'closed',  label: 'Closed',  count: closed.length },
  ]

  const emptyMessages: Record<Tab, string> = {
    all:     isPlanner ? 'No inquiries received yet.' : 'No inquiries sent yet.',
    pending: 'No pending inquiries.',
    active:  'No active conversations.',
    closed:  'No closed inquiries.',
  }

  return (
    <DashboardShell title="Inquiries">

      {/* Stats row */}
      {!isLoading && inquiries.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-white border border-cream rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-charcoal">{inquiries.length}</p>
            <p className="text-xs text-stone-warm mt-1">Total</p>
          </div>
          <div className="bg-white border border-cream rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{pending.length}</p>
            <p className="text-xs text-stone-warm mt-1">Pending</p>
          </div>
          <div className="bg-white border border-cream rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-700">{active.length}</p>
            <p className="text-xs text-stone-warm mt-1">Active</p>
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
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-white border border-cream rounded-xl animate-pulse" />
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
        <div className="flex flex-col gap-2">
          {sorted.map(i => (
            <InquiryCard key={i.id} inquiry={i} role={user.role} />
          ))}
        </div>
      )}

    </DashboardShell>
  )
}
