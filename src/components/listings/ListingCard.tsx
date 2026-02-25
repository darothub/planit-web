import Link from 'next/link'
import Image from 'next/image'
import { EventListingResponse } from '@/lib/types'
import { formatPrice } from '@/lib/utils'

type Props = {
  listing: EventListingResponse
}

export default function ListingCard({ listing }: Props) {
  return (
    <Link href={`/listings/${listing.id}`} className="group block">
      <div className="bg-parchment rounded-card shadow-card hover:shadow-card-hover transition-shadow duration-300 overflow-hidden">

        {/* Photo */}
        <div className="relative aspect-[3/2] overflow-hidden">
          {listing.coverImageUrl ? (
            <Image
              src={listing.coverImageUrl}
              alt={listing.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-sand-dark to-cream flex items-center justify-center">
              <span className="text-4xl opacity-40">🎪</span>
            </div>
          )}

          {/* Event type badge */}
          <span className="absolute top-3 left-3 bg-accent/85 text-white text-xs font-semibold
            px-2.5 py-1 rounded-full backdrop-blur-sm">
            {listing.eventType.displayName}
          </span>

          {listing.isFeatured && (
            <span className="absolute top-3 right-3 bg-primary text-white text-xs font-semibold
              px-2.5 py-1 rounded-full">
              Featured
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-stone-warm text-xs mb-1">{listing.location}</p>
          <h3 className="font-semibold text-charcoal line-clamp-2 text-sm leading-snug">
            {listing.title}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-2">
            {listing.averageRating ? (
              <>
                <span className="text-primary text-sm">★</span>
                <span className="text-sm font-medium text-charcoal">
                  {listing.averageRating.toFixed(1)}
                </span>
                {listing.reviewCount > 0 && (
                  <span className="text-stone-warm text-xs">({listing.reviewCount})</span>
                )}
              </>
            ) : (
              <span className="text-stone-warm text-xs">No reviews yet</span>
            )}
          </div>

          {/* Price */}
          <p className="mt-2">
            <span className="text-stone-warm text-xs">From </span>
            <span className="font-semibold text-charcoal text-sm">
              {formatPrice(listing.basePrice)}
            </span>
          </p>
        </div>
      </div>
    </Link>
  )
}