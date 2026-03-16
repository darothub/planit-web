import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { EventType, PlannerProfileResponse } from '@/lib/types'
import DashboardShell from '@/components/dashboard/DashboardShell'
import FormField from '@/components/ui/FormField'
import ImageUploadField from '@/components/ui/ImageUploadField'
import { TERRA_GRADIENT } from '@/lib/utils'
import { DEMO_PLANNER_PROFILE_VERIFIED } from '@/showcase/data'

const BIO_MAX = 500

const VERIFICATION_BANNER: Record<string, { bg: string; text: string; msg: string }> = {
  PENDING:  { bg: 'bg-amber-50 border-amber-200',  text: 'text-amber-800', msg: 'Your profile is under review. We\'ll notify you within 24–48 hours.' },
  REJECTED: { bg: 'bg-red-50 border-red-200',       text: 'text-red-800',   msg: 'Your application was not approved.' },
}

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
    placeholderData: DEMO_PLANNER_PROFILE_VERIFIED,
    retry: false,
  })

  const { data: eventTypes = [] } = useQuery<EventType[]>({
    queryKey: ['event-types'],
    queryFn: () => api.get('/event-types').then(r => r.data.data),
    enabled: !!token,
  })

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

  // Profile completeness
  const completenessFields = [
    { label: 'Business name',    done: !!form.businessName },
    { label: 'Bio',              done: !!form.bio },
    { label: 'Location',         done: !!form.location },
    { label: 'Phone',            done: !!form.phone },
    { label: 'Profile photo',    done: !!form.profileImageUrl },
    { label: 'Years experience', done: !!form.yearsOfExperience },
    { label: 'Specialties',      done: selectedIds.length > 0 },
  ]
  const doneCount = completenessFields.filter(f => f.done).length
  const completePct = Math.round((doneCount / completenessFields.length) * 100)

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
    await Promise.all([profileMutation.mutateAsync(), specialtiesMutation.mutateAsync()])
  }

  if (!user) return null

  const verificationStatus = profile?.verificationStatus
  const banner = verificationStatus ? VERIFICATION_BANNER[verificationStatus] : null
  const initials = (form.businessName || user.firstName || 'P')[0].toUpperCase()

  return (
    <DashboardShell title="My Profile">
      <div className="max-w-2xl">

        {/* Verification banner */}
        {banner && (
          <div className={`mb-5 px-4 py-3 rounded-xl border text-sm ${banner.bg} ${banner.text}`}>
            <span className="font-semibold">
              {verificationStatus === 'PENDING' ? '⏳ Under review — ' : '❌ Not approved — '}
            </span>
            {banner.msg}
            {verificationStatus === 'REJECTED' && profile?.verificationNotes && (
              <p className="mt-1 text-xs opacity-80">{profile.verificationNotes}</p>
            )}
          </div>
        )}

        {/* Profile header card */}
        <div className="bg-white border border-cream rounded-xl p-5 mb-5 flex items-center gap-4">
          {/* Avatar */}
          <div
            className="w-16 h-16 rounded-full flex-shrink-0 flex items-center justify-center text-white text-2xl font-bold overflow-hidden"
            style={form.profileImageUrl ? {} : { background: TERRA_GRADIENT }}
          >
            {form.profileImageUrl
              ? <img src={form.profileImageUrl} alt="" className="w-full h-full object-cover" />
              : initials
            }
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-charcoal">{form.businessName || 'Your Business'}</p>
              {verificationStatus === 'VERIFIED' && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">✓ Verified</span>
              )}
            </div>
            <p className="text-xs text-stone-warm mt-0.5">{form.location || 'No location set'}</p>
            {/* Completeness bar */}
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-stone-warm">Profile {completePct}% complete</span>
                {completePct < 100 && (
                  <span className="text-xs text-stone-warm">{completenessFields.filter(f => !f.done).map(f => f.label).join(', ')} missing</span>
                )}
              </div>
              <div className="h-1.5 bg-cream rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${completePct}%`,
                    background: completePct === 100 ? '#4ade80' : 'var(--color-primary)',
                  }}
                />
              </div>
            </div>
          </div>

          {profile && verificationStatus === 'VERIFIED' && (
            <Link
              href={`/planners/${profile.id}`}
              target="_blank"
              className="flex-shrink-0 text-xs font-semibold text-primary hover:underline"
            >
              View profile →
            </Link>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

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

          {/* Business info */}
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

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Location">
                <input value={form.location} onChange={set('location')} className="input-base" placeholder="London, UK" />
              </FormField>
              <FormField label="Years of Experience">
                <input type="number" value={form.yearsOfExperience} onChange={set('yearsOfExperience')} min={0} className="input-base" />
              </FormField>
            </div>

            <FormField label={`Bio (${form.bio.length}/${BIO_MAX})`}>
              <textarea
                value={form.bio}
                onChange={set('bio')}
                rows={4}
                maxLength={BIO_MAX}
                className="input-base resize-none"
                placeholder="Tell clients about yourself…"
              />
            </FormField>
          </div>

          {/* Specialties */}
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

          {/* Availability toggle */}
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

          {/* Sticky save bar */}
          <div className="sticky bottom-0 bg-white border-t border-cream -mx-4 px-4 py-3 flex items-center gap-4 shadow-lg mt-2">
            <button
              type="submit"
              disabled={isPending}
              className="bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-2.5 rounded-btn transition-colors disabled:opacity-50"
            >
              {isPending ? 'Saving…' : 'Save Profile'}
            </button>
            {isSuccess && <p className="text-sm text-green-700 font-medium">✓ Profile saved</p>}
            {isError   && <p className="text-sm text-red-600">Something went wrong. Please try again.</p>}
          </div>

        </form>
      </div>
    </DashboardShell>
  )
}
