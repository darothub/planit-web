import Head from 'next/head'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import AdminShell from '@/components/admin/AdminShell'
import { api } from '@/lib/api'
import { AdminStatsResponse } from '@/lib/types'
import { formatPrice, cn } from '@/lib/utils'
const EMPTY_STATS: AdminStatsResponse = {
  pendingPlanners: 0, verifiedPlanners: 0, openDisputes: 0,
  totalClients: 0, totalPlanners: 0, publishedListings: 0,
  totalBookings: 0, totalRevenue: 0,
}

function StatCard({
  label,
  value,
  sub,
  variant = 'default',
}: {
  label: string
  value: string | number
  sub?: string
  variant?: 'default' | 'warn' | 'danger' | 'accent'
}) {
  const valueClass =
    variant === 'warn'   ? 'text-amber-600' :
    variant === 'danger' ? 'text-red-600'   :
    variant === 'accent' ? 'text-primary'   :
    'text-charcoal'

  const cardClass =
    variant === 'warn'   ? 'bg-amber-50 border-amber-200' :
    variant === 'danger' ? 'bg-red-50 border-red-200'     :
    variant === 'accent' ? 'bg-primary/5 border-primary/20' :
    'bg-white border-cream'

  return (
    <div className={cn('rounded-xl border p-5', cardClass)}>
      <p className="text-xs font-medium text-stone-warm uppercase tracking-wider">{label}</p>
      <p className={cn('text-3xl font-bold mt-1', valueClass)}>{value}</p>
      {sub && <p className="text-xs text-stone-warm mt-1">{sub}</p>}
    </div>
  )
}

function StatCardSkeleton() {
  return <div className="rounded-xl border border-cream bg-white p-5 h-24 animate-pulse" />
}

type QuickAction = {
  href: string
  icon: string
  iconBg: string
  iconColor: string
  title: string
  description: string
  badge?: number
  badgeColor?: string
}

function QuickActionCard({ href, icon, iconBg, iconColor, title, description, badge, badgeColor }: QuickAction) {
  return (
    <Link
      href={href}
      className="flex items-start gap-4 bg-white border border-cream rounded-xl p-5 hover:shadow-md transition-shadow group"
    >
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0', iconBg, iconColor)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-charcoal group-hover:text-primary transition-colors">{title}</p>
          {badge != null && badge > 0 && (
            <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded-full', badgeColor ?? 'bg-gray-100 text-gray-600')}>
              {badge}
            </span>
          )}
        </div>
        <p className="text-sm text-stone-warm mt-0.5">{description}</p>
      </div>
      <span className="text-stone-warm group-hover:text-primary transition-colors shrink-0 mt-0.5">→</span>
    </Link>
  )
}

export default function AdminOverviewPage() {
  const { data: stats = EMPTY_STATS, isLoading } = useQuery<AdminStatsResponse>({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats').then(r => r.data.data),
    retry: false,
    refetchInterval: 60_000,
  })

  const hasAlerts = stats.pendingPlanners > 0 || stats.openDisputes > 0

  return (
    <>
      <Head><title>Overview — Planit Admin</title></Head>
      <AdminShell title="Overview">

        {/* Attention banners */}
        {hasAlerts && (
          <div className="flex flex-wrap gap-3 mb-6">
            {stats.pendingPlanners > 0 && (
              <Link
                href="/admin/planners"
                className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium px-4 py-2 rounded-lg hover:bg-amber-100 transition-colors"
              >
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold">
                  {stats.pendingPlanners}
                </span>
                planner {stats.pendingPlanners === 1 ? 'application' : 'applications'} awaiting review
              </Link>
            )}
            {stats.openDisputes > 0 && (
              <Link
                href="/admin/disputes"
                className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
              >
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                  {stats.openDisputes}
                </span>
                open {stats.openDisputes === 1 ? 'dispute' : 'disputes'} needing resolution
              </Link>
            )}
          </div>
        )}

        {/* Users section */}
        <p className="text-xs font-semibold text-stone-warm uppercase tracking-wider mb-3">Users</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {isLoading ? (
            [1, 2, 3, 4].map(i => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard label="Total clients"    value={stats.totalClients.toLocaleString()} />
              <StatCard label="Total planners"   value={stats.totalPlanners.toLocaleString()} />
              <StatCard
                label="Verified planners"
                value={stats.verifiedPlanners.toLocaleString()}
                sub={`${stats.totalPlanners - stats.verifiedPlanners} pending`}
              />
              <StatCard
                label="Pending approvals"
                value={stats.pendingPlanners}
                variant={stats.pendingPlanners > 0 ? 'warn' : 'default'}
              />
            </>
          )}
        </div>

        {/* Marketplace section */}
        <p className="text-xs font-semibold text-stone-warm uppercase tracking-wider mb-3">Marketplace</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {isLoading ? (
            [1, 2, 3, 4].map(i => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard label="Published listings" value={stats.publishedListings.toLocaleString()} />
              <StatCard label="Total bookings"     value={stats.totalBookings.toLocaleString()} />
              <StatCard
                label="Open disputes"
                value={stats.openDisputes}
                variant={stats.openDisputes > 0 ? 'danger' : 'default'}
              />
              <StatCard
                label="Revenue captured"
                value={formatPrice(stats.totalRevenue)}
                sub="Stripe captured payments"
                variant="accent"
              />
            </>
          )}
        </div>

        {/* Quick actions */}
        <p className="text-xs font-semibold text-stone-warm uppercase tracking-wider mb-3">Quick actions</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <QuickActionCard
            href="/admin/planners"
            icon="✓"
            iconBg="bg-amber-100"
            iconColor="text-amber-700"
            title="Planner Queue"
            description="Review and verify new planner applications"
            badge={stats.pendingPlanners}
            badgeColor="bg-amber-100 text-amber-800"
          />
          <QuickActionCard
            href="/admin/disputes"
            icon="⚖"
            iconBg="bg-red-100"
            iconColor="text-red-700"
            title="Disputes"
            description="Resolve open disputes — issue refunds or release funds"
            badge={stats.openDisputes}
            badgeColor="bg-red-100 text-red-800"
          />
          <QuickActionCard
            href="/admin/listings"
            icon="🗂"
            iconBg="bg-blue-100"
            iconColor="text-blue-700"
            title="Listings"
            description="Search, review, and bulk-delete event listings"
          />
        </div>

      </AdminShell>
    </>
  )
}
