import type { GetServerSideProps } from 'next'
import ShowcaseShell from '@/showcase/ShowcaseShell'
import ResetPasswordPage from '@/pages/reset-password'

export const getServerSideProps: GetServerSideProps = ({ query }) => {
  if (process.env.NODE_ENV === 'production') return Promise.resolve({ notFound: true })
  // Ensure a demo token is always present so the form renders (not the "invalid link" state)
  if (!query.token) {
    return Promise.resolve({
      redirect: { destination: '/showcase/auth-reset-password?token=demo-reset', permanent: false },
    })
  }
  return Promise.resolve({ props: {} })
}

export default function ShowcaseAuthResetPassword() {
  return (
    <ShowcaseShell pageName="Reset Password" demoRole="GUEST">
      <ResetPasswordPage />
    </ShowcaseShell>
  )
}
