import { useEffect } from 'react'
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
    <AuthShell title="Welcome back">
      <LoginForm />
      <p className="text-center text-sm text-stone-warm mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/auth/register" className="text-primary font-medium hover:underline">
          Register here
        </Link>
      </p>
    </AuthShell>
  )
}
