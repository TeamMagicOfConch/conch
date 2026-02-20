import { useEffect, useState, useCallback } from 'react'
import { AuthForm } from '@/app/components/AuthForm'
import { WaitingRoom } from '@/app/components/WaitingRoom'
import { DiaryEditor } from '@/app/components/DiaryEditor'
import { ResponseEditor } from '@/app/components/ResponseEditor'
import { ReviewEditor } from '@/app/components/ReviewEditor'
import { ReviewWriting } from '@/app/components/user/ReviewWriting'
import { CalendarView } from '@/app/components/CalendarView'
import { AdminWaitingRoom } from '@/app/components/admin/AdminWaitingRoom'
import { MatchingConfig } from '@/app/components/admin/MatchingConfig'
import { SessionControl } from '@/app/components/admin/SessionControl'
import { AdminCalendarView } from '@/app/components/admin/AdminCalendarView'
import { UITestPage } from '@/app/components/UITestPage'
import { Button } from '@/app/components/ui/button'
import { toast } from 'sonner'
import * as api from '@/lib/api'
import { projectId, publicAnonKey } from '/utils/supabase/info'

// Enable UI test mode by adding ?test to the URL
const isTestMode = window.location.search.includes('test')

type UserData = {
  userId: string
  email: string
  name: string
  isAdmin: boolean
}

type Session = {
  sessionId: string
  date: string
  status: 'waiting' | 'writing' | 'responding' | 'reviewing' | 'completed'
  participants: string[]
  matches?: Record<string, string>
  startedAt: string | null
  timeRemaining?: number // in seconds
  matchingWarning?: boolean // True if matching constraints couldn't be met
  timeRequests?: string[] // User IDs who requested more time
}

type AppState =
  | { view: 'auth' }
  | { view: 'waiting' }
  | { view: 'writing' }
  | { view: 'responding' }
  | { view: 'reviewing' }
  | { view: 'calendar' }
  | { view: 'admin-waiting' }
  | { view: 'admin-matching' }
  | { view: 'admin-control' }
  | { view: 'admin-calendar' }

