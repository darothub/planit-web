import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { api } from '@/lib/api'
import { EventType } from '@/lib/types'

// Earthy gradient backgrounds per category — used until real photos are available
// Replace gradient with a photo URL once you have real assets
const categoryStyles: Record<string, { gradient: string; emoji: string }> = {
  WEDDING:          { gradient: 'from-rose-900/80 via-stone-800/70 to-charcoal/90',   emoji: '💒' },
  BIRTHDAY:         { gradient: 'from-amber-800/80 via-accent/70 to-charcoal/90',      emoji: '🎂' },
  CORPORATE:        { gradient: 'from-accent/80 via-accent-hover/70 to-charcoal/90',   emoji: '🏢' },
  ANNIVERSARY:      { gradient: 'from-primary/70 via-accent/70 to-charcoal/90',        emoji: '💐' },
  GRADUATION:       { gradient: 'from-amber-700/80 via-stone-700/70 to-charcoal/90',   emoji: '🎓' },
  BABY_SHOWER:      { gradient: 'from-sand-dark/80 via-cream/60 to-stone-warm/80',     emoji: '🍼' },
  ENGAGEMENT:       { gradient: 'from-primary-hover/80 via-accent/70 to-charcoal/90',  emoji: '💍' },
  DEFAULT:          { gradient: 'from-accent/80 via-stone-warm/60 to-charcoal/90',     emoji: '🎪' },
}

function getCategoryStyle(name: string) {
  return categoryStyles[name] ?? categoryStyles.DEFAULT
}

export default function EventCategories() {
  const router = useRouter()

  const { data: eventTypes, isLoading } = useQuery<EventType[]>({
    queryKey: ['event-types'],
    queryFn: () => api.get('/event-types').then(r => r.data.data),
    staleTime: Infinity,
  })

  if (isLoading || !eventTypes?.length) return null

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="mb-8">
        <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-1">
          Browse by occasion
        </p>
        <h2 className="text-3xl font-bold text-charcoal">
          What are you celebrating?
        </h2>
      </div>

      {/* Category grid — 2 rows on desktop, horizontal scroll on mobile */}
      <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory
        md:grid md:grid-cols-3 lg:grid-cols-4 md:overflow-visible">
        {eventTypes.map(et => {
          const { gradient, emoji } = getCategoryStyle(et.name)
          return (
            <button
              key={et.id}
              onClick={() => router.push({ pathname: '/listings', query: { eventTypeId: et.id } })}
              className="group relative flex-shrink-0 w-48 md:w-auto snap-start
                aspect-[4/3] rounded-card overflow-hidden cursor-pointer
                shadow-card hover:shadow-card-hover transition-shadow duration-300"
            >
              {/* Background gradient (swap for <Image> when real photos exist) */}
              <div className={`absolute inset-0 bg-gradient-to-b ${gradient}
                group-hover:scale-105 transition-transform duration-500`}
              />

              {/* Subtle texture overlay */}
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, white 0%, transparent 70%)' }}
              />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
                <span className="text-4xl drop-shadow-lg">{emoji}</span>
                <span className="text-white font-semibold text-center leading-tight drop-shadow-md">
                  {et.displayName}
                </span>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10
                transition-colors duration-300 rounded-card" />
            </button>
          )
        })}
      </div>
    </section>
  )
}
