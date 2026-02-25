const steps = [
  {
    icon: '✨',
    title: 'Get inspired',
    description:
      'Browse beautiful events created by verified planners. Filter by occasion, location, and budget until you find something that feels right.',
  },
  {
    icon: '💬',
    title: 'Connect & customise',
    description:
      'Message the planner directly. Share your vision, ask questions, and agree on every detail before committing a penny.',
  },
  {
    icon: '🔒',
    title: 'Book securely',
    description:
      'Pay through Planit. Your money is held safely in escrow and only released to the planner after your event is complete.',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-16">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-2">
          Stress-free from start to finish
        </p>
        <h2 className="text-3xl font-bold text-charcoal mb-3">
          How it works
        </h2>
        <p className="text-stone-warm max-w-lg mx-auto mb-12">
          From first spark of inspiration to the day itself — Planit has you covered.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-10 left-[calc(16.7%+1.5rem)] right-[calc(16.7%+1.5rem)]
            h-px bg-cream z-0" />

          {steps.map((step, i) => (
            <div key={i} className="relative z-10 flex flex-col items-center gap-4">
              {/* Icon circle */}
              <div className="w-20 h-20 rounded-full bg-parchment shadow-card flex items-center
                justify-center text-3xl border-4 border-sand">
                {step.icon}
              </div>

              {/* Step number */}
              <div className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold
                flex items-center justify-center -mt-2 shadow-sm">
                {i + 1}
              </div>

              <h3 className="text-lg font-semibold text-charcoal">{step.title}</h3>
              <p className="text-stone-warm text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
