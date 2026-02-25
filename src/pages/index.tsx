import Head from 'next/head'
import PageShell from '@/components/layout/PageShell'
import SearchStrip from '@/components/home/SearchStrip'
import CategoryRows from '@/components/home/CategoryRows'
import HowItWorks from '@/components/home/HowItWorks'

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Planit — Discover Extraordinary Events</title>
        <meta
          name="description"
          content="Browse curated events from verified planners — weddings, birthdays, corporate gatherings and more. Book with confidence."
        />
      </Head>
      {/*
        PageShell wraps with Navbar + Footer.
        SearchStrip is sticky (top-16) so it hugs the Navbar on scroll.
        CategoryRows shows listings immediately — no hero, no waiting.
      */}
      <PageShell>
        <SearchStrip />
        <CategoryRows />
        <HowItWorks />
      </PageShell>
    </>
  )
}
