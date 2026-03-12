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

  // ── Auth routes — specific showcase redirects first, then suppress the rest
  if (pathname === '/forgot-password')      return '/showcase/auth-forgot-password'
  if (pathname === '/reset-password')       return '/showcase/auth-reset-password'
  if (pathname === '/verify-email')         return '/showcase/auth-verify-email'
  if (pathname.startsWith('/auth/')) return null  // suppress login/register redirects

  // ── Home ──────────────────────────────────────────────────────────────────
  if (pathname === '/') return '/showcase/home'

  // ── Public listings ───────────────────────────────────────────────────────
  if (pathname === '/listings') return '/showcase/listings'
  if (pathname.startsWith('/listings/')) return '/showcase/listing-detail'

  // ── Messages ──────────────────────────────────────────────────────────────
  if (pathname === '/messages') return '/showcase/messages'
  const msgMatch = pathname.match(/^\/messages\/(.+)/)
  if (msgMatch) return `/showcase/messages?inquiryId=${msgMatch[1]}`

  // ── Planner routes ────────────────────────────────────────────────────────
  if (pathname === '/planners') return '/showcase/planners-browse'
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
    if (pathname === '/dashboard/settings')                    return '/showcase/dashboard-client-settings'
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
    if (pathname === '/dashboard/profile')                     return '/showcase/dashboard-planner-profile'
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
  // Two-pronged approach (routeChangeStart throw+catch is unreliable in Pages
  // Router — router.push inside routeChangeError silently fails):
  //
  //  1. Monkey-patch router.push / router.replace → programmatic navigation
  //  2. Document capture-phase click listener → <Link> clicks (fires before
  //     React/Next.js see the event, so we intercept before the Link's onClick)
  //
  // Both translate real-app URLs to their showcase equivalents using the same
  // getShowcaseRedirect / getAdminShowcaseRedirect helpers.
  useEffect(() => {
    const origPush    = router.push.bind(router)
    const origReplace = router.replace.bind(router)

    function computeRedirect(url: string | { pathname?: string }): string | null | undefined {
      const raw = typeof url === 'string' ? url : (url?.pathname ?? '/')
      if (raw.startsWith('/showcase')) return undefined  // already showcase — pass through

      if (demoRole === 'ADMIN') {
        const ar = getAdminShowcaseRedirect(url)
        if (ar !== undefined) return ar
      }
      return getShowcaseRedirect(url, demoRole)
    }

    // 1. Monkey-patch programmatic navigation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.push = (url: any, as?: any, options?: any) => {
      const redirect = computeRedirect(url)
      if (redirect === undefined) return origPush(url, as, options)
      if (redirect === null)      return Promise.resolve(false)
      return origPush(redirect)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.replace = (url: any, as?: any, options?: any) => {
      const redirect = computeRedirect(url)
      if (redirect === undefined) return origReplace(url, as, options)
      if (redirect === null)      return Promise.resolve(false)
      return origReplace(redirect)
    }

    // 2. Capture-phase click listener — intercepts <Link> clicks before
    //    Next.js's own handlers fire. stopPropagation() in capture phase
    //    prevents the event from reaching any child element handlers (including
    //    React synthetic events on the <a> tag), so the Link never calls push.
    function handleClick(e: MouseEvent) {
      const a = (e.target as Element).closest('a[href]')
      if (!a) return
      const href = a.getAttribute('href') ?? ''
      if (!href.startsWith('/') || href.startsWith('/showcase')) return  // not an internal app link

      const redirect = computeRedirect(href)
      if (redirect === undefined) return  // allow through unchanged

      e.preventDefault()
      e.stopPropagation()
      if (redirect !== null) origPush(redirect)
      // redirect === null → suppressed, do nothing
    }

    document.addEventListener('click', handleClick, true)

    return () => {
      router.push    = origPush
      router.replace = origReplace
      document.removeEventListener('click', handleClick, true)
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
