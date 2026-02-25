type Props = {
  rating: number   // 0–5
  size?: 'sm' | 'md'
}

export default function StarRating({ rating, size = 'sm' }: Props) {
  const sz = size === 'sm' ? 'text-sm' : 'text-base'
  return (
    <span className={sz}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= Math.round(rating) ? 'text-primary' : 'text-cream'}>
          ★
        </span>
      ))}
    </span>
  )
}