import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { PlannerSummaryResponse } from '@/lib/types'

type Props = {
  planner: PlannerSummaryResponse
}

const MAX_SPECIALTIES = 3

export default function PlannerCard({ planner }: Props) {
  const [imgError, setImgError] = useState(false)
  const displayName = planner.businessName ?? planner.firstName
  const initials = displayName[0]?.toUpperCase() ?? '?'
  const visibleSpecialties = planner.specialties.slice(0, MAX_SPECIALTIES)
  const hiddenCount = planner.specialties.length - MAX_SPECIALTIES

  return (
    <Link href={`/planners/${planner.id}`} className="group block">

      {/* Avatar */}
      <div className="relative aspect-square rounded-card overflow-hidden bg-sand">
        {planner.profileImageUrl && !imgError ? (
          <Image
            src={planner.profileImageUrl}
            alt={displayName}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center
            bg-gradient-to-br from-primary/20 to-accent/20">
            <span className="text-4xl font-bold text-primary/60">{initials}</span>
          </div>
        )}

        {/* Accepting badge */}
        {planner.isAcceptingInquiries && (
          <span className="absolute top-3 left-3 bg-white/90 text-green-700 text-xs font-semibold
            px-2.5 py-1 rounded-full shadow-sm backdrop-blur-sm">
            Open to bookings
          </span>
        )}
      </div>

      {/* Details */}
      <div className="mt-2.5 px-0.5">

        {/* Name + rating */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-charcoal text-sm leading-snug line-clamp-1 flex-1">
            {displayName}
          </h3>
          {planner.rating != null && (
            <span className="text-xs text-charcoal font-medium flex-shrink-0">
              ★ {planner.rating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Location */}
        {planner.location && (
          <p className="text-stone-warm text-xs mt-0.5 line-clamp-1">
            {planner.location}
          </p>
        )}

        {/* Specialties */}
        {visibleSpecialties.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {visibleSpecialties.map(s => (
              <span
                key={s.id}
                className="px-2 py-0.5 bg-sand border border-cream rounded-full
                  text-xs text-charcoal"
              >
                {s.displayName}
              </span>
            ))}
            {hiddenCount > 0 && (
              <span className="px-2 py-0.5 text-xs text-stone-warm">+{hiddenCount}</span>
            )}
          </div>
        )}

        {/* Bookings */}
        {planner.totalBookings > 0 && (
          <p className="text-stone-warm text-xs mt-1">
            {planner.totalBookings} {planner.totalBookings === 1 ? 'booking' : 'bookings'}
          </p>
        )}

      </div>
    </Link>
  )
}