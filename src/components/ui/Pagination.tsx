import { useRouter } from 'next/router'

type Props = {
  page: number
  totalPages: number
}

export default function Pagination({ page, totalPages }: Props) {
  const router = useRouter()

  const goTo = (p: number) => {
    router.push(
      { pathname: '/listings', query: { ...router.query, page: p } },
      undefined,
      { shallow: true }
    )
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex justify-center items-center gap-2 mt-12">
      <button
        onClick={() => goTo(page - 1)}
        disabled={page === 0}
        className="px-4 py-2 rounded-btn border border-cream text-sm font-medium
          disabled:opacity-40 hover:bg-primary hover:text-white hover:border-primary
          transition-colors"
      >
        Previous
      </button>
      <span className="px-4 py-2 text-stone-warm text-sm">
        Page {page + 1} of {totalPages}
      </span>
      <button
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages - 1}
        className="px-4 py-2 rounded-btn border border-cream text-sm font-medium
          disabled:opacity-40 hover:bg-primary hover:text-white hover:border-primary
          transition-colors"
      >
        Next
      </button>
    </div>
  )
}
