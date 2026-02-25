import Navbar from './Navbar'
import Footer from './Footer'

type Props = {
  children: React.ReactNode
  /** Pass true to hide the footer (e.g. on chat pages with full-height layout) */
  noFooter?: boolean
}

export default function PageShell({ children, noFooter = false }: Props) {
  return (
    <div className="min-h-screen bg-sand flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      {!noFooter && <Footer />}
    </div>
  )
}