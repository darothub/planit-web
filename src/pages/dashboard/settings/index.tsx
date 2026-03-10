import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { UserResponse } from '@/lib/types'
import DashboardShell from '@/components/dashboard/DashboardShell'
import FormField from '@/components/ui/FormField'

export default function ClientSettingsPage() {
  const { token, user } = useAuthStore()
  const router = useRouter()
  const qc = useQueryClient()

  useEffect(() => {
    if (!token) router.replace('/auth/login?redirect=/dashboard/settings')
  }, [token, router])

  const { data: profile } = useQuery<UserResponse>({
    queryKey: ['user-profile'],
    queryFn: () => api.get('/users/me').then(r => r.data.data),
    enabled: !!token,
    retry: false,
  })

  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '' })

  useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.firstName ?? '',
        lastName:  profile.lastName ?? '',
        phone:     profile.phone ?? '',
      })
    }
  }, [profile])

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }))

  const mutation = useMutation({
    mutationFn: () => api.put('/users/me', {
      firstName: form.firstName || undefined,
      lastName:  form.lastName || undefined,
      phone:     form.phone || undefined,
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['user-profile'] }),
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    mutation.mutate()
  }

  if (!user) return null

  return (
    <DashboardShell title="Account Settings">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl">

        {/* ── Personal info ─────────────────────────────────────────────── */}
        <div className="bg-white border border-cream rounded-xl p-6 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-charcoal">Personal info</h2>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="First Name">
              <input value={form.firstName} onChange={set('firstName')} className="input-base" placeholder="Jane" />
            </FormField>
            <FormField label="Last Name">
              <input value={form.lastName} onChange={set('lastName')} className="input-base" placeholder="Smith" />
            </FormField>
          </div>

          <FormField label="Phone">
            <input value={form.phone} onChange={set('phone')} className="input-base" placeholder="+44 7700 000000" />
          </FormField>

          <div className="bg-sand border border-cream rounded-lg px-4 py-3">
            <p className="text-xs text-stone-warm">
              <span className="font-medium text-charcoal">Email: </span>
              {profile?.email ?? user.email}
            </p>
            <p className="text-xs text-stone-warm mt-1">
              Email address cannot be changed. Contact support if you need help.
            </p>
          </div>
        </div>

        {/* ── Save ──────────────────────────────────────────────────────── */}
        {mutation.isError   && <p className="text-red-600 text-sm">Something went wrong. Please try again.</p>}
        {mutation.isSuccess && <p className="text-green-700 text-sm">Settings saved!</p>}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="self-start bg-primary hover:bg-primary-hover text-white font-semibold
            px-6 py-2.5 rounded-btn transition-colors disabled:opacity-50"
        >
          {mutation.isPending ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </DashboardShell>
  )
}
