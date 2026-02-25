import Head from 'next/head'
import PageShell from '@/components/layout/PageShell'
import HeroSearch from '@/components/home/HeroSearch'
import EventCategories from '@/components/home/EventCategories'
import FeaturedListings from '@/components/home/FeaturedListings'
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
      <PageShell>
        <HeroSearch />
        <EventCategories />
        <FeaturedListings />
        <HowItWorks />
      </PageShell>
    </>
  )
}