export default function App() {
  // Show UI test page if ?test is in URL
  if (isTestMode) {
    return <UITestPage />
  }

  const [user, setUser] = useState<UserData | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [state, setState] = useState<AppState>({ view: 'auth' })
  const [isInitializing, setIsInitializing] = useState(true)

  const loadCurrentSession = useCallback(async () => {
    try {
      console.log('=== loadCurrentSession called ===')
      const { session: currentSession } = await api.getCurrentSession()
      console.log('Fetched session:', currentSession)
      setSession(currentSession)

      if (!currentSession) {
        console.log('No current session')
        // Only update view if we're currently in a session-related view
        if (user?.isAdmin) {
          setState((prev) => {
            // Don't override admin-matching view
            if (prev.view === 'admin-matching' || prev.view === 'admin-calendar') return prev
            return { view: 'admin-waiting' }
          })
        } else {
          setState((prev) => {
            // Don't override calendar view
            if (prev.view === 'calendar') return prev
            return { view: 'waiting' }
          })
        }
        return
      }

      console.log('Session participants:', currentSession.participants)
      console.log('Session status:', currentSession.status)

      // Update state based on session status and user role
      // BUT don't override admin-matching view
      if (user?.isAdmin) {
        setState((prev) => {
          // Don't override admin-matching or admin-calendar view
          if (prev.view === 'admin-matching' || prev.view === 'admin-calendar') return prev

          if (currentSession.status === 'waiting') {
            return { view: 'admin-waiting' }
          } else if (currentSession.status === 'writing' || currentSession.status === 'responding' || currentSession.status === 'reviewing') {
            return { view: 'admin-control' }
          } else {
            // completed or other status - go back to waiting
            return { view: 'admin-waiting' }
          }
        })
      } else {
        setState((prev) => {
          // Don't override calendar view
          if (prev.view === 'calendar') return prev

          console.log('🔍 Setting user view based on session status:', currentSession.status)
          console.log('🔍 Previous view:', prev.view)

          switch (currentSession.status) {
            case 'waiting':
              console.log('🔍 → Setting view to: waiting')
              return { view: 'waiting' }
            case 'writing':
              console.log('🔍 → Setting view to: writing')
              return { view: 'writing' }
            case 'responding':
              console.log('🔍 → Setting view to: responding')
              return { view: 'responding' }
            case 'reviewing':
              console.log('🔍 → Setting view to: reviewing')
              return { view: 'reviewing' }
            case 'completed':
              console.log('🔍 → Setting view to: waiting (from completed)')
              return { view: 'waiting' } // completed 상태에서도 대기실로
            default:
              console.log('🔍 → Keeping previous view:', prev.view)
              return prev
          }
        })
      }
    } catch (error) {
      console.error('Load session error:', error)
      // Don't throw - just set to waiting view if not already in a specific view
      setState((prev) => {
        // Don't override special views
        if (prev.view === 'admin-matching' || prev.view === 'admin-calendar' || prev.view === 'calendar') return prev

        if (user?.isAdmin) {
          return { view: 'admin-waiting' }
        } else {
          return { view: 'waiting' }
        }
      })
    }
  }, [user])

  // Poll session every 3 seconds to keep participant count updated
  useEffect(() => {
    if (!user) return

    console.log('Starting session polling...')
    const interval = setInterval(() => {
      console.log('Polling session...')
      loadCurrentSession()
    }, 3000)

    return () => {
      console.log('Stopping session polling')
      clearInterval(interval)
    }
  }, [user, loadCurrentSession])

  // Auto-leave session when window/tab closes
  useEffect(() => {
    if (!user) return

    const handleBeforeUnload = () => {
      try {
        console.log('Window closing, leaving session...')
        // Call leaveSession synchronously before page unload
        const token = localStorage.getItem('auth_token')
        if (token) {
          // Use fetch with keepalive for better reliability during unload
          fetch(`https://${projectId}.supabase.co/functions/v1/make-server-1d29bb00/session/leave`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${publicAnonKey}`,
              'X-User-Token': token,
            },
            keepalive: true, // Important: ensures request completes even after page unload
          }).catch((err) => {
            console.error('Failed to leave session on unload:', err)
          })
        }
      } catch (error) {
        console.error('Error leaving session on unload:', error)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [user])

  // Auth handlers
  const handleSignIn = async (email: string) => {
    try {
      const result = await api.signInSimple(email)
      localStorage.setItem('auth_token', result.token)

      setUser(result.user)
      toast.success(`환영합니다, ${result.user.name}님!`)

      // Auto-join session after sign in (only for non-admin users)
      if (!result.user.isAdmin) {
        try {
          const { session: joinedSession } = await api.joinSession()
          setSession(joinedSession)
          setState({ view: 'waiting' })
        } catch (joinError) {
          console.error('Auto-join session error:', joinError)
          // Still load current session even if join fails
          await loadCurrentSession()
        }
      } else {
        // Admin: just load current session without joining
        await loadCurrentSession()
      }
    } catch (error: any) {
      console.error('Sign in error:', error)
      toast.error(error.message || '로그인 실패')
      throw error
    }
  }

  const handleLogout = async () => {
    console.log('=== Logout started ===')
    try {
      // Leave session before logging out
      console.log('Calling leaveSession API...')
      const result = await api.leaveSession()
      console.log('leaveSession result:', result)
    } catch (error) {
      console.error('Leave session error:', error)
      // Continue with logout even if leave session fails
    }

    console.log('Clearing auth token and user state...')
    localStorage.removeItem('auth_token')
    setUser(null)
    setState({ view: 'auth' })
    toast.success('로그아웃되었습니다')
    console.log('=== Logout complete ===')
  }

  const handleJoinSession = async () => {
    try {
      const { session: joinedSession } = await api.joinSession()
      setSession(joinedSession)
      if (user?.isAdmin) {
        setState({ view: 'admin-waiting' })
      } else {
        setState({ view: 'waiting' })
      }
    } catch (error: any) {
      console.error('Join session error:', error)
      toast.error('세션 참여 실패')
    }
  }

  // User handlers
  const handleWriteDiary = async (content: string) => {
    try {
      await api.writeDiary(content)
      await loadCurrentSession()
    } catch (error: any) {
      console.error('Write diary error:', error)
      toast.error('일기 저장 실패')
    }
  }

  const handleWriteResponse = async (content: string) => {
    try {
      const { diary } = await api.getAssignedDiary()
      await api.writeResponse(diary.diaryId, content)
      toast.success('답변이 저장되었습니다')
      await loadCurrentSession()
    } catch (error: any) {
      console.error('Write response error:', error)
      toast.error('답변 저장 실패')
    }
  }

  const handleWriteReview = async (highlights: Array<{ text: string; startIdx: number; endIdx: number }>, comment: string) => {
    try {
      const { response } = await api.getMyDiaryResponse()
      await api.writeReview(response.responseId, highlights, comment)
      toast.success('리뷰가 저장되었습니다')
      await loadCurrentSession()
    } catch (error: any) {
      console.error('Write review error:', error)
      toast.error('리뷰 저장 실패')
    }
  }

  // Admin handlers
  const handleStartSession = async () => {
    try {
      await api.startSession()
      toast.success('세션이 시작되었습니다')
      await loadCurrentSession()
    } catch (error: any) {
      console.error('Start session error:', error)
      toast.error('세션 시작 실패')
    }
  }

  const handleNextPhase = async () => {
    try {
      console.log('=== App.tsx: handleNextPhase called ===')

      const token = localStorage.getItem('auth_token')
      console.log('Auth token check:', token ? 'EXISTS' : 'MISSING')

      if (!token) {
        console.error('⚠️ No auth token! Aborting next phase.')
        toast.error('인증 토큰이 없습니다. 다시 로그인해주세요.')
        handleLogout()
        return
      }

      console.log('Calling api.nextPhase()...')
      const result = await api.nextPhase()
      console.log('api.nextPhase() result:', result)

      toast.success('다음 단계로 이동했습니다')

      console.log('Reloading session...')
      await loadCurrentSession()
      console.log('Session reloaded')
    } catch (error: any) {
      console.error('Next phase error:', error)
      toast.error('단계 이동 실패: ' + (error.message || '알 수 없는 오류'))
    }
  }

  const handleForceEnd = async () => {
    try {
      console.log('=== App.tsx: handleForceEnd called ===')

      // Advance through all remaining phases until completed
      let attempts = 0
      const maxAttempts = 5
      while (attempts < maxAttempts) {
        attempts++
        console.log(`Force end: advancing phase (attempt ${attempts})...`)
        const result = await api.nextPhase()
        console.log('Phase advance result:', result)

        if (result.session?.status === 'completed') {
          break
        }
      }

      toast.success('세션이 강제 종료되었습니다')
      await loadCurrentSession()
    } catch (error: any) {
      console.error('Force end error:', error)
      toast.error('세션 강제 종료 실패: ' + (error.message || '알 수 없는 오류'))
    }
  }

  const handleResetSession = async () => {
    if (!confirm('세션을 초기화하시겠습니까?\n모든 세션 데이터가 초기화됩니다.')) {
      return
    }
    try {
      await api.resetSession()
      toast.success('세션이 초기화되었습니다')
      await loadCurrentSession()
    } catch (error: any) {
      console.error('Reset session error:', error)
      toast.error('세션 초기화 실패: ' + (error.message || '알 수 없는 오류'))
    }
  }

  const handleRequestTime = async () => {
    try {
      await api.requestMoreTime()
    } catch (error: any) {
      // Silently handle "already requested" case
      if (!error.message?.includes('Already requested')) {
        console.error('Request time error:', error)
        toast.error('시간 요청 실패')
      }
    }
  }

  const handleSaveMatching = async (excludedPairs: string[][]) => {
    try {
      console.log('=== App.tsx: handleSaveMatching called ===')
      console.log('Excluded pairs to save:', excludedPairs)
      console.log('Pairs count:', excludedPairs.length)

      await api.setMatchingExclusions(excludedPairs)

      console.log('✓ API call completed successfully')
      toast.success('매칭 설정이 저장되었습니다')
      // Don't change view - stay on matching config screen
      // setState({ view: 'admin-waiting' });
    } catch (error: any) {
      console.error('❌ Save matching error:', error)
      console.error('Error message:', error.message)
      toast.error('매칭 설정 저장 실패: ' + error.message)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      await api.deleteUser(userId)
      toast.success('사용자가 삭제되었습니다')
      // Reload the matching config view to reflect the deletion
      await loadCurrentSession()
    } catch (error: any) {
      console.error('Delete user error:', error)
      toast.error('사용 삭제 실패')
      throw error
    }
  }

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('Initializing auth...')

        const storedToken = localStorage.getItem('auth_token')
        console.log('Token in localStorage:', storedToken ? `${storedToken.substring(0, 20)}...` : 'NONE')

        if (storedToken) {
          console.log('Token found, loading user data...')
          try {
            const { user: userData } = await api.getUserData()
            console.log('User data loaded:', userData)
            setUser(userData)

            // Auto-join session after loading user (only for non-admin)
            if (!userData.isAdmin) {
              try {
                console.log('Auto-joining session...')
                const { session: joinedSession } = await api.joinSession()
                setSession(joinedSession)
                console.log('Joined session:', joinedSession)

                switch (joinedSession?.status) {
                  case 'waiting':
                    setState({ view: 'waiting' })
                    break
                  case 'writing':
                    setState({ view: 'writing' })
                    break
                  case 'responding':
                    setState({ view: 'responding' })
                    break
                  case 'reviewing':
                    setState({ view: 'reviewing' })
                    break
                  case 'completed':
                    setState({ view: 'waiting' }) // completed 상태에서도 대기실로
                    break
                  default:
                    setState({ view: 'waiting' })
                }
              } catch (joinError) {
                console.error('Auto-join session error:', joinError)
                // Still load current session even if join fails
                await loadCurrentSession()
              }
            } else {
              // Admin: just load current session without joining
              console.log('Admin user, loading current session...')
              await loadCurrentSession()
            }
          } catch (error) {
            console.error('Load user data error:', error)
            localStorage.removeItem('auth_token')
            setState({ view: 'auth' })
          }
        } else {
          console.log('No token found, showing auth screen')
          setState({ view: 'auth' })
        }
      } catch (error) {
        console.error('Init auth error:', error)
        setState({ view: 'auth' })
      } finally {
        setIsInitializing(false)
      }
    }

    initAuth()
  }, [])

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-gray-400">로딩 중...</div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm onSignIn={handleSignIn} />
  }

  // User views
  if (!user.isAdmin) {
    switch (state.view) {
      case 'waiting':
        return (
          <WaitingRoomWrapper
            currentUserId={user.userId}
            onViewCalendar={() => setState({ view: 'calendar' })}
            onLogout={handleLogout}
          />
        )

      case 'writing':
        return (
          <DiaryEditor
            onSubmit={handleWriteDiary}
            onLogout={handleLogout}
            defaultTime={session?.timeRemaining}
            showMatchingWarning={session?.matchingWarning}
            hasRequestedTime={session?.timeRequests?.includes(user.userId) || false}
            onRequestTime={handleRequestTime}
          />
        )

      case 'responding':
        return (
          <ResponseEditorWrapper
            onSubmit={handleWriteResponse}
            onLogout={handleLogout}
            onError={() => toast.error('일기를 불러올 수 없습니다')}
            defaultTime={session?.timeRemaining}
            hasRequestedTime={session?.timeRequests?.includes(user.userId) || false}
            onRequestTime={handleRequestTime}
          />
        )

      case 'reviewing':
        return (
          <ReviewEditorWrapper
            onSubmit={handleWriteReview}
            onLogout={handleLogout}
            onError={() => toast.error('답변을 불러올 수 없습니다')}
            defaultTime={session?.timeRemaining}
            hasRequestedTime={session?.timeRequests?.includes(user.userId) || false}
            onRequestTime={handleRequestTime}
          />
        )

      case 'calendar':
        return (
          <CalendarViewWrapper
            onClose={() => setState({ view: 'waiting' })}
            onLogout={handleLogout}
            onError={() => toast.error('히스토리를 불러올 수 없습니다')}
          />
        )

      default:
        console.log('Unexpected view for user:', state.view)
        return (
          <WaitingRoomWrapper
            currentUserId={user.userId}
            onViewCalendar={() => setState({ view: 'calendar' })}
            onLogout={handleLogout}
          />
        )
    }
  }

  // Admin views
  if (user.isAdmin) {
    switch (state.view) {
      case 'admin-waiting':
        return (
          <AdminWaitingRoomWrapper
            onStartSession={handleStartSession}
            onOpenMatching={() => setState({ view: 'admin-matching' })}
            onResetSession={handleResetSession}
            onViewUserHistory={() => setState({ view: 'admin-calendar' })}
            onLogout={handleLogout}
            onError={() => toast.error('참여자 목록을 불러올 수 없습니다')}
          />
        )

      case 'admin-calendar':
        return (
          <AdminCalendarViewWrapper
            onClose={() => setState({ view: 'admin-waiting' })}
            onLogout={handleLogout}
            onError={() => toast.error('히스토리를 불러올 수 없습니다')}
          />
        )

      case 'admin-matching':
        return (
          <MatchingConfigWrapper
            onSave={handleSaveMatching}
            onDeleteUser={handleDeleteUser}
            onClose={() => setState({ view: 'admin-waiting' })}
            onLogout={handleLogout}
            onError={() => toast.error('매칭 설정을 불러올 수 없습니다')}
          />
        )

      case 'admin-control':
        return (
          <SessionControlWrapper
            session={session!}
            onNextPhase={handleNextPhase}
            onResetSession={handleResetSession}
            onRefresh={loadCurrentSession}
            onLogout={handleLogout}
            onError={() => toast.error('세션 정보를 불러올 수 없습니다')}
          />
        )

      default:
        console.log('Unexpected view for admin:', state.view)
        return (
          <AdminWaitingRoomWrapper
            onStartSession={handleStartSession}
            onOpenMatching={() => setState({ view: 'admin-matching' })}
            onResetSession={handleResetSession}
            onViewUserHistory={() => setState({ view: 'admin-calendar' })}
            onLogout={handleLogout}
            onError={() => toast.error('참여자 목록을 불러올 수 없습니다')}
          />
        )
    }
  }

  // Final fallback (should never reach here)
  console.error('Unexpected app state:', { user, state })
  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="text-gray-900">예상치 못한 오류가 발생했습니다</div>
        <Button
          onClick={handleLogout}
          className="bg-black hover:bg-gray-800 text-white"
        >
          로그아웃
        </Button>
      </div>
    </div>
  )
}

// Wrapper components for data fetching
function ResponseEditorWrapper({
  onSubmit,
  onLogout,
  onError,
  defaultTime,
  hasRequestedTime,
  onRequestTime,
}: {
  onSubmit: (content: string) => Promise<void>
  onLogout: () => void
  onError: () => void
  defaultTime?: number
  hasRequestedTime: boolean
  onRequestTime: () => Promise<void>
}) {
  const [diary, setDiary] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    // Only load once to prevent losing user's writing
    if (hasLoaded) return

    const load = async () => {
      try {
        console.log('=== ResponseEditorWrapper: Loading assigned diary ===')
        setError(null)
        const { diary } = await api.getAssignedDiary()
        console.log('ResponseEditorWrapper: Diary loaded:', diary)
        setDiary(diary)
        setHasLoaded(true)
      } catch (error: any) {
        console.error('ResponseEditorWrapper: Failed to load diary:', error)
        setError(error.message || '일기를 불러올 수 없습니다')
        setHasLoaded(true)
        onError()
      }
    }
    load()
  }, [hasLoaded, onError])

  // Don't show anything while loading - just render silently
  if (!hasLoaded) {
    return <div className="min-h-screen bg-[#fafafa]" />
  }

  if (error || !diary) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center gap-4 p-8">
        <div className="text-red-500 text-center">{error || '일기를 불러올 수 없습니다'}</div>
        <Button
          onClick={onLogout}
          className="bg-black hover:bg-gray-800 text-white"
        >
          로그아웃
        </Button>
      </div>
    )
  }

  return (
    <ResponseEditor
      diary={diary}
      onSubmit={onSubmit}
      onLogout={onLogout}
      defaultTime={defaultTime}
      hasRequestedTime={hasRequestedTime}
      onRequestTime={onRequestTime}
    />
  )
}

function ReviewEditorWrapper({
  onSubmit,
  onLogout,
  onError,
  defaultTime,
  hasRequestedTime,
  onRequestTime,
}: {
  onSubmit: (highlights: Array<{ text: string; startIdx: number; endIdx: number }>, comment: string) => Promise<void>
  onLogout: () => void
  onError: () => void
  defaultTime?: number
  hasRequestedTime: boolean
  onRequestTime: () => Promise<void>
}) {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    // Only load once to prevent losing user's writing
    if (hasLoaded) return

    const load = async () => {
      try {
        console.log('=== ReviewEditorWrapper: Loading data ===')
        setError(null)
        const result = await api.getMyDiaryResponse()
        console.log('ReviewEditorWrapper: Data loaded:', result)
        setData(result)
        setHasLoaded(true)
      } catch (error: any) {
        console.error('ReviewEditorWrapper: Failed to load data:', error)
        setError(error.message || '답변을 불러올 수 없습니다')
        setHasLoaded(true)
        onError()
      }
    }
    load()
  }, [hasLoaded, onError])

  console.log('=== ReviewEditorWrapper: Render ===')
  console.log('Has loaded:', hasLoaded)
  console.log('Error:', error)
  console.log('Data:', data)
  console.log('Has diary:', !!data?.diary)
  console.log('Has response:', !!data?.response)

  // Don't show anything while loading - just render silently
  if (!hasLoaded) {
    return <div className="min-h-screen bg-[#fafafa]" />
  }

  if (error || !data || !data.diary || !data.response) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center gap-4 p-8">
        <div className="text-red-500 text-center">{error || '답변 데이터를 불러올 수 없습니다'}</div>
        <div className="text-sm text-gray-400 text-center max-w-md">
          {!data && '데이터가 없습니다'}
          {data && !data.diary && '일기가 없습니다'}
          {data && !data.response && '답변이 없습니다 - 아직 작성되지 않았을 수 있습니다'}
        </div>
        <Button
          onClick={onLogout}
          className="bg-black hover:bg-gray-800 text-white"
        >
          로그아웃
        </Button>
      </div>
    )
  }

  // Convert ReviewWriting format to old format for submission
  const handleSubmit = async (highlights: Array<{ start: number; end: number; text: string }>, comment: string) => {
    console.log('=== ReviewEditorWrapper: Submit review ===')
    console.log('Highlights:', highlights)
    console.log('Comment:', comment)

    // Convert ReviewWriting format to expected format
    const convertedHighlights = highlights.map((h) => ({
      text: h.text,
      startIdx: h.start,
      endIdx: h.end,
    }))

    console.log('Converted highlights:', convertedHighlights)
    await onSubmit(convertedHighlights, comment)
  }

  console.log('=== ReviewEditorWrapper: Rendering ReviewWriting ===')
  return (
    <ReviewWriting
      myDiary={data.diary}
      response={data.response}
      timeRemaining={defaultTime || 0}
      onSubmit={handleSubmit}
      hasRequestedTime={hasRequestedTime}
      onRequestTime={onRequestTime}
    />
  )
}

function CalendarViewWrapper({ onClose, onLogout, onError }: { onClose: () => void; onLogout: () => void; onError: () => void }) {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { history: h } = await api.getDiaryHistory()
        setHistory(h || [])
      } catch (error) {
        onError()
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <CalendarView
      history={history}
      loading={loading}
      onClose={onClose}
      onLogout={onLogout}
    />
  )
}

function AdminWaitingRoomWrapper({
  onStartSession,
  onOpenMatching,
  onResetSession,
  onViewUserHistory,
  onLogout,
  onError,
}: {
  onStartSession: () => Promise<void>
  onOpenMatching: () => void
  onResetSession: () => Promise<void>
  onViewUserHistory: () => void
  onLogout: () => void
  onError: () => void
}) {
  const [participants, setParticipants] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        console.log('=== Loading admin waiting room data ===')
        console.log('Timestamp:', new Date().toISOString())

        const { session } = await api.getCurrentSession()
        console.log('Current session:', JSON.stringify(session, null, 2))

        if (session) {
          console.log('Session participants:', session.participants)
          console.log('Session participants count:', session.participants.length)

          const { users } = await api.getAllUsers()
          console.log('All users count:', users.length)
          console.log(
            'All users:',
            users.map((u: any) => ({ userId: u.userId, email: u.email, isAdmin: u.isAdmin })),
          )

          // Show only non-admin users who are currently in the session
          const participantUsers = users.filter((u: any) => session.participants.includes(u.userId) && !u.isAdmin)

          console.log(
            'Participant users (non-admin, in session):',
            participantUsers.map((u: any) => ({ userId: u.userId, email: u.email })),
          )
          console.log('Participant users count:', participantUsers.length)

          setParticipants(participantUsers)
        } else {
          console.log('No session exists, clearing participants')
          setParticipants([])
        }
        console.log('=== Admin waiting room data load complete ===')
      } catch (error) {
        console.error('Load admin waiting room error:', error)
        onError()
      }
    }
    load()

    const interval = setInterval(load, 3000)
    return () => clearInterval(interval)
  }, [onError])

  return (
    <AdminWaitingRoom
      participants={participants}
      onStartSession={onStartSession}
      onOpenMatching={onOpenMatching}
      onResetSession={onResetSession}
      onViewUserHistory={onViewUserHistory}
      onLogout={onLogout}
    />
  )
}

function AdminCalendarViewWrapper({ onClose, onLogout, onError }: { onClose: () => void; onLogout: () => void; onError: () => void }) {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { history: h } = await api.getAdminDiaryHistory()
        setHistory(h || [])
      } catch (error) {
        console.error('Load admin history error:', error)
        onError()
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <AdminCalendarView
      history={history}
      loading={loading}
      onClose={onClose}
      onLogout={onLogout}
    />
  )
}

function MatchingConfigWrapper({
  onSave,
  onDeleteUser,
  onClose,
  onLogout,
  onError,
}: {
  onSave: (excludedPairs: string[][]) => Promise<void>
  onDeleteUser: (userId: string) => Promise<void>
  onClose: () => void
  onLogout: () => void
  onError: () => void
}) {
  const [users, setUsers] = useState<any[]>([])
  const [excludedPairs, setExcludedPairs] = useState<string[][]>([])
  const [hasLoaded, setHasLoaded] = useState(false)

  const load = useCallback(async () => {
    try {
      console.log('Loading matching config...')
      const [{ users: u }, { config }] = await Promise.all([api.getAllUsers(), api.getMatchingConfig()])
      console.log('Loaded users:', u)
      console.log('Loaded config:', config)

      // Filter out admin users
      const nonAdminUsers = u.filter((user: any) => !user.isAdmin)
      console.log('Non-admin users:', nonAdminUsers)

      // Check if users have email field
      nonAdminUsers.forEach((user: any) => {
        console.log('User:', user.userId, user.name, user.email)
      })

      setUsers(nonAdminUsers)
      setExcludedPairs(config.excludedPairs || [])
      setHasLoaded(true)
    } catch (error) {
      console.error('Failed to load matching config:', error)
      onError()
    }
  }, [onError]) // Removed hasLoaded from dependencies so we can call load() again

  useEffect(() => {
    if (!hasLoaded) {
      load()
    }
  }, [hasLoaded, load])

  const handleSave = async (pairs: string[][]) => {
    console.log('=== MatchingConfigWrapper: handleSave called ===')
    console.log('Pairs to save:', pairs)
    await onSave(pairs)
    console.log('Save completed, reloading data...')
    // Reload data after save to reflect changes
    setHasLoaded(false)
    // Wait a bit for DB to update, then reload
    setTimeout(() => {
      console.log('Triggering reload after save...')
      load()
    }, 500)
  }

  const handleDeleteUser = async (userId: string) => {
    console.log('=== MatchingConfigWrapper: handleDeleteUser called ===')
    console.log('User ID to delete:', userId)
    await onDeleteUser(userId)
    console.log('Delete completed, reloading data...')
    // Reload data after deletion - force reload by resetting hasLoaded
    setHasLoaded(false)
    // Wait a bit for DB to update, then reload
    setTimeout(() => {
      console.log('Triggering reload after delete...')
      load()
    }, 500)
  }

  return (
    <MatchingConfig
      users={users}
      excludedPairs={excludedPairs}
      onSave={handleSave}
      onDeleteUser={handleDeleteUser}
      onClose={onClose}
      onLogout={onLogout}
    />
  )
}

function WaitingRoomWrapper({ currentUserId, onViewCalendar, onLogout }: { currentUserId: string; onViewCalendar: () => void; onLogout: () => void }) {
  const [participants, setParticipants] = useState<Array<{ userId: string; name: string }>>([])

  useEffect(() => {
    const load = async () => {
      try {
        const { participants: pList, pendingPokes } = await api.getSessionParticipants()
        setParticipants(pList)

        // Show toast for each pending poke
        if (pendingPokes && pendingPokes.length > 0) {
          for (const poke of pendingPokes) {
            toast(`${poke.fromName}님이 쿡 찔렀어요! 👈`, {
              duration: 3000,
            })
          }
        }
      } catch (error) {
        console.error('Load participants error:', error)
      }
    }
    load()

    const interval = setInterval(load, 3000)
    return () => clearInterval(interval)
  }, [])

  const handlePoke = async (targetUserId: string) => {
    try {
      await api.pokeUser(targetUserId)
    } catch (error) {
      console.error('Poke error:', error)
    }
  }

  return (
    <WaitingRoom
      participants={participants}
      currentUserId={currentUserId}
      onViewCalendar={onViewCalendar}
      onLogout={onLogout}
      onPoke={handlePoke}
    />
  )
}

function SessionControlWrapper({
  session,
  onNextPhase,
  onResetSession,
  onRefresh,
  onLogout,
  onError,
}: {
  session: Session
  onNextPhase: () => Promise<void>
  onResetSession: () => Promise<void>
  onRefresh: () => Promise<void>
  onLogout: () => void
  onError: () => void
}) {
  const [statuses, setStatuses] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const { statuses: s } = await api.getParticipantStatuses()
        setStatuses(s)
      } catch (error) {
        onError()
      }
    }
    load()

    const interval = setInterval(load, 5000)
    return () => clearInterval(interval)
  }, [onError])

  return (
    <SessionControl
      session={session}
      statuses={statuses}
      onNextPhase={onNextPhase}
      onResetSession={onResetSession}
      onRefresh={onRefresh}
      onLogout={onLogout}
    />
  )
}
