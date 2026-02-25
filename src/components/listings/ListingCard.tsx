import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { HeartIcon } from '@heroicons/react/24/outline'
import { EventListingResponse } from '@/lib/types'
import { formatPrice } from '@/lib/utils'

type Props = {
  listing: EventListingResponse
}

function ImagePlaceholder({ label }: { label: string }) {
  return (
    <div className="w-full h-full bg-gradient-to-br from-sand via-cream to-parchment
      flex flex-col items-center justify-center gap-2 select-none">
      <span className="text-3xl opacity-30">🎪</span>
      <span className="text-stone-warm text-xs opacity-60 text-center px-2 leading-tight">
        {label}
      </span>
    </div>
  )
}

export default function ListingCard({ listing }: Props) {
  const [imgError, setImgError] = useState(false)

  return (
    <Link href={`/listings/${listing.id}`} className="group block">

      {/* ── Image — the only rounded/card element ──────────────────── */}
      <div className="relative aspect-[15/16] rounded-card overflow-hidden">
        {listing.coverImageUrl && !imgError ? (
          <Image
            src={listing.coverImageUrl}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            onError={() => setImgError(true)}
          />
        ) : (
          <ImagePlaceholder label={listing.title} />
        )}

        {/* Featured pill — top left (like "Guest favorite") */}
        {listing.isFeatured && (
          <span className="absolute top-3 left-3 bg-white text-charcoal text-xs font-semibold
            px-3 py-1.5 rounded-full shadow-sm">
            Featured
          </span>
        )}

        {/* Heart button — top right */}
        <button
          onClick={e => { e.preventDefault(); e.stopPropagation() }}
          aria-label="Save"
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/20
            hover:bg-black/30 flex items-center justify-center
            transition-colors backdrop-blur-sm"
        >
          <HeartIcon className="w-4 h-4 text-white drop-shadow" />
        </button>
      </div>

      {/* ── Plain text details below the image (no card background) ── */}
      <div className="mt-2.5 px-0.5">

        {/* Title + rating on same row */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-charcoal text-sm leading-snug line-clamp-1 flex-1">
            {listing.title}
          </h3>
          {listing.averageRating != null && (
            <span className="text-xs text-charcoal font-medium flex-shrink-0 flex items-center gap-0.5">
              ★ {listing.averageRating.toFixed(2)}
            </span>
          )}
        </div>

        {/* Location · Event type */}
        <p className="text-stone-warm text-xs mt-0.5 leading-snug">
          {listing.location} · {listing.eventType.displayName}
        </p>

        {/* Price */}
        <p className="text-charcoal text-sm mt-0.5">
          <span className="text-stone-warm font-normal">From </span>
          <span className="font-semibold">{formatPrice(listing.basePrice)}</span>
        </p>

      </div>
    </Link>
  )
}
