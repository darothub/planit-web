import LegalLayout from '@/components/legal/LegalLayout'

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="April 19, 2026">

      <p>
        These Terms of Service (the &ldquo;Terms&rdquo;) govern your access to and use of
        the Planit platform, including our website, mobile experiences, and related
        services (collectively, the &ldquo;Services&rdquo;). By creating an account or
        using the Services you agree to be bound by these Terms.
      </p>

      <h2>1. Who we are</h2>
      <p>
        Planit, Inc. (&ldquo;Planit&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) operates a
        two-sided marketplace that connects clients seeking event-planning services
        with verified independent planners (&ldquo;Planners&rdquo;). Planit is the
        venue; Planners are independent professionals and are solely responsible
        for the services they provide.
      </p>

      <h2>2. Eligibility &amp; accounts</h2>
      <ul>
        <li>You must be at least 18 years old to create an account.</li>
        <li>
          You agree to provide accurate, current information and to keep your
          credentials confidential. You are responsible for all activity on your
          account.
        </li>
        <li>
          We may suspend or terminate accounts that violate these Terms, including
          accounts that have been the subject of a verified ban or rejection
          decision (see Section 7).
        </li>
      </ul>

      <h2>3. Bookings &amp; payments</h2>
      <p>
        When a client confirms a booking, payment is authorised through our
        third-party payment processor (Stripe). Funds are held until the event is
        completed or refunded according to Section 6. Planit charges a service fee
        disclosed at checkout. Planners are responsible for any taxes on amounts
        they receive.
      </p>

      <h2>4. Conduct</h2>
      <p>You agree not to:</p>
      <ul>
        <li>misrepresent yourself, your services, or your identity;</li>
        <li>circumvent the platform to avoid paying service fees;</li>
        <li>upload content you do not have the right to share;</li>
        <li>harass, defraud, or discriminate against other users;</li>
        <li>attempt to disrupt or probe the security of the Services.</li>
      </ul>

      <h2>5. Reviews</h2>
      <p>
        Reviews must reflect genuine experiences. We reserve the right to remove
        reviews that violate our community standards or are submitted in bad faith.
      </p>

      <h2>6. Cancellations &amp; refunds</h2>
      <p>
        Cancellations are governed by our <a href="/refund-policy">Refund Policy</a>,
        which is incorporated into these Terms by reference.
      </p>

      <h2>7. Verification, suspension, and ban</h2>
      <p>
        Planners must complete identity verification before listings are visible to
        clients. Planit may, at its sole discretion, decline an application, ban a
        verified planner, or take down a listing where we believe a violation of
        these Terms has occurred. A banned planner&rsquo;s listings are immediately
        hidden from clients.
      </p>

      <h2>8. Intellectual property</h2>
      <p>
        The Planit name, logo, and platform design are owned by Planit, Inc. You
        retain ownership of content you upload but grant us a worldwide, royalty-free
        licence to host and display that content on the Services.
      </p>

      <h2>9. Disclaimers &amp; limitation of liability</h2>
      <p>
        The Services are provided &ldquo;as is&rdquo; without warranties of any kind.
        To the maximum extent permitted by law, Planit shall not be liable for any
        indirect, incidental, or consequential damages, or for the conduct of any
        third-party planner or client.
      </p>

      <h2>10. Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. Material changes will be
        notified to active users by email at least 14 days before they take effect.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions about these Terms? Email{' '}
        <a href="mailto:legal@planit.com">legal@planit.com</a>.
      </p>

    </LegalLayout>
  )
}
