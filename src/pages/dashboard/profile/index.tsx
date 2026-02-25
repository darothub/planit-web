import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { PlannerProfileResponse } from '@/lib/types'
import DashboardShell from '@/components/dashboard/DashboardShell'
import FormField from '@/components/ui/FormField'

export default function PlannerProfilePage() {
  const { token, user } = useAuthStore()
  const router = useRouter()
  const qc = useQueryClient()

  useEffect(() => {
    if (!token) router.replace('/auth/login?redirect=/dashboard/profile')
    else if (user && user.role !== 'PLANNER') router.replace('/dashboard')
  }, [token, user, router])

  const { data: profile } = useQuery<PlannerProfileResponse>({
    queryKey: ['planner-profile'],
    queryFn: () => api.get('/planners/me').then(r => r.data.data),
    enabled: !!token,
    retry: false,
  })

  const [form, setForm] = useState({
    businessName:       '',
    bio:                '',
    location:           '',
    yearsOfExperience:  '',
    profileImageUrl:    '',
    phone:              '',
  })

  useEffect(() => {
    if (profile) {
      setForm({
        businessName:      profile.businessName ?? '',
        bio:               profile.bio ?? '',
        location:          profile.location ?? '',
        yearsOfExperience: String(profile.yearsOfExperience ?? ''),
        profileImageUrl:   profile.profileImageUrl ?? '',
        phone:             profile.phone ?? '',
      })
    }
  }, [profile])

  const mutation = useMutation({
    mutationFn: () => api.put('/planners/me', {
      businessName:      form.businessName || undefined,
      bio:               form.bio || undefined,
      location:          form.location || undefined,
      yearsOfExperience: form.yearsOfExperience ? Number(form.yearsOfExperience) : undefined,
      profileImageUrl:   form.profileImageUrl || undefined,
      phone:             form.phone || undefined,
    }).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['planner-profile'] }),
  })

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  if (!user) return null

  return (
    <DashboardShell title="My Profile">
      <form
        onSubmit={e => { e.preventDefault(); mutation.mutate() }}
        className="bg-white border border-cream rounded-xl p-6 flex flex-col gap-4 max-w-2xl"
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Business Name">
            <input value={form.businessName} onChange={set('businessName')} className="input-base" placeholder="Jane Smith Events" />
          </FormField>
          <FormField label="Phone">
            <input value={form.phone} onChange={set('phone')} className="input-base" placeholder="+44 7700 000000" />
          </FormField>
        </div>

        <FormField label="Location">
          <input value={form.location} onChange={set('location')} className="input-base" placeholder="London, UK" />
        </FormField>

        <FormField label="Years of Experience">
          <input type="number" value={form.yearsOfExperience} onChange={set('yearsOfExperience')} min={0} className="input-base w-32" />
        </FormField>

        <FormField label="Bio">
          <textarea value={form.bio} onChange={set('bio')} rows={4} className="input-base resize-none" placeholder="Tell clients about yourself…" />
        </FormField>

        <FormField label="Profile Image URL">
          <input value={form.profileImageUrl} onChange={set('profileImageUrl')} className="input-base" placeholder="https://…" />
        </FormField>

        {mutation.isError && <p className="text-red-600 text-sm">Something went wrong.</p>}
        {mutation.isSuccess && <p className="text-green-700 text-sm">Profile saved!</p>}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="self-start bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-2.5 rounded-btn transition-colors disabled:opacity-50"
        >
          {mutation.isPending ? 'Saving…' : 'Save Profile'}
        </button>
      </form>
    </DashboardShell>
  )
}
