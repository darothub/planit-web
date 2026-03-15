import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'
import {
  Squares2X2Icon,
  ClipboardDocumentListIcon,
  ListBulletIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'

type NavItem = {
  href: string
  label: string
  icon: React.ElementType
  exact?: boolean
}

const plannerSideNav: NavItem[] = [
  { href: '/dashboard',           label: 'Overview',  icon: Squares2X2Icon,             exact: true },
  { href: '/dashboard/bookings',  label: 'Bookings',  icon: ClipboardDocumentListIcon },
  { href: '/dashboard/listings',  label: 'Listings',  icon: ListBulletIcon },
  { href: '/dashboard/inquiries', label: 'Messages',  icon: ChatBubbleLeftRightIcon },
  { href: '/dashboard/calendar',  label: 'Calendar',  icon: CalendarIcon },
  { href: '/dashboard/disputes',  label: 'Disputes',  icon: ExclamationTriangleIcon },
  { href: '/dashboard/profile',   label: 'Profile',   icon: UserCircleIcon },
]

const clientSideNav: NavItem[] = [
  { href: '/dashboard',           label: 'Overview',  icon: Squares2X2Icon,             exact: true },
  { href: '/dashboard/bookings',  label: 'Bookings',  icon: ClipboardDocumentListIcon },
  { href: '/dashboard/inquiries', label: 'Messages',  icon: ChatBubbleLeftRightIcon },
  { href: '/dashboard/disputes',  label: 'Disputes',  icon: ExclamationTriangleIcon },
  { href: '/dashboard/settings',  label: 'Settings',  icon: Cog6ToothIcon },
]

const plannerMobileNav: NavItem[] = [
  { href: '/dashboard',           label: 'Overview',  icon: Squares2X2Icon,             exact: true },
  { href: '/dashboard/listings',  label: 'Listings',  icon: ListBulletIcon },
  { href: '/dashboard/inquiries', label: 'Messages',  icon: ChatBubbleLeftRightIcon },
  { href: '/dashboard/calendar',  label: 'Calendar',  icon: CalendarIcon },
  { href: '/dashboard/profile',   label: 'Profile',   icon: UserCircleIcon },
]

const clientMobileNav: NavItem[] = [
  { href: '/dashboard',           label: 'Overview',  icon: Squares2X2Icon,             exact: true },
  { href: '/dashboard/bookings',  label: 'Bookings',  icon: ClipboardDocumentListIcon },
  { href: '/dashboard/inquiries', label: 'Messages',  icon: ChatBubbleLeftRightIcon },
  { href: '/dashboard/disputes',  label: 'Disputes',  icon: ExclamationTriangleIcon },
  { href: '/dashboard/settings',  label: 'Settings',  icon: Cog6ToothIcon },
]

type Props = {
  children: React.ReactNode
  title?: string
}

export default function DashboardShell({ children, title }: Props) {
  const router = useRouter()
  const { user } = useAuthStore()
  const isPlanner = user?.role === 'PLANNER'
  const sideNav   = isPlanner ? plannerSideNav  : clientSideNav
  const mobileNav = isPlanner ? plannerMobileNav : clientMobileNav

  const isActive = (href: string, exact?: boolean) =>
    exact ? router.pathname === href : router.pathname.startsWith(href)

  const dateStr = new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })

  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : 'U'

  return (
    <div className="min-h-screen bg-sand">

      {/* ── Desktop sidebar ─────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-14 bg-charcoal z-30 flex-col items-center py-3">
        {/* Logo */}
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mb-5">
          <span className="text-white text-xs font-bold leading-none">P</span>
        </div>

        {/* Nav items */}
        <div className="flex-1 flex flex-col items-center gap-1 w-full px-2">
          {sideNav.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact)
            return (
              <Link
                key={href}
                href={href}
                title={label}
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-lg transition-colors',
                  active
                    ? 'bg-white/20 text-white'
                    : 'text-white/55 hover:bg-white/10 hover:text-white'
                )}
              >
                <Icon className="w-5 h-5" />
              </Link>
            )
          })}
        </div>

        {/* Bottom: settings + avatar */}
        <div className="flex flex-col items-center gap-2 px-2 pb-1">
          <Link
            href="/dashboard/settings"
            title="Settings"
            className="flex items-center justify-center w-10 h-10 rounded-lg text-white/55 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Cog6ToothIcon className="w-5 h-5" />
          </Link>
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">{initials}</span>
          </div>
        </div>
      </aside>

      {/* ── Main area ───────────────────────────────────────────────────────── */}
      <div className="lg:pl-14">

        {/* Desktop top bar */}
        <header className="hidden lg:flex items-center gap-4 bg-white border-b border-cream px-6 py-3">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm font-semibold text-charcoal">Dashboard</span>
            <span className="text-stone-warm text-sm">· {dateStr}</span>
          </div>
          <div className="flex-1 max-w-xs">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-warm" />
              <input
                type="text"
                placeholder="Search…"
                className="input-base pl-9 py-1.5 text-sm"
              />
            </div>
          </div>
          {isPlanner && (
            <Link
              href="/dashboard/listings/new"
              className="ml-auto flex items-center gap-1 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-btn hover:bg-primary-hover transition-colors whitespace-nowrap"
            >
              + New Listing
            </Link>
          )}
        </header>

        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center justify-between bg-white border-b border-cream px-4 py-3">
          <span className="font-bold text-primary text-lg tracking-tight">planit*</span>
          <div className="flex items-center gap-3">
            {isPlanner && (
              <Link
                href="/dashboard/listings/new"
                className="text-sm font-semibold text-primary"
              >
                + New
              </Link>
            )}
            <div className="w-8 h-8 bg-charcoal rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">{initials}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-screen pb-24 lg:pb-6">
          {title && (
            <div className="px-4 lg:px-6 pt-6 mb-1">
              <h1 className="text-2xl font-bold text-charcoal">{title}</h1>
            </div>
          )}
          {children}
        </main>
      </div>

      {/* ── Mobile bottom tab bar ────────────────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-cream z-30">
        <div className="flex">
          {mobileNav.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors',
                  active ? 'text-primary' : 'text-stone-warm'
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

    </div>
  )
}
