import { useEffect, useRef, useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { Calendar, Users, ExternalLink, Hand } from 'lucide-react'

interface Participant {
  userId: string
  name: string
}

interface WaitingRoomProps {
  participants: Participant[]
  currentUserId: string
  onViewCalendar: () => void
  onLogout: () => void
  onPoke: (targetUserId: string) => void
}

export function WaitingRoom({ participants, currentUserId, onViewCalendar, onLogout, onPoke }: WaitingRoomProps) {
  const adRef = useRef<HTMLDivElement>(null)
  const [pokedUsers, setPokedUsers] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      if (adRef.current && adRef.current.childElementCount === 0) {
        const ins = document.createElement('ins')
        ins.className = 'adsbygoogle'
        ins.style.display = 'block'
        ins.setAttribute('data-ad-client', 'ca-pub-4077089301782274')
        ins.setAttribute('data-ad-slot', 'auto')
        ins.setAttribute('data-ad-format', 'auto')
        ins.setAttribute('data-full-width-responsive', 'true')
        adRef.current.appendChild(ins)
        ;((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
      }
    } catch {
      // AdSense not loaded
    }
  }, [])

  const handlePoke = (targetUserId: string) => {
    onPoke(targetUserId)
    setPokedUsers((prev) => new Set(prev).add(targetUserId))
    // Reset after 3 seconds
    setTimeout(() => {
      setPokedUsers((prev) => {
        const next = new Set(prev)
        next.delete(targetUserId)
        return next
      })
    }, 3000)
  }

  const otherParticipants = participants.filter((p) => p.userId !== currentUserId)

  return (
    <div
      className="min-h-[100dvh] bg-[#fafafa] flex flex-col items-center justify-between p-8"
      data-testid="waiting-room"
    >
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="text-center space-y-6 max-w-md w-full">
          <div className="space-y-4">
            <h1 className="text-3xl font-normal tracking-tight text-gray-900">대기실</h1>
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <Users className="w-5 h-5" />
              <span
                className="text-lg"
                data-testid="waiting-participant-count"
              >
                {participants.length}명 대기 중
              </span>
            </div>
          </div>

          {/* Participant List */}
          {otherParticipants.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-left">
              <div className="space-y-2">
                {otherParticipants.map((p) => (
                  <div
                    key={p.userId}
                    className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-gray-50"
                  >
                    <span className="text-sm text-gray-700">{p.name}</span>
                    <button
                      data-testid={`waiting-poke-${p.userId}`}
                      onClick={() => handlePoke(p.userId)}
                      disabled={pokedUsers.has(p.userId)}
                      className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full transition-colors ${
                        pokedUsers.has(p.userId)
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 active:scale-95'
                      }`}
                    >
                      <Hand className="w-3.5 h-3.5" />
                      {pokedUsers.has(p.userId) ? '찔렀어요' : '쿡 찌르기'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-sm text-gray-400">관리자가 세션을 시작하면 자동으로 일기 작성 화면으로 이동합니다</p>

          <div className="space-y-3 pt-2">
            <Button
              data-testid="waiting-calendar-button"
              onClick={onViewCalendar}
              variant="outline"
              className="w-full py-6 text-base border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              지난 일기 보기
            </Button>

            <a
              data-testid="waiting-about-link"
              href="/about"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-6 text-base border border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center justify-center gap-2 rounded-md transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              소라고동의 마법 서비스 보기
            </a>
          </div>

          {/* Google AdSense */}
          <div
            ref={adRef}
            className="mt-4 w-full min-h-[100px]"
          />
        </div>
      </div>

      <div className="w-full flex justify-center pb-4">
        <Button
          data-testid="waiting-logout-button"
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
