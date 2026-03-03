import ShowcaseShell from '@/showcase/ShowcaseShell'
import HomePage from '@/pages/index'

export const getServerSideProps = () => {
  if (process.env.NODE_ENV === 'production') return { notFound: true }
  return { props: {} }
}

export default function ShowcaseHome() {
  return (
    <ShowcaseShell pageName="Home">
      <HomePage />
    </ShowcaseShell>
  )
}
