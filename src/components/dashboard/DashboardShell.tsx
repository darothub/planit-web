import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuthStore } from '@/store/authStore'
import Navbar from '@/components/layout/Navbar'
import { cn } from '@/lib/utils'

const clientNav = [
  { href: '/dashboard',            label: 'Overview',  icon: '🏠', exact: true },
  { href: '/dashboard/bookings',   label: 'Bookings',  icon: '📋' },
  { href: '/dashboard/inquiries',  label: 'Messages',  icon: '💬' },
  { href: '/dashboard/disputes',   label: 'Disputes',  icon: '⚠️' },
]

const plannerNav = [
  { href: '/dashboard',            label: 'Overview',  icon: '📊', exact: true },
  { href: '/dashboard/bookings',   label: 'Bookings',  icon: '📋' },
  { href: '/dashboard/listings',   label: 'Listings',  icon: '🗂' },
  { href: '/dashboard/inquiries',  label: 'Messages',  icon: '💬' },
  { href: '/dashboard/calendar',   label: 'Calendar',  icon: '📅' },
  { href: '/dashboard/disputes',   label: 'Disputes',  icon: '⚠️' },
  { href: '/dashboard/profile',    label: 'Profile',   icon: '👤' },
]

type Props = {
  children: React.ReactNode
  title?: string
}

export default function DashboardShell({ children, title }: Props) {
  const router = useRouter()
  const { user } = useAuthStore()
  const nav = user?.role === 'PLANNER' ? plannerNav : clientNav

  const isActive = (href: string, exact?: boolean) =>
    exact ? router.pathname === href : router.pathname.startsWith(href)

  return (
    <div className="min-h-screen bg-sand">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">

        {/* Sidebar — desktop */}
        <aside className="hidden md:block w-52 flex-shrink-0">
          <nav className="flex flex-col gap-1">
            {nav.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-btn text-sm font-medium transition-colors',
                  isActive(item.href, item.exact)
                    ? 'bg-primary text-white'
                    : 'text-charcoal hover:bg-cream'
                )}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Mobile nav strip */}
        <div className="md:hidden w-full mb-4">
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {nav.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-btn text-xs font-medium transition-colors',
                  isActive(item.href, item.exact)
                    ? 'bg-primary text-white'
                    : 'text-charcoal bg-white border border-cream'
                )}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Main */}
        <main className="flex-1 min-w-0">
          {title && <h1 className="text-2xl font-bold text-charcoal mb-6">{title}</h1>}
          {children}
        </main>

      </div>
    </div>
  )
}
