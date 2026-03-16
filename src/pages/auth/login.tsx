import { useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import AuthShell from '@/components/auth/AuthShell'
import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  const router = useRouter()
  const token = useAuthStore(s => s.token)

  useEffect(() => {
    if (token) router.replace('/dashboard')
  }, [token, router])

  return (
    <>
      <Head>
        <title>Sign In — Planit</title>
      </Head>
      <AuthShell title="Welcome back" subtitle="Sign in to your Planit account.">
        <LoginForm />
        <p className="text-center text-sm text-stone-warm mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-primary font-medium hover:underline">
            Create one
          </Link>
        </p>
      </AuthShell>
    </>
  )
}
