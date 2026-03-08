import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import AuthShell from '@/components/auth/AuthShell'

type Status = 'loading' | 'success' | 'expired' | 'invalid' | 'no-token'

export default function VerifyEmailPage() {
  const router = useRouter()
  const { token: authToken } = useAuthStore()
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    if (!router.isReady) return

    const token = router.query.token as string | undefined

    if (!token) {
      setStatus('no-token')
      return
    }

    api.get(`/auth/verify-email/${token}`)
      .then(() => setStatus('success'))
      .catch(err => {
        const msg: string = err?.response?.data?.message ?? ''
        setStatus(msg.toLowerCase().includes('expired') ? 'expired' : 'invalid')
      })
  }, [router.isReady, router.query.token])

  return (
    <>
      <Head>
        <title>Verify Email — Planit</title>
      </Head>

      <AuthShell title="Email verification">
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="w-10 h-10 rounded-full border-4 border-cream border-t-primary animate-spin" />
            <p className="text-stone-warm text-sm">Verifying your email…</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-2xl">
              ✓
            </div>
            <div>
              <p className="font-semibold text-charcoal text-lg">Email verified!</p>
              <p className="text-stone-warm text-sm mt-1">
                Your account is ready to use.
              </p>
            </div>
            <Link
              href={authToken ? '/dashboard' : '/auth/login'}
              className="w-full text-center bg-primary hover:bg-primary-hover text-white
                font-semibold py-3 rounded-btn transition-colors mt-2"
            >
              {authToken ? 'Go to dashboard' : 'Sign in'}
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
                Verification links are valid for 24 hours. Please register again to get a new link.
              </p>
            </div>
            <Link
              href="/auth/register"
              className="w-full text-center bg-primary hover:bg-primary-hover text-white
                font-semibold py-3 rounded-btn transition-colors mt-2"
            >
              Register again
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
                This verification link is not valid. It may have already been used.
              </p>
            </div>
            <Link
              href={authToken ? '/dashboard' : '/auth/login'}
              className="w-full text-center bg-primary hover:bg-primary-hover text-white
                font-semibold py-3 rounded-btn transition-colors mt-2"
            >
              {authToken ? 'Go to dashboard' : 'Sign in'}
            </Link>
          </div>
        )}
      </AuthShell>
    </>
  )
}
