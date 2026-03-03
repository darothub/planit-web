import { useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ShowcaseShell from '@/showcase/ShowcaseShell'
import InquiriesPage from '@/pages/dashboard/inquiries/index'
import { DEMO_INQUIRIES_CLIENT } from '@/showcase/data'

export const getServerSideProps = () => {
  if (process.env.NODE_ENV === 'production') return { notFound: true }
  return { props: {} }
}

export default function ShowcaseDashboardInquiries() {
  const qc = useMemo(() => {
    const c = new QueryClient()
    // InquiriesPage uses queryKey ['my-inquiries'] for CLIENT role
    c.setQueryData(['my-inquiries'], DEMO_INQUIRIES_CLIENT)
    return c
  }, [])

  return (
    <QueryClientProvider client={qc}>
      <ShowcaseShell pageName="Client — Inquiries" demoRole="CLIENT">
        <InquiriesPage />
      </ShowcaseShell>
    </QueryClientProvider>
  )
}
