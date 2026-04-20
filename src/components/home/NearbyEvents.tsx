/**
 * NearbyEvents — "Find events near you" section, location-aware version.
 *
 * Replaces the old static city grid with proximity-sorted listings.
 *
 * Two data sources merge here:
 * 1. `userLocation` — where to search from (Vercel geo header / GPS / manual)
 * 2. `listings`     — already filtered to the chosen radius (server side)
 *                     and annotated with `distanceKm` (server or client side)
 *
 * Pure presentational component. Showcase passes mock data; production passes
 * real API data. No fetching here.
 */

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MapPinIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { EventListingResponse } from '@/lib/types'
import { formatPrice, getListingGradient, cn } from '@/lib/utils'
import { formatDistance } from '@/lib/geo'

// ─── Types ─────────────────────────────────────────────────────────────────

export type UserLocation = {
  lat: number
  lng: number
  city: string                       // human-readable label, eg "London"
  source: 'gps' | 'ip' | 'manual'    // how we learned the location
  country?: string | null            // ISO-3166-1 alpha-2 (eg "GB", "NG"), used by the city picker
}

/** A listing annotated with its distance from the user. */
export type NearbyListing = EventListingResponse & { distanceKm: number }

type DiscoverTab = { key: string; label: string }

const DISCOVER_TABS: DiscoverTab[] = [
  { key: 'ALL',         label: 'All'           },
  { key: 'WEDDING',     label: 'Weddings'      },
  { key: 'BIRTHDAY',    label: 'Birthdays'     },
  { key: 'CORPORATE',   label: 'Corporate'     },
  { key: 'ANNIVERSARY', label: 'Anniversaries' },
  { key: 'GRADUATION',  label: 'Graduations'   },
  { key: 'BABY_SHOWER', label: 'Baby Showers'  },
  { key: 'ENGAGEMENT',  label: 'Engagements'   },
]

const VISIBLE_LIMIT = 8

// ─── Props ─────────────────────────────────────────────────────────────────

type Props = {
  userLocation: UserLocation | null
  /** Already filtered to radius + annotated with distanceKm; sorted server-side. */
  listings: NearbyListing[]
  radiusKm: number
  /** Total nearby count (for the "See all 47 events" CTA). */
  totalCount?: number
  loading?: boolean
  /** Open city-picker. If absent, the change button is hidden. */
  onChangeCity?: () => void
  /** Clear the location and fall back to "all of UK". */
  onClearLocation?: () => void
  /** Request browser GPS permission (only shown when source !== 'gps'). */
  onUseGps?: () => void
}

// ─── Card ──────────────────────────────────────────────────────────────────

/** Gradient + title fallback shown when no cover image, or when loading fails. */
function ImagePlaceholder({ id, label }: { id: number; label: string }) {
  return (
    <div
      className="w-full h-full flex items-end select-none"
      style={{ background: getListingGradient(id) }}
    >
      <span className="px-3 pb-3 text-white/80 text-xs font-medium line-clamp-2 leading-snug">
        {label}
      </span>
    </div>
  )
}

function NearbyCard({ listing }: { listing: NearbyListing }) {
  // Track image load failures (404, blocked host, network error) so we can
  // swap to the gradient placeholder — same pattern as ListingCard.
  const [imgError, setImgError] = useState(false)
  const showImage = Boolean(listing.coverImageUrl) && !imgError

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group block flex-shrink-0 w-[260px]"
    >
      <div className="relative aspect-[4/3] rounded-card overflow-hidden bg-cream">
        {showImage ? (
          <Image
            src={listing.coverImageUrl}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="260px"
            onError={() => setImgError(true)}
          />
        ) : (
          <ImagePlaceholder id={listing.id} label={listing.title} />
        )}

        {/* Distance badge — top-left, same position style as Featured pill */}
        <span
          className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-charcoal text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1"
          aria-label={`${formatDistance(listing.distanceKm)} away`}
        >
          <MapPinIcon className="h-3 w-3 text-primary" aria-hidden />
          {formatDistance(listing.distanceKm)} away
        </span>
      </div>

      <div className="mt-2.5">
        <p className="text-sm font-semibold text-charcoal group-hover:text-primary transition-colors line-clamp-1">
          {listing.title}
        </p>
        <p className="text-xs text-stone-warm mt-0.5">{listing.location}</p>
        <p className="text-xs text-charcoal mt-1">
          <span className="font-semibold">{formatPrice(listing.basePrice)}</span>
          <span className="text-stone-warm"> · from</span>
        </p>
      </div>
    </Link>
  )
}

// ─── Main ──────────────────────────────────────────────────────────────────

