import { useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ShowcaseShell from '@/showcase/ShowcaseShell'
import ClientSettingsPage from '@/pages/dashboard/settings'
import { UserResponse } from '@/lib/types'

export const getServerSideProps = () => {
  if (process.env.NODE_ENV === 'production') return { notFound: true }
  return { props: {} }
}

const DEMO_USER: UserResponse = {
  id: 1001,
  email: 'sarah@example.com',
  firstName: 'Sarah',
  lastName: 'Chen',
  phone: '+44 7700 654321',
  role: 'CLIENT',
  emailVerified: true,
}

export default function ShowcaseClientSettings() {
  const qc = useMemo(() => {
    const c = new QueryClient()
    c.setQueryData(['user-profile'], DEMO_USER)
    return c
  }, [])

  return (
    <QueryClientProvider client={qc}>
      <ShowcaseShell pageName="Account Settings (Client)" demoRole="CLIENT">
        <ClientSettingsPage />
      </ShowcaseShell>
    </QueryClientProvider>
  )
}
