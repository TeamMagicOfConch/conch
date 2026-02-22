import { useState, useMemo, useCallback } from 'react'
import { Button } from '@/app/components/ui/button'
import { ScrollArea } from '@/app/components/ui/scroll-area'
import { Card } from '@/app/components/ui/card'
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'

interface HistoryEntry {
  userId: string
  userName: string
  userEmail: string
  diary?: { content: string; completedAt: string }
  response?: {
    content: string
    respondentId: string
    respondentName: string
    completedAt: string
  }
  review?: {
    highlights: Array<{ text: string; startIdx: number; endIdx: number }>
    comment: string
    completedAt: string
  }
}

interface SessionHistory {
  sessionId: string
  date: string
  entries: HistoryEntry[]
}

interface AdminCalendarViewProps {
  history: SessionHistory[]
  loading?: boolean
  onClose: () => void
  onLogout: () => void
}

type ViewMode = 'calendar' | 'date-detail' | 'user-detail'

export function AdminCalendarView({ history, loading = false, onClose, onLogout }: AdminCalendarViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('calendar')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [currentDate, setCurrentDate] = useState(() => new Date())

  // Group sessions by date
  const sessionsByDate = useMemo(() => {
    const map = new Map<string, SessionHistory[]>()
    for (const session of history) {
      const dateKey = session.date.slice(0, 10)
      const existing = map.get(dateKey) || []
      existing.push(session)
      map.set(dateKey, existing)
    }
    // Sort sessions within each date (newest first)
    for (const [, sessions] of map) {
      sessions.sort((a, b) => {
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
  const firstDay = new Date(year, month, 1).getDay()
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
    const dates = history.map((s) => s.date.slice(0, 10)).sort()
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

  // Get all sessions for a date
  const getSessionsForDate = useCallback((dk: string): SessionHistory[] => sessionsByDate.get(dk) || [], [sessionsByDate])

  // Get unique participants count for a date
  const getParticipantCount = (dk: string): number => {
    const sessions = getSessionsForDate(dk)
    const allEntries = sessions.flatMap((s) => s.entries)
    return new Set(allEntries.filter((e) => e.diary).map((e) => e.userId)).size
  }

  // Get selected entry
  const selectedEntry = useMemo(() => {
    if (!selectedDate || !selectedSessionId || !selectedUserId) return null
    const sessions = getSessionsForDate(selectedDate)
    const session = sessions.find((s) => s.sessionId === selectedSessionId)
    if (!session) return null
    return session.entries.find((e) => e.userId === selectedUserId) || null
  }, [getSessionsForDate, selectedDate, selectedSessionId, selectedUserId])

  const formatDate = (dk: string) => {
    const [y, m, d] = dk.split('-')
    return `${y}년 ${parseInt(m)}월 ${parseInt(d)}일`
  }

  const renderHighlightedResponse = (content: string, highlights: Array<{ text: string; startIdx: number; endIdx: number }>) => {
    if (!highlights || highlights.length === 0) return content

    const sorted = [...highlights].sort((a, b) => a.startIdx - b.startIdx)
    const segments: { text: string; highlighted: boolean }[] = []
    let idx = 0

    sorted.forEach((h) => {
      if (idx < h.startIdx) {
        segments.push({ text: content.slice(idx, h.startIdx), highlighted: false })
      }
      segments.push({ text: content.slice(h.startIdx, h.endIdx), highlighted: true })
      idx = h.endIdx
    })

    if (idx < content.length) {
      segments.push({ text: content.slice(idx), highlighted: false })
    }

    return (
      <>
        {segments.map((seg, i) => (
          <span
            key={i}
            className={seg.highlighted ? 'bg-yellow-100' : ''}
          >
            {seg.text}
          </span>
        ))}
      </>
    )
  }

  // === CALENDAR VIEW ===
  if (viewMode === 'calendar') {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white">
          <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-normal tracking-tight text-gray-900">히스토리</h1>
            </div>
            <button
              onClick={onLogout}
              className="text-gray-400 hover:text-gray-600 transition-colors text-sm px-3 py-2"
            >
              로그아웃
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-lg">히스토리를 불러오고 있습니다...</p>
              <p className="text-sm mt-1">데이터가 많을 경우 시간이 걸릴 수 있습니다</p>
            </div>
          </div>
        ) : (
          /* Calendar */
          <div className="flex-1 flex justify-center pt-8 px-8">
            <div className="w-full max-w-3xl">
              {/* Month navigation */}
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={prevMonth}
                  disabled={!canGoPrev}
                  className={`p-2 transition-colors ${canGoPrev ? 'text-gray-400 hover:text-gray-900' : 'text-gray-200 cursor-not-allowed'}`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-semibold text-gray-900">
                  {year}년 {month + 1}월
                </h2>
                <button
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
                {weeks.map((w, wi) =>
                  w.map((day, di) => {
                    if (day === null)
                      return (
                        <div
                          key={`${wi}-${di}`}
                          className="h-20"
                        />
                      )

                    const dk = dateKey(day)
                    const count = getParticipantCount(dk)

                    return (
                      <div
                        key={dk}
                        className="relative h-20 border-t border-gray-100"
                      >
                        <button
                          onClick={() => {
                            if (count > 0) {
                              setSelectedDate(dk)
                              setViewMode('date-detail')
                            }
                          }}
                          disabled={count === 0}
                          className={`w-full h-full flex flex-col items-center pt-2 gap-1 transition-colors ${
                            count > 0 ? 'hover:bg-gray-100 cursor-pointer' : ''
                          }`}
                        >
                          <span
                            className={`text-sm w-8 h-8 flex items-center justify-center rounded-full ${
                              isToday(day) ? 'bg-gray-900 text-white font-bold' : di === 0 ? 'text-red-400' : di === 6 ? 'text-blue-400' : 'text-gray-700'
                            }`}
                          >
                            {day}
                          </span>
                          {count > 0 && <span className="text-xs text-gray-500 font-medium">{count}명</span>}
                        </button>
                      </div>
                    )
                  }),
                )}
              </div>

              {history.length === 0 && (
                <div className="text-center text-gray-400 mt-16">
                  <p className="text-lg mb-2">아직 완료된 세션이 없습니다</p>
                  <p className="text-sm">세션이 완료되면 여기에 기록됩니다</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // === DATE DETAIL VIEW ===
  if (viewMode === 'date-detail' && selectedDate) {
    const sessions = getSessionsForDate(selectedDate)
    const allEntries = sessions.flatMap((s) => s.entries.map((e) => ({ ...e, sessionId: s.sessionId })))

    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white">
          <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                onClick={() => {
                  setViewMode('calendar')
                  setSelectedDate(null)
                  setSelectedSessionId(null)
                  setSelectedUserId(null)
                }}
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-normal tracking-tight text-gray-900">{formatDate(selectedDate)}</h1>
                <p className="text-sm text-gray-500 mt-0.5">{allEntries.filter((e) => e.diary).length}명 참여</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="text-gray-400 hover:text-gray-600 transition-colors text-sm px-3 py-2"
            >
              로그아웃
            </button>
          </div>
        </div>

        {/* Participant cards */}
        <div className="flex-1 px-8 py-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allEntries.map((entry) => (
              <Card
                key={`${entry.sessionId}-${entry.userId}`}
                className="p-5 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedSessionId(entry.sessionId)
                  setSelectedUserId(entry.userId)
                  setViewMode('user-detail')
                }}
              >
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium text-gray-900">{entry.userName}</h3>
                    <p className="text-xs text-gray-500">{entry.userEmail}</p>
                  </div>

                  {entry.diary && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {entry.diary.content.slice(0, 60)}
                      {entry.diary.content.length > 60 ? '...' : ''}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // === USER DETAIL VIEW ===
  if (viewMode === 'user-detail' && selectedDate && selectedEntry) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white">
          <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                onClick={() => {
                  setViewMode('date-detail')
                  setSelectedSessionId(null)
                  setSelectedUserId(null)
                }}
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-normal tracking-tight text-gray-900">{selectedEntry.userName}</h1>
                <p className="text-sm text-gray-500 mt-0.5">{formatDate(selectedDate)}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="text-gray-400 hover:text-gray-600 transition-colors text-sm px-3 py-2"
            >
              로그아웃
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-4 md:px-8 py-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Diary + Response split */}
            <div className="flex flex-col md:flex-row gap-6">
              {/* Diary */}
              <div className="flex-1 space-y-2">
                <h2 className="text-sm font-medium text-gray-600">일기</h2>
                {selectedEntry.diary ? (
                  <ScrollArea
                    className="bg-[#ffeaa7] shadow-md p-6 max-h-[600px]"
                    style={{
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
                    }}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed text-gray-900">{selectedEntry.diary.content}</p>
                  </ScrollArea>
                ) : (
                  <div className="bg-gray-100 rounded-lg p-6 text-center text-gray-400">일기를 작성하지 않았습니다</div>
                )}
              </div>

              {/* Response */}
              <div className="flex-1 space-y-2">
                <h2 className="text-sm font-medium text-gray-600">
                  받은 답변
                  {selectedEntry.response && <span className="text-gray-400 font-normal ml-2">from {selectedEntry.response.respondentName}</span>}
                </h2>
                {selectedEntry.response ? (
                  <ScrollArea className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 max-h-[600px]">
                    <p className="whitespace-pre-wrap leading-relaxed text-gray-900">
                      {renderHighlightedResponse(selectedEntry.response.content, selectedEntry.review?.highlights || [])}
                    </p>
                  </ScrollArea>
                ) : (
                  <div className="bg-gray-100 rounded-lg p-6 text-center text-gray-400">답변을 받지 못했습니다</div>
                )}
              </div>
            </div>

            {/* Review comment */}
            {selectedEntry.review && (
              <div className="space-y-2">
                <h2 className="text-sm font-medium text-gray-600">리뷰 코멘트</h2>
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                  <p className="whitespace-pre-wrap leading-relaxed text-gray-700">{selectedEntry.review.comment}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Fallback
  return null
}
