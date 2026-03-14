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
    else if (user?.role === 'ADMIN') router.replace('/admin')
  }, [token, user, router])

  if (!user) return null
  if (user.role === 'CLIENT')  return <ClientDashboard />
  if (user.role === 'PLANNER') return <PlannerDashboard />

  // ADMIN: return null while redirect fires — never show the placeholder
  return null
}
