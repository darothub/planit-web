import Head from 'next/head'
import Link from 'next/link'
import PageShell from '@/components/layout/PageShell'

export default function ServerErrorPage() {
  return (
    <>
      <Head>
        <title>Something Went Wrong — Planit</title>
      </Head>
      <PageShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
          <p className="text-8xl font-bold text-primary opacity-20 leading-none select-none">
            500
          </p>
          <h1 className="text-2xl font-bold text-charcoal mt-4">Something went wrong</h1>
          <p className="text-stone-warm mt-2 max-w-sm">
            An unexpected error occurred on our end. Please try again in a moment.
          </p>
          <Link
            href="/"
            className="mt-8 bg-primary hover:bg-primary-hover text-white font-semibold
              px-6 py-3 rounded-btn transition-colors"
          >
            Back to home
          </Link>
        </div>
      </PageShell>
    </>
  )
}
