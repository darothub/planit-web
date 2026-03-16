import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { EventListingResponse, PageResponse } from '@/lib/types'
import AdminShell from '@/components/admin/AdminShell'
import { formatPrice, getListingGradient } from '@/lib/utils'

const EMPTY_PAGE: PageResponse<EventListingResponse> = {
  content: [], page: 0, size: 20, totalElements: 0, totalPages: 0, first: true, last: true,
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export default function AdminListingsPage() {
  const qc = useQueryClient()
  const [searchInput, setSearchInput]   = useState('')
  const [page, setPage]                 = useState(0)
  const [selected, setSelected]         = useState<Set<number>>(new Set())
  const [confirmOpen, setConfirmOpen]   = useState(false)
  const [resultMsg, setResultMsg]       = useState<string | null>(null)

  const search = useDebounce(searchInput, 400)

  // Reset to first page when search term changes
  useEffect(() => { setPage(0) }, [search])

  const { data = EMPTY_PAGE, isLoading, isError, error } = useQuery<PageResponse<EventListingResponse>>({
    queryKey: ['admin-listings', search, page],
    queryFn: () =>
      api.get('/admin/listings', { params: { q: search || undefined, page, size: 20 } })
         .then(r => r.data.data),
    placeholderData: EMPTY_PAGE,
    retry: false,
  })

  const deleteMutation = useMutation({
    mutationFn: (ids: number[]) => api.delete('/admin/listings', { data: { ids } }),
    onSuccess: (res) => {
      const { deletedCount, failedCount, failed } = res.data.data
      const parts = [`${deletedCount} listing${deletedCount !== 1 ? 's' : ''} deleted`]
      if (failedCount > 0) {
        const reasons = Object.entries(failed as Record<string, string>)
          .map(([id, reason]) => `#${id}: ${reason}`)
          .join('; ')
        parts.push(`${failedCount} skipped (${reasons})`)
      }
      setResultMsg(parts.join(' · '))
      setSelected(new Set())
      setConfirmOpen(false)
      qc.invalidateQueries({ queryKey: ['admin-listings'] })
    },
  })

  const allIds = data.content.map(l => l.id)
  const allSelected = allIds.length > 0 && allIds.every(id => selected.has(id))

  const toggleAll = () => {
    if (allSelected) {
      setSelected(prev => { const s = new Set(prev); allIds.forEach(id => s.delete(id)); return s })
    } else {
      setSelected(prev => new Set([...prev, ...allIds]))
    }
  }

  const toggle = useCallback((id: number) => {
    setSelected(prev => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })
  }, [])

  return (
    <AdminShell title="All Listings">

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          type="text"
          placeholder="Search by title…"
          value={searchInput}
          onChange={e => { setSearchInput(e.target.value); setResultMsg(null) }}
          className="flex-1 border border-cream rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        {selected.size > 0 && (
          <button
            onClick={() => setConfirmOpen(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Delete selected ({selected.size})
          </button>
        )}
      </div>

      {/* Result banner */}
      {resultMsg && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
          {resultMsg}
        </div>
      )}

      {/* Error banner */}
      {isError && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
          Failed to load listings:{' '}
          {(error as { response?: { data?: { message?: string }; status?: number } })?.response?.data?.message
            ?? (error as Error)?.message
            ?? 'Unknown error'}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-cream overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-sand border-b border-cream">
            <tr>
              <th className="px-4 py-3 text-left w-10">
                <input type="checkbox" checked={allSelected} onChange={toggleAll}
                  className="accent-primary" />
              </th>
              <th className="px-4 py-3 text-left font-semibold text-charcoal">Title</th>
              <th className="px-4 py-3 text-left font-semibold text-charcoal hidden md:table-cell">Planner</th>
              <th className="px-4 py-3 text-left font-semibold text-charcoal hidden lg:table-cell">Type</th>
              <th className="px-4 py-3 text-left font-semibold text-charcoal hidden sm:table-cell">Price</th>
              <th className="px-4 py-3 text-left font-semibold text-charcoal">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream">
            {isLoading && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-stone-warm">Loading…</td></tr>
            )}
            {!isLoading && data.content.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-stone-warm">
                {searchInput ? `No listings matching "${searchInput}"` : 'No listings found'}
              </td></tr>
            )}
            {data.content.map(listing => (
              <tr key={listing.id}
                className={`hover:bg-sand/40 transition-colors ${selected.has(listing.id) ? 'bg-red-50' : ''}`}>
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selected.has(listing.id)}
                    onChange={() => toggle(listing.id)} className="accent-primary" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {/* Thumbnail — always shown, gradient fallback */}
                    <div className="w-10 h-10 rounded-lg shrink-0 overflow-hidden hidden sm:block">
                      {listing.coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={listing.coverImageUrl} alt=""
                          className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full" style={{
                          background: getListingGradient(listing.id)
                        }} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-charcoal line-clamp-1">{listing.title}</p>
                      <Link
                        href={`/listings/${listing.id}`}
                        target="_blank"
                        className="text-xs text-primary hover:underline"
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-stone-warm hidden md:table-cell">
                  {listing.planner?.businessName ?? '—'}
                </td>
                <td className="px-4 py-3 text-stone-warm hidden lg:table-cell">
                  {listing.eventType?.displayName ?? '—'}
                </td>
                <td className="px-4 py-3 text-stone-warm hidden sm:table-cell">
                  {listing.basePrice ? formatPrice(listing.basePrice) : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    listing.isPublished
                      ? 'bg-green-100 text-green-700'
                      : 'bg-stone-100 text-stone-500'
                  }`}>
                    {listing.isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {data.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-cream flex items-center justify-between text-sm text-stone-warm">
            <span>{data.totalElements} total</span>
            <div className="flex gap-2">
              <button disabled={data.first} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 rounded border border-cream disabled:opacity-40 hover:bg-sand transition-colors">
                ‹ Prev
              </button>
              <span className="px-3 py-1">Page {data.page + 1} of {data.totalPages}</span>
              <button disabled={data.last} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 rounded border border-cream disabled:opacity-40 hover:bg-sand transition-colors">
                Next ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm delete dialog */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-charcoal mb-2">
              Delete {selected.size} listing{selected.size !== 1 ? 's' : ''}?
            </h2>
            <p className="text-sm text-stone-warm mb-6">
              This is permanent. Listings with active inquiries will be skipped and reported.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-btn border border-cream text-sm font-medium hover:bg-sand transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate([...selected])}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2.5 rounded-btn bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
            {deleteMutation.isError && (
              <p className="mt-3 text-red-600 text-sm text-center">Something went wrong. Please try again.</p>
            )}
          </div>
        </div>
      )}
    </AdminShell>
  )
}
