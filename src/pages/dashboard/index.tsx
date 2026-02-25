import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuthStore } from '@/store/authStore'
import ClientDashboard from '@/components/dashboard/ClientDashboard'
import PlannerDashboard from '@/components/dashboard/PlannerDashboard'
import DashboardShell from '@/components/dashboard/DashboardShell'

export default function DashboardPage() {
  const { token, user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!token) router.replace('/auth/login?redirect=/dashboard')
  }, [token, router])

  if (!user) return null
  if (user.role === 'CLIENT')  return <ClientDashboard />
  if (user.role === 'PLANNER') return <PlannerDashboard />

  return (
    <DashboardShell title="Admin">
      <p className="text-stone-warm">Admin panel coming soon.</p>
    </DashboardShell>
  )
}
