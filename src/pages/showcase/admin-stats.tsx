import { useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ShowcaseShell from '@/showcase/ShowcaseShell'
import AdminOverviewPage from '@/pages/admin/index'
import { DEMO_ADMIN_STATS } from '@/showcase/data'

export const getServerSideProps = () => {
  if (process.env.NODE_ENV === 'production') return { notFound: true }
  return { props: {} }
}

export default function ShowcaseAdminStats() {
  const qc = useMemo(() => {
    const c = new QueryClient()
    c.setQueryData(['admin-stats'], DEMO_ADMIN_STATS)
    return c
  }, [])

  return (
    <QueryClientProvider client={qc}>
      <ShowcaseShell pageName="Admin Overview" demoRole="ADMIN">
        <AdminOverviewPage />
      </ShowcaseShell>
    </QueryClientProvider>
  )
}
