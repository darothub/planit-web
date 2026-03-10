import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuthStore } from '@/store/authStore'
import { DEMO_ADMIN_USER, DEMO_CLIENT_USER, DEMO_PLANNER_USER } from './data'

type DeviceWidth = 'mobile' | 'tablet' | 'desktop'
type DemoRole = 'CLIENT' | 'PLANNER' | 'ADMIN' | 'GUEST'

type Props = {
  pageName: string
  demoRole?: DemoRole
  children: React.ReactNode
}

const DEVICE_WIDTHS: Record<DeviceWidth, string> = {
  mobile:  'max-w-[390px]',
  tablet:  'max-w-[768px]',
  desktop: 'max-w-full',
}

// ─── Route interception ───────────────────────────────────────────────────────
//
// Every component rendered in the showcase can produce navigation (Links,
// router.push, router.replace). All of it must stay inside /showcase/*.
//
// Return values:
//   null      → suppress navigation entirely  (no page change)
//   string    → redirect to this showcase URL instead
//   undefined → allow through unchanged

function getShowcaseRedirect(
  url: string | { pathname?: string },
  demoRole: DemoRole,
): string | null | undefined {
  const raw      = typeof url === 'string' ? url : (url.pathname ?? '/')
  const pathname = raw.split('?')[0]

  // ── Always suppress auth routes (login/register redirects) ────────────────
  if (pathname.startsWith('/auth/')) return null

  // ── Home ──────────────────────────────────────────────────────────────────
  if (pathname === '/') return '/showcase/home'

  // ── Public listings ───────────────────────────────────────────────────────
  if (pathname === '/listings') return '/showcase/listings'
  if (pathname.startsWith('/listings/')) return '/showcase/listing-detail'

  // ── Messages ──────────────────────────────────────────────────────────────
  const msgMatch = pathname.match(/^\/messages\/(.+)/)
  if (msgMatch) return `/showcase/messages?inquiryId=${msgMatch[1]}`

  // ── Planner profiles ──────────────────────────────────────────────────────
  if (pathname.startsWith('/planners/')) return '/showcase/planner-profile'

  // ── Dashboard routes ──────────────────────────────────────────────────────
  if (!pathname.startsWith('/dashboard')) return undefined // allow anything else through

  const clientOverview  = '/showcase/dashboard-client'
  const plannerOverview = '/showcase/dashboard-planner'

  if (demoRole === 'CLIENT') {
    if (pathname === '/dashboard')                             return clientOverview
    if (pathname === '/dashboard/bookings')                    return '/showcase/dashboard-bookings-client'
    if (pathname.startsWith('/dashboard/bookings/'))           return '/showcase/dashboard-booking-detail?id=demo-1'
    if (pathname === '/dashboard/inquiries')                   return '/showcase/dashboard-inquiries'
    if (pathname === '/dashboard/disputes')                    return '/showcase/dashboard-disputes'
    if (pathname === '/dashboard/profile')                     return clientOverview
    return clientOverview
  }

  if (demoRole === 'PLANNER') {
    if (pathname === '/dashboard')                             return plannerOverview
    if (pathname === '/dashboard/bookings')                    return '/showcase/dashboard-bookings-planner'
    if (pathname.startsWith('/dashboard/bookings/'))           return '/showcase/dashboard-booking-detail?id=demo-1'
    if (pathname === '/dashboard/listings')                    return '/showcase/dashboard-listings'
    if (pathname === '/dashboard/listings/new')                return '/showcase/dashboard-listing-form'
    if (pathname.startsWith('/dashboard/listings/'))           return '/showcase/dashboard-listing-form'
    if (pathname === '/dashboard/inquiries')                   return '/showcase/dashboard-inquiries-planner'
    if (pathname === '/dashboard/calendar')                    return '/showcase/dashboard-calendar'
    if (pathname === '/dashboard/disputes')                    return '/showcase/dashboard-disputes'
    if (pathname === '/dashboard/profile')                     return plannerOverview
    return plannerOverview
  }

  // GUEST hitting any dashboard route — send to showcase index
  return '/showcase'
}

