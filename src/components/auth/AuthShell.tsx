import Link from 'next/link'

type Props = {
  title: string
  children: React.ReactNode
}

export default function AuthShell({ title, children }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sand to-parchment flex flex-col items-center justify-center px-4 py-12">

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/favicon.ico" alt="" aria-hidden className="w-7 h-7 object-contain" />
        <span className="text-2xl font-bold text-accent tracking-tight">planit</span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-card p-8">
        <h1 className="text-xl font-bold text-charcoal mb-6">{title}</h1>
        {children}
      </div>

    </div>
  )
}
