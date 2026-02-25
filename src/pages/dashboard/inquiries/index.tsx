import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { InquiryResponse } from '@/lib/types'
import DashboardShell from '@/components/dashboard/DashboardShell'
import InquiryCard from '@/components/inquiries/InquiryCard'

export default function InquiriesPage() {
  const { token, user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!token) router.replace('/auth/login?redirect=/dashboard/inquiries')
  }, [token, router])

  const isPlanner = user?.role === 'PLANNER'

  const { data: inquiries = [], isLoading } = useQuery<InquiryResponse[]>({
    queryKey: [isPlanner ? 'received-inquiries' : 'my-inquiries'],
    queryFn: () => api.get(isPlanner ? '/inquiries/received' : '/inquiries/my').then(r => r.data.data),
    enabled: !!token,
    retry: false,
  })

  if (!user) return null

  return (
    <DashboardShell title="Messages">
      {isLoading && (
        <div className="flex flex-col gap-2">
          {[1,2,3,4].map(i => <div key={i} className="h-20 bg-white border border-cream rounded-xl animate-pulse" />)}
        </div>
      )}
      {!isLoading && inquiries.length === 0 && (
        <div className="bg-white border border-cream rounded-xl p-8 text-center">
          <p className="text-stone-warm">No conversations yet.</p>
        </div>
      )}
      <div className="flex flex-col gap-2">
        {inquiries.map(i => (
          <InquiryCard key={i.id} inquiry={i} role={user.role} />
        ))}
      </div>
    </DashboardShell>
  )
}
