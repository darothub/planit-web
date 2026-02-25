import { InquiryMessageResponse } from '@/lib/types'

type Props = {
  message: InquiryMessageResponse
  isMine: boolean
}

export default function MessageBubble({ message, isMine }: Props) {
  const time = new Date(message.sentAt).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex flex-col gap-1 max-w-[70%] ${isMine ? 'items-end' : 'items-start'}`}>
        {!isMine && (
          <span className="text-xs text-stone-warm font-medium px-1">{message.senderName}</span>
        )}
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
          isMine
            ? 'bg-primary text-white rounded-br-sm'
            : 'bg-white text-charcoal rounded-bl-sm shadow-sm border border-cream'
        } ${message.id === -1 ? 'opacity-60' : ''}`}>
          {message.content}
        </div>
        <span className="text-xs text-stone-warm px-1">{time}</span>
      </div>
    </div>
  )
}