function getAdminShowcaseRedirect(url: string | { pathname?: string }): string | null | undefined {
  const raw      = typeof url === 'string' ? url : (url.pathname ?? '/')
  const pathname = raw.split('?')[0]
  if (pathname === '/admin' || pathname === '/admin/planners') return '/showcase/admin-planners'
  if (pathname === '/admin/disputes') return '/showcase/admin-disputes'
  return undefined
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ShowcaseShell({ pageName, demoRole = 'GUEST', children }: Props) {
  const router = useRouter()
  const [device, setDevice] = useState<DeviceWidth>('desktop')

  // authReady gates child rendering: children only mount AFTER auth has been
  // injected into the store, so protected pages' useEffect redirect guards
  // always see a valid (or intentionally null) token on their first render.
  const [authReady, setAuthReady] = useState(false)
  const savedRef = useRef(useAuthStore.getState())

  // ── Auth injection (before children mount) ────────────────────────────────
  useLayoutEffect(() => {
    if (demoRole === 'CLIENT') {
      useAuthStore.setState({
        token: DEMO_CLIENT_USER.token,
        user: {
          id:        DEMO_CLIENT_USER.userId,
          email:     DEMO_CLIENT_USER.email,
          firstName: DEMO_CLIENT_USER.firstName,
          lastName:  DEMO_CLIENT_USER.lastName,
          role:      DEMO_CLIENT_USER.role,
        },
      })
    } else if (demoRole === 'PLANNER') {
      useAuthStore.setState({
        token: DEMO_PLANNER_USER.token,
        user: {
          id:        DEMO_PLANNER_USER.userId,
          email:     DEMO_PLANNER_USER.email,
          firstName: DEMO_PLANNER_USER.firstName,
          lastName:  DEMO_PLANNER_USER.lastName,
          role:      DEMO_PLANNER_USER.role,
        },
      })
    } else if (demoRole === 'ADMIN') {
      useAuthStore.setState({
        token: DEMO_ADMIN_USER.token,
        user: {
          id:        DEMO_ADMIN_USER.userId,
          email:     DEMO_ADMIN_USER.email,
          firstName: DEMO_ADMIN_USER.firstName,
          lastName:  DEMO_ADMIN_USER.lastName,
          role:      DEMO_ADMIN_USER.role,
        },
      })
    } else {
      // GUEST keeps token null (auth-page showcase: prevents redirect to /dashboard)
      useAuthStore.setState({ token: null, user: null })
    }

    // React flushes this synchronously before paint — children always mount
    // with auth already in the store, so their useEffect redirect guards pass.
    setAuthReady(true)

    return () => { useAuthStore.setState(savedRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoRole])

  // ── Route interception — catches ALL navigation including <Link> clicks ─────
  //
  // Monkey-patching router.push/replace misses <Link> clicks because Next.js
  // Pages Router's <Link> goes through the router singleton directly. Using
  // router.events catches every route change regardless of how it was triggered.
  //
  // Pattern: throw in routeChangeStart to cancel; re-navigate in routeChangeError.
  useEffect(() => {
    function onRouteChangeStart(url: string) {
      if (url.startsWith('/showcase')) return  // already in showcase — allow

      const adminRedirect = demoRole === 'ADMIN'
        ? getAdminShowcaseRedirect(url)
        : undefined
      const redirect = adminRedirect !== undefined
        ? adminRedirect
        : getShowcaseRedirect(url, demoRole)

      if (redirect !== undefined) {
        // null = suppress, string = reroute — cancel this navigation either way
        throw 'showcase-intercept'
      }
      // undefined = allow through unchanged
    }

    function onRouteChangeError(err: unknown, url: string) {
      if (err !== 'showcase-intercept') return

      const adminRedirect = demoRole === 'ADMIN'
        ? getAdminShowcaseRedirect(url)
        : undefined
      const redirect = adminRedirect !== undefined
        ? adminRedirect
        : getShowcaseRedirect(url, demoRole)

      if (redirect !== null && redirect !== undefined) {
        // Defer until the router has fully settled from the cancelled navigation.
        // Calling router.push synchronously here fails silently because the router
        // is still in error-cleanup state at this point.
        setTimeout(() => router.push(redirect), 0)
      }
      // redirect === null: suppress entirely — do nothing
    }

    router.events.on('routeChangeStart', onRouteChangeStart)
    router.events.on('routeChangeError', onRouteChangeError)

    return () => {
      router.events.off('routeChangeStart', onRouteChangeStart)
      router.events.off('routeChangeError', onRouteChangeError)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoRole])

  return (
    <div className="min-h-screen bg-sand">
      {/* Chrome bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-10 bg-charcoal text-white flex items-center px-4 gap-4 text-sm">
        <Link
          href="/showcase"
          className="flex items-center gap-1 text-white/70 hover:text-white transition-colors text-xs shrink-0"
        >
          ← All screens
        </Link>

        <span className="flex-1 text-center font-semibold truncate">{pageName}</span>

        <div className="flex items-center gap-1 shrink-0">
          {(
            [
              { key: 'mobile',  icon: '📱', label: 'Mobile'  },
              { key: 'tablet',  icon: '💻', label: 'Tablet'  },
              { key: 'desktop', icon: '🖥',  label: 'Desktop' },
            ] as { key: DeviceWidth; icon: string; label: string }[]
          ).map(({ key, icon, label }) => (
            <button
              key={key}
              title={label}
              onClick={() => setDevice(key)}
              className={`w-7 h-7 flex items-center justify-center rounded transition-colors text-base ${
                device === key ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Content — offset by chrome bar height (h-10 = 40px) */}
      <div className="pt-10">
        <div className={`${DEVICE_WIDTHS[device]} mx-auto transition-all duration-300`}>
          {authReady && children}
        </div>
      </div>
    </div>
  )
}
