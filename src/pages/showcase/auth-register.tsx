import ShowcaseShell from '@/showcase/ShowcaseShell'
import RegisterPage from '@/pages/auth/register'

export const getServerSideProps = () => {
  if (process.env.NODE_ENV === 'production') return { notFound: true }
  return { props: {} }
}

export default function ShowcaseAuthRegister() {
  // demoRole="GUEST" keeps token null so RegisterPage doesn't redirect to /dashboard
  return (
    <ShowcaseShell pageName="Register" demoRole="GUEST">
      <RegisterPage />
    </ShowcaseShell>
  )
}
