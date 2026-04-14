/**
 * AirbnbHeader — Planit-branded header with Airbnb-style structure.
 *
 * Row 1: Logo | centre tabs | right actions
 * Row 2: Pill search — What / Where / When
 */

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import LogoIcon from '@/components/ui/LogoIcon'
import { useAuthStore } from '@/store/authStore'
import { demoCategories } from '@/lib/demoData'
import Cookies from 'js-cookie'
import { cn } from '@/lib/utils'

type Tab = 'events' | 'planners'

type Props = {
  activeTab?: Tab
}

export default function AirbnbHeader({ activeTab = 'events' }: Props) {
  const router = useRouter()
  const { token, user, logout, _hasHydrated } = useAuthStore()
  const [tab,         setTab]         = useState<Tab>(activeTab)
  const [eventTypeId, setEventTypeId] = useState('')
  const [location,    setLocation]    = useState('')
  const [date,        setDate]        = useState('')
  const [menuOpen,    setMenuOpen]    = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    if (menuOpen) document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [menuOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const query: Record<string, string> = {}
    if (eventTypeId) query.eventTypeId = eventTypeId
    if (location)    query.location    = location
    if (date)        query.date        = date
    router.push({ pathname: tab === 'planners' ? '/planners' : '/listings', query })
  }

  const handleLogout = () => {
    Cookies.remove('planit_token')
    logout()
    router.push('/')
    setMenuOpen(false)
  }

  const initials    = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : null
  const profileHref = user?.role === 'PLANNER' ? '/dashboard/profile' : '/dashboard/settings'

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-cream shadow-sm">

      {/* ── Row 1: Logo · Tabs · Right actions ─────────────────────── */}
      {/* 3-column grid guarantees tabs are truly centred regardless of
          logo/right-actions widths. */}
      <div className="max-w-7xl mx-auto px-6 h-16 grid grid-cols-3 items-center">

        {/* Col 1 — Logo (left-aligned) */}
        <Link href="/" className="flex items-center gap-1 justify-self-start">
          <LogoIcon size={40} />
          <span className="text-lg font-bold text-accent tracking-tight">planit</span>
        </Link>

        {/* Col 2 — Centre tabs (perfectly centred) */}
        <nav className="hidden md:flex items-end justify-center gap-1">
          {(
            [
              { key: 'events',   label: 'Find Events'   },
              { key: 'planners', label: 'Find Planners'  },
            ] as { key: Tab; label: string }[]
          ).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'px-5 py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap',
                tab === t.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-stone-warm hover:text-charcoal hover:border-stone-warm',
              )}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* Col 3 — Right actions (right-aligned) */}
        <div className="flex items-center gap-2 justify-self-end">
          <Link
            href="/auth/register?role=PLANNER"
            className="hidden md:block text-sm font-semibold text-charcoal hover:bg-sand
              px-4 py-2 rounded-full transition-colors whitespace-nowrap"
          >
            Become a Planner
          </Link>

          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Open menu"
              className="flex items-center gap-2 border border-cream rounded-full
                px-3 py-1.5 hover:shadow-sm transition-shadow bg-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
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

            {menuOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-modal border border-cream z-50 py-1 overflow-hidden">
                <div className="md:hidden">
                  <DropItem href="/listings"  onClick={() => setMenuOpen(false)}>Find Events</DropItem>
                  <DropItem href="/planners"  onClick={() => setMenuOpen(false)}>Find Planners</DropItem>
                  <div className="border-t border-cream my-1" />
                </div>
                {!_hasHydrated ? null : !user ? (
                  <>
                    <DropItem href="/auth/login"    onClick={() => setMenuOpen(false)}>Sign in</DropItem>
                    <DropItem href="/auth/register" onClick={() => setMenuOpen(false)}>Sign up</DropItem>
                    <div className="border-t border-cream my-1" />
                    <DropItem href="/auth/register?role=PLANNER" onClick={() => setMenuOpen(false)}>Become a Planner</DropItem>
                  </>
                ) : (
                  <>
                    <DropItem href="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</DropItem>
                    <DropItem href="/messages"  onClick={() => setMenuOpen(false)}>Messages</DropItem>
                    <DropItem href={profileHref} onClick={() => setMenuOpen(false)}>
                      {user.role === 'PLANNER' ? 'Profile & Settings' : 'Settings'}
                    </DropItem>
                    {user.role === 'PLANNER' && (
                      <DropItem href="/dashboard/listings" onClick={() => setMenuOpen(false)}>My Listings</DropItem>
                    )}
                    {user.role === 'ADMIN' && (
                      <DropItem href="/admin" onClick={() => setMenuOpen(false)}>Admin Panel</DropItem>
                    )}
                    <div className="border-t border-cream my-1" />
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-stone-warm hover:bg-sand transition-colors">
                      Sign out
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Row 2: Pill search ──────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 pb-3">
        <form
          onSubmit={handleSearch}
          className="flex items-center bg-white border-2 border-cream rounded-full
            shadow-card hover:shadow-card-hover transition-shadow"
        >
          {/* What */}
          <div className="flex-1 flex flex-col px-5 py-2 border-r border-cream min-w-0">
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Event</span>
            {tab === 'events' ? (
              <select
                value={eventTypeId}
                onChange={e => setEventTypeId(e.target.value)}
                className="bg-transparent text-sm text-charcoal/60 focus:outline-none cursor-pointer appearance-none leading-snug"
              >
                <option value="">What&apos;s the occasion?</option>
                {demoCategories.map(c => (
                  <option key={c.eventTypeName} value={c.eventTypeName}>{c.displayName}</option>
                ))}
              </select>
            ) : (
              <span className="text-sm text-stone-warm">Event planners</span>
            )}
          </div>

          {/* Where */}
          <div className="flex-[1.8] flex flex-col px-5 py-2 border-r border-cream min-w-0">
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">City</span>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Where should it be hosted?"
              className="bg-transparent text-xs text-charcoal placeholder:text-charcoal/50 focus:outline-none leading-snug w-full"
            />
          </div>

          {/* When */}
          <div className="flex-1 flex flex-col px-5 py-2 min-w-0">
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Date</span>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="bg-transparent text-sm text-charcoal/60 focus:outline-none leading-snug"
            />
          </div>

          {/* Search */}
          <button
            type="submit"
            aria-label="Search"
            className="m-2 bg-primary hover:bg-primary-hover text-white rounded-full
              px-5 h-10 flex items-center gap-2 font-semibold text-sm flex-shrink-0 transition-colors"
          >
            <MagnifyingGlassIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Search</span>
          </button>
        </form>
      </div>
    </header>
  )
}

function DropItem({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link href={href} onClick={onClick} className="block px-4 py-2.5 text-sm text-charcoal hover:bg-sand transition-colors">
      {children}
    </Link>
  )
}
