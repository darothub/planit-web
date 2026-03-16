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

    const makePage = (search: string, page: number) => {
      const q = (search ?? '').toLowerCase()
      const filtered = q
        ? listings.filter(l => l.title.toLowerCase().includes(q))
        : listings
      const size = 20
      const start = page * size
      return {
        content: filtered.slice(start, start + size),
        page,
        size,
        totalElements: filtered.length,
        totalPages: Math.ceil(filtered.length / size),
        first: page === 0,
        last: start + size >= filtered.length,
      }
    }

    const c = new QueryClient({
      defaultOptions: { queries: { staleTime: Infinity, retry: false } },
    })

    // Pre-seed the initial (empty search) result
    c.setQueryData(['admin-listings', '', 0], makePage('', 0))

    // For every subsequent query key (new search term / page), seed demo data immediately
    // so the real queryFn (which hits a real API) is never called
    c.getQueryCache().subscribe(event => {
      if (event.type === 'added') {
        const key = event.query.queryKey as [string, string, number]
        if (key[0] === 'admin-listings') {
          c.setQueryData(key, makePage(key[1] ?? '', key[2] ?? 0))
        }
      }
    })

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
