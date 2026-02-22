import { useState, useEffect, useRef } from 'react'
import { Button } from '@/app/components/ui/button'
import { Card } from '@/app/components/ui/card'
import { Clock, Bell } from 'lucide-react'

interface ReviewWritingProps {
  myDiary: {
    diaryId: string
    content: string
    createdAt: string
  }
  response: {
    responseId: string
    content: string
    respondentName: string
    completedAt: string
  }
  timeRemaining: number
  onSubmit: (highlights: HighlightRange[], comment: string) => Promise<void>
  hasRequestedTime: boolean
  onRequestTime: () => Promise<void>
}

interface HighlightRange {
  start: number
  end: number
  text: string
}

export function ReviewWriting({ myDiary, response, timeRemaining, onSubmit, hasRequestedTime, onRequestTime }: ReviewWritingProps) {
  const [highlights, setHighlights] = useState<HighlightRange[]>([])
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [clientTime, setClientTime] = useState(timeRemaining)
  const [pendingSelection, setPendingSelection] = useState<{ start: number; end: number; text: string } | null>(null)
  const [buttonPos, setButtonPos] = useState<{ top: number; left: number } | null>(null)
  const responseContainerRef = useRef<HTMLDivElement>(null)

  // Update client time when prop changes
  useEffect(() => {
    setClientTime(timeRemaining)
  }, [timeRemaining])

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setClientTime((prevTime) => Math.max(0, prevTime - 1))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Listen for selectionchange to support mobile text selection
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection()
      if (!selection || selection.isCollapsed) {
        setPendingSelection(null)
        return
      }

      const selectedText = selection.toString().trim()
      if (!selectedText) {
        setPendingSelection(null)
        return
      }

      const range = selection.getRangeAt(0)
      const container = range.commonAncestorContainer
      const responseElement = document.getElementById('response-content')
      if (!responseElement || !responseElement.contains(container)) {
        setPendingSelection(null)
        return
      }

      const preSelectionRange = range.cloneRange()
      preSelectionRange.selectNodeContents(responseElement)
      preSelectionRange.setEnd(range.startContainer, range.startOffset)
      const start = preSelectionRange.toString().length
      const end = start + selectedText.length

      setPendingSelection({ start, end, text: selectedText })

      // Get position of selection relative to container for floating button
      const rect = range.getBoundingClientRect()
      const containerRect = responseContainerRef.current?.getBoundingClientRect()
      if (containerRect) {
        setButtonPos({
          top: rect.top - containerRect.top - 44,
          left: rect.left - containerRect.left + rect.width / 2,
        })
      }
    }

    document.addEventListener('selectionchange', handleSelectionChange)
    return () => document.removeEventListener('selectionchange', handleSelectionChange)
  }, [])

  const minutes = Math.floor(clientTime / 60)
  const seconds = clientTime % 60

  const applyHighlight = () => {
    if (!pendingSelection) return

    const { start, end, text } = pendingSelection

    const overlapsExisting = highlights.some(
      (h) => (start >= h.start && start < h.end) || (end > h.start && end <= h.end) || (start <= h.start && end >= h.end),
    )

    if (overlapsExisting) {
      setHighlights(highlights.filter((h) => !((start >= h.start && start < h.end) || (end > h.start && end <= h.end) || (start <= h.start && end >= h.end))))
    } else {
      setHighlights([...highlights, { start, end, text }])
    }

    setPendingSelection(null)
    setButtonPos(null)
    window.getSelection()?.removeAllRanges()
  }

  // Desktop: apply on mouseUp directly
  const handleMouseUp = () => {
    // Small delay so selectionchange fires first
    setTimeout(applyHighlight, 10)
  }

  const renderHighlightedText = (text: string) => {
    if (highlights.length === 0) {
      return text
    }

    // Sort highlights by start position
    const sortedHighlights = [...highlights].sort((a, b) => a.start - b.start)

    const segments = []
    let currentIndex = 0

    sortedHighlights.forEach((highlight) => {
      // Add text before highlight
      if (currentIndex < highlight.start) {
        segments.push({
          text: text.slice(currentIndex, highlight.start),
          highlighted: false,
        })
      }

      // Add highlighted text
      segments.push({
        text: text.slice(highlight.start, highlight.end),
        highlighted: true,
      })

      currentIndex = highlight.end
    })

    // Add remaining text
    if (currentIndex < text.length) {
      segments.push({
        text: text.slice(currentIndex),
        highlighted: false,
      })
    }

    return segments.map((segment, index) => (
      <span
        key={index}
        className={segment.highlighted ? 'bg-yellow-200' : ''}
      >
        {segment.text}
      </span>
    ))
  }

  const handleSubmit = async () => {
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      await onSubmit(highlights, comment)
    } catch (error) {
    } finally {
      setIsSubmitting(false)
    }
  }

  const canSubmit = highlights.length > 0 && comment.trim().length > 0

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Sticky Header with timer */}
      <div className="sticky top-0 z-10 bg-[#fafafa] border-b border-gray-200 px-4 md:px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-normal tracking-tight text-gray-900">리뷰 작성</h1>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-gray-500" />
            <div className="text-2xl font-light font-mono text-gray-900">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            {clientTime === 0 && !hasRequestedTime && (
              <button
                onClick={onRequestTime}
                className="text-sm px-3 py-1 bg-amber-400 hover:bg-amber-500 text-amber-900 rounded-full animate-pulse transition-colors flex items-center gap-1"
              >
                <Bell className="w-3.5 h-3.5" />
                시간 더 주세요
              </button>
            )}
            {clientTime === 0 && hasRequestedTime && <span className="text-sm px-3 py-1 bg-gray-200 text-gray-500 rounded-full">요청 완료</span>}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="px-4 md:px-8 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Main content - responsive layout */}
          <div className="flex flex-col md:grid md:grid-cols-2 gap-6">
            {/* Left: My Diary */}
            <div className="space-y-4">
              <h2 className="text-lg font-normal text-gray-900">내가 작성한 일기</h2>
              <div
                className="p-6 md:p-8 bg-[#ffeaa7] shadow-md min-h-[45vw] md:min-h-[240px]"
                style={{
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
                }}
              >
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">{myDiary.content}</p>
                </div>
              </div>
            </div>

            {/* Right: Response with highlights */}
            <div className="space-y-4">
              <h2 className="text-lg font-normal text-gray-900">어떤 소라고동의 답변</h2>
              <p className="text-sm text-gray-500">인상 깊은 부분을 드래그하여 하이라이트해주세요</p>
              <div
                ref={responseContainerRef}
                className="relative p-6 md:p-8 bg-[#fafafa]"
              >
                <div
                  id="response-content"
                  className="prose prose-sm max-w-none cursor-text select-text"
                  onMouseUp={handleMouseUp}
                >
                  <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">{renderHighlightedText(response.content)}</p>
                </div>

                {/* Mobile: floating highlight button near selection */}
                {pendingSelection && buttonPos && (
                  <button
                    onClick={applyHighlight}
                    className="absolute z-20 -translate-x-1/2 bg-black text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium active:bg-gray-800 md:hidden whitespace-nowrap"
                    style={{ top: Math.max(0, buttonPos.top), left: buttonPos.left }}
                  >
                    하이라이트{' '}
                    {highlights.some(
                      (h) =>
                        (pendingSelection.start >= h.start && pendingSelection.start < h.end) ||
                        (pendingSelection.end > h.start && pendingSelection.end <= h.end) ||
                        (pendingSelection.start <= h.start && pendingSelection.end >= h.end),
                    )
                      ? '제거'
                      : '추가'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Comment section */}
          <div className="space-y-4">
            <h2 className="text-lg font-normal text-gray-900">리뷰 코멘트</h2>
            <p className="text-sm text-gray-500">상대가 달아준 답변이 어땠는지, 왜 그 부분을 하이라이트했는지 자유롭게 작성해주세요</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder=""
              className="w-full min-h-[200px] p-6 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none shadow-sm"
            />
          </div>

          {/* Submit button */}
          <div className="flex justify-center pt-6 pb-8">
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              className="bg-black hover:bg-gray-800 active:bg-gray-900 text-white w-full md:w-auto px-12 py-6 text-lg disabled:bg-gray-300 disabled:cursor-not-allowed touch-manipulation"
            >
              {isSubmitting ? '제출 중...' : '작성 완료'}
            </Button>
          </div>

          {!canSubmit && <div className="text-center text-sm text-gray-500">답변에서 하이라이트할 부분을 드래그하고, 코멘트를 작성해주세요</div>}
        </div>
      </div>
    </div>
  )
}
