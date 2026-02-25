import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { CalendarBlockResponse } from '@/lib/types'
import DashboardShell from '@/components/dashboard/DashboardShell'
import { cn } from '@/lib/utils'

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  return { firstDay: (firstDay + 6) % 7, daysInMonth } // Mon-first
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_NAMES = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

export default function CalendarPage() {
  const { token, user } = useAuthStore()
  const router = useRouter()
  const qc = useQueryClient()

  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selecting, setSelecting] = useState<{ start: string; end: string } | null>(null)
  const [reason, setReason] = useState('')
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (!token) router.replace('/auth/login?redirect=/dashboard/calendar')
    else if (user && user.role !== 'PLANNER') router.replace('/dashboard')
  }, [token, user, router])

  const { data: blocks = [] } = useQuery<CalendarBlockResponse[]>({
    queryKey: ['calendar-blocks'],
    queryFn: () => api.get('/planners/me/calendar/blocks').then(r => r.data.data),
    enabled: !!token,
    retry: false,
  })

  const addBlock = useMutation({
    mutationFn: () => api.post('/planners/me/calendar/blocks', {
      startDate: selecting!.start,
      endDate:   selecting!.end,
      reason:    reason || undefined,
      scope:     'ALL',
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['calendar-blocks'] })
      setSelecting(null)
      setReason('')
      setShowModal(false)
    },
  })

  const removeBlock = useMutation({
    mutationFn: (id: number) => api.delete(`/planners/me/calendar/blocks/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['calendar-blocks'] }),
  })

  const { firstDay, daysInMonth } = getMonthDays(year, month)

  const isBlocked = (day: number) => {
    const d = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return blocks.some(b => d >= b.startDate && d <= b.endDate)
  }

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const handleDayClick = (day: number) => {
    const d = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    if (!selecting) {
      setSelecting({ start: d, end: d })
    } else if (d >= selecting.start) {
      setSelecting(s => ({ ...s!, end: d }))
      setShowModal(true)
    } else {
      setSelecting({ start: d, end: d })
    }
  }

  const inSelection = (day: number) => {
    if (!selecting) return false
    const d = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return d >= selecting.start && d <= selecting.end
  }

  if (!user) return null

  return (
    <DashboardShell title="Availability Calendar">
      <p className="text-sm text-stone-warm mb-4">
        Click a start date then an end date to block out a range. Blocked dates appear in terracotta.
      </p>

      <div className="bg-white border border-cream rounded-xl p-6 max-w-lg">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-1 hover:text-primary transition-colors">‹</button>
          <span className="font-semibold text-charcoal">{MONTH_NAMES[month]} {year}</span>
          <button onClick={nextMonth} className="p-1 hover:text-primary transition-colors">›</button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_NAMES.map(d => (
            <div key={d} className="text-center text-xs text-stone-warm py-1">{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const blocked = isBlocked(day)
            const selected = inSelection(day)
            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={cn(
                  'text-sm rounded-lg py-2 transition-colors font-medium',
                  blocked   ? 'bg-primary text-white'        :
                  selected  ? 'bg-primary/20 text-primary'   :
                  'hover:bg-sand text-charcoal'
                )}
              >
                {day}
              </button>
            )
          })}
        </div>

        {selecting && !showModal && (
          <p className="text-xs text-stone-warm mt-3 text-center">
            Start: {selecting.start} — now click an end date
          </p>
        )}
      </div>

      {/* Existing blocks */}
      {blocks.length > 0 && (
        <div className="mt-6 max-w-lg">
          <h3 className="font-semibold text-charcoal mb-3">Blocked Periods</h3>
          <div className="flex flex-col gap-2">
            {blocks.map(b => (
              <div key={b.id} className="flex items-center justify-between bg-white border border-cream rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-charcoal">{b.startDate} → {b.endDate}</p>
                  {b.reason && <p className="text-xs text-stone-warm">{b.reason}</p>}
                </div>
                <button
                  onClick={() => removeBlock.mutate(b.id)}
                  className="text-xs text-red-600 hover:text-red-800 font-medium transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && selecting && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-modal">
            <h3 className="font-semibold text-charcoal mb-1">Block dates</h3>
            <p className="text-sm text-stone-warm mb-4">{selecting.start} → {selecting.end}</p>
            <label className="text-xs font-medium text-stone-warm block mb-1">Reason (optional)</label>
            <input
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Holiday"
              className="input-base text-sm mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => addBlock.mutate()}
                disabled={addBlock.isPending}
                className="flex-1 bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 rounded-btn transition-colors disabled:opacity-50"
              >
                {addBlock.isPending ? 'Saving…' : 'Block Dates'}
              </button>
              <button
                onClick={() => { setShowModal(false); setSelecting(null) }}
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
