import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserRole } from '@/lib/types'

type User = {
  id: number
  email: string
  firstName: string
  lastName: string
  role: UserRole
}

type AuthState = {
  token: string | null
  user: User | null
  _hasHydrated: boolean
  setAuth: (token: string, user: User) => void
  logout: () => void
  setHasHydrated: (state: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      _hasHydrated: false,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'planit-auth',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)