import { useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ShowcaseShell from '@/showcase/ShowcaseShell'
import ClientSettingsPage from '@/pages/dashboard/settings'
import { DEMO_USER_PROFILE } from '@/showcase/data'

export const getServerSideProps = () => {
  if (process.env.NODE_ENV === 'production') return { notFound: true }
  return { props: {} }
}

export default function ShowcaseClientSettings() {
  const qc = useMemo(() => {
    const c = new QueryClient()
    c.setQueryData(['user-profile'], DEMO_USER_PROFILE)
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
