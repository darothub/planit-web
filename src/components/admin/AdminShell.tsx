import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Cookies from 'js-cookie'
import { useAuthStore } from '@/store/authStore'

type Props = {
  title: string
  children: React.ReactNode
}

export default function AdminShell({ title, children }: Props) {
  const { token, user, logout } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!token) router.replace('/auth/login?redirect=/admin')
    else if (user?.role !== 'ADMIN') router.replace('/dashboard')
  }, [token, user, router])

  const handleLogout = () => {
    Cookies.remove('planit_token')
    logout()
    router.push('/auth/login')
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-sand flex items-center justify-center">
        <div className="h-48 w-96 bg-white border border-cream rounded-xl animate-pulse" />
      </div>
    )
  }

  const navLinks = [
    { href: '/admin',          label: 'Overview'      },
    { href: '/admin/planners', label: 'Planner Queue'  },
    { href: '/admin/disputes', label: 'Disputes'       },
    { href: '/admin/listings', label: 'Listings'       },
  ]

  return (
    <div className="min-h-screen bg-sand">
      <header className="bg-charcoal text-white px-6 py-3 flex items-center gap-6">
        <span className="font-bold text-base tracking-tight">Planit Admin</span>
        <nav className="flex gap-5 text-sm">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`transition-colors ${
                router.pathname === href
                  ? 'text-white font-semibold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <span className="ml-auto text-xs text-white/40">{user.email}</span>
        <button
          onClick={handleLogout}
          className="text-xs text-white/60 hover:text-white transition-colors"
        >
          Sign out
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-charcoal mb-6">{title}</h1>
        {children}
      </main>
    </div>
  )
}