import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { api } from '@/lib/api'
import AuthShell from '@/components/auth/AuthShell'
import FormField from '@/components/ui/FormField'
import PasswordInput from '@/components/ui/PasswordInput'

const schema = z.object({
  newPassword: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/\d/, 'Must contain a number')
    .regex(/[@$!%*?&]/, 'Must contain a special character (@$!%*?&)'),
  confirm: z.string(),
}).refine(d => d.newPassword === d.confirm, {
  message: 'Passwords do not match',
  path: ['confirm'],
})
type Values = z.infer<typeof schema>

type Status = 'idle' | 'loading' | 'success' | 'expired' | 'invalid' | 'no-token'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [status, setStatus] = useState<Status>('idle')

  const { register, handleSubmit, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
  })

  // Guard: redirect to forgot-password if no token in URL
  useEffect(() => {
    if (!router.isReady) return
    if (!router.query.token) setStatus('no-token')
  }, [router.isReady, router.query.token])

  async function onSubmit(data: Values) {
    const token = router.query.token as string
    setStatus('loading')
    try {
      await api.post('/auth/reset-password', { token, newPassword: data.newPassword })
      setStatus('success')
    } catch (err: unknown) {
      const msg: string = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? ''
      setStatus(msg.toLowerCase().includes('expired') ? 'expired' : 'invalid')
    }
  }

  return (
    <>
      <Head>
        <title>Reset Password — Planit</title>
      </Head>

      <AuthShell title="Choose a new password">

        {(status === 'idle' || status === 'loading') && (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField label="New password" error={errors.newPassword?.message}>
              <PasswordInput {...register('newPassword')} />
            </FormField>

            <FormField label="Confirm password" error={errors.confirm?.message}>
              <PasswordInput {...register('confirm')} />
            </FormField>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-primary hover:bg-primary-hover text-white font-semibold
                py-3 rounded-btn transition-colors disabled:opacity-60 mt-1"
            >
              {status === 'loading' ? 'Resetting…' : 'Reset password'}
            </button>
          </form>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-2xl">
              ✓
            </div>
            <div>
              <p className="font-semibold text-charcoal text-lg">Password updated</p>
              <p className="text-stone-warm text-sm mt-1">
                Your password has been reset. You can now sign in with your new password.
              </p>
            </div>
            <Link
              href="/auth/login"
              className="w-full text-center bg-primary hover:bg-primary-hover text-white
                font-semibold py-3 rounded-btn transition-colors mt-2"
            >
              Sign in
            </Link>
          </div>
        )}

        {status === 'expired' && (
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-2xl">
              ⏱
            </div>
            <div>
              <p className="font-semibold text-charcoal text-lg">Link expired</p>
              <p className="text-stone-warm text-sm mt-1">
                Reset links are valid for 1 hour. Request a new one below.
              </p>
            </div>
            <Link
              href="/forgot-password"
              className="w-full text-center bg-primary hover:bg-primary-hover text-white
                font-semibold py-3 rounded-btn transition-colors mt-2"
            >
              Request new link
            </Link>
          </div>
        )}

        {(status === 'invalid' || status === 'no-token') && (
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-2xl">
              ✕
            </div>
            <div>
              <p className="font-semibold text-charcoal text-lg">Invalid link</p>
              <p className="text-stone-warm text-sm mt-1">
                This reset link is not valid. It may have already been used.
              </p>
            </div>
            <Link
              href="/forgot-password"
              className="w-full text-center bg-primary hover:bg-primary-hover text-white
                font-semibold py-3 rounded-btn transition-colors mt-2"
            >
              Request new link
            </Link>
          </div>
        )}

      </AuthShell>
    </>
  )
}
