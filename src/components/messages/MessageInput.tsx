import { useState, useRef, KeyboardEvent } from 'react'
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'

type Props = {
  onSend: (content: string) => void
  disabled: boolean
}

export default function MessageInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const send = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    // Reset height after clear
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
    // Auto-grow
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`
  }

  return (
    <div className="p-4 border-t border-cream bg-white flex gap-3 items-end">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Type a message… (Enter to send)"
        rows={1}
        className="flex-1 resize-none rounded-btn border border-cream px-4 py-2.5
          text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
          disabled:opacity-50 leading-relaxed overflow-hidden"
        style={{ minHeight: '42px', maxHeight: '128px' }}
      />
      <button
        onClick={send}
        disabled={disabled || !value.trim()}
        className="bg-primary hover:bg-primary-hover text-white p-2.5 rounded-btn
          transition-colors disabled:opacity-40 flex-shrink-0"
        aria-label="Send"
      >
        <PaperAirplaneIcon className="w-5 h-5" />
      </button>
    </div>
  )
}
