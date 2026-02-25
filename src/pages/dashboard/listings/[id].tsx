import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { EventListingResponse } from '@/lib/types'
import DashboardShell from '@/components/dashboard/DashboardShell'
import ListingForm from '@/components/dashboard/ListingForm'

export default function EditListingPage() {
  const { token, user } = useAuthStore()
  const router = useRouter()
  const { id } = router.query

  useEffect(() => {
    if (!token) router.replace('/auth/login')
    else if (user && user.role !== 'PLANNER') router.replace('/dashboard')
  }, [token, user, router])

  const { data: listing, isLoading } = useQuery<EventListingResponse>({
    queryKey: ['listing', id],
    queryFn: () => api.get(`/planners/me/listings/${id}`).then(r => r.data.data),
    enabled: !!token && !!id,
    retry: false,
  })

  if (!user || isLoading) return (
    <DashboardShell title="Edit Listing">
      <div className="h-96 bg-white border border-cream rounded-xl animate-pulse max-w-2xl" />
    </DashboardShell>
  )

  if (!listing) return (
    <DashboardShell title="Edit Listing">
      <p className="text-stone-warm">Listing not found.</p>
    </DashboardShell>
  )

  return (
    <DashboardShell title="Edit Listing">
      <ListingForm initial={listing} />
    </DashboardShell>
  )
}
