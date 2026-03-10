import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { EventType, PlannerProfileResponse } from '@/lib/types'
import DashboardShell from '@/components/dashboard/DashboardShell'
import FormField from '@/components/ui/FormField'
import ImageUploadField from '@/components/ui/ImageUploadField'

export default function PlannerProfilePage() {
  const { token, user } = useAuthStore()
  const router = useRouter()
  const qc = useQueryClient()

  useEffect(() => {
    if (!token) router.replace('/auth/login?redirect=/dashboard/profile')
    else if (user && user.role !== 'PLANNER') router.replace('/dashboard')
  }, [token, user, router])

  // ── Fetch profile + event types ──────────────────────────────────────────
  const { data: profile } = useQuery<PlannerProfileResponse>({
    queryKey: ['planner-profile'],
    queryFn: () => api.get('/planners/me').then(r => r.data.data),
    enabled: !!token,
    retry: false,
  })

  const { data: eventTypes = [] } = useQuery<EventType[]>({
    queryKey: ['event-types'],
    queryFn: () => api.get('/event-types').then(r => r.data.data),
    enabled: !!token,
  })

  // ── Form state ────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    businessName:      '',
    bio:               '',
    location:          '',
    yearsOfExperience: '',
    profileImageUrl:   '',
    phone:             '',
  })
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [isAcceptingInquiries, setIsAcceptingInquiries] = useState(true)

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
      setSelectedIds(profile.specialties?.map(s => s.id) ?? [])
      setIsAcceptingInquiries(profile.isAcceptingInquiries ?? true)
    }
  }, [profile])

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }))

  function toggleSpecialty(id: number) {
    setSelectedIds(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id])
  }

  // ── Mutations ─────────────────────────────────────────────────────────────
  const profileMutation = useMutation({
    mutationFn: () => api.put('/planners/me', {
      businessName:         form.businessName || undefined,
      bio:                  form.bio || undefined,
      location:             form.location || undefined,
      yearsOfExperience:    form.yearsOfExperience ? Number(form.yearsOfExperience) : undefined,
      profileImageUrl:      form.profileImageUrl || undefined,
      phone:                form.phone || undefined,
      isAcceptingInquiries,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['planner-profile'] })
      qc.invalidateQueries({ queryKey: ['profile-avatar'] })
    },
  })

  const specialtiesMutation = useMutation({
    mutationFn: () => api.put('/planners/me/specialties', { eventTypeIds: selectedIds }),
  })

  const isPending = profileMutation.isPending || specialtiesMutation.isPending
  const isError   = profileMutation.isError   || specialtiesMutation.isError
  const isSuccess = profileMutation.isSuccess  && specialtiesMutation.isSuccess

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await Promise.all([
      profileMutation.mutateAsync(),
      specialtiesMutation.mutateAsync(),
    ])
  }

  if (!user) return null

  return (
    <DashboardShell title="My Profile">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl">

        {/* ── Profile photo ─────────────────────────────────────────────── */}
        <div className="bg-white border border-cream rounded-xl p-6">
          <h2 className="text-sm font-semibold text-charcoal mb-4">Profile photo</h2>
          <ImageUploadField
            variant="avatar"
            folder="avatars"
            value={form.profileImageUrl}
            onChange={url => setForm(f => ({ ...f, profileImageUrl: url }))}
          />
        </div>

        {/* ── Profile info ──────────────────────────────────────────────── */}
        <div className="bg-white border border-cream rounded-xl p-6 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-charcoal">Business info</h2>

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
        </div>

        {/* ── Specialties ───────────────────────────────────────────────── */}
        {eventTypes.length > 0 && (
          <div className="bg-white border border-cream rounded-xl p-6">
            <h2 className="text-sm font-semibold text-charcoal mb-1">Specialties</h2>
            <p className="text-xs text-stone-warm mb-4">
              Select the event types you specialise in. These appear on your public profile.
            </p>
            <div className="flex flex-wrap gap-2">
              {eventTypes.map(et => {
                const active = selectedIds.includes(et.id)
                return (
                  <button
                    key={et.id}
                    type="button"
                    onClick={() => toggleSpecialty(et.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      active
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-charcoal border-cream hover:border-primary hover:text-primary'
                    }`}
                  >
                    {et.displayName}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Availability ──────────────────────────────────────────────── */}
        <div className="bg-white border border-cream rounded-xl p-6">
          <h2 className="text-sm font-semibold text-charcoal mb-1">Availability</h2>
          <p className="text-xs text-stone-warm mb-4">
            Control whether clients can send you new inquiries.
          </p>
          <label className="flex items-center gap-3 cursor-pointer select-none w-fit">
            <div
              onClick={() => setIsAcceptingInquiries(v => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                isAcceptingInquiries ? 'bg-primary' : 'bg-cream'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  isAcceptingInquiries ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </div>
            <span className="text-sm text-charcoal">
              {isAcceptingInquiries ? 'Accepting new inquiries' : 'Not accepting new inquiries'}
            </span>
          </label>
        </div>

        {/* ── Save ──────────────────────────────────────────────────────── */}
        {isError   && <p className="text-red-600 text-sm">Something went wrong. Please try again.</p>}
        {isSuccess && <p className="text-green-700 text-sm">Profile saved!</p>}

        <button
          type="submit"
          disabled={isPending}
          className="self-start bg-primary hover:bg-primary-hover text-white font-semibold
            px-6 py-2.5 rounded-btn transition-colors disabled:opacity-50"
        >
          {isPending ? 'Saving…' : 'Save Profile'}
        </button>
      </form>
    </DashboardShell>
  )
}
