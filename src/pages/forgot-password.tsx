import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Head from 'next/head'
import Link from 'next/link'
import { api } from '@/lib/api'
import AuthShell from '@/components/auth/AuthShell'
import FormField from '@/components/ui/FormField'

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
})
type Values = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: Values) {
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email: data.email })
    } catch {
      // Swallow errors — always show the same confirmation to prevent
      // revealing whether an account exists for this email.
    } finally {
      setLoading(false)
      setSubmitted(true)
    }
  }

  return (
    <>
      <Head>
        <title>Forgot Password — Planit</title>
      </Head>

      <AuthShell title="Reset your password">
        {submitted ? (
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-2xl">
              ✉
            </div>
            <div>
              <p className="font-semibold text-charcoal text-lg">Check your email</p>
              <p className="text-stone-warm text-sm mt-1">
                If an account exists for that address, we&apos;ve sent a reset link.
                The link expires in 1 hour.
              </p>
            </div>
            <Link
              href="/auth/login"
              className="w-full text-center bg-primary hover:bg-primary-hover text-white
                font-semibold py-3 rounded-btn transition-colors mt-2"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <p className="text-stone-warm text-sm -mt-2">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>

            <FormField label="Email" error={errors.email?.message}>
              <input
                type="email"
                {...register('email')}
                className="input-base"
                placeholder="you@example.com"
                autoFocus
              />
            </FormField>

            <button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary-hover text-white font-semibold
                py-3 rounded-btn transition-colors disabled:opacity-60 mt-1"
            >
              {loading ? 'Sending…' : 'Send reset link'}
            </button>

            <p className="text-center text-sm text-stone-warm">
              Remember your password?{' '}
              <Link href="/auth/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        )}
      </AuthShell>
    </>
  )
}
