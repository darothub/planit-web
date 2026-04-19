/**
 * AirbnbFooter — Planit-branded footer.
 *
 * Three-column links (Support | Planners | Planit) + bottom bar.
 * Uses Planit's charcoal/sand palette — distinct from Airbnb's grey footer.
 *
 * Note: "Find events near you" inspiration section lives mid-page (not here).
 */

import Link from 'next/link'
import LogoIcon from '@/components/ui/LogoIcon'

const SUPPORT_LINKS = [
  { label: 'Help Centre',          href: '#' },
  { label: 'Safety information',   href: '#' },
  { label: 'Cancellation options', href: '/refund-policy' },
  { label: 'Anti-discrimination',  href: '#' },
  { label: 'Report a concern',     href: '#' },
]

const PLANNER_LINKS = [
  { label: 'List your services',  href: '/auth/register?role=PLANNER' },
  { label: 'Planner resources',   href: '#' },
  { label: 'Community forum',     href: '#' },
  { label: 'Hosting responsibly', href: '#' },
]

const PLANIT_LINKS = [
  { label: 'Browse Events',   href: '/listings' },
  { label: 'Browse Planners', href: '/planners'  },
  { label: 'About Planit',    href: '#'          },
  { label: 'Careers',         href: '#'          },
  { label: 'Newsroom',        href: '#'          },
]

export default function AirbnbFooter() {
  return (
    <footer className="bg-charcoal text-white">

      {/* ── Three-column links ──────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-8 grid grid-cols-1 sm:grid-cols-3 gap-10 border-b border-white/10">

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-5">Support</p>
          <nav className="flex flex-col gap-3">
            {SUPPORT_LINKS.map(l => (
              <Link key={l.label} href={l.href}
                className="text-sm text-white/70 hover:text-white transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-5">Hosting</p>
          <nav className="flex flex-col gap-3">
            {PLANNER_LINKS.map(l => (
              <Link key={l.label} href={l.href}
                className="text-sm text-white/70 hover:text-white transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-5">Planit</p>
          <nav className="flex flex-col gap-3">
            {PLANIT_LINKS.map(l => (
              <Link key={l.label} href={l.href}
                className="text-sm text-white/70 hover:text-white transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Bottom bar ──────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">

        <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
          <div className="flex items-center gap-1.5">
            <LogoIcon size={22} className="brightness-0 invert opacity-80" />
            <span className="text-sm font-bold text-white/90">planit</span>
          </div>
          <span className="text-white/40 text-xs">© {new Date().getFullYear()} Planit, Inc.</span>
          <span className="text-white/30 text-xs hidden sm:inline">·</span>
          <Link href="/privacy" className="text-xs text-white/50 hover:text-white transition-colors">Privacy</Link>
          <span className="text-white/30 text-xs">·</span>
          <Link href="/terms" className="text-xs text-white/50 hover:text-white transition-colors">Terms</Link>
          <span className="text-white/30 text-xs">·</span>
          <Link href="/refund-policy" className="text-xs text-white/50 hover:text-white transition-colors">Refunds</Link>
        </div>

        {/* Social icons */}
        <div className="flex items-center gap-4">
          <a href="#" aria-label="Facebook" className="text-white/40 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>
          <a href="#" aria-label="X" className="text-white/40 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a href="#" aria-label="Instagram" className="text-white/40 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  )
}
