import { useState } from 'react'
import { EventAmenity } from '@/lib/types'

const AMENITY_META: Record<EventAmenity, { icon: string; label: string }> = {
  RED_CARPET:               { icon: '🎟️', label: 'Red carpet entrance' },
  LIVE_BAND:                { icon: '🎸', label: 'Live band' },
  DJ_SERVICE:               { icon: '🎧', label: 'DJ service' },
  MC_HOST:                  { icon: '🎙️', label: 'Master of ceremonies' },
  DANCE_FLOOR:              { icon: '🕺', label: 'Dance floor' },
  PHOTO_BOOTH:              { icon: '📸', label: 'Photo booth' },
  PHOTOGRAPHY_STANDARD:     { icon: '📷', label: 'Standard photography' },
  PHOTOGRAPHY_PROFESSIONAL: { icon: '🎞️', label: 'Professional photography (4K)' },
  VIDEOGRAPHY_CINEMATIC:    { icon: '🎬', label: 'Cinematic videography' },
  DRONE_FOOTAGE:            { icon: '🚁', label: 'Aerial drone footage' },
  CATERING_BUFFET:          { icon: '🍽️', label: 'Buffet catering' },
  CATERING_PLATED:          { icon: '🍴', label: 'Plated meal service' },
  OPEN_BAR:                 { icon: '🍸', label: 'Open bar' },
  WELCOME_DRINKS:           { icon: '🥂', label: 'Welcome drinks' },
  CAKE_INCLUDED:            { icon: '🎂', label: 'Custom cake included' },
  DESSERT_STATION:          { icon: '🍰', label: 'Dessert station' },
  FLORAL_ARRANGEMENTS:      { icon: '💐', label: 'Floral arrangements' },
  BALLOON_DECOR:            { icon: '🎈', label: 'Balloon décor' },
  LIGHTING_PREMIUM:         { icon: '✨', label: 'Premium event lighting' },
  THEMED_DECOR:             { icon: '🎨', label: 'Custom themed décor' },
  VALET_PARKING:            { icon: '🚗', label: 'Valet parking' },
  SECURITY:                 { icon: '🛡️', label: 'Security team' },
  DEDICATED_COORDINATOR:    { icon: '📋', label: 'Dedicated event coordinator' },
  OUTDOOR_SPACE:            { icon: '🌿', label: 'Outdoor venue' },
  AIR_CONDITIONING:         { icon: '❄️', label: 'Air conditioning' },
}

const DEFAULT_VISIBLE = 8

type Props = {
  amenities: EventAmenity[]
}

export default function EventAmenities({ amenities }: Props) {
  const [expanded, setExpanded] = useState(false)

  const visible = expanded ? amenities : amenities.slice(0, DEFAULT_VISIBLE)
  const hasMore = amenities.length > DEFAULT_VISIBLE

  return (
    <div>
      <h2 className="text-xl font-semibold text-charcoal mb-5">What this event includes</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {visible.map(amenity => {
          const meta = AMENITY_META[amenity]
          if (!meta) return null
          return (
            <div
              key={amenity}
              className="flex items-center gap-3 rounded-xl border border-cream p-4"
            >
              <span className="text-xl leading-none">{meta.icon}</span>
              <span className="text-sm text-charcoal leading-tight">{meta.label}</span>
            </div>
          )
        })}
      </div>

      {hasMore && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="mt-5 text-sm font-medium text-charcoal underline underline-offset-2 hover:text-primary transition-colors"
        >
          {expanded
            ? 'Show less'
            : `Show all ${amenities.length} amenities`}
        </button>
      )}
    </div>
  )
}
