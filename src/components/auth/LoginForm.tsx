import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { loginSchema, LoginValues } from '@/lib/validations'
import { useAuthActions } from '@/lib/auth'
import { AuthResponse } from '@/lib/types'
import FormField from '@/components/ui/FormField'
import PasswordInput from '@/components/ui/PasswordInput'

export default function LoginForm() {
  const { handleAuthSuccess } = useAuthActions()

  const { register, handleSubmit, formState: { errors } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  })

  const mutation = useMutation({
    mutationFn: (data: LoginValues) =>
      api.post<{ data: AuthResponse }>('/auth/login', data).then(r => r.data.data),
    onSuccess: handleAuthSuccess,
  })

  return (
    <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="flex flex-col gap-4">
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

      {mutation.isError && (
        <p className="text-red-600 text-sm text-center">
          Invalid email or password. Please try again.
        </p>
      )}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="bg-primary hover:bg-primary-hover text-white font-semibold
          py-3 rounded-btn transition-colors disabled:opacity-60 mt-2"
      >
        {mutation.isPending ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  )
}
