import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { registerSchema, RegisterValues } from '@/lib/validations'
import FormField from '@/components/ui/FormField'
import PasswordInput from '@/components/ui/PasswordInput'
import TurnstileWidget from '@/components/auth/TurnstileWidget'
import { cn } from '@/lib/utils'

type Props = {
  onSuccess: () => void
}

const ROLES = [
  {
    value: 'CLIENT' as const,
    label: "I'm a Client",
    description: 'Browse listings and book event planners',
  },
  {
    value: 'PLANNER' as const,
    label: "I'm a Planner",
    description: 'List your services and manage bookings',
  },
]

export default function RegisterForm({ onSuccess }: Props) {
  const router = useRouter()
  const [role, setRole] = useState<'CLIENT' | 'PLANNER'>('CLIENT')
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  // Pre-select PLANNER when navigating from "Become a Planner" link (?role=PLANNER)
  useEffect(() => {
    if (router.isReady && router.query.role === 'PLANNER') {
      setRole('PLANNER')
    }
  }, [router.isReady, router.query.role])

  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  })

  const passwordValue = watch('password', '')

  const passwordReqs = [
    { label: '8+ characters',      met: passwordValue.length >= 8 },
    { label: 'Uppercase letter',   met: /[A-Z]/.test(passwordValue) },
    { label: 'Number',             met: /[0-9]/.test(passwordValue) },
    { label: 'Special character',  met: /[^A-Za-z0-9]/.test(passwordValue) },
  ]

  const mutation = useMutation({
    mutationFn: (data: RegisterValues) => {
      const endpoint = role === 'CLIENT' ? '/auth/register/client' : '/auth/register/planner'
      return api.post(endpoint, { ...data, captchaToken })
    },
    onSuccess,
  })

  return (
    <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="flex flex-col gap-4">

      {/* Role selector */}
      <div className="grid grid-cols-2 gap-2">
        {ROLES.map(r => (
          <button
            key={r.value}
            type="button"
            onClick={() => setRole(r.value)}
            className={cn(
              'py-3 px-4 text-left rounded-xl border-2 transition-colors',
              role === r.value
                ? 'border-primary bg-primary/5'
                : 'border-cream bg-white hover:border-primary/30 hover:bg-sand',
            )}
          >
            <p className="text-sm font-semibold text-charcoal">{r.label}</p>
            <p className="text-xs text-stone-warm mt-0.5 leading-snug">{r.description}</p>
          </button>
        ))}
      </div>

      {/* Name row */}
      <div className="grid grid-cols-2 gap-3">
        <FormField label="First Name" error={errors.firstName?.message}>
          <input
            {...register('firstName')}
            className="input-base"
            placeholder="Jane"
          />
        </FormField>
        <FormField label="Last Name" error={errors.lastName?.message}>
          <input
            {...register('lastName')}
            className="input-base"
            placeholder="Smith"
          />
        </FormField>
      </div>

      <FormField label="Email" error={errors.email?.message}>
        <input
          type="email"
          {...register('email')}
          className="input-base"
          placeholder="you@example.com"
        />
      </FormField>

      <FormField label="Password" error={errors.password?.message}>
        <PasswordInput {...register('password')} />
        {passwordValue.length > 0 && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2">
            {passwordReqs.map(req => (
              <div
                key={req.label}
                className={cn(
                  'flex items-center gap-1.5 text-xs transition-colors',
                  req.met ? 'text-green-600' : 'text-stone-warm',
                )}
              >
                <span className="font-bold">{req.met ? '✓' : '○'}</span>
                <span>{req.label}</span>
              </div>
            ))}
          </div>
        )}
      </FormField>

      {role === 'PLANNER' && (
        <FormField label="Business Name" error={errors.businessName?.message}>
          <input
            {...register('businessName')}
            className="input-base"
            placeholder="Jane Smith Events"
          />
        </FormField>
      )}

      <TurnstileWidget onVerify={setCaptchaToken} onExpire={() => setCaptchaToken(null)} />

      {mutation.isError && (
        <p className="text-red-600 text-sm text-center">
          {(mutation.error as any)?.response?.data?.message ?? 'Something went wrong. Please check your details and try again.'}
        </p>
      )}

      <button
        type="submit"
        disabled={!captchaToken || mutation.isPending}
        className="bg-primary hover:bg-primary-hover text-white font-semibold
          py-3 rounded-btn transition-colors disabled:opacity-60 mt-2"
      >
        {mutation.isPending ? 'Creating account…' : 'Create Account'}
      </button>

    </form>
  )
}
