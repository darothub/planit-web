import { useEffect, useState } from 'react'
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
    if (token) router.replace('/dashboard')
  }, [token, router])

  return (
    <AuthShell title="Create your account">
      {registered ? (
        <div className="text-center py-4">
          <div className="text-4xl mb-4">📬</div>
          <h2 className="text-lg font-semibold text-charcoal">Check your inbox</h2>
          <p className="text-stone-warm text-sm mt-2">
            We sent a verification link to your email. Click it to activate your account.
          </p>
          <Link
            href="/auth/login"
            className="inline-block mt-6 text-primary font-medium text-sm hover:underline"
          >
            Back to sign in
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
  )
}
