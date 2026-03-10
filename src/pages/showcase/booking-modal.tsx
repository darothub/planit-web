import ShowcaseShell from '@/showcase/ShowcaseShell'
import BookNowModal from '@/components/bookings/BookNowModal'
import { DEMO_INQUIRIES_CLIENT } from '@/showcase/data'

export const getServerSideProps = () => {
  if (process.env.NODE_ENV === 'production') return { notFound: true }
  return { props: {} }
}

// Use the first ACTIVE demo inquiry
const DEMO_INQUIRY = DEMO_INQUIRIES_CLIENT[0]

export default function ShowcaseBookingModal() {
  return (
    <ShowcaseShell pageName="Book Now Modal (Client)" demoRole="CLIENT">
      <div className="max-w-lg mx-auto pt-6">
        <p className="text-xs text-stone-warm mb-4 text-center">
          Modal rendered inline — in production it floats over the messages page.
        </p>
        <BookNowModal
          inquiry={DEMO_INQUIRY}
          onClose={() => {}}
          inline
        />
      </div>
    </ShowcaseShell>
  )
}
