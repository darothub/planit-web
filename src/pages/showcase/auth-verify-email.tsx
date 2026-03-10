import ShowcaseShell from '@/showcase/ShowcaseShell'
import VerifyEmailPage from '@/pages/verify-email'

export const getServerSideProps = () => {
  if (process.env.NODE_ENV === 'production') return { notFound: true }
  return { props: {} }
}

export default function ShowcaseAuthVerifyEmail() {
  // initialStatus="success" skips the API call and shows the verified state directly
  return (
    <ShowcaseShell pageName="Verify Email" demoRole="GUEST">
      <VerifyEmailPage initialStatus="success" />
    </ShowcaseShell>
  )
}
