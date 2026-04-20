/**
 * Geo helpers — proximity search for "Find events near you".
 *
 * Used by:
 * - Showcase: assigns synthetic coords to demo listings + computes distances
 * - Production: city-name → coords lookup for the manual location picker
 *
 * Real API listings already carry `latitude` / `longitude`; the backend does the
 * radius filter via `EventListingSpecification.withinRadius`. This file is purely
 * for client-side fallbacks and the location picker.
 */

/** Lat/Lng tuple. Coords are WGS-84 decimal degrees. */
export type Coords = { lat: number; lng: number }

/**
 * UK city → centre coordinates. Approximate (city-hall level), good enough
 * for proximity sorting / "X mi away" badges. Add cities as the planner
 * footprint grows.
 */
export const UK_CITY_COORDS: Record<string, Coords> = {
  London:        { lat: 51.5074, lng: -0.1278 },
  Manchester:    { lat: 53.4808, lng: -2.2426 },
  Birmingham:    { lat: 52.4862, lng: -1.8904 },
  Edinburgh:     { lat: 55.9533, lng: -3.1883 },
  Glasgow:       { lat: 55.8642, lng: -4.2518 },
  Bristol:       { lat: 51.4545, lng: -2.5879 },
  Leeds:         { lat: 53.8008, lng: -1.5491 },
  Liverpool:     { lat: 53.4084, lng: -2.9916 },
  Sheffield:     { lat: 53.3811, lng: -1.4701 },
  Cardiff:       { lat: 51.4816, lng: -3.1791 },
  Brighton:      { lat: 50.8225, lng: -0.1372 },
  Bath:          { lat: 51.3811, lng: -2.3590 },
  Oxford:        { lat: 51.7520, lng: -1.2577 },
  Cambridge:     { lat: 52.2053, lng:  0.1218 },
  Nottingham:    { lat: 52.9548, lng: -1.1581 },
  Surrey:        { lat: 51.2362, lng: -0.5704 },  // Guildford
  Kent:          { lat: 51.2787, lng:  0.5217 },  // Maidstone
  Cornwall:      { lat: 50.2660, lng: -5.0527 },  // Truro
  Cotswolds:     { lat: 51.8330, lng: -1.8433 },  // Stow-on-the-Wold
  'Lake District': { lat: 54.4609, lng: -3.0886 }, // Keswick
  Yorkshire:     { lat: 53.9591, lng: -1.0815 },  // York
}

/** Look up a city's centre coordinates by name. Returns `null` if unknown. */
export function cityToCoords(city: string | null | undefined): Coords | null {
  if (!city) return null
  return UK_CITY_COORDS[city] ?? null
}

/**
 * Haversine distance between two coordinates, in kilometres.
 * Accuracy ±0.5% — fine for "12 km away" badges.
 */
export function haversineKm(a: Coords, b: Coords): number {
  const R = 6371 // Earth radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180

  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)

  const sinDLat = Math.sin(dLat / 2)
  const sinDLng = Math.sin(dLng / 2)
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng
  return 2 * R * Math.asin(Math.sqrt(h))
}

/** Convert km → miles, rounded to nearest integer. UK-centric formatting. */
export function kmToMiles(km: number): number {
  return Math.round(km * 0.621371)
}

/** Format a distance for display: "2 mi" / "47 mi" / "<1 mi". */
export function formatDistance(km: number): string {
  const mi = kmToMiles(km)
  if (mi < 1) return '<1 mi'
  return `${mi} mi`
}
