import ShowcaseShell from '@/showcase/ShowcaseShell'
import DiscoveryPage from '@/pages/listings/index'

export const getServerSideProps = () => {
  if (process.env.NODE_ENV === 'production') return { notFound: true }
  return { props: {} }
}

export default function ShowcaseListings() {
  return (
    <ShowcaseShell pageName="Browse Events">
      <DiscoveryPage />
    </ShowcaseShell>
  )
}
