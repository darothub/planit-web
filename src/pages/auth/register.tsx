import { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import AuthShell from '@/components/auth/AuthShell'
import RegisterForm from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  const router = useRouter()
  const token = useAuthStore(s => s.token)
  const [registered, setRegistered] = useState(false)

  useEffect(() => {
    // Allow a logged-in CLIENT to reach this page via ?role=PLANNER (Become a Planner flow)
    if (token && router.isReady && router.query.role !== 'PLANNER') {
      router.replace('/dashboard')
    }
  }, [token, router, router.isReady, router.query.role])

  return (
    <>
      <Head>
        <title>Create Account — Planit</title>
      </Head>
      <AuthShell
        title={registered ? 'Check your inbox' : 'Create your account'}
        subtitle={registered ? undefined : 'Join Planit — it only takes a minute.'}
      >
        {registered ? (
          <div className="text-center py-2">
            <div className="text-5xl mb-4">📬</div>
            <p className="text-stone-warm text-sm mt-2 leading-relaxed">
              We sent a verification link to your email address.
              Click it to activate your account.
            </p>
            <p className="text-stone-warm text-xs mt-3">
              Can&apos;t find it? Check your spam or junk folder.
            </p>
            <Link
              href="/auth/login"
              className="inline-block mt-6 bg-primary hover:bg-primary-hover text-white font-semibold text-sm px-6 py-2.5 rounded-btn transition-colors"
            >
              Go to sign in
            </Link>
          </div>
        ) : (
          <>
            <RegisterForm onSuccess={() => setRegistered(true)} />
            <p className="text-center text-sm text-stone-warm mt-6">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </>
        )}
      </AuthShell>
    </>
  )
}
