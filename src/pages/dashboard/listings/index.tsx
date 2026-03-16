import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { EventListingResponse } from '@/lib/types'
import DashboardShell from '@/components/dashboard/DashboardShell'
import { formatPrice, getListingGradient, cn } from '@/lib/utils'
import { DEMO_PLANNER_LISTINGS } from '@/showcase/data'

type Tab = 'all' | 'published' | 'drafts'

export default function PlannerListingsPage() {
  const { token, user } = useAuthStore()
  const router = useRouter()
  const qc = useQueryClient()
  const [tab, setTab] = useState<Tab>('all')
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  useEffect(() => {
    if (!token) router.replace('/auth/login?redirect=/dashboard/listings')
    else if (user && user.role !== 'PLANNER') router.replace('/dashboard')
  }, [token, user, router])

  const { data: listings = DEMO_PLANNER_LISTINGS, isLoading } = useQuery<EventListingResponse[]>({
    queryKey: ['my-listings'],
    queryFn: () => api.get('/planners/me/listings').then(r => r.data.data),
    enabled: !!token,
    placeholderData: DEMO_PLANNER_LISTINGS,
    retry: false,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/planners/me/listings/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-listings'] })
      setConfirmDeleteId(null)
    },
  })

  const publishMutation = useMutation({
    mutationFn: ({ id, publish }: { id: number; publish: boolean }) =>
      api.patch(`/planners/me/listings/${id}/${publish ? 'publish' : 'unpublish'}`).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-listings'] }),
  })

  if (!user) return null

  const published = listings.filter(l => l.isPublished)
  const drafts    = listings.filter(l => !l.isPublished)

  const filtered =
    tab === 'published' ? published :
    tab === 'drafts'    ? drafts :
    listings

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'all',       label: 'All',       count: listings.length },
    { key: 'published', label: 'Published', count: published.length },
    { key: 'drafts',    label: 'Drafts',    count: drafts.length },
  ]

  return (
    <DashboardShell title="My Listings">

      {/* Stats row */}
      {listings.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-white border border-cream rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-charcoal">{listings.length}</p>
            <p className="text-xs text-stone-warm mt-1">Total</p>
          </div>
          <div className="bg-white border border-cream rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-700">{published.length}</p>
            <p className="text-xs text-stone-warm mt-1">Published</p>
          </div>
          <div className="bg-white border border-cream rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-charcoal">{drafts.length}</p>
            <p className="text-xs text-stone-warm mt-1">Drafts</p>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-cream rounded-xl p-1">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                tab === t.key
                  ? 'bg-primary text-white'
                  : 'text-stone-warm hover:text-charcoal hover:bg-sand',
              )}
            >
              {t.label}
              {t.count > 0 && (
                <span className={cn(
                  'ml-1.5 text-xs px-1.5 py-0.5 rounded-full',
                  tab === t.key ? 'bg-white/20 text-white' : 'bg-sand text-stone-warm',
                )}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* New listing CTA */}
        <Link
          href="/dashboard/listings/new"
          className="ml-auto bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-5 py-2.5 rounded-btn transition-colors"
        >
          + New Listing
        </Link>
      </div>

      {/* Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white border border-cream rounded-xl overflow-hidden animate-pulse">
              <div className="aspect-[16/9] bg-cream" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-cream rounded w-3/4" />
                <div className="h-3 bg-cream rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filtered.length === 0 && (
        <div className="bg-white border border-cream rounded-xl p-10 text-center">
          {listings.length === 0 ? (
            <>
              <p className="text-3xl mb-3">🗂</p>
              <p className="font-medium text-charcoal mb-1">No listings yet</p>
              <p className="text-sm text-stone-warm mb-4">Create your first listing to start receiving inquiries from clients.</p>
              <Link href="/dashboard/listings/new" className="inline-block bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-5 py-2.5 rounded-btn transition-colors">
                Create your first listing
              </Link>
            </>
          ) : (
            <p className="text-stone-warm text-sm">No {tab} listings.</p>
          )}
        </div>
      )}

      {/* Grid */}
      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(listing => (
            <div key={listing.id} className="bg-white border border-cream rounded-xl overflow-hidden flex flex-col">

              {/* Thumbnail */}
              <div
                className="relative aspect-[16/9] flex-shrink-0"
                style={{ background: getListingGradient(listing.id) }}
              >
                {listing.coverImageUrl && (
                  <Image
                    src={listing.coverImageUrl}
                    alt={listing.title}
                    fill
                    className="object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                )}

                {/* Status badge — top left */}
                <span className={cn(
                  'absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full',
                  listing.isPublished ? 'bg-green-100 text-green-800' : 'bg-white/90 text-stone-500',
                )}>
                  {listing.isPublished ? 'Published' : 'Draft'}
                </span>

                {/* Featured badge */}
                {listing.isFeatured && (
                  <span className="absolute top-2 left-[5.5rem] text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    ★ Featured
                  </span>
                )}

                {/* Rating badge — top right */}
                {listing.averageRating != null && (
                  <span className="absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-black/50 text-white backdrop-blur-sm">
                    ★ {listing.averageRating.toFixed(1)}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-4 flex flex-col flex-1">
                <p className="font-semibold text-charcoal text-sm truncate mb-0.5">{listing.title}</p>
                <p className="text-xs text-stone-warm truncate">
                  {listing.eventType.displayName} · {listing.location}
                </p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="text-xs font-semibold text-charcoal">{formatPrice(listing.basePrice)}</span>
                  <span className="text-stone-warm text-xs">·</span>
                  <span className="text-xs text-stone-warm">
                    {listing.minGuests}–{listing.maxGuests} guests
                  </span>
                  {listing.reviewCount > 0 && (
                    <>
                      <span className="text-stone-warm text-xs">·</span>
                      <span className="text-xs text-stone-warm">
                        {listing.reviewCount} review{listing.reviewCount !== 1 ? 's' : ''}
                      </span>
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-cream">
                  <Link
                    href={`/dashboard/listings/${listing.id}`}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/listings/${listing.id}`}
                    target="_blank"
                    className="text-xs font-medium text-stone-warm hover:text-charcoal transition-colors"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => publishMutation.mutate({ id: listing.id, publish: !listing.isPublished })}
                    disabled={publishMutation.isPending}
                    className={cn(
                      'text-xs font-medium transition-colors disabled:opacity-50',
                      listing.isPublished
                        ? 'text-stone-warm hover:text-charcoal'
                        : 'text-green-700 hover:text-green-900',
                    )}
                  >
                    {listing.isPublished ? 'Unpublish' : 'Publish'}
                  </button>

                  {/* Delete with inline confirm */}
                  {confirmDeleteId === listing.id ? (
                    <div className="ml-auto flex items-center gap-2">
                      <span className="text-xs text-stone-warm">Delete?</span>
                      <button
                        onClick={() => deleteMutation.mutate(listing.id)}
                        disabled={deleteMutation.isPending}
                        className="text-xs font-semibold text-red-600 hover:text-red-800 disabled:opacity-50"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-xs text-stone-warm hover:text-charcoal"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(listing.id)}
                      className="text-xs font-medium text-red-600 hover:text-red-800 transition-colors ml-auto"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </DashboardShell>
  )
}
