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

  return (
    <DashboardShell title="My Listings">
      <div className="flex justify-end mb-4">
        <Link
          href="/dashboard/listings/new"
          className="bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-5 py-2.5 rounded-btn transition-colors"
        >
          + New Listing
        </Link>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-white border border-cream rounded-xl animate-pulse" />)}
        </div>
      )}

      {!isLoading && listings.length === 0 && (
        <div className="bg-white border border-cream rounded-xl p-10 text-center">
          <p className="text-stone-warm mb-4">You haven&apos;t created any listings yet.</p>
          <Link href="/dashboard/listings/new" className="text-primary font-semibold hover:underline">
            Create your first listing →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.map(listing => (
          <div key={listing.id} className="bg-white border border-cream rounded-xl overflow-hidden">
            {/* Image */}
            <div className="relative aspect-[16/9] bg-sand">
              {listing.coverImageUrl ? (
                <Image src={listing.coverImageUrl} alt={listing.title} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl opacity-30">🎪</div>
              )}
              <span className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
                listing.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {listing.isPublished ? 'Published' : 'Draft'}
              </span>
            </div>

            {/* Info */}
            <div className="p-4">
              <p className="font-semibold text-charcoal text-sm truncate">{listing.title}</p>
              <p className="text-xs text-stone-warm mt-0.5">{listing.location} · {formatPrice(listing.basePrice)}</p>

              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-cream">
                <Link
                  href={`/dashboard/listings/${listing.id}`}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Edit
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
                  className="text-xs font-medium text-red-600 hover:text-red-800 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  )
}
