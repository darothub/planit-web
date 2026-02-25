import Link from 'next/link'
import Image from 'next/image'

type Props = {
  planner: {
    id: number
    businessName: string | null
    profileImageUrl: string | null
  }
}

export default function PlannerCard({ planner }: Props) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative w-14 h-14 rounded-full overflow-hidden bg-sand flex-shrink-0">
        {planner.profileImageUrl ? (
          <Image
            src={planner.profileImageUrl}
            alt={planner.businessName ?? 'Planner'}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary text-white text-xl font-bold">
            {(planner.businessName ?? 'P')[0]}
          </div>
        )}
      </div>

      <div className="flex-1">
        <p className="font-semibold text-charcoal">
          {planner.businessName ?? 'Event Planner'}
        </p>
        <p className="text-stone-warm text-sm">Verified Planner</p>
      </div>

      <Link
        href={`/planners/${planner.id}`}
        className="text-primary text-sm font-semibold hover:underline underline-offset-2"
      >
        View Profile
      </Link>
    </div>
  )
}
