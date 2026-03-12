import Head from 'next/head'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import AdminShell from '@/components/admin/AdminShell'
import { api } from '@/lib/api'
import { AdminStatsResponse } from '@/lib/types'
import { formatPrice } from '@/lib/utils'

const DEMO_STATS: AdminStatsResponse = {
  pendingPlanners: 0,
  verifiedPlanners: 0,
  openDisputes: 0,
  totalClients: 0,
  totalPlanners: 0,
  publishedListings: 0,
  totalBookings: 0,
  totalRevenue: 0,
}

type StatCardProps = {
  label: string
  value: string | number
  sub?: string
  accent?: boolean
}

function StatCard({ label, value, sub, accent }: StatCardProps) {
  return (
    <div className={`rounded-xl border p-5 ${accent ? 'bg-primary/5 border-primary/20' : 'bg-white border-cream'}`}>
      <p className="text-xs font-medium text-stone-warm uppercase tracking-wider">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${accent ? 'text-primary' : 'text-charcoal'}`}>{value}</p>
      {sub && <p className="text-xs text-stone-warm mt-1">{sub}</p>}
    </div>
  )
}

export default function AdminOverviewPage() {
  const { data: stats = DEMO_STATS } = useQuery<AdminStatsResponse>({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats').then(r => r.data.data),
    placeholderData: DEMO_STATS,
    retry: false,
    refetchInterval: 60_000,
  })

  return (
    <>
      <Head><title>Overview — Planit Admin</title></Head>
      <AdminShell title="Overview">

        {/* Attention-needed row */}
        {(stats.pendingPlanners > 0 || stats.openDisputes > 0) && (
          <div className="flex flex-wrap gap-3 mb-8">
            {stats.pendingPlanners > 0 && (
              <Link
                href="/admin/planners"
                className="flex items-center gap-2 bg-amber-50 border border-amber-200
                  text-amber-800 text-sm font-medium px-4 py-2 rounded-lg
                  hover:bg-amber-100 transition-colors"
              >
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs
                  flex items-center justify-center font-bold">
                  {stats.pendingPlanners}
                </span>
                planner {stats.pendingPlanners === 1 ? 'application' : 'applications'} awaiting review
              </Link>
            )}
            {stats.openDisputes > 0 && (
              <Link
                href="/admin/disputes"
                className="flex items-center gap-2 bg-red-50 border border-red-200
                  text-red-800 text-sm font-medium px-4 py-2 rounded-lg
                  hover:bg-red-100 transition-colors"
              >
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs
                  flex items-center justify-center font-bold">
                  {stats.openDisputes}
                </span>
                open {stats.openDisputes === 1 ? 'dispute' : 'disputes'} needing resolution
              </Link>
            )}
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <StatCard
            label="Pending approvals"
            value={stats.pendingPlanners}
            accent={stats.pendingPlanners > 0}
          />
          <StatCard
            label="Open disputes"
            value={stats.openDisputes}
            accent={stats.openDisputes > 0}
          />
          <StatCard
            label="Total clients"
            value={stats.totalClients.toLocaleString()}
          />
          <StatCard
            label="Verified planners"
            value={stats.verifiedPlanners.toLocaleString()}
            sub={`${stats.totalPlanners} total`}
          />
          <StatCard
            label="Total bookings"
            value={stats.totalBookings.toLocaleString()}
          />
          <StatCard
            label="Published listings"
            value={stats.publishedListings.toLocaleString()}
          />
          <StatCard
            label="Revenue captured"
            value={formatPrice(stats.totalRevenue)}
            sub="Stripe captured payments"
            accent
          />
        </div>

        {/* Quick actions */}
        <h2 className="text-sm font-semibold text-stone-warm uppercase tracking-wider mb-3">
          Quick actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/admin/planners"
            className="flex items-start gap-4 bg-white border border-cream rounded-xl p-5
              hover:shadow-md transition-shadow group"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center
              text-amber-700 text-lg shrink-0">
              ✓
            </div>
            <div>
              <p className="font-semibold text-charcoal group-hover:text-primary transition-colors">
                Planner Queue
              </p>
              <p className="text-sm text-stone-warm mt-0.5">
                Review and verify new planner applications
              </p>
            </div>
          </Link>

          <Link
            href="/admin/disputes"
            className="flex items-start gap-4 bg-white border border-cream rounded-xl p-5
              hover:shadow-md transition-shadow group"
          >
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center
              text-red-700 text-lg shrink-0">
              ⚖
            </div>
            <div>
              <p className="font-semibold text-charcoal group-hover:text-primary transition-colors">
                Disputes
              </p>
              <p className="text-sm text-stone-warm mt-0.5">
                Resolve open disputes — issue refunds or release funds
              </p>
            </div>
          </Link>
        </div>

      </AdminShell>
    </>
  )
}
