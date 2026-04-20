/**
 * NearbyEventsContainer — production wiring for the "Find events near you"
 * section. Purely client-side on purpose: keeps the outer SSR page safe to
 * edge-cache without per-user cache pollution.
 *
 * Location resolution order:
 *   1. localStorage (previous manual / GPS pick)
 *   2. /api/location (Vercel IP geo headers)
 *   3. null → UI prompts user to pick a city
 *
 * Persists manual / GPS picks in localStorage so the choice survives reloads.
 * Never stores coarse IP location — that's re-resolved per session.
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import NearbyEvents, { UserLocation, NearbyListing } from './NearbyEvents'
import { api } from '@/lib/api'
import { EventListingResponse } from '@/lib/types'
import {
  haversineKm,
  cityToCoords,
  getCitiesForCountry,
  getCountryName,
  isSupportedCountry,
} from '@/lib/geo'
import type { LocationHintResponse } from '@/pages/api/location'

const STORAGE_KEY = 'planit_location'
const RADIUS_KM = 80       // ≈ 50 miles
const PAGE_SIZE = 50       // nearby listings to fetch per request

// Stored shape includes a timestamp so we could expire old picks later.
type StoredLocation = UserLocation & { savedAt: number }

// ─── Persistence helpers ──────────────────────────────────────────────────

function loadStoredLocation(): UserLocation | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<StoredLocation>
    if (
      typeof parsed.lat !== 'number' ||
      typeof parsed.lng !== 'number' ||
      typeof parsed.city !== 'string' ||
      !parsed.source
    ) return null
    return {
      lat: parsed.lat,
      lng: parsed.lng,
      city: parsed.city,
      source: parsed.source,
      country: typeof parsed.country === 'string' ? parsed.country : null,
    }
  } catch {
    return null
  }
}

function persistLocation(loc: UserLocation | null): void {
  if (typeof window === 'undefined') return
  if (!loc) {
    localStorage.removeItem(STORAGE_KEY)
    return
  }
  // Only persist deliberate picks, not IP estimates — those should re-resolve
  // each session so a travelling user isn't stuck with a stale city.
  if (loc.source === 'ip') return
  const payload: StoredLocation = { ...loc, savedAt: Date.now() }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

// ─── Container ────────────────────────────────────────────────────────────

export default function NearbyEventsContainer() {
  const [location, setLocation] = useState<UserLocation | null>(null)
  // Hydration gate: renders `null` location on first paint (matches server HTML)
  const [hydrated, setHydrated] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [gpsError, setGpsError] = useState<string | null>(null)

  // 1. Hydrate: stored pick first, then IP hint
  useEffect(() => {
    const stored = loadStoredLocation()
    if (stored) {
      setLocation(stored)
      setHydrated(true)
      return
    }

    let cancelled = false
    fetch('/api/location')
      .then(r => (r.ok ? r.json() : null))
      .then((data: LocationHintResponse | null) => {
        if (cancelled) return
        if (data?.lat != null && data?.lng != null && data.city) {
          setLocation({
            lat: data.lat,
            lng: data.lng,
            city: data.city,
            source: 'ip',
            country: data.country ?? null,
          })
        }
        setHydrated(true)
      })
      .catch(() => {
        if (!cancelled) setHydrated(true)
      })

    return () => { cancelled = true }
  }, [])

  // 2. Fetch listings within radius of current location
  const { data: rawListings = [], isLoading } = useQuery<EventListingResponse[]>({
    queryKey: ['nearby-listings', location?.lat, location?.lng],
    queryFn: () =>
      api.get<{ data: { content: EventListingResponse[] } }>('/listings', {
        params: {
          lat: location!.lat,
          lng: location!.lng,
          radiusKm: RADIUS_KM,
          page: 0,
          size: PAGE_SIZE,
        },
      }).then(r => r.data.data?.content ?? []),
    enabled: hydrated && !!location,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  // 3. Annotate with distance + sort ascending
  const nearbyListings = useMemo<NearbyListing[]>(() => {
    if (!location) return []
    const out: NearbyListing[] = []
    for (const l of rawListings) {
      if (l.latitude == null || l.longitude == null) continue
      const distanceKm = haversineKm(location, { lat: l.latitude, lng: l.longitude })
      out.push({ ...l, distanceKm })
    }
    return out.sort((a, b) => a.distanceKm - b.distanceKm)
  }, [rawListings, location])

  // ─── Handlers ──────────────────────────────────────────────────────────

  const handleChangeCity = useCallback(() => setPickerOpen(true), [])

  const handleClear = useCallback(() => {
    persistLocation(null)
    setLocation(null)
  }, [])

  const handleUseGps = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGpsError('Your browser does not support location sharing.')
      return
    }
    setGpsError(null)
    navigator.geolocation.getCurrentPosition(
      pos => {
        const next: UserLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          // Keep any existing city label so the chip stays human-readable;
          // a proper reverse-geocode is future work.
          city: location?.city ?? 'Your location',
          source: 'gps',
          // Carry the IP-derived country forward so the picker stays local
          country: location?.country ?? null,
        }
        persistLocation(next)
        setLocation(next)
      },
      err => {
        setGpsError(
          err.code === err.PERMISSION_DENIED
            ? 'Location permission was declined. Pick a city instead.'
            : err.code === err.TIMEOUT
              ? 'Location request timed out. Pick a city instead.'
              : 'Could not determine your location. Pick a city instead.',
        )
      },
      { timeout: 10_000, enableHighAccuracy: false, maximumAge: 5 * 60 * 1000 },
    )
  }, [location?.city, location?.country])

  const pickCity = useCallback((city: string) => {
    // Resolve coords using the user's country first; falls back across
    // all supported countries so a saved cross-country pick still works.
    const coords = cityToCoords(city, location?.country)
    if (!coords) return
    const next: UserLocation = {
      ...coords,
      city,
      source: 'manual',
      country: location?.country ?? null,
    }
    persistLocation(next)
    setLocation(next)
    setPickerOpen(false)
  }, [location?.country])

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <>
      <NearbyEvents
        userLocation={hydrated ? location : null}
        listings={nearbyListings}
        totalCount={nearbyListings.length}
        radiusKm={RADIUS_KM}
        loading={hydrated && !!location && isLoading}
        onChangeCity={handleChangeCity}
        onClearLocation={handleClear}
        onUseGps={handleUseGps}
      />

      {gpsError && (
        <div
          role="alert"
          className="fixed bottom-6 right-6 z-50 bg-rose-50 border border-rose-200 text-rose-900 text-sm px-4 py-3 rounded-xl shadow-lg max-w-xs flex items-start gap-3"
        >
          <span className="flex-1">{gpsError}</span>
          <button
            onClick={() => setGpsError(null)}
            aria-label="Dismiss"
            className="font-bold text-rose-600 hover:text-rose-900"
          >
            ✕
          </button>
        </div>
      )}

      {pickerOpen && (
        <CityPickerModal
          currentCity={location?.city ?? null}
          country={location?.country ?? null}
          onPick={pickCity}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </>
  )
}

// ─── City picker modal ────────────────────────────────────────────────────
//
// Shows up to 20 cities in the user's country (IP-detected or stored).
// Falls back to the United Kingdom list when the country is unknown or
// unsupported. Cities are sorted alphabetically with a simple text filter.

function CityPickerModal({
  currentCity,
  country,
  onPick,
  onClose,
}: {
  currentCity: string | null
  country: string | null
  onPick: (city: string) => void
  onClose: () => void
}) {
  const [filter, setFilter] = useState('')

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const countryName  = getCountryName(country)
  const supported    = isSupportedCountry(country)
  const allCities    = useMemo(() => Object.keys(getCitiesForCountry(country)).sort(), [country])
  const filteredCities = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return allCities
    return allCities.filter(c => c.toLowerCase().includes(q))
  }, [allCities, filter])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Pick a city in ${countryName}`}
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-cream px-5 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-charcoal">Pick a city</h3>
              <p className="text-xs text-stone-warm mt-0.5">
                Top cities in {countryName}
                {!supported && ' (your country isn\u2019t listed yet)'}
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-stone-warm hover:text-charcoal text-2xl leading-none"
            >
              ✕
            </button>
          </div>
          <input
            type="text"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Search cities…"
            aria-label="Search cities"
            className="mt-3 w-full px-4 py-2 text-sm border border-cream rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="overflow-y-auto p-2">
          {filteredCities.length === 0 ? (
            <p className="text-sm text-stone-warm text-center py-8">
              No cities match &ldquo;{filter}&rdquo;.
            </p>
          ) : (
            filteredCities.map(c => (
              <button
                key={c}
                onClick={() => onPick(c)}
                className={`w-full text-left px-4 py-3 rounded-lg hover:bg-cream transition-colors text-sm ${
                  c === currentCity ? 'bg-cream font-semibold text-primary' : 'text-charcoal'
                }`}
              >
                {c}
              </button>
            ))
          )}
        </div>
        <p className="text-xs text-stone-warm px-5 py-3 border-t border-cream">
          {allCities.length} cities in {countryName}. More coming soon.
        </p>
      </div>
    </div>
  )
}
