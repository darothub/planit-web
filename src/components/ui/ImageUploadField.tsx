import { useRef, useState } from 'react'
import { api } from '@/lib/api'

type Props = {
  value: string
  onChange: (url: string) => void
  folder?: string
  /** 'cover' (default): full-width aspect-video preview.
   *  'avatar': circular 80px preview with link-style upload button. */
  variant?: 'cover' | 'avatar'
}

export default function ImageUploadField({ value, onChange, folder = 'listings', variant = 'cover' }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setError(null)
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', folder)
      const res = await api.post<{ data: { url: string } }>('/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      onChange(res.data.data.url)
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept="image/jpeg,image/png,image/webp,image/gif"
      className="hidden"
      onChange={e => {
        const file = e.target.files?.[0]
        if (file) handleFile(file)
        e.target.value = ''
      }}
    />
  )

  if (variant === 'avatar') {
    return (
      <div className="flex items-center gap-4">
        {/* Circular preview */}
        <div className="w-20 h-20 rounded-full bg-sand border-2 border-cream overflow-hidden
          flex-shrink-0 flex items-center justify-center text-stone-warm text-2xl">
          {value
            ? <img src={value} alt="Profile photo" className="w-full h-full object-cover" />
            : '👤'
          }
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-1">
          {fileInput}
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="text-sm text-primary font-medium hover:underline disabled:opacity-50 text-left"
          >
            {uploading ? 'Uploading…' : value ? 'Change photo' : 'Upload photo'}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-xs text-stone-warm hover:text-red-500 transition-colors text-left"
            >
              Remove
            </button>
          )}
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      </div>
    )
  }

  // variant === 'cover'
  return (
    <div className="space-y-2">
      {value && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-cream">
          <img src={value} alt="Cover preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors"
            aria-label="Remove image"
          >
            ✕
          </button>
        </div>
      )}
      {fileInput}
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="w-full border-2 border-dashed border-cream hover:border-primary rounded-lg py-3 px-4 text-sm text-stone-warm hover:text-primary transition-colors disabled:opacity-50 text-center"
      >
        {uploading ? 'Uploading…' : value ? 'Replace image' : '+ Upload image'}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
