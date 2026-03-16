import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { CalendarBlockResponse } from '@/lib/types'
import DashboardShell from '@/components/dashboard/DashboardShell'
import { cn } from '@/lib/utils'
import { DEMO_CALENDAR_BLOCKS } from '@/showcase/data'

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_NAMES   = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

function toIso(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function formatCalDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
}

function dayCount(start: string, end: string) {
  return Math.round((new Date(end + 'T00:00:00').getTime() - new Date(start + 'T00:00:00').getTime()) / 86_400_000) + 1
}

function getMonthDays(year: number, month: number) {
  const firstDay    = (new Date(year, month, 1).getDay() + 6) % 7 // Mon = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  return { firstDay, daysInMonth }
}

export default function CalendarPage() {
  const { token, user } = useAuthStore()
  const router = useRouter()
  const qc = useQueryClient()

  const today      = new Date()
  const todayIso   = toIso(today.getFullYear(), today.getMonth(), today.getDate())
  const [year, setYear]   = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const [selectStart, setSelectStart] = useState<string | null>(null)
  const [hoverDay, setHoverDay]       = useState<string | null>(null)
  const [reason, setReason]           = useState('')
  const [showModal, setShowModal]     = useState(false)
  const [pendingRange, setPendingRange] = useState<{ start: string; end: string } | null>(null)
  const [confirmRemoveId, setConfirmRemoveId] = useState<number | null>(null)

  useEffect(() => {
    if (!token) router.replace('/auth/login?redirect=/dashboard/calendar')
    else if (user && user.role !== 'PLANNER') router.replace('/dashboard')
  }, [token, user, router])

  // Escape cancels selection
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setSelectStart(null); setHoverDay(null) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const { data: blocks = DEMO_CALENDAR_BLOCKS } = useQuery<CalendarBlockResponse[]>({
    queryKey: ['calendar-blocks'],
    queryFn: () => api.get('/planners/me/calendar/blocks').then(r => r.data.data),
    enabled: !!token,
    placeholderData: DEMO_CALENDAR_BLOCKS,
    retry: false,
  })

  const addBlock = useMutation({
    mutationFn: () => api.post('/planners/me/calendar/blocks', {
      startDate: pendingRange!.start,
      endDate:   pendingRange!.end,
      reason:    reason || undefined,
      scope:     'ALL',
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['calendar-blocks'] })
      setPendingRange(null)
      setReason('')
      setShowModal(false)
    },
  })

  const removeBlock = useMutation({
    mutationFn: (id: number) => api.delete(`/planners/me/calendar/blocks/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['calendar-blocks'] })
      setConfirmRemoveId(null)
    },
  })

  const { firstDay, daysInMonth } = getMonthDays(year, month)

  const prevMonth = () => {
    // Don't go before current month
    if (year === today.getFullYear() && month === today.getMonth()) return
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }
  const isAtMinMonth = year === today.getFullYear() && month === today.getMonth()

  const dayIso = useCallback((day: number) => toIso(year, month, day), [year, month])

  const isPast = (day: number) => dayIso(day) < todayIso

  const isBlocked = (day: number) => {
    const d = dayIso(day)
    return blocks.some(b => d >= b.startDate && d <= b.endDate)
  }

  const getBlockForDay = (day: number) => {
    const d = dayIso(day)
    return blocks.find(b => d >= b.startDate && d <= b.endDate) ?? null
  }

  const inSelection = (day: number): boolean => {
    if (!selectStart) return false
    const d = dayIso(day)
    const end = hoverDay ?? selectStart
    const [lo, hi] = d <= end ? [selectStart, end] : [end, selectStart]
    return d >= lo && d <= hi
  }

  const handleDayClick = (day: number) => {
    if (isPast(day)) return
    const d = dayIso(day)
    if (!selectStart) {
      setSelectStart(d)
    } else {
      const start = d < selectStart ? d : selectStart
      const end   = d < selectStart ? selectStart : d
      setPendingRange({ start, end })
      setSelectStart(null)
      setHoverDay(null)
      setShowModal(true)
    }
  }

  const handleDayHover = (day: number) => {
    if (selectStart && !isPast(day)) setHoverDay(dayIso(day))
  }

  if (!user) return null

  return (
    <DashboardShell title="Availability Calendar">

      <p className="text-sm text-stone-warm mb-5">
        Click a start date, then an end date to block out a range. Blocked dates won&apos;t be bookable by clients.
        {selectStart && (
          <span className="ml-2 text-primary font-medium">
            Start selected: {formatCalDate(selectStart)} — now click an end date
            <button
              onClick={() => { setSelectStart(null); setHoverDay(null) }}
              className="ml-2 text-stone-warm hover:text-charcoal"
              aria-label="Cancel selection"
            >
              <XMarkIcon className="w-4 h-4 inline" />
            </button>
          </span>
        )}
      </p>

      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── Calendar ─────────────────────────────────────────────────────── */}
        <div className="bg-white border border-cream rounded-xl p-6 w-full lg:w-auto lg:flex-shrink-0">

          {/* Month navigation */}
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={prevMonth}
              disabled={isAtMinMonth}
              className="p-1.5 rounded-lg hover:bg-sand transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Previous month"
            >
              <ChevronLeftIcon className="w-5 h-5 text-charcoal" />
            </button>
            <span className="font-semibold text-charcoal text-base">
              {MONTH_NAMES[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-sand transition-colors"
              aria-label="Next month"
            >
              <ChevronRightIcon className="w-5 h-5 text-charcoal" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAY_NAMES.map(d => (
              <div key={d} className="text-center text-xs font-medium text-stone-warm py-1 w-10">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} className="w-10 h-10" />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day     = i + 1
              const iso     = dayIso(day)
              const past    = isPast(day)
              const blocked = isBlocked(day)
              const block   = getBlockForDay(day)
              const isToday = iso === todayIso
              const sel     = inSelection(day)
              const isStart = selectStart === iso

              return (
                <div key={day} className="w-10 h-10 flex items-center justify-center relative">
                  <button
                    onClick={() => handleDayClick(day)}
                    onMouseEnter={() => handleDayHover(day)}
                    onMouseLeave={() => setHoverDay(null)}
                    title={block?.reason ?? undefined}
                    disabled={past}
                    className={cn(
                      'w-9 h-9 rounded-full text-sm font-medium transition-colors flex items-center justify-center relative',
                      past    ? 'text-stone-warm/40 cursor-not-allowed' :
                      blocked ? 'bg-primary text-white hover:bg-primary-hover' :
                      isStart ? 'bg-primary/30 text-primary ring-2 ring-primary' :
                      sel     ? 'bg-primary/15 text-primary' :
                      'hover:bg-sand text-charcoal',
                    )}
                  >
                    {day}
                    {/* Today dot */}
                    {isToday && (
                      <span className={cn(
                        'absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full',
                        blocked ? 'bg-white' : 'bg-primary',
                      )} />
                    )}
                  </button>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-cream text-xs text-stone-warm">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-primary inline-block" /> Blocked
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border-2 border-primary inline-block" /> Today
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-primary/15 inline-block" /> Selecting
            </span>
          </div>
        </div>

        {/* ── Blocked periods list ─────────────────────────────────────────── */}
        <div className="flex-1 w-full">
          <h3 className="font-semibold text-charcoal mb-3">
            Blocked Periods
            {blocks.length > 0 && (
              <span className="ml-2 text-xs font-normal text-stone-warm">{blocks.length} block{blocks.length !== 1 ? 's' : ''}</span>
            )}
          </h3>

          {blocks.length === 0 ? (
            <div className="bg-white border border-cream rounded-xl p-8 text-center">
              <p className="text-stone-warm text-sm">No blocked dates. Click the calendar to add one.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {[...blocks].sort((a, b) => a.startDate.localeCompare(b.startDate)).map(b => {
                const days = dayCount(b.startDate, b.endDate)
                const isPastBlock = b.endDate < todayIso
                return (
                  <div
                    key={b.id}
                    className={cn(
                      'bg-white border border-cream rounded-xl px-4 py-3 flex items-center justify-between gap-3',
                      isPastBlock && 'opacity-50',
                    )}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        <p className="text-sm font-medium text-charcoal">
                          {formatCalDate(b.startDate)}
                          {b.startDate !== b.endDate && (
                            <> → {formatCalDate(b.endDate)}</>
                          )}
                        </p>
                        <span className="text-xs text-stone-warm flex-shrink-0">
                          {days === 1 ? '1 day' : `${days} days`}
                        </span>
                      </div>
                      {b.reason && (
                        <p className="text-xs text-stone-warm mt-0.5 ml-4">{b.reason}</p>
                      )}
                    </div>

                    {confirmRemoveId === b.id ? (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-stone-warm">Remove?</span>
                        <button
                          onClick={() => removeBlock.mutate(b.id)}
                          disabled={removeBlock.isPending}
                          className="text-xs font-semibold text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setConfirmRemoveId(null)}
                          className="text-xs text-stone-warm hover:text-charcoal"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmRemoveId(b.id)}
                        className="text-xs text-red-600 hover:text-red-800 font-medium transition-colors flex-shrink-0"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Block dates modal */}
      {showModal && pendingRange && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-semibold text-charcoal mb-1">Block dates</h3>
            <p className="text-sm text-stone-warm mb-1">
              {formatCalDate(pendingRange.start)}
              {pendingRange.start !== pendingRange.end && <> → {formatCalDate(pendingRange.end)}</>}
            </p>
            <p className="text-xs text-stone-warm mb-4">
              {dayCount(pendingRange.start, pendingRange.end) === 1
                ? '1 day'
                : `${dayCount(pendingRange.start, pendingRange.end)} days`}
            </p>
            <label className="text-xs font-medium text-charcoal block mb-1">Reason (optional)</label>
            <input
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Holiday, personal commitment"
              className="input-base text-sm mb-4 w-full"
              autoFocus
            />
            {addBlock.isError && (
              <p className="text-xs text-red-600 mb-3">
                {(addBlock.error as any)?.response?.data?.message ?? 'Something went wrong.'}
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => addBlock.mutate()}
                disabled={addBlock.isPending}
                className="flex-1 bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 rounded-btn transition-colors disabled:opacity-50"
              >
                {addBlock.isPending ? 'Saving…' : 'Block Dates'}
              </button>
              <button
                onClick={() => { setShowModal(false); setPendingRange(null); setReason('') }}
                className="flex-1 border border-cream text-charcoal py-2.5 rounded-btn hover:bg-sand transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  )
}
