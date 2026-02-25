const steps = [
  {
    icon: '🔍',
    title: 'Browse',
    description: 'Search through hundreds of verified event planners. Filter by event type, location, budget, and availability.',
  },
  {
    icon: '💬',
    title: 'Message',
    description: 'Chat directly with planners, discuss your vision, and agree on a price that works for you.',
  },
  {
    icon: '✅',
    title: 'Book with confidence',
    description: 'Pay securely through Planit. Your money is held safely until after your event is complete.',
  },
]

export default function HowItWorks() {
  return (
    <section className="bg-parchment py-16">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-2">Simple process</p>
        <h2 className="text-3xl font-bold text-charcoal mb-12">How Planit works</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="relative">
              {/* Connector line between steps (desktop only) */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[calc(50%+2.5rem)] right-0 h-px bg-cream" />
              )}

              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-sand flex items-center justify-center text-3xl shadow-card">
                  {step.icon}
                </div>
                <div className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold
                  flex items-center justify-center -mt-2">
                  {i + 1}
                </div>
                <h3 className="text-lg font-semibold text-charcoal">{step.title}</h3>
                <p className="text-stone-warm text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
