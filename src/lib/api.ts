import axios from 'axios'
import Cookies from 'js-cookie'

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

// Global response error handler — log non-auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 handling is done per-component (redirect to login)
    return Promise.reject(error)
  }
)