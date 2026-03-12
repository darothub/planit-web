import type { GetServerSideProps } from 'next'

// Dummy default export required by Next.js — response is written in getServerSideProps
function SitemapXml() { return null }
export default SitemapXml

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const proto = req.headers['x-forwarded-proto'] ?? 'http'
  const host  = req.headers['x-forwarded-host'] ?? req.headers.host ?? 'localhost:3000'
  const base  = `${proto}://${host}`
  const api   = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8081/api/v1'

  // Static routes
  const staticUrls = [
    { path: '/',         priority: '1.0', changefreq: 'daily'   },
    { path: '/listings', priority: '0.9', changefreq: 'hourly'  },
    { path: '/planners', priority: '0.9', changefreq: 'hourly'  },
  ]

  // Dynamic routes — fetch IDs server-side (best-effort; skip on error)
  let listingIds: number[] = []
  let plannerIds: number[] = []

  try {
    const [listingsRes, plannersRes] = await Promise.all([
      fetch(`${api}/listings?size=500&page=0`),
      fetch(`${api}/planners?size=500&page=0`),
    ])
    if (listingsRes.ok) {
      const json = await listingsRes.json()
      listingIds = (json.data?.content ?? []).map((l: { id: number }) => l.id)
    }
    if (plannersRes.ok) {
      const json = await plannersRes.json()
      plannerIds = (json.data?.content ?? []).map((p: { id: number }) => p.id)
    }
  } catch {
    // Non-fatal — sitemap still contains static pages
  }

  const urlTag = (path: string, priority: string, changefreq: string) => `
  <url>
    <loc>${base}${path}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls.map(u => urlTag(u.path, u.priority, u.changefreq)).join('')}
${listingIds.map(id => urlTag(`/listings/${id}`, '0.7', 'weekly')).join('')}
${plannerIds.map(id => urlTag(`/planners/${id}`, '0.7', 'weekly')).join('')}
</urlset>`

  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600')
  res.write(xml)
  res.end()

  return { props: {} }
}
