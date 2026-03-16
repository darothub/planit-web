import Link from 'next/link'

const STATS = [
  { value: '500+',  label: 'Active planners' },
  { value: '12k+',  label: 'Events planned' },
  { value: '4.9★', label: 'Average rating' },
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
          Join hundreds of verified planners on Planit. Showcase your work,
          receive inquiries from serious clients, and get paid securely.
        </p>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {STATS.map(stat => (
            <div
              key={stat.label}
              className="bg-white/10 border border-white/10 rounded-xl px-8 py-4 min-w-[120px]"
            >
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-white/50 mt-0.5">{stat.label}</p>
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
