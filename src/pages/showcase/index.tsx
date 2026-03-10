import Head from 'next/head'
import Link from 'next/link'

export const getServerSideProps = () => {
  if (process.env.NODE_ENV === 'production') return { notFound: true }
  return { props: {} }
}

type Screen = {
  href: string
  name: string
  description: string
}

type Section = {
  label: string
  colour: string      // Tailwind border-l colour class
  bgColour: string    // subtle bg tint
  screens: Screen[]
}

const sections: Section[] = [
  {
    label: '🌐 Public',
    colour: 'border-blue-500',
    bgColour: 'bg-blue-50',
    screens: [
      { href: '/showcase/home',           name: 'Home',           description: 'Search strip, category rows, how it works' },
      { href: '/showcase/listings',       name: 'Browse Events',  description: 'Discovery grid with filters and pagination' },
      { href: '/showcase/listing-detail', name: 'Listing Detail', description: 'Full listing page with gallery, booking card, amenities' },
    ],
  },
  {
    label: '🔐 Auth',
    colour: 'border-purple-500',
    bgColour: 'bg-purple-50',
    screens: [
      { href: '/showcase/auth-login',    name: 'Login',    description: 'Email / password sign-in form' },
      { href: '/showcase/auth-register', name: 'Register', description: 'Role picker + registration form' },
    ],
  },
  {
    label: '👤 Client',
    colour: 'border-green-500',
    bgColour: 'bg-green-50',
    screens: [
      { href: '/showcase/dashboard-client',           name: 'Overview',       description: 'Client dashboard — active bookings + messages' },
      { href: '/showcase/dashboard-bookings-client',  name: 'Bookings',       description: 'Full bookings list (CLIENT view)' },
      { href: '/showcase/dashboard-booking-detail',          name: 'Booking Detail',          description: 'ACCEPTED booking — cancel + confirm completion actions' },
      { href: '/showcase/dashboard-booking-detail-disputed', name: 'Booking Detail (Disputed)', description: 'DISPUTED booking — dispute panel, evidence list, upload evidence' },
      { href: '/showcase/dashboard-inquiries',        name: 'Inquiries',      description: 'Conversation list in dashboard context (CLIENT)' },
      { href: '/showcase/dashboard-disputes',         name: 'Disputes',       description: 'Dispute list with status badges' },
      { href: '/showcase/messages',                   name: 'Messages',       description: 'Full chat — inbox sidebar + chat window' },
    ],
  },
  {
    label: '🔑 Admin',
    colour: 'border-amber-500',
    bgColour: 'bg-amber-50',
    screens: [
      { href: '/showcase/admin-planners', name: 'Planner Queue', description: 'Pending planner applications — approve or reject with notes' },
      { href: '/showcase/admin-disputes', name: 'Disputes',      description: 'Open disputes — resolve with full/partial refund or release to planner' },
    ],
  },
  {
    label: '🗂 Planner',
    colour: 'border-rose-400',
    bgColour: 'bg-rose-50',
    screens: [
      { href: '/showcase/dashboard-planner',               name: 'Overview',          description: 'Planner dashboard — stats row + pending bookings' },
      { href: '/showcase/dashboard-bookings-planner',           name: 'Received Bookings',       description: 'Full bookings list (PLANNER view)' },
      { href: '/showcase/dashboard-booking-detail-planner',          name: 'Booking Detail (Planner)',      description: 'REQUESTED booking — accept / decline actions' },
      { href: '/showcase/dashboard-booking-detail-date-change',       name: 'Booking Detail (Date Change)',  description: 'ACCEPTED booking — pending date change request, accept / decline' },
      { href: '/showcase/dashboard-listings',              name: 'My Listings',       description: 'Listing management grid with publish/draft toggle' },
      { href: '/showcase/dashboard-listing-form',          name: 'Listing Form',      description: 'Edit listing form — cover image upload, gallery management, amenities' },
      { href: '/showcase/dashboard-inquiries-planner',     name: 'Inquiries',         description: 'Conversation list in dashboard context (PLANNER)' },
      { href: '/showcase/dashboard-calendar',              name: 'Calendar',          description: 'Availability calendar with block-date picker' },
      { href: '/showcase/dashboard-disputes',              name: 'Disputes',          description: 'Dispute list with status badges' },
      { href: '/showcase/messages',                        name: 'Messages',          description: 'Full chat — inbox sidebar + chat window' },
    ],
  },
]

export default function ShowcaseIndex() {
  return (
    <>
      <Head>
        <title>Showcase — Planit UI Preview</title>
      </Head>
      <div className="min-h-screen bg-sand px-4 py-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-charcoal">Planit UI Showcase</h1>
            <p className="text-stone-warm mt-2 text-sm max-w-lg">
              Every screen with hardcoded demo data — no auth, no backend required.
              Only available in development.
            </p>
          </div>

          {/* Sections */}
          <div className="flex flex-col gap-10">
            {sections.map(section => (
              <div key={section.label}>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-warm mb-3">
                  {section.label}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {section.screens.map(screen => (
                    <Link
                      key={screen.href}
                      href={screen.href}
                      className={`block rounded-xl border border-cream ${section.bgColour} border-l-4 ${section.colour} px-5 py-4 hover:shadow-md transition-shadow group`}
                    >
                      <p className="font-semibold text-charcoal group-hover:text-primary transition-colors">
                        {screen.name}
                      </p>
                      <p className="text-xs text-stone-warm mt-0.5">{screen.description}</p>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-12 text-xs text-stone-warm/60 text-center">
            Dev-only — blocked in production via <code>NODE_ENV</code> guard
          </p>
        </div>
      </div>
    </>
  )
}
