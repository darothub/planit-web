/**
 * Production Home — Airbnb-style, Planit-branded
 *
 * AirbnbHeader           — Logo | Find Events/Planners tabs | pill search
 * Welcome strip          — terracotta band with tagline + trust signals
 * Category rows          — horizontal scrollable rows per event type (API-first, SSR)
 * NearbyEventsContainer  — "Find events near you" — IP geo / GPS / manual pick
 * AirbnbFooter           — Charcoal footer with link columns + bottom bar
 */

import Head from 'next/head'
import type { GetServerSideProps } from 'next'
import { useQuery } from '@tanstack/react-query'
import AirbnbHeader from '@/components/home/AirbnbHeader'
import AirbnbFooter from '@/components/home/AirbnbFooter'
import CategoryRow from '@/components/home/CategoryRow'
import NearbyEventsContainer from '@/components/home/NearbyEventsContainer'
import { demoCategories } from '@/lib/demoData'
import { api } from '@/lib/api'
import { EventListingResponse } from '@/lib/types'

// ─── Category icons ────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, string> = {
  WEDDING:     '💒',
  BIRTHDAY:    '🎂',
  CORPORATE:   '🏢',
  ANNIVERSARY: '💑',
  GRADUATION:  '🎓',
  BABY_SHOWER: '👶',
  ENGAGEMENT:  '💍',
}

// ─── SSR ──────────────────────────────────────────────────────────────────
// Fetch listings on the Vercel server before HTML is sent to the browser.
// The first paint already contains real data — no demo flash possible.
// If the backend is slow/down we fall back to an empty array; React Query
// will retry on the client and skeleton-style empty state shows briefly.

type HomePageProps = { initialListings: EventListingResponse[] }

export const getServerSideProps: GetServerSideProps<HomePageProps> = async ({ res }) => {
  // Edge cache: serve a fresh copy for 60s, then revalidate in the background
  // for up to 5 more minutes — every visitor in that window gets instant HTML.
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8081/api/v1'

  // 2s timeout — never let a slow backend block our page render
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 2000)

  let initialListings: EventListingResponse[] = []
  try {
    const r = await fetch(`${apiUrl}/listings?page=0&size=60`, { signal: controller.signal })
    if (r.ok) {
      const json = await r.json() as { data?: { content?: EventListingResponse[] } }
      initialListings = json.data?.content ?? []
    }
  } catch {
    // Network/timeout → render empty; client-side query will retry
    initialListings = []
  } finally {
    clearTimeout(timeout)
  }

  return { props: { initialListings } }
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function HomePage({ initialListings }: HomePageProps) {
  // Real data is already in the HTML thanks to getServerSideProps.
  // React Query keeps it fresh on the client (revalidate after 5min).
  // No demo data anywhere — no flash possible.
  const { data: apiListings } = useQuery<EventListingResponse[]>({
    queryKey: ['listings-home'],
    queryFn: () =>
      api.get<{ data: { content: EventListingResponse[] } }>('/listings', { params: { page: 0, size: 60 } })
         .then(r => r.data.data?.content ?? []),
    initialData: initialListings,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  // Group real listings by event type; hide empty categories.
  // demoCategories is used only as a static category-order + display-name lookup —
  // its `listings` field is never read here.
  const categories = (() => {
    const byType = apiListings.reduce<Record<string, EventListingResponse[]>>((acc, l) => {
      const key = l.eventType.name;
      (acc[key] ??= []).push(l)
      return acc
    }, {})

    return demoCategories
      .map(cat => ({ ...cat, listings: byType[cat.eventTypeName] ?? [] }))
      .filter(cat => cat.listings.length > 0)
  })()

  return (
    <>
      <Head>
        <title>Planit — Find Your Perfect Event Planner</title>
        <meta
          name="description"
          content="Browse curated events from verified planners — weddings, birthdays, corporate gatherings and more. Book with confidence."
        />
      </Head>

      {/* ── AirbnbHeader ────────────────────────────────────────────────── */}
      <AirbnbHeader />

      {/* ── Welcome strip — Planit-exclusive warm band ───────────────────
          Compact terracotta strip with brand promise + trust signals.
      ─────────────────────────────────────────────────────────────────── */}
      <div className="bg-primary">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white font-semibold text-sm text-center sm:text-left">
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

      {/* ── Category rows ────────────────────────────────────────────────── */}
      <main className="bg-sand">
        {categories.map((category, idx) => (
          <div
            key={category.eventTypeName}
            className={idx % 2 === 0 ? 'bg-sand' : 'bg-parchment'}
          >
            <div className="max-w-7xl mx-auto px-6 py-10">
              {/* Primary accent bar + emoji — Planit's visual signature */}
              <div className="flex items-center gap-2 mb-4">
                <span className="w-1 h-5 rounded-full bg-primary flex-shrink-0" aria-hidden />
                <span className="text-base">{CATEGORY_ICONS[category.eventTypeName]}</span>
              </div>
              <CategoryRow
                title={`Popular ${category.displayName} events`}
                seeAllHref={`/listings?eventTypeId=${category.eventTypeName}`}
                listings={category.listings}
              />
            </div>
          </div>
        ))}
      </main>

      {/* ── Find events near you — IP geo / GPS / manual city pick ─────── */}
      <NearbyEventsContainer />

      {/* ── AirbnbFooter ────────────────────────────────────────────────── */}
      <AirbnbFooter />
    </>
  )
}
