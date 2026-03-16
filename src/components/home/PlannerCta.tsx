import Link from 'next/link'

// Benefits are feature-based — true from day one, no volume numbers needed
const BENEFITS = [
  { icon: '📋', text: 'Your own listings page' },
  { icon: '💬', text: 'Inquiries direct to your inbox' },
  { icon: '💳', text: 'Secure payments via Stripe' },
  { icon: '🛡️', text: 'Dispute protection built in' },
]

export default function PlannerCta() {
  return (
    <section className="bg-charcoal text-white py-16 md:py-20">
      <div className="max-w-4xl mx-auto px-4 text-center">

        <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-3">
          Grow your business
        </p>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Are you an event planner?
        </h2>
        <p className="text-white/60 max-w-lg mx-auto mb-10 leading-relaxed">
          List your services on Planit. Receive inquiries from serious clients,
          communicate on-platform, and get paid securely — all in one place.
        </p>

        {/* Benefits grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10 max-w-2xl mx-auto">
          {BENEFITS.map(b => (
            <div
              key={b.text}
              className="bg-white/10 border border-white/10 rounded-xl px-4 py-4 flex flex-col items-center gap-2"
            >
              <span className="text-2xl">{b.icon}</span>
              <p className="text-xs text-white/60 leading-snug">{b.text}</p>
            </div>
          ))}
        </div>

        <Link
          href="/auth/register?role=PLANNER"
          className="inline-block bg-primary hover:bg-primary-hover text-white font-semibold px-8 py-3 rounded-btn transition-colors"
        >
          Join as a Planner →
        </Link>

      </div>
    </section>
  )
}
