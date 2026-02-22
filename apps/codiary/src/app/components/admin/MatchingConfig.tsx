import { useState, useEffect } from 'react'
import { Button } from '@/app/components/ui/button'
import { Card } from '@/app/components/ui/card'
import { X, LogOut, Trash2 } from 'lucide-react'

interface User {
  userId: string
  name: string
  email: string
}

interface MatchingConfigProps {
  users: User[]
  excludedPairs: string[][]
  onSave: (excludedPairs: string[][]) => Promise<void>
  onClose: () => void
  onLogout: () => void
  onDeleteUser: (userId: string) => Promise<void>
}

export function MatchingConfig({ users, excludedPairs: initialExcludedPairs, onSave, onClose, onLogout, onDeleteUser }: MatchingConfigProps) {
  const [excludedPairs, setExcludedPairs] = useState<Set<string>>(new Set(initialExcludedPairs.map((pair) => pair.sort().join('|'))))
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Update excludedPairs when initialExcludedPairs changes (on reload)
  useEffect(() => {
    setExcludedPairs(new Set(initialExcludedPairs.map((pair) => pair.sort().join('|'))))
  }, [initialExcludedPairs])

  // Filter out any null/undefined users
  const validUsers = users.filter((user): user is User => user != null && user.userId != null)

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId)
      }
      if (prev.length >= 2) {
        return [prev[1], userId]
      }
      return [...prev, userId]
    })
  }

  useEffect(() => {
    if (selectedUsers.length === 2) {
      const pairKey = selectedUsers.sort().join('|')
      setExcludedPairs((prev) => {
        const newSet = new Set(prev)
        if (newSet.has(pairKey)) {
          newSet.delete(pairKey)
        } else {
          newSet.add(pairKey)
        }
        return newSet
      })
      setSelectedUsers([])
    }
  }, [selectedUsers])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const pairs = Array.from(excludedPairs).map((pairKey) => pairKey.split('|'))

      await onSave(pairs)
    } catch (error) {
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`${userName} 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      return
    }

    setDeletingUserId(userId)
    try {
      await onDeleteUser(userId)
    } finally {
      setDeletingUserId(null)
    }
  }

  const isExcluded = (userId1: string, userId2: string) => {
    const pairKey = [userId1, userId2].sort().join('|')
    return excludedPairs.has(pairKey)
  }

  const angle = (2 * Math.PI) / validUsers.length
  // Dynamic radius: ensure nodes don't overlap based on user count
  const nodeSize = 128
  const gap = 20
  const minRadius = validUsers.length > 1 ? (nodeSize + gap) / (2 * Math.sin(Math.PI / validUsers.length)) : 0
  const radius = Math.max(minRadius, 150)
  const containerSize = Math.round(2 * radius + nodeSize + 40)
  const center = containerSize / 2

  if (validUsers.length === 0) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white">
          <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-normal tracking-tight text-gray-900">매칭 설정</h1>
              <p className="text-sm text-gray-500 mt-1">매칭하지 않을 사용자 쌍을 설정하세요</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </Button>
              <Button
                onClick={onLogout}
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-gray-900"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">아직 참여자가 없습니다</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-normal tracking-tight text-gray-900">매칭 설정</h1>
            <p className="text-sm text-gray-500 mt-1">매칭하지 않을 사용자 쌍을 설정하세요</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-gray-900"
            >
              <X className="w-5 h-5" />
            </Button>
            <Button
              onClick={onLogout}
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-gray-900"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Network diagram */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div
          className="relative"
          style={{ width: containerSize, height: containerSize }}
        >
          <svg
            className="absolute inset-0 pointer-events-none"
            width={containerSize}
            height={containerSize}
          >
            {/* Draw non-excluded lines first (behind) */}
            {validUsers.map((user1, i) => {
              const x1 = center + radius * Math.cos(angle * i - Math.PI / 2)
              const y1 = center + radius * Math.sin(angle * i - Math.PI / 2)

              return validUsers.slice(i + 1).map((user2, j) => {
                const actualJ = i + 1 + j
                const x2 = center + radius * Math.cos(angle * actualJ - Math.PI / 2)
                const y2 = center + radius * Math.sin(angle * actualJ - Math.PI / 2)

                if (isExcluded(user1.userId, user2.userId)) return null

                return (
                  <line
                    key={`${user1.userId}-${user2.userId}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#e5e7eb"
                    strokeWidth={1}
                    className="transition-all"
                  />
                )
              })
            })}
            {/* Draw excluded lines on top */}
            {validUsers.map((user1, i) => {
              const x1 = center + radius * Math.cos(angle * i - Math.PI / 2)
              const y1 = center + radius * Math.sin(angle * i - Math.PI / 2)

              return validUsers.slice(i + 1).map((user2, j) => {
                const actualJ = i + 1 + j
                const x2 = center + radius * Math.cos(angle * actualJ - Math.PI / 2)
                const y2 = center + radius * Math.sin(angle * actualJ - Math.PI / 2)

                if (!isExcluded(user1.userId, user2.userId)) return null

                return (
                  <line
                    key={`ex-${user1.userId}-${user2.userId}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#ef4444"
                    strokeWidth={2}
                    className="transition-all"
                  />
                )
              })
            })}
          </svg>

          {/* Draw user nodes */}
          {validUsers.map((user, i) => {
            const x = center + radius * Math.cos(angle * i - Math.PI / 2)
            const y = center + radius * Math.sin(angle * i - Math.PI / 2)
            const isSelected = selectedUsers.includes(user.userId)
            const isDeleting = deletingUserId === user.userId

            return (
              <div
                key={user.userId}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: x, top: y }}
              >
                <button
                  onClick={() => toggleUser(user.userId)}
                  disabled={isDeleting}
                  className={`transition-all ${isSelected ? 'bg-black text-white' : 'bg-white text-gray-900 hover:bg-gray-100'} border-2 ${
                    isSelected ? 'border-black' : 'border-gray-200'
                  } rounded-full w-32 h-32 flex flex-col items-center justify-center shadow-sm ${isDeleting ? 'opacity-50' : ''} px-2`}
                >
                  <span className="text-sm font-medium leading-tight text-center break-all">{user.name}</span>
                  <span className="text-[10px] opacity-70 mt-1 leading-tight text-center break-all">{user.email}</span>
                </button>

                {/* Delete button - visible on hover only */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteUser(user.userId, user.name)
                  }}
                  disabled={isDeleting}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-sm transition-all disabled:opacity-50 opacity-0 group-hover:opacity-100"
                  title="사용자 삭제"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )
          })}
        </div>

        <div className="mt-8 text-center space-y-2">
          <p className="text-sm text-gray-600">두 사용자를 클릭하여 매칭 제외 설정</p>
          <p className="text-xs text-gray-400">빨간 선은 매칭이 제외된 쌍입니다</p>
        </div>

        <div className="mt-8">
          <Button
            onClick={handleSave}
            className="bg-black hover:bg-gray-800 text-white px-8 relative z-10 cursor-pointer"
            disabled={isSaving}
          >
            {isSaving ? '저장 중...' : '설정 저장'}
          </Button>
        </div>
      </div>
    </div>
  )
}
