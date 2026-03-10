import { useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ShowcaseShell from '@/showcase/ShowcaseShell'
import AdminDisputesPage from '@/pages/admin/disputes'
import { DEMO_ADMIN_DISPUTES } from '@/showcase/data'

export const getServerSideProps = () => {
  if (process.env.NODE_ENV === 'production') return { notFound: true }
  return { props: {} }
}

export default function ShowcaseAdminDisputes() {
  const qc = useMemo(() => {
    const c = new QueryClient()
    c.setQueryData(['admin-disputes'], DEMO_ADMIN_DISPUTES)
    return c
  }, [])

  return (
    <QueryClientProvider client={qc}>
      <ShowcaseShell pageName="Admin — Disputes" demoRole="ADMIN">
        <AdminDisputesPage />
      </ShowcaseShell>
    </QueryClientProvider>
  )
}
