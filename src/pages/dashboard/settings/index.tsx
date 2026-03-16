import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { UserResponse } from '@/lib/types'
import DashboardShell from '@/components/dashboard/DashboardShell'
import FormField from '@/components/ui/FormField'
import ImageUploadField from '@/components/ui/ImageUploadField'
import { TERRA_GRADIENT } from '@/lib/utils'
import { DEMO_USER_PROFILE } from '@/showcase/data'

const ROLE_LABEL: Record<string, string> = {
  CLIENT:  'Client',
  PLANNER: 'Planner',
  ADMIN:   'Admin',
}

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
    placeholderData: DEMO_USER_PROFILE,
    retry: false,
  })

  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', profileImageUrl: '' })

  useEffect(() => {
    if (profile) {
      setForm({
        firstName:       profile.firstName ?? '',
        lastName:        profile.lastName ?? '',
        phone:           profile.phone ?? '',
        profileImageUrl: profile.profileImageUrl ?? '',
      })
    }
  }, [profile])

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }))

  // ── Profile mutation ─────────────────────────────────────────────────────────
  const profileMutation = useMutation({
    mutationFn: () => api.put('/users/me', {
      firstName:       form.firstName || undefined,
      lastName:        form.lastName || undefined,
      phone:           form.phone || undefined,
      profileImageUrl: form.profileImageUrl || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-profile'] })
      qc.invalidateQueries({ queryKey: ['profile-avatar'] })
    },
  })

  // ── Password mutation ────────────────────────────────────────────────────────
  const [pw, setPw] = useState({ current: '', newPw: '', confirm: '' })
  const [pwError, setPwError] = useState<string | null>(null)

  const setPwField = (key: keyof typeof pw) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setPw(p => ({ ...p, [key]: e.target.value }))

  const passwordMutation = useMutation({
    mutationFn: () => api.put('/users/me/password', {
      currentPassword: pw.current,
      newPassword:     pw.newPw,
    }),
    onSuccess: () => {
      setPw({ current: '', newPw: '', confirm: '' })
      setPwError(null)
    },
  })

  function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault()
    profileMutation.mutate()
  }

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (pw.newPw !== pw.confirm) {
      setPwError('New passwords do not match.')
      return
    }
    if (pw.newPw.length < 8) {
      setPwError('New password must be at least 8 characters.')
      return
    }
    setPwError(null)
    passwordMutation.mutate()
  }

  if (!user) return null

  const displayName  = `${form.firstName || user.firstName} ${form.lastName || user.lastName}`.trim()
  const initials     = `${(form.firstName || user.firstName)[0] ?? ''}${(form.lastName || user.lastName)[0] ?? ''}`.toUpperCase()
  const email        = profile?.email ?? user.email
  const roleLabel    = ROLE_LABEL[user.role] ?? user.role

  return (
    <DashboardShell title="Account Settings">
      <div className="max-w-2xl">

        {/* ── Profile header card ──────────────────────────────────────── */}
        <div className="bg-white border border-cream rounded-xl p-5 mb-5 flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xl font-bold overflow-hidden"
            style={form.profileImageUrl ? {} : { background: TERRA_GRADIENT }}
          >
            {form.profileImageUrl
              ? <img src={form.profileImageUrl} alt="" className="w-full h-full object-cover" />
              : initials
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-charcoal">{displayName || 'Your Account'}</p>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sand text-stone-warm">
                {roleLabel}
              </span>
            </div>
            <p className="text-xs text-stone-warm mt-0.5">{email}</p>
          </div>
        </div>

        {/* ── Main profile form ────────────────────────────────────────── */}
        <form onSubmit={handleProfileSubmit} className="flex flex-col gap-5">

          {/* Profile photo */}
          <div className="bg-white border border-cream rounded-xl p-6">
            <h2 className="text-sm font-semibold text-charcoal mb-4">Profile photo</h2>
            <ImageUploadField
              variant="avatar"
              folder="avatars"
              value={form.profileImageUrl}
              onChange={url => setForm(f => ({ ...f, profileImageUrl: url }))}
            />
          </div>

          {/* Personal info */}
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
                {email}
              </p>
              <p className="text-xs text-stone-warm mt-1">
                Email address cannot be changed. Contact support if you need help.
              </p>
            </div>
          </div>

          {/* Sticky save bar */}
          <div className="sticky bottom-0 bg-white border-t border-cream -mx-4 px-4 py-3 flex items-center gap-4 shadow-lg mt-2">
            <button
              type="submit"
              disabled={profileMutation.isPending}
              className="bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-2.5 rounded-btn transition-colors disabled:opacity-50"
            >
              {profileMutation.isPending ? 'Saving…' : 'Save Changes'}
            </button>
            {profileMutation.isSuccess && <p className="text-sm text-green-700 font-medium">✓ Changes saved</p>}
            {profileMutation.isError   && <p className="text-sm text-red-600">Something went wrong. Please try again.</p>}
          </div>

        </form>

        {/* ── Change password ──────────────────────────────────────────── */}
        <form onSubmit={handlePasswordSubmit} className="mt-5">
          <div className="bg-white border border-cream rounded-xl p-6 flex flex-col gap-4">
            <div>
              <h2 className="text-sm font-semibold text-charcoal">Change password</h2>
              <p className="text-xs text-stone-warm mt-0.5">Use a strong password of at least 8 characters.</p>
            </div>

            <FormField label="Current password">
              <input
                type="password"
                value={pw.current}
                onChange={setPwField('current')}
                className="input-base"
                autoComplete="current-password"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="New password">
                <input
                  type="password"
                  value={pw.newPw}
                  onChange={setPwField('newPw')}
                  className="input-base"
                  autoComplete="new-password"
                />
              </FormField>
              <FormField label="Confirm new password">
                <input
                  type="password"
                  value={pw.confirm}
                  onChange={setPwField('confirm')}
                  className="input-base"
                  autoComplete="new-password"
                />
              </FormField>
            </div>

            {pwError && <p className="text-xs text-red-600">{pwError}</p>}
            {passwordMutation.isError && (
              <p className="text-xs text-red-600">
                {(passwordMutation.error as any)?.response?.data?.message ?? 'Could not update password. Check your current password and try again.'}
              </p>
            )}
            {passwordMutation.isSuccess && (
              <p className="text-xs text-green-700 font-medium">✓ Password updated successfully</p>
            )}

            <div>
              <button
                type="submit"
                disabled={passwordMutation.isPending || !pw.current || !pw.newPw || !pw.confirm}
                className="bg-primary hover:bg-primary-hover text-white font-semibold px-5 py-2.5 rounded-btn transition-colors disabled:opacity-50 text-sm"
              >
                {passwordMutation.isPending ? 'Updating…' : 'Update Password'}
              </button>
            </div>
          </div>
        </form>

      </div>
    </DashboardShell>
  )
}
