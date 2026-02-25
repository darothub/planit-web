import { useState } from 'react'
import Image from 'next/image'
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline'

type Props = {
  coverUrl: string | null
  images: { imageUrl: string; caption: string | null }[]
}

function Img({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [err, setErr] = useState(false)
  if (err || !src) {
    return (
      <div className={`bg-gradient-to-br from-sand via-cream to-parchment flex items-center justify-center ${className ?? ''}`}>
        <PhotoIcon className="w-10 h-10 text-stone-warm opacity-30" />
      </div>
    )
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={`object-cover ${className ?? ''}`}
      sizes="(max-width: 768px) 100vw, 50vw"
      onError={() => setErr(true)}
    />
  )
}

export default function PhotoGallery({ coverUrl, images }: Props) {
  const [modalOpen, setModalOpen] = useState(false)

  // All photos: cover first, then extra images
  const allPhotos = [
    ...(coverUrl ? [{ imageUrl: coverUrl, caption: null }] : []),
    ...images,
  ]

  const photo = (i: number) => allPhotos[i] ?? null

  return (
    <>
      {/* Grid */}
      <div className="relative rounded-2xl overflow-hidden">

        {/* Mobile: single cover image */}
        <div className="md:hidden relative aspect-[4/3]">
          <Img src={coverUrl ?? ''} alt="Cover" />
        </div>

        {/* Desktop: Airbnb-style 5-photo grid */}
        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr] grid-rows-2 gap-2 h-[480px]">
          {/* Main — spans 2 rows */}
          <div className="relative row-span-2">
            <Img src={photo(0)?.imageUrl ?? ''} alt="Main photo" />
          </div>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="relative">
              <Img src={photo(i)?.imageUrl ?? ''} alt={`Photo ${i + 1}`} />
            </div>
          ))}
        </div>

        {/* Show all button */}
        {allPhotos.length > 1 && (
          <button
            onClick={() => setModalOpen(true)}
            className="absolute bottom-4 right-4 bg-white text-charcoal text-xs font-semibold
              px-4 py-2 rounded-full border border-cream shadow-sm
              hover:bg-sand transition-colors"
          >
            Show all photos
          </button>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-8">
            <button
              onClick={() => setModalOpen(false)}
              className="sticky top-4 float-right bg-white/10 hover:bg-white/20 text-white
                rounded-full p-2 transition-colors mb-4"
              aria-label="Close"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
            <div className="clear-right flex flex-col gap-4">
              {allPhotos.map((p, i) => (
                <div key={i} className="relative aspect-[4/3]">
                  <Img src={p.imageUrl} alt={p.caption ?? `Photo ${i + 1}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
