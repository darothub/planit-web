import ShowcaseShell from '@/showcase/ShowcaseShell'
import LoginPage from '@/pages/auth/login'

export const getServerSideProps = () => {
  if (process.env.NODE_ENV === 'production') return { notFound: true }
  return { props: {} }
}

export default function ShowcaseAuthLogin() {
  // demoRole="GUEST" keeps token null so LoginPage doesn't redirect to /dashboard
  return (
    <ShowcaseShell pageName="Login" demoRole="GUEST">
      <LoginPage />
    </ShowcaseShell>
  )
}