export default function NearbyEvents({
  userLocation,
  listings,
  radiusKm,
  totalCount,
  loading = false,
  onChangeCity,
  onClearLocation,
  onUseGps,
}: Props) {
  const [tab, setTab] = useState<string>('ALL')

  const filteredListings = useMemo(() => {
    const filtered = tab === 'ALL'
      ? listings
      : listings.filter(l => l.eventType.name === tab)
    return filtered.slice(0, VISIBLE_LIMIT)
  }, [listings, tab])

  const radiusMi = Math.round(radiusKm * 0.621371)

  return (
    <section className="bg-white border-t border-cream border-b">
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* ── Heading + location chip ─────────────────────────────────── */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <p className="text-primary text-xs font-bold uppercase tracking-widest mb-1">
              Explore by location
            </p>
            <h2 className="text-2xl font-bold text-charcoal">
              {userLocation
                ? `Events near ${userLocation.city}`
                : 'Find events near you'}
            </h2>
            <p className="text-stone-warm text-sm mt-1">
              {userLocation
                ? `Within ${radiusMi} miles · ${totalCount ?? listings.length} verified planner${(totalCount ?? listings.length) === 1 ? '' : 's'}`
                : 'Share your location or pick a city to see what\'s available nearby.'}
            </p>
          </div>

          {/* Location chip / picker controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {userLocation ? (
              <>
                <span className="inline-flex items-center gap-1.5 bg-cream text-charcoal text-xs font-semibold px-3 py-1.5 rounded-full">
                  <MapPinIcon className="h-3.5 w-3.5 text-primary" />
                  {userLocation.city}
                  {userLocation.source === 'ip' && (
                    <span className="text-stone-warm font-normal">(estimated)</span>
                  )}
                  {onClearLocation && (
                    <button
                      onClick={onClearLocation}
                      aria-label="Clear location"
                      className="ml-1 hover:text-primary transition-colors"
                    >
                      <XMarkIcon className="h-3.5 w-3.5" />
                    </button>
                  )}
                </span>
                {onChangeCity && (
                  <button
                    onClick={onChangeCity}
                    className="text-xs font-semibold text-charcoal underline underline-offset-2 hover:text-primary transition-colors"
                  >
                    Change city
                  </button>
                )}
                {onUseGps && userLocation.source !== 'gps' && (
                  <button
                    onClick={onUseGps}
                    className="text-xs font-semibold text-primary hover:underline underline-offset-2 transition-colors"
                  >
                    📍 Use exact location
                  </button>
                )}
              </>
            ) : (
              <>
                {onUseGps && (
                  <button
                    onClick={onUseGps}
                    className="inline-flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-primary/90 transition-colors"
                  >
                    <MapPinIcon className="h-3.5 w-3.5" />
                    Use my location
                  </button>
                )}
                {onChangeCity && (
                  <button
                    onClick={onChangeCity}
                    className="text-xs font-semibold text-charcoal underline underline-offset-2 hover:text-primary transition-colors"
                  >
                    Pick a city
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Tab strip ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar border-b border-cream mb-6">
          {DISCOVER_TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'pb-3 px-4 text-sm font-medium whitespace-nowrap border-b-2 flex-shrink-0 transition-colors',
                tab === t.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-stone-warm hover:text-charcoal',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Listings rail ─────────────────────────────────────────────── */}
        {loading ? (
          // Skeleton row
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[260px]">
                <div className="aspect-[4/3] rounded-card bg-cream animate-pulse" />
                <div className="mt-2.5 space-y-2">
                  <div className="h-3 bg-cream rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-cream rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          // Empty state
          <div className="text-center py-12 bg-sand rounded-card">
            <MapPinIcon className="h-10 w-10 text-stone-warm/40 mx-auto mb-3" />
            <p className="text-charcoal font-semibold">
              {userLocation
                ? `No events within ${radiusMi} miles${tab === 'ALL' ? '' : ' for this category'}`
                : 'Pick a city to see nearby events'}
            </p>
            <p className="text-xs text-stone-warm mt-1">
              {userLocation
                ? 'Try a different category, or browse all events below.'
                : 'We\'ll show you verified planners in your area.'}
            </p>
            <Link
              href="/listings"
              className="inline-block mt-4 text-sm font-semibold text-primary underline underline-offset-2"
            >
              Browse all events →
            </Link>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-2 px-2">
            {filteredListings.map(listing => (
              <NearbyCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        {/* ── See-all CTA ───────────────────────────────────────────────── */}
        {userLocation && filteredListings.length > 0 && (
          <div className="mt-6">
            <Link
              href={
                tab === 'ALL'
                  ? `/listings?lat=${userLocation.lat}&lng=${userLocation.lng}&radiusKm=${radiusKm}`
                  : `/listings?lat=${userLocation.lat}&lng=${userLocation.lng}&radiusKm=${radiusKm}&eventTypeId=${tab}`
              }
              className="text-sm font-semibold text-charcoal underline underline-offset-2 hover:text-primary transition-colors"
            >
              See all {totalCount ?? listings.length} events near {userLocation.city} →
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
