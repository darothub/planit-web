/**
 * Showcase: Home with location-aware "Find events near you".
 *
 * Stream A — Phase 1 visual review.
 *
 * Mocks four scenarios via the picker at the top:
 *   1. No location yet (initial state)
 *   2. IP-based estimate (London, "estimated" badge)
 *   3. Exact GPS (London, no badge)
 *   4. Manual city pick (Manchester)
 *
 * Demo listings get synthetic coords from `cityToCoords`; distances are
 * computed via Haversine. Production will get real coords from the API
 * + Vercel geo headers — same component, different data source.
 *
 * Dev-only.
 */

import { useState, useMemo } from 'react'
import Head from 'next/head'
import ShowcaseShell from '@/showcase/ShowcaseShell'
import AirbnbHeader from '@/components/home/AirbnbHeader'
import AirbnbFooter from '@/components/home/AirbnbFooter'
import NearbyEvents, { UserLocation, NearbyListing } from '@/components/home/NearbyEvents'
import { demoCategories } from '@/lib/demoData'
import { cityToCoords, haversineKm, UK_CITY_COORDS } from '@/lib/geo'
import { cn } from '@/lib/utils'

export const getServerSideProps = () => {
  if (process.env.NODE_ENV === 'production') return { notFound: true }
  return { props: {} }
}

// ─── Scenario picker ───────────────────────────────────────────────────────

type Scenario = {
  key: string
  label: string
  location: UserLocation | null
}

const SCENARIOS: Scenario[] = [
  {
    key: 'none',
    label: '1. No location',
    location: null,
  },
  {
    key: 'ip-london',
    label: '2. IP estimate (London)',
    location: { ...UK_CITY_COORDS.London, city: 'London',     source: 'ip'     },
  },
  {
    key: 'gps-london',
    label: '3. GPS exact (London)',
    location: { ...UK_CITY_COORDS.London, city: 'London',     source: 'gps'    },
  },
  {
    key: 'manual-manchester',
    label: '4. Manual (Manchester)',
    location: { ...UK_CITY_COORDS.Manchester, city: 'Manchester', source: 'manual' },
  },
  {
    key: 'manual-edinburgh',
    label: '5. Manual (Edinburgh)',
    location: { ...UK_CITY_COORDS.Edinburgh, city: 'Edinburgh', source: 'manual' },
  },
]

const RADIUS_KM = 80 // ~50 miles

// ─── Page ──────────────────────────────────────────────────────────────────

export default function ShowcaseHomeNearby() {
  const [scenarioKey, setScenarioKey] = useState<string>('ip-london')

  const scenario = SCENARIOS.find(s => s.key === scenarioKey) ?? SCENARIOS[0]
  const userLocation = scenario.location

  // Build mock "nearby" listings:
  //  - flatten all demo listings
  //  - assign synthetic lat/lng via cityToCoords(listing.location)
  //  - compute distance from userLocation
  //  - filter to RADIUS_KM
  //  - sort by distance ascending
  const { nearbyListings, totalCount } = useMemo(() => {
    if (!userLocation) return { nearbyListings: [] as NearbyListing[], totalCount: 0 }

    const all = demoCategories.flatMap(c => c.listings)
    const annotated: NearbyListing[] = []
    for (const listing of all) {
      const coords = cityToCoords(listing.location)
      if (!coords) continue
      const distanceKm = haversineKm(userLocation, coords)
      annotated.push({ ...listing, latitude: coords.lat, longitude: coords.lng, distanceKm })
    }
    const withinRadius = annotated
      .filter(l => l.distanceKm <= RADIUS_KM)
      .sort((a, b) => a.distanceKm - b.distanceKm)

    return { nearbyListings: withinRadius, totalCount: withinRadius.length }
  }, [userLocation])

  return (
    <ShowcaseShell pageName="Home — Location-aware">
      <Head>
        <title>Showcase — Home with Nearby Events</title>
      </Head>

      <AirbnbHeader />

      {/* Welcome strip — same as production home */}
      <div className="bg-primary">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white font-semibold text-sm">
            The marketplace for verified event planners
          </p>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-1">
            {[
              { icon: '✅', text: 'Verified planners' },
              { icon: '🔒', text: 'Payments in escrow' },
              { icon: '💬', text: 'Free to message' },
              { icon: '🛡️', text: 'Dispute protection' },
            ].map(t => (
              <span key={t.text} className="flex items-center gap-1 text-white/85 text-xs font-medium">
                {t.icon} {t.text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Scenario picker — dev-only debug bar ─────────────────────── */}
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-3 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
            Showcase scenario:
          </span>
          {SCENARIOS.map(s => (
            <button
              key={s.key}
              onClick={() => setScenarioKey(s.key)}
              className={cn(
                'text-xs font-semibold px-3 py-1.5 rounded-full transition-colors',
                scenarioKey === s.key
                  ? 'bg-amber-800 text-white'
                  : 'bg-white text-amber-800 hover:bg-amber-100',
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── The new section ──────────────────────────────────────────── */}
      <NearbyEvents
        userLocation={userLocation}
        listings={nearbyListings}
        totalCount={totalCount}
        radiusKm={RADIUS_KM}
        onChangeCity={() => alert('Showcase: this would open a city picker modal')}
        onClearLocation={() => setScenarioKey('none')}
        onUseGps={() => setScenarioKey('gps-london')}
      />

      <AirbnbFooter />
    </ShowcaseShell>
  )
}
