import ShowcaseShell from '@/showcase/ShowcaseShell'
import ForgotPasswordPage from '@/pages/forgot-password'

export const getServerSideProps = () => {
  if (process.env.NODE_ENV === 'production') return { notFound: true }
  return { props: {} }
}

export default function ShowcaseAuthForgotPassword() {
  return (
    <ShowcaseShell pageName="Forgot Password" demoRole="GUEST">
      <ForgotPasswordPage />
    </ShowcaseShell>
  )
}
