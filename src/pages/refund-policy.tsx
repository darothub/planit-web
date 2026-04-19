import LegalLayout from '@/components/legal/LegalLayout'

export default function RefundPolicyPage() {
  return (
    <LegalLayout title="Refund Policy" lastUpdated="April 19, 2026">

      <p>
        This Refund Policy explains when and how clients can receive refunds for
        bookings made through Planit. It forms part of our{' '}
        <a href="/terms">Terms of Service</a>.
      </p>

      <h2>1. Standard cancellation tiers</h2>
      <p>
        Each Planner sets a cancellation policy on their listing &mdash; clients
        see this clearly before booking. Three standard tiers are available:
      </p>
      <ul>
        <li>
          <strong>Flexible</strong> &mdash; full refund (less Stripe processing
          fees) up to 7 days before the event date.
        </li>
        <li>
          <strong>Moderate</strong> &mdash; full refund up to 14 days before the
          event; 50% refund between 7 and 14 days; no refund within 7 days.
        </li>
        <li>
          <strong>Strict</strong> &mdash; 50% refund up to 30 days before the event;
          no refund within 30 days.
        </li>
      </ul>

      <h2>2. Planit service fee</h2>
      <p>
        The Planit service fee is non-refundable, except where a refund is issued
        because Planit cancelled the booking, the planner failed to deliver, or
        the case was resolved in the client&rsquo;s favour through our dispute
        process.
      </p>

      <h2>3. Date changes</h2>
      <p>
        Clients and planners may agree to reschedule an event without cancelling.
        Up to one date change per booking is free; subsequent changes may incur a
        rescheduling fee. The original payment authorisation is preserved.
      </p>

      <h2>4. Disputes</h2>
      <p>
        If something goes wrong, open a dispute from your booking detail page within
        14 days of the event. Our team will review the case &mdash; including
        messages, agreed scope, and any uploaded evidence &mdash; and decide
        whether to issue a refund, release funds to the planner, or split funds.
        Dispute decisions are final.
      </p>

      <h2>5. How refunds are processed</h2>
      <p>
        Approved refunds are issued to the original payment method via Stripe.
        Funds typically arrive within 5&ndash;10 business days, depending on your
        bank.
      </p>

      <h2>6. Planner cancellations</h2>
      <p>
        If a planner cancels a confirmed booking, the client receives a 100%
        refund (including the service fee) regardless of the cancellation tier.
        Repeated planner cancellations may result in a ban.
      </p>

      <h2>7. Force majeure</h2>
      <p>
        For events affected by circumstances beyond either party&rsquo;s control
        (natural disasters, government orders, public-health emergencies), Planit
        may, at its discretion, waive standard cancellation terms.
      </p>

      <h2>8. Contact</h2>
      <p>
        Questions about a refund? Email{' '}
        <a href="mailto:support@planit.com">support@planit.com</a>.
      </p>

    </LegalLayout>
  )
}
