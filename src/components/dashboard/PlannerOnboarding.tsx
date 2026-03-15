import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { EventListingResponse, PlannerProfileResponse } from '@/lib/types'
import { cn } from '@/lib/utils'
import { CheckCircleIcon } from '@heroicons/react/24/outline'

type Props = { profile: PlannerProfileResponse }

type Step = {
  id: number
  label: string
  done: boolean
  href?: string
  cta?: string
  disabled?: boolean
}

export default function PlannerOnboarding({ profile }: Props) {
  const { data: listings = [] } = useQuery<EventListingResponse[]>({
    queryKey: ['my-listings'],
    queryFn: () => api.get('/planners/me/listings').then(r => r.data.data),
    retry: false,
  })

  const steps: Step[] = [
    {
      id: 1,
      label: 'Create your account',
      done: true,
    },
    {
      id: 2,
      label: 'Verify your email',
      done: true,
    },
    {
      id: 3,
      label: 'Complete your profile',
      done: !!(profile.bio && profile.businessName),
      href: '/dashboard/profile',
      cta: 'Update profile',
    },
    {
      id: 4,
      label: 'Create your first listing',
      done: listings.length > 0,
      href: '/dashboard/listings/new',
      cta: 'Add listing',
    },
    {
      id: 5,
      label: 'Add payout details',
      done: false,
      disabled: true,
      cta: 'Coming soon',
    },
  ]

  const currentStep = steps.find(s => !s.done)

  return (
    <div className="px-4 lg:px-6 py-6 max-w-2xl">
      {/* Amber verification banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-6">
        <p className="text-sm font-semibold text-amber-800">Verification in progress</p>
        <p className="text-sm text-amber-700 mt-0.5">
          We&apos;re reviewing your details. This typically takes 24–48 hours.
        </p>
        <Link
          href={`/planners/${profile.id}`}
          className="inline-block mt-2 text-xs font-semibold text-amber-700 underline hover:text-amber-900"
        >
          Preview your public profile →
        </Link>
      </div>

      <h1 className="text-xl font-bold text-charcoal mb-1">Get started</h1>
      <p className="text-sm text-stone-warm mb-6">Complete these steps to start receiving bookings.</p>

      {/* Steps */}
      <div className="flex flex-col gap-3">
        {steps.map(step => {
          const isCurrent = currentStep?.id === step.id
          return (
            <div
              key={step.id}
              className={cn(
                'bg-white border rounded-xl px-5 py-4 flex items-center gap-4 transition-all',
                isCurrent
                  ? 'border-primary shadow-card'
                  : step.done
                  ? 'border-cream opacity-70'
                  : 'border-cream'
              )}
            >
              {/* Step indicator */}
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center shrink-0',
                step.done ? 'bg-green-100' : isCurrent ? 'bg-primary' : 'bg-sand'
              )}>
                {step.done ? (
                  <CheckCircleIcon className="w-4 h-4 text-green-600" />
                ) : (
                  <span className={cn('text-xs font-bold', isCurrent ? 'text-white' : 'text-stone-warm')}>
                    {step.id}
                  </span>
                )}
              </div>

              {/* Label */}
              <span className={cn(
                'flex-1 text-sm font-medium',
                step.done ? 'text-stone-warm line-through' : 'text-charcoal'
              )}>
                {step.label}
              </span>

              {/* CTA — only on current step */}
              {isCurrent && step.href && !step.disabled && (
                <Link
                  href={step.href}
                  className="bg-primary text-white text-xs font-semibold px-4 py-2 rounded-btn hover:bg-primary-hover transition-colors whitespace-nowrap"
                >
                  {step.cta}
                </Link>
              )}
              {isCurrent && step.disabled && (
                <span className="bg-sand text-stone-warm text-xs font-semibold px-4 py-2 rounded-btn whitespace-nowrap cursor-not-allowed">
                  {step.cta}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
