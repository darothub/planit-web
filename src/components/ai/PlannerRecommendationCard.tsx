/**
 * PlannerRecommendationCard — inline result card the agent renders below
 * its text reply when it returned planner recommendations.
 *
 * Tight horizontal layout (image left, content right) so multiple cards
 * stack cleanly inside a chat panel that's only ~360px wide.
 */

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { StarIcon } from '@heroicons/react/20/solid'
import type { PlannerRecommendationCard as Card } from '@/showcase/ai/types'
import { getListingGradient } from '@/lib/utils'

export default function PlannerRecommendationCard({ card }: { card: Card }) {
  const [imgError, setImgError] = useState(false)

  return (
    <Link
      href={card.ctaHref}
      className="flex gap-3 p-2.5 rounded-xl bg-white border border-cream hover:border-primary/40 hover:shadow-md transition-all group"
    >
      {/* Image */}
      <div className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-cream">
        {!imgError ? (
          <Image
            src={card.imageUrl}
            alt={card.title}
            fill
            sizes="80px"
            className="object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="w-full h-full flex items-end p-1.5"
            style={{ background: getListingGradient(card.id) }}
          >
            <span className="text-white text-[10px] font-medium leading-tight line-clamp-2">
              {card.title}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-charcoal leading-tight line-clamp-1 group-hover:text-primary">
          {card.title}
        </p>
        <p className="text-xs text-stone-warm mt-0.5">
          {card.planner} · {card.city}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="flex items-center gap-0.5 text-xs text-charcoal">
            <StarIcon className="h-3 w-3 text-amber-500" aria-hidden />
            <span className="font-semibold">{card.rating.toFixed(1)}</span>
            <span className="text-stone-warm">({card.reviewCount})</span>
          </span>
          <span className="text-xs font-semibold text-charcoal">
            from £{card.basePrice.toLocaleString()}
          </span>
        </div>
        {card.matchReasons.length > 0 && (
          <ul className="mt-1 flex flex-wrap gap-1">
            {card.matchReasons.slice(0, 2).map(r => (
              <li
                key={r}
                className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100"
              >
                ✓ {r}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Link>
  )
}
