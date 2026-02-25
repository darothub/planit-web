type Props = {
  message?: string
}

export default function EmptyState({ message = 'No results found.' }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <span className="text-5xl mb-4">🎪</span>
      <p className="text-charcoal font-semibold text-lg mb-1">Nothing here yet</p>
      <p className="text-stone-warm text-sm max-w-xs">{message}</p>
    </div>
  )
}
