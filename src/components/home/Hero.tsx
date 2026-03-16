import Link from 'next/link'

const TRUST_SIGNALS = [
  { icon: '⭐', text: 'Trusted by 12,000+ clients' },
  { icon: '🔒', text: 'Secure payments' },
  { icon: '✅', text: 'Verified planners only' },
  { icon: '💬', text: 'Free to message' },
]

export default function Hero() {
  return (
    <div className="bg-charcoal text-white">
      <div className="max-w-4xl mx-auto px-4 py-14 md:py-20 text-center">

        {/* Trust badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-medium px-4 py-1.5 rounded-full mb-6 border border-white/10">
          <span>✨</span>
          <span>500+ verified planners across the UK</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight mb-4">
          Your vision.{' '}
          <span className="text-primary">Their expertise.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-white/60 text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Connect with verified event planners and bring your perfect event to life —
          from intimate celebrations to grand occasions.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          <Link
            href="/listings"
            className="bg-primary hover:bg-primary-hover text-white font-semibold px-7 py-3 rounded-btn transition-colors"
          >
            Browse Events
          </Link>
          <Link
            href="/planners"
            className="bg-white/10 hover:bg-white/20 text-white font-semibold px-7 py-3 rounded-btn transition-colors border border-white/20"
          >
            Browse Planners
          </Link>
        </div>

        {/* Trust signals */}
        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2">
          {TRUST_SIGNALS.map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 text-sm text-white/50">
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
