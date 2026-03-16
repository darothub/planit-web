import Head from 'next/head'
import PageShell from '@/components/layout/PageShell'
import Hero from '@/components/home/Hero'
import SearchStrip from '@/components/home/SearchStrip'
import FeaturedListings from '@/components/home/FeaturedListings'
import HowItWorks from '@/components/home/HowItWorks'
import PlannerCta from '@/components/home/PlannerCta'

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
      <PageShell>
        <Hero />
        <SearchStrip />
        <FeaturedListings />
        <HowItWorks />
        <PlannerCta />
      </PageShell>
    </>
  )
}
