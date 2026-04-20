/**
 * /api/location — best-effort IP-level geolocation from Vercel edge headers.
 *
 * Called from the browser (never-cached per-request) so that the outer
 * HTML page can keep `s-maxage=60` edge caching without leaking one user's
 * city into another user's cached copy.
 *
 * Vercel populates these headers only in production:
 *   - x-vercel-ip-city        (URL-encoded, e.g. "San%20Francisco")
 *   - x-vercel-ip-latitude    (stringified float)
 *   - x-vercel-ip-longitude   (stringified float)
 *   - x-vercel-ip-country     (ISO-3166-1 alpha-2)
 *
 * In local dev or non-Vercel hosting we return `{ source: null }` and the
 * client UI falls back to "Pick a city".
 */

import type { NextApiRequest, NextApiResponse } from 'next'

export type LocationHintResponse = {
  lat: number | null
  lng: number | null
  city: string | null
  country: string | null
  source: 'ip' | null
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<LocationHintResponse>,
) {
  // Never cache — response depends on the caller's IP
  res.setHeader('Cache-Control', 'no-store, max-age=0')

  const h = req.headers
  const rawCity    = h['x-vercel-ip-city']
  const rawLat     = h['x-vercel-ip-latitude']
  const rawLng     = h['x-vercel-ip-longitude']
  const rawCountry = h['x-vercel-ip-country']

  const city = typeof rawCity === 'string' && rawCity.length > 0
    ? decodeURIComponent(rawCity)
    : null
  const lat = typeof rawLat === 'string' ? parseFloat(rawLat) : NaN
  const lng = typeof rawLng === 'string' ? parseFloat(rawLng) : NaN
  const country = typeof rawCountry === 'string' ? rawCountry : null

  const valid = city !== null && Number.isFinite(lat) && Number.isFinite(lng)

  return res.status(200).json({
    lat:     valid ? lat : null,
    lng:     valid ? lng : null,
    city:    valid ? city : null,
    country,
    source:  valid ? 'ip' : null,
  })
}
