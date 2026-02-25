import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { BookingResponse } from '@/lib/types'
import DashboardShell from '@/components/dashboard/DashboardShell'
import BookingCard from '@/components/bookings/BookingCard'

export default function BookingsPage() {
  const { token, user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!token) router.replace('/auth/login?redirect=/dashboard/bookings')
  }, [token, router])

  const isPlanner = user?.role === 'PLANNER'
  const endpoint = isPlanner ? '/bookings/received' : '/bookings/my'
  const queryKey = isPlanner ? 'received-bookings' : 'my-bookings'

  const { data: bookings = [], isLoading } = useQuery<BookingResponse[]>({
    queryKey: [queryKey],
    queryFn: () => api.get(endpoint).then(r => r.data.data),
    enabled: !!token,
    retry: false,
  })

  if (!user) return null

  return (
    <DashboardShell title={isPlanner ? 'Received Bookings' : 'Your Bookings'}>
      {isLoading && (
        <div className="flex flex-col gap-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-24 bg-white border border-cream rounded-xl animate-pulse" />
          ))}
        </div>
      )}
      {!isLoading && bookings.length === 0 && (
        <div className="bg-white border border-cream rounded-xl p-8 text-center">
          <p className="text-stone-warm">No bookings yet.</p>
        </div>
      )}
      <div className="flex flex-col gap-3">
        {bookings.map(b => (
          <BookingCard key={b.id} booking={b} role={user.role} />
        ))}
      </div>
    </DashboardShell>
  )
}
