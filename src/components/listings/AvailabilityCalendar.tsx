import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { BlockedPeriodResponse } from '@/lib/types'

// ─── Demo blocked ranges for negative (demo) listing IDs ─────────────────────

const DEMO_BLOCKED: BlockedPeriodResponse[] = [
  { startDate: '2026-03-05', endDate: '2026-03-07', reason: 'Booked' },
  { startDate: '2026-03-15', endDate: '2026-03-15', reason: 'Booked' },
  { startDate: '2026-03-22', endDate: '2026-03-24', reason: null },
  { startDate: '2026-04-10', endDate: '2026-04-12', reason: 'Booked' },
  { startDate: '2026-04-20', endDate: '2026-04-20', reason: null },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatYMD(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseYMD(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function isDateBlocked(dateStr: string, blocked: BlockedPeriodResponse[]): boolean {
  return blocked.some(b => dateStr >= b.startDate && dateStr <= b.endDate)
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

// Returns 0=Mon … 6=Sun (Monday-first grid)
function getMondayFirstDay(year: number, month: number): number {
  const raw = new Date(year, month, 1).getDay() // 0=Sun
  return (raw + 6) % 7
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

// ─── Single month grid ────────────────────────────────────────────────────────

function MonthGrid({
  year,
  month,
  blocked,
}: {
  year: number
  month: number
  blocked: BlockedPeriodResponse[]
}) {
  const today = formatYMD(new Date())
  const daysInMonth = getDaysInMonth(year, month)
  const startOffset = getMondayFirstDay(year, month) // 0-based Mon-first

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // pad to complete weeks
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="w-full">
      <p className="text-sm font-semibold text-charcoal text-center mb-3">
        {MONTH_NAMES[month]} {year}
      </p>
      <div className="grid grid-cols-7 gap-0">
        {DAY_LABELS.map(d => (
          <div key={d} className="text-center text-xs text-stone-warm py-1 font-medium">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const blocked_ = isDateBlocked(dateStr, blocked)
          const isToday = dateStr === today
          const isPast = dateStr < today

          return (
            <div
              key={i}
              className={[
                'text-center text-sm py-1.5 rounded-md mx-0.5 my-0.5 select-none',
                blocked_
                  ? 'bg-red-50 text-stone-400 line-through'
                  : isPast
                  ? 'text-stone-300'
                  : 'text-charcoal',
                isToday && !blocked_ ? 'font-bold relative after:absolute after:bottom-0.5 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary after:rounded-full' : '',
              ].filter(Boolean).join(' ')}
            >
              {day}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CalendarSkeleton() {
  return (
    <div className="flex gap-8 animate-pulse">
      {[0, 1].map(i => (
        <div key={i} className="flex-1">
          <div className="h-4 bg-cream rounded w-24 mx-auto mb-4" />
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, j) => (
              <div key={j} className="h-7 bg-cream rounded" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

type Props = { listingId: number }

export default function AvailabilityCalendar({ listingId }: Props) {
  const now = new Date()
  const [baseYear, setBaseYear] = useState(now.getFullYear())
  const [baseMonth, setBaseMonth] = useState(now.getMonth())

  // Second displayed month
  const secondMonth = baseMonth === 11 ? 0 : baseMonth + 1
  const secondYear = baseMonth === 11 ? baseYear + 1 : baseYear

  // Date range for API call: cover both visible months
  const rangeStart = `${baseYear}-${String(baseMonth + 1).padStart(2, '0')}-01`
  const lastDayOfSecond = getDaysInMonth(secondYear, secondMonth)
  const rangeEnd = `${secondYear}-${String(secondMonth + 1).padStart(2, '0')}-${lastDayOfSecond}`

  const isDemo = listingId < 0

  const { data: blocked = [], isLoading } = useQuery<BlockedPeriodResponse[]>({
    queryKey: ['availability', listingId, rangeStart],
    queryFn: () =>
      api
        .get(`/listings/${listingId}/availability`, { params: { rangeStart, rangeEnd } })
        .then(r => r.data.data ?? []),
    enabled: !isDemo,
    staleTime: 5 * 60 * 1000,
    retry: false,
    placeholderData: [],
  })

  const displayBlocked = isDemo ? DEMO_BLOCKED : blocked

  const handlePrev = () => {
    if (baseMonth === 0) { setBaseMonth(11); setBaseYear(y => y - 1) }
    else setBaseMonth(m => m - 1)
  }

  const handleNext = () => {
    if (baseMonth === 11) { setBaseMonth(0); setBaseYear(y => y + 1) }
    else setBaseMonth(m => m + 1)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrev}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-sand transition-colors text-charcoal"
          aria-label="Previous month"
        >
          ‹
        </button>
        <div className="text-sm text-stone-warm">
          <span className="text-red-400 font-medium">━</span> Unavailable&emsp;Available: plain date
        </div>
        <button
          onClick={handleNext}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-sand transition-colors text-charcoal"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {isLoading ? (
        <CalendarSkeleton />
      ) : (
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <MonthGrid year={baseYear} month={baseMonth} blocked={displayBlocked} />
          </div>
          <div className="flex-1">
            <MonthGrid year={secondYear} month={secondMonth} blocked={displayBlocked} />
          </div>
        </div>
      )}
    </div>
  )
}
