import { useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ShowcaseShell from '@/showcase/ShowcaseShell'
import AdminListingsPage from '@/pages/admin/listings'
import { getAllDemoListings } from '@/lib/demoData'

export const getServerSideProps = () => {
  if (process.env.NODE_ENV === 'production') return { notFound: true }
  return { props: {} }
}

export default function ShowcaseAdminListings() {
  const qc = useMemo(() => {
    const listings = getAllDemoListings()
    const page = {
      content: listings,
      page: 0,
      size: 20,
      totalElements: listings.length,
      totalPages: Math.ceil(listings.length / 20),
      first: true,
      last: true,
    }
    const c = new QueryClient()
    c.setQueryData(['admin-listings', '', 0], page)
    return c
  }, [])

  return (
    <QueryClientProvider client={qc}>
      <ShowcaseShell pageName="Admin — Listings" demoRole="ADMIN">
        <AdminListingsPage />
      </ShowcaseShell>
    </QueryClientProvider>
  )
}
