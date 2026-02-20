import { useState, useEffect, useRef } from 'react'
import { Textarea } from '@/app/components/ui/textarea'
import { LogOut, AlertTriangle, Bell } from 'lucide-react'
import { SoraSubmit } from '@/app/components/SoraSubmit'
import { toast } from 'sonner'

interface DiaryEditorProps {
  onSubmit: (content: string) => Promise<void>
  onLogout: () => void
  defaultTime?: number
  showMatchingWarning?: boolean
  hasRequestedTime: boolean
  onRequestTime: () => Promise<void>
}

export function DiaryEditor({ onSubmit, onLogout, defaultTime = 600, showMatchingWarning = false, hasRequestedTime, onRequestTime }: DiaryEditorProps) {
  const [content, setContent] = useState('')
  const [time, setTime] = useState(defaultTime)
  const [isTyping, setIsTyping] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedContent, setSubmittedContent] = useState('')
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Sync with defaultTime prop when it changes
  useEffect(() => {
    if (defaultTime !== undefined) {
      setTime(defaultTime)
    }
  }, [defaultTime])

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => Math.max(0, prev - 1))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    setIsTyping(true)

    // Auto-grow textarea
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.max(300, textarea.scrollHeight)}px`
    }

    // Re-enable button if content has been modified after submission
    if (isSubmitted && e.target.value !== submittedContent) {
      setIsSubmitted(false)
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
    }, 1000)
  }

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitted) return

    setLoading(true)
    try {
      await onSubmit(content)
      setIsSubmitted(true)
      setSubmittedContent(content)
      toast('소라고동에게 내 일기에 대한 답변을 요청했어요.')
    } catch (error) {
      console.error('Failed to submit diary:', error)
    } finally {
      setLoading(false)
    }
  }

  const minutes = Math.floor(time / 60)
  const seconds = time % 60

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with timer */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-8 py-4 flex justify-center relative">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-light tracking-wider text-gray-900 font-mono">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            {time === 0 && !hasRequestedTime && (
              <button
                onClick={onRequestTime}
                className="text-sm px-3 py-1 bg-amber-400 hover:bg-amber-500 text-amber-900 rounded-full animate-pulse transition-colors flex items-center gap-1"
              >
                <Bell className="w-3.5 h-3.5" />
                시간 더 주세요
              </button>
            )}
            {time === 0 && hasRequestedTime && <span className="text-sm px-3 py-1 bg-gray-200 text-gray-500 rounded-full">요청 완료</span>}
          </div>
          <button
            onClick={onLogout}
            className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-2 text-sm"
          >
            <LogOut className="w-4 h-4" />
            로그아웃
          </button>
        </div>
      </div>

      {/* Matching Warning Banner */}
      {showMatchingWarning && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-4xl mx-auto px-8 py-3 flex items-center gap-3 text-amber-800">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">오늘은 내가 알고 있는 사람이 일기에 대한 답변을 작성할 가능성이 있습니다</p>
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 flex items-start justify-center p-4 md:p-8 pt-4 md:pt-12 overflow-auto">
        <div className="max-w-3xl w-full">
          <div
            className={`bg-white rounded-lg transition-colors duration-300`}
            style={{
              minHeight: '300px',
            }}
          >
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={handleChange}
              placeholder=""
              className="w-full min-h-[300px] p-4 md:p-8 bg-white border-none resize-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 leading-10 text-gray-900 placeholder:text-gray-300 overflow-hidden"
              style={{
                lineHeight: '40px',
              }}
            />
          </div>

          {/* Character count */}
          <div className="mt-4 text-sm text-gray-500">{content.length}자</div>

          {/* Spacer for fixed bottom sora */}
          <div className="h-28" />
        </div>
      </div>

      {/* Sora pull-to-submit - fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-100 py-4 z-10">
        <SoraSubmit
          onSubmit={handleSubmit}
          disabled={!content.trim() || loading}
          isSubmitted={isSubmitted}
        />
      </div>
    </div>
  )
}
