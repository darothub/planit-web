import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuthStore } from '@/store/authStore'
import Cookies from 'js-cookie'
import { useState } from 'react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    Cookies.remove('planit_token')
    logout()
    router.push('/')
  }

  return (
    <nav className="sticky top-0 z-50 bg-parchment/95 backdrop-blur-md border-b border-cream">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-8">

        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-accent tracking-tight">
          planit
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/listings"
            className="text-sm font-medium text-charcoal hover:text-primary transition-colors"
          >
            Browse Planners
          </Link>

          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-charcoal hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-stone-warm hover:text-primary transition-colors"
              >
                Sign out
              </button>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                {user.firstName[0]}{user.lastName[0]}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-medium text-charcoal hover:text-primary transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className="bg-primary hover:bg-primary-hover text-white text-sm font-semibold
                  px-5 py-2 rounded-btn transition-colors"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-charcoal"
          onClick={() => setMobileOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen
            ? <XMarkIcon className="w-6 h-6" />
            : <Bars3Icon className="w-6 h-6" />
          }
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-parchment border-t border-cream px-4 py-4 flex flex-col gap-3">
          <Link
            href="/listings"
            className="text-sm font-medium text-charcoal py-2"
            onClick={() => setMobileOpen(false)}
          >
            Browse Planners
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-charcoal py-2" onClick={() => setMobileOpen(false)}>
                Dashboard
              </Link>
              <button onClick={handleLogout} className="text-sm font-medium text-stone-warm text-left py-2">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm font-medium text-charcoal py-2" onClick={() => setMobileOpen(false)}>
                Sign in
              </Link>
              <Link href="/auth/register" className="bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-btn text-center" onClick={() => setMobileOpen(false)}>
                Get started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}