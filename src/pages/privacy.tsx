import LegalLayout from '@/components/legal/LegalLayout'

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="April 19, 2026">

      <p>
        This Privacy Policy describes how Planit, Inc. (&ldquo;Planit&rdquo;,
        &ldquo;we&rdquo;) collects, uses, and shares information about you when you
        use the Planit platform.
      </p>

      <h2>1. What we collect</h2>
      <ul>
        <li>
          <strong>Account information</strong> &mdash; name, email address, phone
          number, role (client or planner), profile photo.
        </li>
        <li>
          <strong>Planner profile</strong> &mdash; business name, location,
          specialties, portfolio images, years of experience.
        </li>
        <li>
          <strong>Booking data</strong> &mdash; event type, date, guest count,
          message history, payment status.
        </li>
        <li>
          <strong>Payment information</strong> &mdash; processed by Stripe. Planit
          stores only the last four digits of cards and a Stripe customer
          identifier; full card numbers are never stored on our servers.
        </li>
        <li>
          <strong>Usage data</strong> &mdash; log files, IP addresses, browser type,
          pages visited, and timestamps.
        </li>
      </ul>

      <h2>2. How we use it</h2>
      <ul>
        <li>To provide, maintain, and improve the Services.</li>
        <li>To facilitate bookings and process payments.</li>
        <li>To send transactional email (booking confirmations, password resets).</li>
        <li>
          To prevent fraud and abuse, including verifying planner identity and
          enforcing bans.
        </li>
        <li>To comply with legal obligations.</li>
      </ul>

      <h2>3. Sharing</h2>
      <p>We share information only as necessary to operate the platform:</p>
      <ul>
        <li>
          <strong>Between users</strong> &mdash; once a booking is accepted, we
          reveal the client and planner contact details to one another so the
          event can be coordinated.
        </li>
        <li>
          <strong>Service providers</strong> &mdash; Stripe (payments), Resend
          (email delivery), Cloudflare R2 (image storage), Fly.io (hosting),
          Vercel (frontend hosting).
        </li>
        <li>
          <strong>Legal</strong> &mdash; if required by law, court order, or to
          protect Planit and its users.
        </li>
      </ul>
      <p>We do not sell personal information.</p>

      <h2>4. Cookies</h2>
      <p>
        We use a single first-party cookie (<code>planit_token</code>) to keep you
        signed in. We do not use third-party advertising or tracking cookies. We may
        add lightweight analytics in the future and will update this policy if so.
      </p>

      <h2>5. Data retention</h2>
      <p>
        We retain account data while your account is active. If you close your
        account, we delete personal data within 90 days, except records we are
        legally required to keep (for example, financial records for tax purposes).
      </p>

      <h2>6. Your rights</h2>
      <p>
        Depending on your jurisdiction (e.g., GDPR, CCPA), you may have the right to
        access, correct, export, or delete your personal data. To exercise any of
        these rights, email{' '}
        <a href="mailto:privacy@planit.com">privacy@planit.com</a>. We respond within
        30 days.
      </p>

      <h2>7. Security</h2>
      <p>
        We use HTTPS in transit, encrypted cookies for authentication, and JWT
        tokens. Production passwords are stored using BCrypt. We rotate credentials
        and patch dependencies regularly. No system is perfectly secure &mdash; if
        we discover a breach affecting you we will notify you within 72 hours.
      </p>

      <h2>8. Children</h2>
      <p>
        The Services are not directed at children under 18 and we do not knowingly
        collect data from them. If you believe a child has provided us data, contact{' '}
        <a href="mailto:privacy@planit.com">privacy@planit.com</a> and we will delete
        it.
      </p>

      <h2>9. Changes</h2>
      <p>
        We may update this Privacy Policy from time to time. The &ldquo;Last
        updated&rdquo; date at the top of this page reflects the latest revision.
      </p>

      <h2>10. Contact</h2>
      <p>
        Questions or requests? Email{' '}
        <a href="mailto:privacy@planit.com">privacy@planit.com</a>.
      </p>

    </LegalLayout>
  )
}
