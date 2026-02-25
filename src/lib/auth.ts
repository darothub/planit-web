import Cookies from 'js-cookie'
import { useRouter } from 'next/router'
import { useAuthStore } from '@/store/authStore'
import { AuthResponse } from '@/lib/types'

export function useAuthActions() {
  const setAuth = useAuthStore(s => s.setAuth)
  const router = useRouter()

  const handleAuthSuccess = (data: AuthResponse) => {
    Cookies.set('planit_token', data.token, { expires: 7, secure: true, sameSite: 'strict' })
    setAuth(data.token, {
      id: data.userId,
      email: data.email,
      role: data.role,
      firstName: data.firstName,
      lastName: data.lastName,
    })
    const redirect = router.query.redirect as string
    router.push(redirect || '/dashboard')
  }

  return { handleAuthSuccess }
}
