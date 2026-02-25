import { useRef, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { EventListingResponse } from '@/lib/types'
import ListingCard from '@/components/listings/ListingCard'

type Props = {
  title: string
  seeAllHref: string
  listings: EventListingResponse[]
}

// Image height for aspect-[15/16] at md card width 216px → 216 × 16/15 ≈ 230px
// Arrow should sit at image centre (230 / 2 = 115px from top)
const ARROW_TOP = 115

export default function CategoryRow({ title, seeAllHref, listings }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    // 2px threshold avoids false positives from sub-pixel rounding
    setCanScrollLeft(el.scrollLeft > 2)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2)
  }

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'right' ? el.clientWidth * 0.75 : -el.clientWidth * 0.75, behavior: 'smooth' })
  }

  // One arrow at a time, same position:
  //   → forward arrow while there is more content to the right
  //   ← back arrow once the user reaches the right end
  const showForward = canScrollRight
  const showBack    = !canScrollRight && canScrollLeft

  return (
    <div>
      {/* Row header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-charcoal">{title}</h2>
        <Link
          href={seeAllHref}
          className="text-primary text-sm font-semibold hover:underline underline-offset-2 whitespace-nowrap"
        >
          See all
        </Link>
      </div>

      {/* Scroll strip + single arrow at right edge */}
      <div className="relative">

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto pb-2
            snap-x snap-mandatory scroll-smooth
            [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {listings.map(listing => (
            <div
              key={listing.id}
              className="flex-shrink-0 w-[200px] md:w-[216px] snap-start"
            >
              <ListingCard listing={listing} />
            </div>
          ))}
          {/* Ghost spacer — prevents last card from touching edge on mobile */}
          <div className="flex-shrink-0 w-4" aria-hidden />
        </div>

        {/* Single arrow — right edge, centred on the image.
            Direction flips: → while scrollable right, ← once at the end. */}
        <button
          onClick={() => scroll(showForward ? 'right' : 'left')}
          aria-label={showForward ? `See more ${title}` : `Back to start of ${title}`}
          style={{ top: ARROW_TOP }}
          className={`absolute right-4 -translate-y-1/2 z-10
            w-9 h-9 bg-white rounded-full shadow-card-hover border border-cream
            flex items-center justify-center
            hover:bg-parchment active:scale-95
            transition-all duration-200
            ${showForward || showBack ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        >
          {showForward
            ? <ChevronRightIcon className="w-4 h-4 text-charcoal" />
            : <ChevronLeftIcon  className="w-4 h-4 text-charcoal" />
          }
        </button>

      </div>
    </div>
  )
}
