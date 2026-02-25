import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { registerSchema, RegisterValues } from '@/lib/validations'
import FormField from '@/components/ui/FormField'
import PasswordInput from '@/components/ui/PasswordInput'
import { cn } from '@/lib/utils'

type Props = {
  onSuccess: () => void
}

export default function RegisterForm({ onSuccess }: Props) {
  const [role, setRole] = useState<'CLIENT' | 'PLANNER'>('CLIENT')

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  })

  const mutation = useMutation({
    mutationFn: (data: RegisterValues) => {
      const endpoint = role === 'CLIENT' ? '/auth/register/client' : '/auth/register/planner'
      return api.post(endpoint, data)
    },
    onSuccess,
  })

  return (
    <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="flex flex-col gap-4">

      {/* Role toggle */}
      <div className="flex rounded-btn overflow-hidden border border-cream">
        {(['CLIENT', 'PLANNER'] as const).map(r => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={cn(
              'flex-1 py-2.5 text-sm font-semibold transition-colors',
              role === r ? 'bg-primary text-white' : 'bg-white text-stone-warm hover:bg-sand'
            )}
          >
            {r === 'CLIENT' ? "I'm a Client" : "I'm a Planner"}
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

      {mutation.isError && (
        <p className="text-red-600 text-sm text-center">
          Something went wrong. Please check your details and try again.
        </p>
      )}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="bg-primary hover:bg-primary-hover text-white font-semibold
          py-3 rounded-btn transition-colors disabled:opacity-60 mt-2"
      >
        {mutation.isPending ? 'Creating account…' : 'Create Account'}
      </button>

    </form>
  )
}
