import { useState, useEffect } from 'react'
import { Button } from '@/app/components/ui/button'
import { Card } from '@/app/components/ui/card'
import { Plus, Minus, ChevronRight, Clock, LogOut, RotateCcw } from 'lucide-react'
import * as api from '@/lib/api'

interface ParticipantStatus {
  userId: string
  name: string
  email: string
  completed: boolean
}

interface Session {
  sessionId: string
  status: 'waiting' | 'writing' | 'responding' | 'reviewing' | 'completed'
  participants: string[]
  matches?: Record<string, string>
  timeRemaining?: number
  timeRequests?: string[]
}

interface SessionControlProps {
  session: Session
  statuses: ParticipantStatus[]
  onNextPhase: () => Promise<void>
  onResetSession: () => Promise<void>
  onRefresh: () => Promise<void>
  onLogout: () => void
}

export function SessionControl({ session, statuses, onNextPhase, onResetSession, onRefresh, onLogout }: SessionControlProps) {
  const [isAdvancing, setIsAdvancing] = useState(false)
  const [isAdjustingTimer, setIsAdjustingTimer] = useState(false)
  const [clientTime, setClientTime] = useState(session.timeRemaining || 0)

  // Check auth token on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    console.log('=== SessionControl: Auth Check ===')
    console.log('Auth token exists:', !!token)

    if (!token) {
      console.error('⚠️ WARNING: No auth token found! Admin needs to re-login.')
      alert('인증 토큰이 만료되었습니다. 다시 로그인해주세요.')
      onLogout()
    }
  }, [onLogout])

  // Update client time when session changes
  useEffect(() => {
    setClientTime(session.timeRemaining || 0)
  }, [session.timeRemaining])

  // Countdown timer - decrease by 1 every second
  useEffect(() => {
    const timer = setInterval(() => {
      setClientTime((prevTime) => Math.max(0, prevTime - 1))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Auto-refresh statuses every 5 seconds
    const interval = setInterval(() => {
      onRefresh()
    }, 5000)

    return () => clearInterval(interval)
  }, [onRefresh])

  const adjustTime = async (delta: number) => {
    if (isAdjustingTimer) return

    setIsAdjustingTimer(true)

    console.log('=== Adjusting timer ===')
    console.log('Current client time:', clientTime)
    console.log('Current server time:', session.timeRemaining)
    console.log('Delta:', delta)

    try {
      // Calculate new time based on current client display
      const newTime = Math.max(0, clientTime + delta)

      console.log('New time to set:', newTime)

      // Update server
      await api.updateSessionTimer(newTime)
      console.log('Timer updated successfully on server')

      // Immediately update local state
      setClientTime(newTime)
      console.log('Client time updated to:', newTime)

      // Refresh session data in background
      await onRefresh()
      console.log('Session refreshed')
    } catch (error) {
      console.error('Failed to update timer:', error)
    } finally {
      setIsAdjustingTimer(false)
    }
  }

  const completedCount = statuses.filter((s) => s.completed).length
  const totalCount = statuses.length

  const minutes = Math.floor(clientTime / 60)
  const seconds = clientTime % 60

  const statusLabels = {
    waiting: '대기 중',
    writing: '일기 작성 중',
    responding: '답변 작성 중',
    reviewing: '리뷰 작성 중',
    completed: '완료',
  }

  const canAdvance = session.status !== 'completed'

  const handleNextPhase = async () => {
    if (isAdvancing) return

    console.log('=== Next Phase Button Clicked ===')
    console.log('Current session status:', session.status)
    console.log('Can advance:', canAdvance)

    setIsAdvancing(true)
    try {
      await onNextPhase()
    } catch (error) {
      console.error('Next phase error in SessionControl:', error)
    } finally {
      setIsAdvancing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa] p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with logout */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-normal tracking-tight text-gray-900">세션 관리</h1>
            <p className="text-sm text-gray-500 mt-1">{statusLabels[session.status]}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleNextPhase}
              disabled={!canAdvance || isAdvancing}
              className="bg-black hover:bg-gray-800 text-white gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isAdvancing ? '처리 중...' : '다음 단계로'}
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              onClick={onResetSession}
              variant="outline"
              className="gap-2 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
            >
              <RotateCcw className="w-4 h-4" />
              세션 초기화
            </Button>
            <button
              onClick={onLogout}
              className="text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-2 text-sm px-3 py-2"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </button>
          </div>
        </div>

        {/* Timer control */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Clock className="w-5 h-5 text-gray-500" />
              <div className="text-3xl font-light font-mono text-gray-900">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => adjustTime(-30)}
                variant="outline"
                size="icon"
                className="border-gray-200"
                disabled={isAdjustingTimer}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => adjustTime(30)}
                variant="outline"
                size="icon"
                className="border-gray-200"
                disabled={isAdjustingTimer}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
          {/* Time request banner */}
          {session.timeRequests && session.timeRequests.length > 0 && (
            <div className="mt-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-amber-800">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium">{session.timeRequests.length}명이 시간 연장을 요청했습니다</span>
            </div>
          )}
        </Card>

        {/* Progress */}
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-normal text-gray-900">진행 현황</h2>
              <span className="text-sm text-gray-500">
                {completedCount} / {totalCount} 완료
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-black h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Participant statuses */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statuses.map((status) => (
            <Card
              key={status.userId}
              className={`p-4 transition-all duration-200 ${
                status.completed
                  ? 'bg-black text-white border-black'
                  : session.timeRequests?.includes(status.userId)
                    ? 'bg-white border-amber-400 border-2'
                    : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className={`font-normal ${status.completed ? 'text-white' : 'text-gray-900'}`}>{status.name}</h3>
                  <p className={`text-xs ${status.completed ? 'text-gray-300' : 'text-gray-500'}`}>{status.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {!status.completed && session.timeRequests?.includes(status.userId) && <span className="text-xs text-amber-600 font-medium">시간 요청</span>}
                  {status.completed && <span className="text-xs text-gray-300">완료</span>}
                  <div className={`w-3 h-3 rounded-full ${status.completed ? 'bg-white' : 'bg-gray-300'}`} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Matching visualization (only during responding phase) */}
        {session.status === 'responding' && session.matches && (
          <Card className="p-6">
            <h2 className="text-lg font-normal text-gray-900 mb-6">매칭 현황</h2>

            {/* Polygon visualization */}
            <div className="flex justify-center mb-6">
              <div className="relative w-[600px] h-[600px]">
                <svg
                  className="absolute inset-0"
                  width="600"
                  height="600"
                >
                  {/* Draw match lines with arrows */}
                  {Object.entries(session.matches).map(([userId, targetId]) => {
                    const userIndex = statuses.findIndex((s) => s.userId === userId)
                    const targetIndex = statuses.findIndex((s) => s.userId === targetId)

                    if (userIndex === -1 || targetIndex === -1) return null

                    const angle = (2 * Math.PI) / statuses.length
                    const radius = 200

                    const x1 = 300 + radius * Math.cos(angle * userIndex - Math.PI / 2)
                    const y1 = 300 + radius * Math.sin(angle * userIndex - Math.PI / 2)
                    const x2 = 300 + radius * Math.cos(angle * targetIndex - Math.PI / 2)
                    const y2 = 300 + radius * Math.sin(angle * targetIndex - Math.PI / 2)

                    // Calculate direction vector
                    const dx = x2 - x1
                    const dy = y2 - y1
                    const length = Math.sqrt(dx * dx + dy * dy)

                    // Circle radius is 55px (110px diameter / 2)
                    const circleRadius = 55

                    // Start from edge of first circle
                    const x1Start = x1 + (dx / length) * circleRadius
                    const y1Start = y1 + (dy / length) * circleRadius

                    // End at edge of second circle
                    const x2End = x2 - (dx / length) * circleRadius
                    const y2End = y2 - (dy / length) * circleRadius

                    return (
                      <g key={`${userId}-${targetId}`}>
                        <line
                          x1={x1Start}
                          y1={y1Start}
                          x2={x2End}
                          y2={y2End}
                          stroke="#000000"
                          strokeWidth={3}
                          markerEnd={`url(#arrowhead-${userId})`}
                        />
                      </g>
                    )
                  })}

                  {/* Arrow marker definitions - one per match for uniqueness */}
                  <defs>
                    {Object.entries(session.matches).map(([userId]) => (
                      <marker
                        key={`marker-${userId}`}
                        id={`arrowhead-${userId}`}
                        markerWidth="8"
                        markerHeight="8"
                        refX="7"
                        refY="4"
                        orient="auto"
                      >
                        <polygon
                          points="0 0, 8 4, 0 8"
                          fill="#000000"
                        />
                      </marker>
                    ))}
                  </defs>
                </svg>

                {/* Draw user nodes */}
                {statuses.map((status, i) => {
                  const angle = (2 * Math.PI) / statuses.length
                  const radius = 200
                  const x = 300 + radius * Math.cos(angle * i - Math.PI / 2)
                  const y = 300 + radius * Math.sin(angle * i - Math.PI / 2)

                  return (
                    <div
                      key={status.userId}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2"
                      style={{ left: x, top: y }}
                    >
                      <div
                        className={`transition-all ${
                          status.completed ? 'bg-black text-white border-black' : 'bg-white text-gray-900 border-gray-200'
                        } border-2 rounded-full w-[110px] h-[110px] flex flex-col items-center justify-center shadow-sm px-2`}
                      >
                        <span className="text-xs font-medium leading-tight text-center break-all px-1">{status.name}</span>
                        <span className={`text-[10px] leading-tight text-center break-all mt-1 px-1 ${status.completed ? 'text-gray-300' : 'text-gray-500'}`}>
                          {status.email}
                        </span>
                        {status.completed && <span className={`text-[9px] mt-1 ${status.completed ? 'text-gray-400' : 'text-gray-500'}`}>완료</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-400">화살표는 누가 누구의 일기를 읽고 답변을 작성하는지 나타냅니다</p>
              <p className="text-xs text-gray-400 mt-1">A → B는 A가 B의 일기에 답변을 작성한다는 의미입니다</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
