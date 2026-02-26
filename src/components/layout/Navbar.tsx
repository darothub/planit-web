import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuthStore } from '@/store/authStore'
import Cookies from 'js-cookie'
import { useState, useEffect, useRef } from 'react'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const handleLogout = () => {
    Cookies.remove('planit_token')
    logout()
    router.push('/')
    setOpen(false)
  }

  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : null

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-cream">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-8">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/favicon.ico" alt="" aria-hidden className="w-6 h-6 object-contain" />
          <span className="text-xl font-bold text-accent tracking-tight">planit</span>
        </Link>

        {/* Centre nav link */}
        <div className="hidden md:flex flex-1 justify-center">
          <Link
            href="/listings"
            className="text-sm font-medium text-charcoal hover:text-primary transition-colors"
          >
            Browse Events
          </Link>
        </div>

        {/* Right: pill button + dropdown */}
        <div ref={ref} className="relative shrink-0">
          <button
            onClick={() => setOpen(o => !o)}
            aria-label="Open menu"
            aria-expanded={open}
            className="flex items-center gap-2 border border-cream rounded-full px-3 py-1.5 hover:shadow-sm transition-shadow bg-white"
          >
            {/* Hamburger icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>

            {/* Avatar */}
            {initials ? (
              <span className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold leading-none">
                {initials}
              </span>
            ) : (
              <span className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-stone-500" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </button>

          {/* Dropdown */}
          {open && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-cream z-50 py-1 overflow-hidden">
              {!user ? (
                <>
                  <DropItem href="/auth/login" onClick={() => setOpen(false)}>Sign in</DropItem>
                  <DropItem href="/auth/register" onClick={() => setOpen(false)}>Sign up</DropItem>
                </>
              ) : (
                <>
                  <DropItem href="/dashboard" onClick={() => setOpen(false)}>Dashboard</DropItem>
                  <DropItem href="/messages" onClick={() => setOpen(false)}>Messages</DropItem>
                  <DropItem href="/dashboard/profile" onClick={() => setOpen(false)}>Profile &amp; Settings</DropItem>
                  {user.role === 'CLIENT' && (
                    <DropItem href="/auth/register?role=PLANNER" onClick={() => setOpen(false)}>Become a Planner</DropItem>
                  )}
                  {user.role === 'PLANNER' && (
                    <DropItem href="/dashboard/listings" onClick={() => setOpen(false)}>My Listings</DropItem>
                  )}
                  <div className="border-t border-cream my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-stone-warm hover:bg-sand transition-colors"
                  >
                    Sign out
                  </button>
                </>
              )}
            </div>
          )}
        </div>

      </div>
    </nav>
  )
}

function DropItem({
  href,
  onClick,
  children,
}: {
  href: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-4 py-2.5 text-sm text-charcoal hover:bg-sand transition-colors"
    >
      {children}
    </Link>
  )
}
