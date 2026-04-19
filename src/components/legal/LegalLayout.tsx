/**
 * LegalLayout — shared chrome for static legal pages
 * (Terms, Privacy, Refund Policy, etc.)
 *
 * Keeps the public AirbnbHeader/AirbnbFooter so the page feels integrated
 * with the rest of the site. Renders the body in a constrained reading
 * column with sensible prose defaults.
 */

import Head from 'next/head'
import Link from 'next/link'
import AirbnbHeader from '@/components/home/AirbnbHeader'
import AirbnbFooter from '@/components/home/AirbnbFooter'

type Props = {
  title: string
  lastUpdated: string
  children: React.ReactNode
}

export default function LegalLayout({ title, lastUpdated, children }: Props) {
  return (
    <>
      <Head>
        <title>{title} — Planit</title>
        <meta name="robots" content="index,follow" />
      </Head>

      <div className="min-h-screen flex flex-col bg-cream">
        <AirbnbHeader />

        <main className="flex-1">
          <div className="max-w-3xl mx-auto px-6 py-12">

            {/* Breadcrumb */}
            <nav className="text-sm text-stone-warm mb-6">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-charcoal">{title}</span>
            </nav>

            <h1 className="text-3xl sm:text-4xl font-bold text-charcoal mb-2">{title}</h1>
            <p className="text-sm text-stone-warm mb-10">Last updated: {lastUpdated}</p>

            <article className="prose prose-stone max-w-none
                                prose-headings:text-charcoal prose-headings:font-bold
                                prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-3
                                prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2
                                prose-p:text-charcoal/90 prose-p:leading-relaxed
                                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                                prose-li:text-charcoal/90 prose-strong:text-charcoal">
              {children}
            </article>
          </div>
        </main>

        <AirbnbFooter />
      </div>
    </>
  )
}
