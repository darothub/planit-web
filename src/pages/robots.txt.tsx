import type { GetServerSideProps } from 'next'

function RobotsTxt() { return null }
export default RobotsTxt

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const proto = req.headers['x-forwarded-proto'] ?? 'http'
  const host  = req.headers['x-forwarded-host'] ?? req.headers.host ?? 'localhost:3000'
  const base  = `${proto}://${host}`

  const content = `User-agent: *
Allow: /

# Block dev-only and API proxy routes
Disallow: /showcase/
Disallow: /api/

Sitemap: ${base}/sitemap.xml
`

  res.setHeader('Content-Type', 'text/plain')
  res.setHeader('Cache-Control', 'public, s-maxage=86400')
  res.write(content)
  res.end()

  return { props: {} }
}
