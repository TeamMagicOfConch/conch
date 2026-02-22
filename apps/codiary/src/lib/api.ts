import { projectId, publicAnonKey } from '/utils/supabase/info'

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-1d29bb00`

let accessToken: string | null = null

export const setAccessToken = (token: string | null) => {
  accessToken = token
  if (token) {
    localStorage.setItem('auth_token', token)
  } else {
    localStorage.removeItem('auth_token')
  }
}

const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('auth_token')

  // Only warn for endpoints that require authentication (exclude public endpoints)
  const publicEndpoints = ['/session/current', '/auth/signin', '/auth/signup']
  const isPublicEndpoint = publicEndpoints.some((pubEndpoint) => endpoint.includes(pubEndpoint))

  if (!token && !isPublicEndpoint) {
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${publicAnonKey}`,
    ...(token && { 'X-User-Token': token }),
    ...options.headers,
  }

  const url = `${API_BASE}${endpoint}`

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      let errorMessage = 'API request failed'
      try {
        const error = await response.json()
        errorMessage = error.error || errorMessage
      } catch (e) {
        // If JSON parsing fails, try to get text
        try {
          const text = await response.text()
          errorMessage = text || errorMessage
        } catch (textError) {}
      }
      throw new Error(errorMessage)
    }

    return response.json()
  } catch (error: unknown) {
    // Network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`네트워크 연결 오류: ${endpoint} 엔드포인트에 접근할 수 없습니다. 서버가 실행 중인지 확인해주세요.`)
    }

    if (error instanceof Error && error.message) {
      throw error
    }
    throw new Error('서버에 연결할 수 없습니다. 네트워크를 확인해주세요.')
  }
}

// Auth
export const signInSimple = async (email: string) => {
  const result = await fetchAPI('/auth/signin', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })

  setAccessToken(result.token)
  return result
}

export const signUp = async (email: string, password: string, name: string) => {
  return fetchAPI('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  })
}

export const signOut = async () => {
  localStorage.removeItem('auth_token')
  setAccessToken(null)
}

export const getSession = async () => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    setAccessToken(token)
    return { access_token: token }
  }
  return null
}

export const getUserData = async () => {
  try {
    const result = await fetchAPI('/auth/session')
    return result
  } catch (error) {
    throw error
  }
}

// Session
export const getCurrentSession = async () => {
  return fetchAPI('/session/current')
}

export const joinSession = async () => {
  return fetchAPI('/session/join', { method: 'POST' })
}

export const leaveSession = async () => {
  return fetchAPI('/session/leave', { method: 'POST' })
}

// Diary
export const writeDiary = async (content: string) => {
  return fetchAPI('/diary/write', {
    method: 'POST',
    body: JSON.stringify({ content }),
  })
}

export const getAssignedDiary = async () => {
  return fetchAPI('/diary/assigned')
}

export const getDiaryHistory = async () => {
  return fetchAPI('/diary/history')
}

// Response
export const writeResponse = async (diaryId: string, content: string) => {
  return fetchAPI('/response/write', {
    method: 'POST',
    body: JSON.stringify({ diaryId, content }),
  })
}

export const getMyDiaryResponse = async () => {
  return fetchAPI('/response/my-diary')
}

// Review
export const writeReview = async (responseId: string, highlights: Array<{ text: string; startIdx: number; endIdx: number }>, comment: string) => {
  return fetchAPI('/review/write', {
    method: 'POST',
    body: JSON.stringify({ responseId, highlights, comment }),
  })
}

// Admin
export const getAllUsers = async () => {
  return fetchAPI('/admin/users')
}

export const startSession = async () => {
  return fetchAPI('/admin/session/start', { method: 'POST' })
}

export const nextPhase = async () => {
  return fetchAPI('/admin/session/next', { method: 'POST' })
}

export const setMatchingExclusions = async (excludedPairs: string[][]) => {
  return fetchAPI('/admin/matching/exclude', {
    method: 'POST',
    body: JSON.stringify({ excludedPairs }),
  })
}

export const getMatchingConfig = async () => {
  return fetchAPI('/admin/matching/config')
}

export const getMatchingResult = async () => {
  return fetchAPI('/admin/matching/result')
}

export const getParticipantStatuses = async () => {
  return fetchAPI('/admin/session/statuses')
}

export const deleteUser = async (userId: string) => {
  return fetchAPI('/admin/user/delete', {
    method: 'POST',
    body: JSON.stringify({ userId }),
  })
}

export const resetSession = async () => {
  return fetchAPI('/admin/session/reset', { method: 'POST' })
}

export const updateSessionTimer = async (timeRemaining: number) => {
  return fetchAPI('/admin/session/timer', {
    method: 'POST',
    body: JSON.stringify({ timeRemaining }),
  })
}

export const requestMoreTime = async () => {
  return fetchAPI('/session/request-time', { method: 'POST' })
}

export const getSessionParticipants = async () => {
  return fetchAPI('/session/participants')
}

export const pokeUser = async (targetUserId: string) => {
  return fetchAPI('/session/poke', {
    method: 'POST',
    body: JSON.stringify({ targetUserId }),
  })
}

export const getAdminDiaryHistory = async () => {
  return fetchAPI('/admin/diary/history')
}
