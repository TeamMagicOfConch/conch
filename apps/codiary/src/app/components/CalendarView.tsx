import { useState, useMemo } from 'react'
import { Button } from '@/app/components/ui/button'
import { ArrowLeft, ChevronLeft, ChevronRight, LogOut } from 'lucide-react'

interface HistoryEntry {
  sessionId: string
  date: string
  participated: boolean
  diary?: {
    content: string
  }
  response?: {
    content: string
  }
  review?: {
    highlights: Array<{ text: string; startIdx: number; endIdx: number }>
    comment: string
  }
}

interface CalendarViewProps {
  history: HistoryEntry[]
  loading?: boolean
  onClose: () => void
  onLogout: () => void
}

export function CalendarView({ history, loading = false, onClose, onLogout }: CalendarViewProps) {
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null)
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [hoveredDate, setHoveredDate] = useState<string | null>(null)

  // Group history entries by date (YYYY-MM-DD)
  const entriesByDate = useMemo(() => {
    const map = new Map<string, HistoryEntry[]>()
    for (const entry of history) {
      const dateKey = entry.date.slice(0, 10) // YYYY-MM-DD
      const existing = map.get(dateKey) || []
      existing.push(entry)
      map.set(dateKey, existing)
    }
    // Sort entries within each date by sessionId (newest first)
    for (const [, entries] of map) {
      entries.sort((a, b) => {
        const getTs = (sid: string) => {
          const m = sid.match(/session_(\d+)/)
          return m ? parseInt(m[1], 10) : 0
        }
        return getTs(b.sessionId) - getTs(a.sessionId)
      })
    }
    return map
  }, [history])

  // Calendar generation
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1).getDay() // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const weeks: (number | null)[][] = []
  let week: (number | null)[] = new Array(firstDay).fill(null)

  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day)
    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null)
    weeks.push(week)
  }

  const today = new Date()
  const isToday = (day: number) => day === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  const dateKey = (day: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  // Month navigation bounds: earliest record → today
  const earliestDate = useMemo(() => {
    if (history.length === 0) return null
    const dates = history.map((e) => e.date.slice(0, 10)).sort()
    return dates[0]
  }, [history])

  const canGoPrev = earliestDate
    ? year > parseInt(earliestDate.slice(0, 4)) || (year === parseInt(earliestDate.slice(0, 4)) && month > parseInt(earliestDate.slice(5, 7)) - 1)
    : false
  const canGoNext = year < today.getFullYear() || (year === today.getFullYear() && month < today.getMonth())

  const prevMonth = () => {
    if (canGoPrev) setCurrentDate(new Date(year, month - 1, 1))
  }
  const nextMonth = () => {
    if (canGoNext) setCurrentDate(new Date(year, month + 1, 1))
  }

  const weekdays = ['일', '월', '화', '수', '목', '금', '토']

  const getSessionLabel = (entry: HistoryEntry, index: number) => {
    const ts = entry.sessionId.match(/session_(\d+)/)
    if (ts) {
      const d = new Date(parseInt(ts[1], 10))
      return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')} 세션`
    }
    return `세션 ${index + 1}`
  }

  const renderHighlightedResponse = (content: string, highlights: Array<{ text: string; startIdx: number; endIdx: number }>) => {
    if (!highlights || highlights.length === 0) {
      return content
    }

    const sortedHighlights = [...highlights].sort((a, b) => a.startIdx - b.startIdx)
    const segments: { text: string; highlighted: boolean }[] = []
    let currentIndex = 0

    sortedHighlights.forEach((highlight) => {
      if (currentIndex < highlight.startIdx) {
        segments.push({
          text: content.slice(currentIndex, highlight.startIdx),
          highlighted: false,
        })
      }
      segments.push({
        text: content.slice(highlight.startIdx, highlight.endIdx),
        highlighted: true,
      })
      currentIndex = highlight.endIdx
    })

    if (currentIndex < content.length) {
      segments.push({
        text: content.slice(currentIndex),
        highlighted: false,
      })
    }

    return (
      <>
        {segments.map((segment, index) => (
          <span
            key={index}
            className={segment.highlighted ? 'bg-yellow-100' : ''}
          >
            {segment.text}
          </span>
        ))}
      </>
    )
  }

  return (
    <div
      className="min-h-screen bg-white flex flex-col"
      data-testid="calendar-view"
    >
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              data-testid="calendar-back-button"
              onClick={selectedEntry ? () => setSelectedEntry(null) : onClose}
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-normal tracking-tight text-gray-900">지난 일기</h1>
          </div>
          <Button
            data-testid="calendar-logout-button"
            onClick={onLogout}
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-gray-900"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex justify-center items-stretch pt-4 md:pt-8 px-4 md:px-8 gap-4 md:gap-8 overflow-auto">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-lg">일기를 불러오고 있습니다...</p>
              <p className="text-sm mt-1">잠시만 기다려주세요</p>
            </div>
          </div>
        ) : selectedEntry ? (
          // Detail view - responsive layout
          <div className="w-full max-w-6xl flex flex-col md:flex-row gap-4 md:gap-8 pb-8">
            {selectedEntry.diary && (
              <div className="w-full md:w-[480px] flex flex-col flex-shrink-0">
                <div
                  className="bg-[#ffeaa7] shadow-md p-6"
                  style={{
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
                    minHeight: '240px',
                  }}
                >
                  <div className="prose prose-gray max-w-none">
                    <p className="whitespace-pre-wrap leading-relaxed text-gray-900">{selectedEntry.diary.content}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 flex flex-col">
              <div
                className="bg-white p-4 md:p-8 shadow-sm"
                style={{ minHeight: '240px' }}
              >
                <h2 className="text-sm font-medium text-gray-500 mb-4">어떤 소라고동의 답변</h2>
                {selectedEntry.response ? (
                  <p className="whitespace-pre-wrap leading-relaxed text-gray-900">
                    {renderHighlightedResponse(selectedEntry.response.content, selectedEntry.review?.highlights || [])}
                  </p>
                ) : (
                  <div className="py-16 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <p className="text-lg mb-2">답변을 받지 못했습니다</p>
                      <p className="text-sm">이 일기에 대한 답변이 작성되지 않았습니다</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Calendar grid view
          <div className="w-full max-w-3xl mx-auto py-4">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-8">
              <button
                data-testid="calendar-prev-month"
                onClick={prevMonth}
                disabled={!canGoPrev}
                className={`p-2 transition-colors ${canGoPrev ? 'text-gray-400 hover:text-gray-900' : 'text-gray-200 cursor-not-allowed'}`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2
                className="text-xl font-semibold text-gray-900"
                data-testid="calendar-month-display"
              >
                {year}년 {month + 1}월
              </h2>
              <button
                data-testid="calendar-next-month"
                onClick={nextMonth}
                disabled={!canGoNext}
                className={`p-2 transition-colors ${canGoNext ? 'text-gray-400 hover:text-gray-900' : 'text-gray-200 cursor-not-allowed'}`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-2">
              {weekdays.map((wd, i) => (
                <div
                  key={wd}
                  className={`text-center text-sm py-2 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}
                >
                  {wd}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7">
              {weeks.map((week, wi) =>
                week.map((day, di) => {
                  if (day === null) {
                    return (
                      <div
                        key={`${wi}-${di}`}
                        className="h-20"
                      />
                    )
                  }

                  const dk = dateKey(day)
                  const entries = entriesByDate.get(dk) || []
                  const hasEntries = entries.length > 0
                  const hasParticipated = entries.some((e) => e.participated)
                  const isHovered = hoveredDate === dk
                  const dayOfWeek = di // 0=Sun, 6=Sat

                  return (
                    <div
                      key={dk}
                      className="relative h-20 border-t border-gray-100"
                      onMouseEnter={() => (hasEntries ? setHoveredDate(dk) : undefined)}
                      onMouseLeave={() => setHoveredDate(null)}
                    >
                      <button
                        onClick={() => {
                          if (entries.length === 1) {
                            setSelectedEntry(entries[0])
                          }
                        }}
                        disabled={!hasEntries || entries.length > 1}
                        className={`w-full h-full flex flex-col items-center pt-2 gap-1 transition-colors ${
                          hasEntries ? 'hover:bg-gray-50 cursor-pointer' : ''
                        } ${entries.length > 1 ? '!cursor-default' : ''}`}
                      >
                        <span
                          className={`text-sm w-8 h-8 flex items-center justify-center rounded-full ${
                            isToday(day)
                              ? 'bg-gray-900 text-white font-bold'
                              : dayOfWeek === 0
                                ? 'text-red-400'
                                : dayOfWeek === 6
                                  ? 'text-blue-400'
                                  : 'text-gray-700'
                          }`}
                        >
                          {day}
                        </span>
                        {hasParticipated && (
                          <div className="flex gap-0.5">
                            {entries
                              .filter((e) => e.participated)
                              .map((_, i) => (
                                <div
                                  key={i}
                                  className="w-1.5 h-1.5 rounded-full bg-gray-900"
                                />
                              ))}
                          </div>
                        )}
                      </button>

                      {/* Hover dropdown for multiple entries */}
                      {isHovered && entries.length > 0 && (
                        <div
                          className={`absolute z-50 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[180px] py-1 ${
                            di >= 5 ? 'right-0' : 'left-0'
                          }`}
                        >
                          {entries.map((entry, idx) => (
                            <button
                              key={entry.sessionId}
                              onClick={() => setSelectedEntry(entry)}
                              className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors flex items-center gap-3"
                            >
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${entry.participated ? 'bg-gray-900' : 'bg-gray-300'}`} />
                              <div>
                                <div className="text-sm text-gray-900">{getSessionLabel(entry, idx)}</div>
                                {entry.diary && <div className="text-xs text-gray-400 truncate max-w-[140px]">{entry.diary.content.slice(0, 30)}...</div>}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                }),
              )}
            </div>

            {/* Legend */}
            {history.length === 0 && (
              <div className="text-center text-gray-400 mt-16">
                <p className="text-lg mb-2">아직 참여한 일기가 없습니다</p>
                <p className="text-sm">세션에 참여하면 여기에 기록됩니다</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
