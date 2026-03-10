import type { GetServerSideProps } from 'next'

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: { destination: '/admin/planners', permanent: false },
})

export default function AdminIndex() {
  return null
}
