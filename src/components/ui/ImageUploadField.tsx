import { useRef, useState } from 'react'
import { api } from '@/lib/api'

type Props = {
  value: string
  onChange: (url: string) => void
  folder?: string
}

export default function ImageUploadField({ value, onChange, folder = 'listings' }: Props) {
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
