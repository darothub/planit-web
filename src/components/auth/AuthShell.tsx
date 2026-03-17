import Link from 'next/link'
import LogoIcon from '@/components/ui/LogoIcon'

type Props = {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export default function AuthShell({ title, subtitle, children }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sand to-parchment flex flex-col items-center justify-center px-4 py-12">

      {/* Logo */}
      <Link href="/" className="flex items-center mb-8">
        <LogoIcon size={48} />
        <span className="text-2xl font-bold text-accent tracking-tight">planit</span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-card p-8">
        <h1 className="text-xl font-bold text-charcoal mb-1">{title}</h1>
        {subtitle && (
          <p className="text-sm text-stone-warm mb-6">{subtitle}</p>
        )}
        {!subtitle && <div className="mb-6" />}
        {children}
      </div>

    </div>
  )
}
