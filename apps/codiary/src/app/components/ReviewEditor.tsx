import { useState, useEffect, useRef } from 'react'
import { Button } from '@/app/components/ui/button'
import { Textarea } from '@/app/components/ui/textarea'
import { ScrollArea } from '@/app/components/ui/scroll-area'
import { LogOut } from 'lucide-react'

interface ReviewEditorProps {
  diary: {
    content: string
  }
  response: {
    responseId: string
    content: string
  }
  onSubmit: (highlights: Array<{ text: string; startIdx: number; endIdx: number }>, comment: string) => Promise<void>
  onLogout: () => void
  defaultTime?: number
}

export function ReviewEditor({ diary, response, onSubmit, onLogout, defaultTime = 300 }: ReviewEditorProps) {
  const [highlights, setHighlights] = useState<Array<{ text: string; startIdx: number; endIdx: number }>>([])
  const [comment, setComment] = useState('')
  const [time, setTime] = useState(defaultTime)
  const [loading, setLoading] = useState(false)
  const responseRef = useRef<HTMLDivElement>(null)

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

  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) return

    const selectedText = selection.toString()
    const range = selection.getRangeAt(0)

    if (!responseRef.current?.contains(range.commonAncestorContainer)) return

    const startIdx = range.startOffset
    const endIdx = range.endOffset

    setHighlights((prev) => [...prev, { text: selectedText, startIdx, endIdx }])

    selection.removeAllRanges()
  }

  const removeHighlight = (index: number) => {
    setHighlights((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!comment.trim() && highlights.length === 0) return

    setLoading(true)
    try {
      await onSubmit(highlights, comment)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const minutes = Math.floor(time / 60)
  const seconds = time % 60

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      {/* Header with timer */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-8 py-4 flex justify-center relative">
          <div className="text-2xl font-light tracking-wider text-gray-900 font-mono">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
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

      {/* Split view */}
      <div className="flex-1 flex p-8 gap-8">
        {/* Left: My diary */}
        <div className="flex-1 flex flex-col">
          <h2 className="text-lg font-normal mb-4 text-gray-700">내가 쓴 일기</h2>
          <ScrollArea className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="prose prose-gray max-w-none">
              <p className="whitespace-pre-wrap leading-relaxed text-gray-900">{diary.content}</p>
            </div>
          </ScrollArea>
        </div>

        {/* Right: Response with highlights */}
        <div className="flex-1 flex flex-col">
          <h2 className="text-lg font-normal mb-4 text-gray-700">
            받은 답변
            <span className="text-sm text-gray-500 ml-2 font-light">(인상 깊은 부분을 드래그하여 하이라이트하세요)</span>
          </h2>

          <ScrollArea className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-4">
            <div
              ref={responseRef}
              onMouseUp={handleTextSelection}
              className="prose prose-gray max-w-none cursor-text select-text"
            >
              <p className="whitespace-pre-wrap leading-relaxed text-gray-900">{response.content}</p>
            </div>
          </ScrollArea>

          {/* Highlights */}
          {highlights.length > 0 && (
            <div className="mb-4 space-y-2">
              <h3 className="text-sm font-normal text-gray-700">하이라이트</h3>
              <div className="space-y-2">
                {highlights.map((highlight, index) => (
                  <div
                    key={index}
                    className="bg-yellow-50 border border-yellow-200 rounded px-3 py-2 text-sm flex justify-between items-center"
                    onContextMenu={(e) => {
                      e.preventDefault()
                      removeHighlight(index)
                    }}
                  >
                    <span className="text-gray-700">"{highlight.text}"</span>
                    <button
                      onClick={() => removeHighlight(index)}
                      className="text-gray-400 hover:text-gray-600 ml-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comment */}
          <div className="space-y-2">
            <h3 className="text-sm font-normal text-gray-700">코멘트</h3>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder=""
              className="bg-white border-gray-200 resize-none h-32"
              style={{
                lineHeight: '40px',
              }}
            />
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-black hover:bg-gray-800 text-white px-8"
            >
              {loading ? '제출 중...' : '작성 완료'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
