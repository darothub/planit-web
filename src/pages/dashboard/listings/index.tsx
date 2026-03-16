import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { EventListingResponse } from '@/lib/types'
import DashboardShell from '@/components/dashboard/DashboardShell'
import { formatPrice } from '@/lib/utils'

const LISTING_GRADIENTS = [
  'linear-gradient(135deg, #C1694F, #8B4513)',
  'linear-gradient(135deg, #4A5240, #2C3520)',
  'linear-gradient(135deg, #8B6F47, #6B4F2A)',
  'linear-gradient(135deg, #5C7A6B, #3D5C4F)',
  'linear-gradient(135deg, #7A5C78, #5C3F5A)',
]

export default function PlannerListingsPage() {
  const { token, user } = useAuthStore()
  const router = useRouter()
  const qc = useQueryClient()

  useEffect(() => {
    if (!token) router.replace('/auth/login?redirect=/dashboard/listings')
    else if (user && user.role !== 'PLANNER') router.replace('/dashboard')
  }, [token, user, router])

  const { data: listings = [], isLoading } = useQuery<EventListingResponse[]>({
    queryKey: ['my-listings'],
    queryFn: () => api.get('/planners/me/listings').then(r => r.data.data),
    enabled: !!token,
    retry: false,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/planners/me/listings/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-listings'] }),
  })

  const publishMutation = useMutation({
    mutationFn: ({ id, publish }: { id: number; publish: boolean }) =>
      api.patch(`/planners/me/listings/${id}/${publish ? 'publish' : 'unpublish'}`).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-listings'] }),
  })

  if (!user) return null

  const published = listings.filter(l => l.isPublished).length
  const drafts = listings.length - published

  return (
    <DashboardShell title="My Listings">

      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        {!isLoading && listings.length > 0 && (
          <p className="text-sm text-stone-warm">
            {listings.length} listing{listings.length !== 1 ? 's' : ''}
            {' · '}
            <span className="text-green-700">{published} published</span>
            {drafts > 0 && <>{' · '}{drafts} draft{drafts !== 1 ? 's' : ''}</>}
          </p>
        )}
        <div className="ml-auto">
          <Link
            href="/dashboard/listings/new"
            className="bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-5 py-2.5 rounded-btn transition-colors"
          >
            + New Listing
          </Link>
        </div>
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
      {!isLoading && listings.length === 0 && (
        <div className="bg-white border border-cream rounded-xl p-10 text-center">
          <p className="text-stone-warm mb-4">You haven&apos;t created any listings yet.</p>
          <Link href="/dashboard/listings/new" className="text-primary font-semibold hover:underline">
            Create your first listing →
          </Link>
        </div>
      )}

      {/* Grid */}
      {!isLoading && listings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map(listing => (
            <div key={listing.id} className="bg-white border border-cream rounded-xl overflow-hidden">

              {/* Thumbnail */}
              <div className="relative aspect-[16/9]">
                {listing.coverImageUrl ? (
                  <Image src={listing.coverImageUrl} alt={listing.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full" style={{
                    background: LISTING_GRADIENTS[Math.abs(listing.id) % LISTING_GRADIENTS.length]
                  }} />
                )}

                {/* Status badge — top left */}
                <span className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
                  listing.isPublished ? 'bg-green-100 text-green-800' : 'bg-white/90 text-stone-500'
                }`}>
                  {listing.isPublished ? 'Published' : 'Draft'}
                </span>

                {/* Rating badge — top right */}
                {listing.averageRating != null && (
                  <span className="absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-black/50 text-white backdrop-blur-sm">
                    ★ {listing.averageRating.toFixed(1)}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <p className="font-semibold text-charcoal text-sm truncate">{listing.title}</p>
                <p className="text-xs text-stone-warm mt-0.5">
                  {listing.eventType.displayName} · {listing.location} · {formatPrice(listing.basePrice)}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-cream">
                  <Link
                    href={`/dashboard/listings/${listing.id}`}
                    className="text-xs font-medium text-primary hover:underline"
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
                    className="text-xs font-medium text-charcoal hover:text-primary transition-colors"
                  >
                    {listing.isPublished ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this listing? This cannot be undone.')) {
                        deleteMutation.mutate(listing.id)
                      }
                    }}
                    className="text-xs font-medium text-red-600 hover:text-red-800 transition-colors ml-auto"
                  >
                    Delete
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </DashboardShell>
  )
}
