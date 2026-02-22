import { Button } from '@/app/components/ui/button'
import { Card } from '@/app/components/ui/card'
import { Network, Users, RotateCcw, CalendarDays } from 'lucide-react'
import logo from '../../../assets/logo.png'

interface Participant {
  userId: string
  name: string
  email: string
}

interface AdminWaitingRoomProps {
  participants: Participant[]
  onStartSession: () => Promise<void>
  onOpenMatching: () => void
  onResetSession: () => Promise<void>
  onViewUserHistory: () => void
  onLogout: () => void
}

export function AdminWaitingRoom({ participants, onStartSession, onOpenMatching, onResetSession, onViewUserHistory, onLogout }: AdminWaitingRoomProps) {
  return (
    <div
      className="min-h-screen bg-[#fafafa] flex flex-col p-8"
      data-testid="admin-waiting-room"
    >
      <div className="flex-1 max-w-6xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={logo}
              alt="교환 일기"
              className="w-12 h-12"
            />
            <div>
              <h1 className="text-3xl font-normal tracking-tight text-gray-900">관리자 대기실</h1>
              <p className="text-sm text-gray-500 mt-1">{participants.length}명이 대기 중</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              data-testid="admin-reset-session-button"
              onClick={onResetSession}
              variant="outline"
              className="gap-2 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
            >
              <RotateCcw className="w-4 h-4" />
              세션 초기화
            </Button>
            <Button
              data-testid="admin-history-button"
              onClick={onViewUserHistory}
              variant="outline"
              className="gap-2 border-gray-200"
            >
              <CalendarDays className="w-4 h-4" />
              히스토리
            </Button>
            <Button
              data-testid="admin-matching-button"
              onClick={onOpenMatching}
              variant="outline"
              className="gap-2 border-gray-200"
            >
              <Network className="w-4 h-4" />
              매칭 설정
            </Button>
            <Button
              data-testid="admin-start-session-button"
              onClick={onStartSession}
              className="bg-black hover:bg-gray-800 text-white gap-2"
              disabled={participants.length === 0}
            >
              <Users className="w-4 h-4" />
              세션 시작
            </Button>
          </div>
        </div>

        {/* Participants list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {participants.map((participant) => (
            <Card
              key={participant.userId}
              data-testid={`admin-participant-${participant.userId}`}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onViewUserHistory()}
            >
              <div className="space-y-1">
                <h3 className="font-normal text-gray-900">{participant.name}</h3>
                <p className="text-sm text-gray-500">{participant.email}</p>
              </div>
            </Card>
          ))}
        </div>

        {participants.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400">아직 참여자가 없습니다</p>
          </div>
        )}
      </div>

      {/* 종료 버튼 - 중앙 하단 */}
      <div className="w-full flex justify-center pb-4">
        <Button
          data-testid="admin-logout-button"
          onClick={onLogout}
          variant="outline"
          className="px-12 py-6 text-lg border-gray-300 text-gray-600 hover:bg-gray-100"
        >
          종료
        </Button>
      </div>
    </div>
  )
}
