import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import LogoIcon from '@/components/ui/LogoIcon'

export default function Footer() {
  const { user } = useAuthStore()

  return (
    <footer className="bg-accent text-white mt-24">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">

          <div>
            <div className="flex items-center mb-3">
              <LogoIcon size={36} className="brightness-0 invert" />
              <span className="text-xl font-bold">planit</span>
            </div>
            <p className="text-accent-light text-sm leading-relaxed">
              Find and book verified event planners for your perfect occasion.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-accent-light mb-4">
              Explore
            </p>
            <nav className="flex flex-col gap-2">
              <Link href="/listings" className="text-sm text-white/80 hover:text-white transition-colors">
                Browse Events
              </Link>
              <Link href="/auth/register" className="text-sm text-white/80 hover:text-white transition-colors">
                Become a Planner
              </Link>
            </nav>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-accent-light mb-4">
              Account
            </p>
            <nav className="flex flex-col gap-2">
              {!user && (
                <>
                  <Link href="/auth/login" className="text-sm text-white/80 hover:text-white transition-colors">
                    Sign In
                  </Link>
                  <Link href="/auth/register" className="text-sm text-white/80 hover:text-white transition-colors">
                    Create Account
                  </Link>
                </>
              )}
              <Link href="/dashboard" className="text-sm text-white/80 hover:text-white transition-colors">
                Dashboard
              </Link>
            </nav>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-sm text-white/50">
          © {new Date().getFullYear()} Planit. All rights reserved.
        </div>
      </div>
    </footer>
  )
}