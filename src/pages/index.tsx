import PageShell from '@/components/layout/PageShell'
import HeroSearch from '@/components/home/HeroSearch'
import FeaturedListings from '@/components/home/FeaturedListings'
import HowItWorks from '@/components/home/HowItWorks'
import Head from 'next/head'

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Planit — Find Your Perfect Event Planner</title>
        <meta
          name="description"
          content="Browse and book verified event planners for weddings, birthdays, corporate events and more."
        />
      </Head>
      <PageShell>
        <HeroSearch />
        <FeaturedListings />
        <HowItWorks />
      </PageShell>
    </>
  )
}