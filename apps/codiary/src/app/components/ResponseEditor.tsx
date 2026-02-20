import { useState, useEffect, useRef } from 'react'
import { Button } from '@/app/components/ui/button'
import { Textarea } from '@/app/components/ui/textarea'
import { LogOut, Bell } from 'lucide-react'

interface ResponseEditorProps {
  diary: {
    content: string
  }
  onSubmit: (content: string) => Promise<void>
  onLogout: () => void
  defaultTime?: number
  hasRequestedTime: boolean
  onRequestTime: () => Promise<void>
}

export function ResponseEditor({ diary, onSubmit, onLogout, defaultTime = 300, hasRequestedTime, onRequestTime }: ResponseEditorProps) {
  const [content, setContent] = useState('')
  const [time, setTime] = useState(defaultTime)
  const [loading, setLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedContent, setSubmittedContent] = useState('')

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

  // Removed auto-submit logic - admin must manually advance to next phase

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)

    // Re-enable button if content has been modified after submission
    if (isSubmitted && e.target.value !== submittedContent) {
      setIsSubmitted(false)
    }
  }

  const handleSubmit = async () => {
    if (isSubmitted) return

    setLoading(true)
    try {
      // Submit even if content is empty
      await onSubmit(content)
      setIsSubmitted(true)
      setSubmittedContent(content)
    } catch (error) {
      console.error('Failed to submit response:', error)
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
        <div className="max-w-6xl mx-auto px-8 py-4 flex justify-center relative">
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

      {/* Split view - fills remaining space */}
      <div className="flex-1 flex flex-col justify-start items-stretch pt-4 md:pt-8 px-4 md:px-8 gap-4 md:gap-8 overflow-auto md:flex-row md:justify-center">
        {/* Left: Original diary - Post-it note style */}
        <div className="w-full md:w-[480px] flex flex-col flex-shrink-0">
          <h2 className="text-sm font-normal text-gray-600 mb-2 md:hidden">누군가의 일기</h2>
          <div
            className="bg-[#ffeaa7] shadow-md p-6 min-h-[45vw] md:min-h-[240px]"
            style={{
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
            }}
          >
            <div className="prose prose-gray max-w-none">
              <p className="whitespace-pre-wrap leading-relaxed text-gray-900">{diary.content}</p>
            </div>
          </div>
        </div>

        {/* Right: Response - Clean white with fixed button at bottom */}
        <div className="flex-1 max-w-2xl flex flex-col min-h-0">
          <h2 className="text-sm font-normal text-gray-600 mb-2 md:hidden">내 답변</h2>
          {/* Scrollable text area */}
          <div className="flex-1 overflow-y-auto bg-white min-h-[300px]">
            <Textarea
              value={content}
              onChange={handleChange}
              placeholder=""
              className="w-full min-h-full p-4 md:p-8 bg-transparent border-none resize-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-900"
              style={{
                lineHeight: '40px',
              }}
            />
          </div>

          {/* Fixed footer at bottom */}
          <div className="pt-4 pb-4 md:pb-8 flex justify-end border-t border-gray-100">
            <Button
              onClick={handleSubmit}
              disabled={loading || isSubmitted}
              className="bg-black hover:bg-gray-800 text-white px-8 disabled:bg-gray-300"
            >
              {loading ? '제출 중...' : isSubmitted ? '제출 완료' : '작성 완료'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
