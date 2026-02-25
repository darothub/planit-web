import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuthStore } from '@/store/authStore'
import DashboardShell from '@/components/dashboard/DashboardShell'
import ListingForm from '@/components/dashboard/ListingForm'

export default function NewListingPage() {
  const { token, user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!token) router.replace('/auth/login?redirect=/dashboard/listings/new')
    else if (user && user.role !== 'PLANNER') router.replace('/dashboard')
  }, [token, user, router])

  if (!user) return null

  return (
    <DashboardShell title="New Listing">
      <ListingForm />
    </DashboardShell>
  )
}
