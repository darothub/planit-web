import Link from 'next/link'

// Trust signals are feature/guarantee-based — true from day one regardless of user count
const TRUST_SIGNALS = [
  { icon: '✅', text: 'Verified planners only' },
  { icon: '🔒', text: 'Payments held in escrow' },
  { icon: '💬', text: 'Free to message' },
  { icon: '🛡️', text: 'Contact info protected' },
]

export default function Hero() {
  return (
    <div className="bg-charcoal text-white">
      <div className="max-w-4xl mx-auto px-4 py-14 md:py-20 text-center">

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight mb-4">
          Your vision.{' '}
          <span className="text-primary">Their expertise.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-white/60 text-base md:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
          Connect with verified event planners and bring your perfect event to life —
          from intimate celebrations to grand occasions.
        </p>

        {/* CTA buttons */}
        <div className="flex items-center justify-center gap-4 mb-10 flex-wrap">
          <Link
            href="/listings"
            className="bg-primary hover:bg-primary-hover text-white font-semibold px-8 py-3 rounded-btn transition-colors"
          >
            Browse Events →
          </Link>
          <Link
            href="/auth/register?role=PLANNER"
            className="text-white/60 hover:text-white text-sm font-medium transition-colors border border-white/20 hover:border-white/40 px-6 py-3 rounded-btn"
          >
            List your services
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
