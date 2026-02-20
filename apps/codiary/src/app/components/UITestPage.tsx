import { useState } from 'react'
import { AuthForm } from '@/app/components/AuthForm'
import { WaitingRoom } from '@/app/components/WaitingRoom'
import { DiaryEditor } from '@/app/components/DiaryEditor'
import { ResponseEditor } from '@/app/components/ResponseEditor'
import { ReviewEditor } from '@/app/components/ReviewEditor'
import { CalendarView } from '@/app/components/CalendarView'
import { AdminWaitingRoom } from '@/app/components/admin/AdminWaitingRoom'
import { MatchingConfig } from '@/app/components/admin/MatchingConfig'
import { SessionControl } from '@/app/components/admin/SessionControl'
import { Button } from '@/app/components/ui/button'

type Screen = 'menu' | 'auth' | 'waiting' | 'writing' | 'responding' | 'reviewing' | 'calendar' | 'admin-waiting' | 'admin-matching' | 'admin-control'

export function UITestPage() {
  const [screen, setScreen] = useState<Screen>('menu')

  // Mock data
  const mockDiary = {
    diaryId: 'diary-1',
    content:
      '오늘은 정말 좋은 하루였다. 아침에 일찍 일어나서 산책을 했는데, 공기가 너무 맑고 상쾌했다. 오랜만에 친구들을 만나서 점심을 먹었는데, 재미있는 이야기를 많이 나눴다.',
    authorName: '김철수',
    createdAt: new Date().toISOString(),
  }

  const mockResponse = {
    responseId: 'response-1',
    content:
      '와, 정말 멋진 하루를 보내셨네요! 저도 요즘 아침 산책을 하려고 노력 중인데, 이 글을 읽으니 더 동기부여가 되네요. 친구들과의 시간도 소중하죠. 어떤 이야기를 나누셨는지 궁금하네요!',
    respondentName: '박영희',
    createdAt: new Date().toISOString(),
  }

  const mockHistory = [
    {
      date: '2026-01-26',
      hasEntry: true,
      diary: { content: '어제의 일기 내용입니다...' },
      response: { content: '어제의 답변입니다...' },
      review: { comment: '어제의 리뷰입니다...' },
    },
    {
      date: '2026-01-25',
      hasEntry: true,
      diary: { content: '그제의 일기 내용입니다...' },
      response: { content: '그제의 답변입니다...' },
      review: { comment: '그제의 리뷰입니다...' },
    },
    {
      date: '2026-01-24',
      hasEntry: false,
    },
  ]

  const mockParticipants = [
    { userId: '1', name: '김철수', email: 'kim@example.com' },
    { userId: '2', name: '박영희', email: 'park@example.com' },
    { userId: '3', name: '이민호', email: 'lee@example.com' },
  ]

  const mockUsers = [
    { userId: '1', name: '김철수', email: 'kim@example.com' },
    { userId: '2', name: '박영희', email: 'park@example.com' },
    { userId: '3', name: '이민호', email: 'lee@example.com' },
    { userId: '4', name: '정지은', email: 'jung@example.com' },
    { userId: '5', name: '최수진', email: 'choi@example.com' },
  ]

  const mockSession = {
    sessionId: 'session-1',
    date: '2026-01-27',
    status: 'writing' as const,
    participants: ['1', '2', '3'],
    startedAt: new Date().toISOString(),
  }

  const mockStatuses = [
    { userId: '1', name: '김철수', completed: true },
    { userId: '2', name: '박영희', completed: false },
    { userId: '3', name: '이민호', completed: true },
  ]

  const mockHandlers = {
    onSignIn: async (email: string) => {
      console.log('Sign in:', email)
      await new Promise((resolve) => setTimeout(resolve, 500))
    },
    onSubmit: async (content: string) => {
      console.log('Submit:', content)
      await new Promise((resolve) => setTimeout(resolve, 500))
    },
    onSubmitReview: async (highlights: Array<{ text: string; startIdx: number; endIdx: number }>, comment: string) => {
      console.log('Submit review:', { highlights, comment })
      await new Promise((resolve) => setTimeout(resolve, 500))
    },
    onViewCalendar: () => setScreen('calendar'),
    onLogout: () => console.log('Logout'),
    onStartSession: async () => {
      console.log('Start session')
      await new Promise((resolve) => setTimeout(resolve, 500))
    },
    onOpenMatching: () => setScreen('admin-matching'),
    onViewUserHistory: (userId: string) => console.log('View user history:', userId),
    onSave: async (excludedPairs: string[][]) => {
      console.log('Save excluded pairs:', excludedPairs)
      await new Promise((resolve) => setTimeout(resolve, 500))
    },
    onClose: () => setScreen('menu'),
    onNextPhase: async () => {
      console.log('Next phase')
      await new Promise((resolve) => setTimeout(resolve, 500))
    },
    onRefresh: async () => {
      console.log('Refresh')
      await new Promise((resolve) => setTimeout(resolve, 500))
    },
  }

  if (screen === 'menu') {
    return (
      <div className="min-h-screen bg-[#fafafa] p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-normal mb-8 text-center">UI 테스트 페이지</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-normal mb-4 text-gray-900">일반 사용자 화면</h2>
              <div className="space-y-2">
                <Button
                  onClick={() => setScreen('auth')}
                  className="w-full bg-black hover:bg-gray-800 text-white"
                >
                  로그인 화면
                </Button>
                <Button
                  onClick={() => setScreen('waiting')}
                  className="w-full bg-black hover:bg-gray-800 text-white"
                >
                  대기실 (0명)
                </Button>
                <Button
                  onClick={() => setScreen('writing')}
                  className="w-full bg-black hover:bg-gray-800 text-white"
                >
                  일기 작성
                </Button>
                <Button
                  onClick={() => setScreen('responding')}
                  className="w-full bg-black hover:bg-gray-800 text-white"
                >
                  답변 작성
                </Button>
                <Button
                  onClick={() => setScreen('reviewing')}
                  className="w-full bg-black hover:bg-gray-800 text-white"
                >
                  리뷰 작성
                </Button>
                <Button
                  onClick={() => setScreen('calendar')}
                  className="w-full bg-black hover:bg-gray-800 text-white"
                >
                  캘린더 보기
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-normal mb-4 text-gray-900">관리자 화면</h2>
              <div className="space-y-2">
                <Button
                  onClick={() => setScreen('admin-waiting')}
                  className="w-full bg-black hover:bg-gray-800 text-white"
                >
                  관리자 대기실
                </Button>
                <Button
                  onClick={() => setScreen('admin-matching')}
                  className="w-full bg-black hover:bg-gray-800 text-white"
                >
                  매칭 설정
                </Button>
                <Button
                  onClick={() => setScreen('admin-control')}
                  className="w-full bg-black hover:bg-gray-800 text-white"
                >
                  세션 컨트롤
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render selected screen
  switch (screen) {
    case 'auth':
      return (
        <div>
          <BackButton onClick={() => setScreen('menu')} />
          <AuthForm onSignIn={mockHandlers.onSignIn} />
        </div>
      )

    case 'waiting':
      return (
        <div>
          <BackButton onClick={() => setScreen('menu')} />
          <WaitingRoom
            participantCount={3}
            onViewCalendar={mockHandlers.onViewCalendar}
            onLogout={mockHandlers.onLogout}
          />
        </div>
      )

    case 'writing':
      return (
        <div>
          <BackButton onClick={() => setScreen('menu')} />
          <DiaryEditor
            onSubmit={mockHandlers.onSubmit}
            onLogout={mockHandlers.onLogout}
          />
        </div>
      )

    case 'responding':
      return (
        <div>
          <BackButton onClick={() => setScreen('menu')} />
          <ResponseEditor
            diary={mockDiary}
            onSubmit={mockHandlers.onSubmit}
            onLogout={mockHandlers.onLogout}
          />
        </div>
      )

    case 'reviewing':
      return (
        <div>
          <BackButton onClick={() => setScreen('menu')} />
          <ReviewEditor
            diary={mockDiary}
            response={mockResponse}
            onSubmit={mockHandlers.onSubmitReview}
            onLogout={mockHandlers.onLogout}
          />
        </div>
      )

    case 'calendar':
      return (
        <div>
          <BackButton onClick={() => setScreen('menu')} />
          <CalendarView
            history={mockHistory}
            onClose={mockHandlers.onClose}
            onLogout={mockHandlers.onLogout}
          />
        </div>
      )

    case 'admin-waiting':
      return (
        <div>
          <BackButton onClick={() => setScreen('menu')} />
          <AdminWaitingRoom
            participants={mockParticipants}
            onStartSession={mockHandlers.onStartSession}
            onOpenMatching={mockHandlers.onOpenMatching}
            onViewUserHistory={mockHandlers.onViewUserHistory}
            onLogout={mockHandlers.onLogout}
          />
        </div>
      )

    case 'admin-matching':
      return (
        <div>
          <BackButton onClick={() => setScreen('menu')} />
          <MatchingConfig
            users={mockUsers}
            excludedPairs={[['1', '2']]}
            onSave={mockHandlers.onSave}
            onClose={mockHandlers.onClose}
            onLogout={mockHandlers.onLogout}
          />
        </div>
      )

    case 'admin-control':
      return (
        <div>
          <BackButton onClick={() => setScreen('menu')} />
          <SessionControl
            session={mockSession}
            statuses={mockStatuses}
            onNextPhase={mockHandlers.onNextPhase}
            onRefresh={mockHandlers.onRefresh}
            onLogout={mockHandlers.onLogout}
          />
        </div>
      )

    default:
      return null
  }
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed top-4 left-4 z-50 px-4 py-2 bg-white border border-gray-200 rounded hover:bg-gray-50 text-sm"
    >
      ← 메뉴로
    </button>
  )
}
