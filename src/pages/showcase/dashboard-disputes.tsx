import { useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ShowcaseShell from '@/showcase/ShowcaseShell'
import DisputesPage from '@/pages/dashboard/disputes/index'
import { DEMO_DISPUTES } from '@/showcase/data'

export const getServerSideProps = () => {
  if (process.env.NODE_ENV === 'production') return { notFound: true }
  return { props: {} }
}

export default function ShowcaseDashboardDisputes() {
  const qc = useMemo(() => {
    const c = new QueryClient()
    c.setQueryData(['disputes'], DEMO_DISPUTES)
    return c
  }, [])

  return (
    <QueryClientProvider client={qc}>
      <ShowcaseShell pageName="Disputes" demoRole="CLIENT">
        <DisputesPage />
      </ShowcaseShell>
    </QueryClientProvider>
  )
}
