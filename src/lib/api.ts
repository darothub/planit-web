import axios from 'axios'
import Cookies from 'js-cookie'
import { useAuthStore } from '@/store/authStore'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT to every request automatically
api.interceptors.request.use((config) => {
  const token = Cookies.get('planit_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Global 401 handler — clears stale auth and redirects to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('planit_token')
      useAuthStore.getState().logout()
      if (typeof window !== 'undefined') {
        window.location.replace('/auth/login')
      }
    }
    return Promise.reject(error)
  }
)