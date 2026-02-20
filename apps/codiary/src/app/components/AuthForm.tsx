import { useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import logo from '../../assets/logo.png'

interface AuthFormProps {
  onSignIn: (email: string) => Promise<void>
}

export function AuthForm({ onSignIn }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      setError('이메일을 입력해주세요')
      return
    }

    setError('')
    setLoading(true)

    try {
      await onSignIn(email.trim())
    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] p-4">
      <Card className="w-full max-w-md shadow-sm border-gray-200">
        <CardHeader className="space-y-1 text-center pb-8">
          <div className="flex justify-center mb-6">
            <img
              src={logo}
              alt="교환 일기"
              className="w-20 h-20"
            />
          </div>
          <CardTitle className="text-3xl font-normal tracking-tight">교환 일기</CardTitle>
          <p className="text-sm text-gray-500 pt-2">이메일을 입력하세요</p>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSignIn}
            className="space-y-4"
          >
            {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">{error}</div>}

            <div className="space-y-2">
              <label className="text-sm text-gray-600">이메일</label>
              <Input
                type="email"
                placeholder=""
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-black hover:bg-gray-800 text-white h-12"
              disabled={loading}
            >
              {loading ? '로그인 중...' : '시작하기'}
            </Button>
          </form>
          <div className="text-center pt-4">
            <a
              href="/about"
              className="text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2"
            >
              소라고동의 마법 서비스 보기
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
