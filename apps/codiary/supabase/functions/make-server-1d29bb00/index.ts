import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { createClient } from 'npm:@supabase/supabase-js@2'

const app = new Hono()

// Enable CORS
app.use(
  '*',
  cors({
    origin: '*',
    allowHeaders: ['Content-Type', 'Authorization', 'X-User-Token', '*'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    exposeHeaders: ['*'],
    credentials: false,
  }),
)

// KV Store wrapper
const kvClient = () => {
  const url = Deno.env.get('SUPABASE_URL')
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }
  return createClient(url, key)
}

const kv = {
  set: async (key: string, value: any): Promise<void> => {
    const supabase = kvClient()
    const { error } = await supabase.from('kv_store_1d29bb00').upsert({ key, value })
    if (error) throw new Error(error.message)
  },

  get: async (key: string): Promise<any> => {
    const supabase = kvClient()
    const { data, error } = await supabase.from('kv_store_1d29bb00').select('value').eq('key', key).maybeSingle()
    if (error) throw new Error(error.message)
    return data?.value
  },

  getByPrefix: async (prefix: string): Promise<any[]> => {
    const supabase = kvClient()
    if (!prefix || prefix === '') {
      const { data, error } = await supabase.from('kv_store_1d29bb00').select('key, value')
      if (error) throw new Error(error.message)
      return data?.map((d) => ({ key: d.key, value: d.value })) ?? []
    }
    const { data, error } = await supabase
      .from('kv_store_1d29bb00')
      .select('key, value')
      .like('key', prefix + '%')
    if (error) throw new Error(error.message)
    return data?.map((d) => ({ key: d.key, value: d.value })) ?? []
  },

  del: async (key: string): Promise<void> => {
    const supabase = kvClient()
    const { error } = await supabase.from('kv_store_1d29bb00').delete().eq('key', key)
    if (error) throw new Error(error.message)
  },

  delAll: async (): Promise<void> => {
    const supabase = kvClient()
    const { error } = await supabase.from('kv_store_1d29bb00').delete().neq('key', '')
    if (error) throw new Error(error.message)
  },

  mdel: async (keys: string[]): Promise<void> => {
    const supabase = kvClient()
    const { error } = await supabase.from('kv_store_1d29bb00').delete().in('key', keys)
    if (error) throw new Error(error.message)
  },
}

// Auth middleware
const authMiddleware = async (c: any, next: any) => {
  try {
    const userToken = c.req.header('X-User-Token')

    if (!userToken) {
      return c.json({ error: 'Unauthorized: Missing authentication' }, 401)
    }

    if (userToken && userToken.startsWith('simple_')) {
      const userId = userToken.replace('simple_', '')
      const userData = await kv.get(`user:${userId}`)

      if (!userData) {
        console.error(`[AUTH] user_not_found id=${userId}`)
        return c.json({ error: 'Unauthorized: User not found' }, 401)
      }

      c.set('user', {
        id: userId,
        email: userData.email,
        user_metadata: { name: userData.name },
      })
      await next()
      return
    }

    return c.json({ error: 'Unauthorized: Missing authentication' }, 401)
  } catch (error: any) {
    console.error(`[AUTH] error=${error.message}`)
    return c.json({ error: 'Authentication failed' }, 401)
  }
}

// Admin middleware
const adminMiddleware = async (c: any, next: any) => {
  try {
    const user = c.get('user')
    if (user.email !== 'conch.of.magic@gmail.com') {
      return c.json({ error: 'Forbidden: Admin access required' }, 403)
    }
    await next()
  } catch (error: any) {
    console.error(`[AUTH] admin_check_failed error=${error.message}`)
    return c.json({ error: 'Admin check failed' }, 403)
  }
}

// Health check
app.get('/make-server-1d29bb00/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Debug endpoint - view all data
app.get('/make-server-1d29bb00/debug/data', async (c) => {
  try {
    const allData = await kv.getByPrefix('')
    return c.json({
      totalKeys: allData.length,
      data: allData.map((item) => ({ key: item.key, value: item.value })),
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Debug endpoint - check headers
app.get('/make-server-1d29bb00/debug/headers', (c) => {
  const headers: Record<string, string> = {}
  c.req.raw.headers.forEach((value, key) => {
    headers[key] = value
  })

  return c.json({
    headers,
    userToken: c.req.header('X-User-Token'),
    authorization: c.req.header('Authorization'),
  })
})

// ========== AUTH ENDPOINTS ==========

// Simple sign in
app.post('/make-server-1d29bb00/auth/signin', async (c) => {
  try {
    const { email } = await c.req.json()

    if (!email) {
      return c.json({ error: 'Email is required' }, 400)
    }

    const userId = `user_${email.replace(/[@.]/g, '_')}`
    let userData = await kv.get(`user:${userId}`)

    if (!userData) {
      const isAdmin = email === 'conch.of.magic@gmail.com'
      const name = email.split('@')[0]
      userData = {
        userId,
        email,
        name,
        isAdmin,
        createdAt: new Date().toISOString(),
      }

      await kv.set(`user:${userId}`, userData)
      console.log(`[AUTH] new_user email=${email} id=${userId} isAdmin=${isAdmin}`)
    }

    const token = `simple_${userId}`
    console.log(`[AUTH] signin email=${email}`)

    return c.json({ user: userData, token })
  } catch (error: any) {
    console.error(`[AUTH] signin_error error=${error.message}`)
    return c.json({ error: error.message || 'Internal server error' }, 500)
  }
})

// Get current session
app.get('/make-server-1d29bb00/auth/session', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    let userData = await kv.get(`user:${user.id}`)

    if (!userData) {
      const isAdmin = user.email === 'conch.of.magic@gmail.com'
      userData = {
        userId: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        isAdmin,
        createdAt: new Date().toISOString(),
      }

      await kv.set(`user:${user.id}`, userData)
      console.log(`[AUTH] auto_created_user email=${user.email}`)
    }

    return c.json({ user: userData })
  } catch (error: any) {
    console.error(`[AUTH] get_session_error error=${error.message}`)
    return c.json({ error: error.message || 'Internal server error' }, 500)
  }
})

// ========== SESSION ENDPOINTS ==========

// Get current session (public - no auth)
app.get('/make-server-1d29bb00/session/current', async (c) => {
  try {
    const currentSessionId = await kv.get('session:current')

    if (!currentSessionId) {
      return c.json({ session: null })
    }

    const session = await kv.get(`session:${currentSessionId}`)

    if (!session) {
      return c.json({ session: null })
    }

    // Calculate timeRemaining based on server time
    if (session.phaseStartedAt && session.initialTime) {
      const elapsed = Math.floor((Date.now() - new Date(session.phaseStartedAt).getTime()) / 1000)
      session.timeRemaining = Math.max(0, session.initialTime - elapsed)
    }

    // Don't expose internal pre-calculated matches to client
    delete session.preCalculatedMatches

    return c.json({ session })
  } catch (error: any) {
    console.error(`[SESSION] get_current_error error=${error.message}`)
    return c.json({ error: error.message || 'Internal server error' }, 500)
  }
})

// Join session
app.post('/make-server-1d29bb00/session/join', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const userId = user.id

    let currentSessionId = await kv.get('session:current')

    if (!currentSessionId) {
      currentSessionId = `session_${Date.now()}`
      const newSession = {
        sessionId: currentSessionId,
        date: new Date().toISOString().split('T')[0],
        status: 'waiting',
        participants: [userId],
        matches: {},
        startedAt: null,
      }
      await kv.set(`session:${currentSessionId}`, newSession)
      await kv.set('session:current', currentSessionId)

      console.log(`[SESSION] created session=${currentSessionId} by=${userId}`)

      return c.json({ session: newSession })
    }

    const session = await kv.get(`session:${currentSessionId}`)

    if (!session.participants.includes(userId)) {
      session.participants.push(userId)
      await kv.set(`session:${currentSessionId}`, session)
      console.log(`[SESSION] joined session=${currentSessionId} user=${userId} participants=${session.participants.length}`)
    }

    return c.json({ session })
  } catch (error: any) {
    console.error(`[SESSION] join_error error=${error.message}`)
    return c.json({ error: error.message || 'Internal server error' }, 500)
  }
})

// Leave session
app.post('/make-server-1d29bb00/session/leave', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const userId = user.id

    const currentSessionId = await kv.get('session:current')

    if (!currentSessionId) {
      return c.json({ success: true, message: 'No active session' })
    }

    const session = await kv.get(`session:${currentSessionId}`)

    if (session && session.participants.includes(userId)) {
      session.participants = session.participants.filter((id: string) => id !== userId)

      if (session.participants.length === 0) {
        session.status = 'completed'
        await kv.set(`session:${currentSessionId}`, session)
        await kv.del('session:current')
        console.log(`[SESSION] ended_empty session=${currentSessionId} lastUser=${userId}`)
      } else {
        await kv.set(`session:${currentSessionId}`, session)
        console.log(`[SESSION] left session=${currentSessionId} user=${userId} remaining=${session.participants.length}`)
      }

      return c.json({
        success: true,
        message: 'Left session successfully',
        remainingParticipants: session.participants.length,
        sessionEnded: session.participants.length === 0,
      })
    } else {
      return c.json({ success: true, message: 'User not in session' })
    }
  } catch (error: any) {
    console.error(`[SESSION] leave_error error=${error.message}`)
    return c.json({ error: error.message || 'Internal server error' }, 500)
  }
})

// Request more time (authenticated users)
app.post('/make-server-1d29bb00/session/request-time', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const userId = user.id

    const currentSessionId = await kv.get('session:current')
    if (!currentSessionId) {
      return c.json({ error: 'No active session' }, 400)
    }

    const session = await kv.get(`session:${currentSessionId}`)
    if (!session) {
      return c.json({ error: 'Session not found' }, 404)
    }

    if (!['writing', 'responding', 'reviewing'].includes(session.status)) {
      return c.json({ error: 'Cannot request time in current phase' }, 400)
    }

    if (!session.timeRequests) {
      session.timeRequests = []
    }

    if (session.timeRequests.includes(userId)) {
      return c.json({ error: 'Already requested', alreadyRequested: true }, 400)
    }

    session.timeRequests.push(userId)
    await kv.set(`session:${currentSessionId}`, session)

    console.log(`[TIME_REQUEST] user=${userId} session=${currentSessionId} phase=${session.status} totalRequests=${session.timeRequests.length}`)

    return c.json({ success: true })
  } catch (error: any) {
    console.error(`[TIME_REQUEST] error=${error.message}`)
    return c.json({ error: error.message || 'Internal server error' }, 500)
  }
})

// Get session participants with names (authenticated)
app.get('/make-server-1d29bb00/session/participants', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const userId = user.id

    const currentSessionId = await kv.get('session:current')
    if (!currentSessionId) {
      return c.json({ participants: [], pendingPokes: [] })
    }

    const session = await kv.get(`session:${currentSessionId}`)
    if (!session) {
      return c.json({ participants: [], pendingPokes: [] })
    }

    // Get participant names (exclude admin)
    const participantList = []
    for (const pid of session.participants) {
      const userData = await kv.get(`user:${pid}`)
      if (userData && !userData.isAdmin) {
        participantList.push({ userId: pid, name: userData.name })
      }
    }

    // Check for pending pokes directed at current user
    const pokeKeys = await kv.getByPrefix(`poke:${currentSessionId}:${userId}:`)
    const pendingPokes = pokeKeys.map((p: any) => p.value)

    // Delete consumed pokes
    if (pokeKeys.length > 0) {
      await kv.mdel(pokeKeys.map((p: any) => p.key))
    }

    return c.json({ participants: participantList, pendingPokes })
  } catch (error: any) {
    console.error(`[PARTICIPANTS] error=${error.message}`)
    return c.json({ error: error.message || 'Internal server error' }, 500)
  }
})

// Poke a user (authenticated)
app.post('/make-server-1d29bb00/session/poke', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const userId = user.id
    const { targetUserId } = await c.req.json()

    if (!targetUserId) {
      return c.json({ error: 'targetUserId is required' }, 400)
    }

    if (targetUserId === userId) {
      return c.json({ error: 'Cannot poke yourself' }, 400)
    }

    const currentSessionId = await kv.get('session:current')
    if (!currentSessionId) {
      return c.json({ error: 'No active session' }, 400)
    }

    const userData = await kv.get(`user:${userId}`)
    const pokeKey = `poke:${currentSessionId}:${targetUserId}:${userId}`
    await kv.set(pokeKey, {
      fromUserId: userId,
      fromName: userData?.name || 'Unknown',
      timestamp: new Date().toISOString(),
    })

    console.log(`[POKE] from=${userId} to=${targetUserId} session=${currentSessionId}`)

    return c.json({ success: true })
  } catch (error: any) {
    console.error(`[POKE] error=${error.message}`)
    return c.json({ error: error.message || 'Internal server error' }, 500)
  }
})

// ========== DIARY ENDPOINTS ==========

// Write diary
app.post('/make-server-1d29bb00/diary/write', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const userId = user.id
    const { content } = await c.req.json()

    const currentSessionId = await kv.get('session:current')

    if (!currentSessionId) {
      return c.json({ error: 'No active session' }, 400)
    }

    const diaryId = `diary_${userId}_${Date.now()}`
    const diary = {
      diaryId,
      sessionId: currentSessionId,
      userId,
      content,
      characterCount: content.length,
      completedAt: new Date().toISOString(),
    }

    await kv.set(`diary:${diaryId}`, diary)
    await kv.set(`diary:session:${currentSessionId}:user:${userId}`, diaryId)

    console.log(`[DIARY] written user=${userId} session=${currentSessionId} diaryId=${diaryId} chars=${content.length}`)

    return c.json({ diary })
  } catch (error: any) {
    console.error(`[DIARY] write_error user=${c.get('user')?.id} error=${error.message}`)
    return c.json({ error: error.message || 'Internal server error' }, 500)
  }
})

// Get assigned diary
app.get('/make-server-1d29bb00/diary/assigned', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const userId = user.id

    const currentSessionId = await kv.get('session:current')
    if (!currentSessionId) {
      return c.json({ error: 'No active session' }, 400)
    }

    const session = await kv.get(`session:${currentSessionId}`)
    const assignedUserId = session.matches?.[userId]

    if (!assignedUserId) {
      return c.json({ error: 'No diary assigned' }, 404)
    }

    const diaryId = await kv.get(`diary:session:${currentSessionId}:user:${assignedUserId}`)
    const diary = await kv.get(`diary:${diaryId}`)

    const authorData = await kv.get(`user:${assignedUserId}`)
    const diaryWithAuthor = {
      ...diary,
      authorName: authorData?.name || 'Unknown',
    }

    return c.json({ diary: diaryWithAuthor })
  } catch (error: any) {
    console.error(`[DIARY] assigned_error error=${error.message}`)
    return c.json({ error: error.message || 'Internal server error' }, 500)
  }
})

// Admin: Get all users' diary history
app.get('/make-server-1d29bb00/admin/diary/history', authMiddleware, adminMiddleware, async (c) => {
  try {
    const allSessions = await kv.getByPrefix('session:')
    const history = []

    for (const sessionItem of allSessions) {
      if (sessionItem.key === 'session:current') continue
      const sessionData = sessionItem.value
      if (sessionData.status !== 'completed') continue
      if (!sessionData.participants?.length) continue

      const entries = []

      for (const userId of sessionData.participants) {
        const userData = await kv.get(`user:${userId}`)
        const diaryId = await kv.get(`diary:session:${sessionData.sessionId}:user:${userId}`)
        const diary = diaryId ? await kv.get(`diary:${diaryId}`) : null

        let response = null
        let review = null

        if (diary) {
          const responseId = await kv.get(`response:diary:${diaryId}`)
          if (responseId) {
            const responseData = await kv.get(`response:${responseId}`)
            if (responseData) {
              const respondentData = await kv.get(`user:${responseData.userId}`)
              response = {
                content: responseData.content,
                respondentId: responseData.userId,
                respondentName: respondentData?.name || 'Unknown',
                completedAt: responseData.completedAt,
              }
            }

            const reviewId = await kv.get(`review:response:${responseId}`)
            if (reviewId) {
              const reviewData = await kv.get(`review:${reviewId}`)
              if (reviewData) {
                review = {
                  highlights: reviewData.highlights,
                  comment: reviewData.comment,
                  completedAt: reviewData.completedAt,
                }
              }
            }
          }
        }

        entries.push({
          userId,
          userName: userData?.name || 'Unknown',
          userEmail: userData?.email || '',
          diary: diary ? { content: diary.content, completedAt: diary.completedAt } : undefined,
          response: response || undefined,
          review: review || undefined,
        })
      }

      history.push({
        sessionId: sessionData.sessionId,
        date: sessionData.date,
        entries,
      })
    }

    history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    console.log(`[ADMIN] history_fetched sessions=${history.length}`)
    return c.json({ history })
  } catch (error: any) {
    console.error(`[ADMIN] history_error error=${error.message}`)
    return c.json({ error: error.message || 'Internal server error' }, 500)
  }
})

// Get diary history
app.get('/make-server-1d29bb00/diary/history', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const userId = user.id

    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

    const allSessions = await kv.getByPrefix('session:')
    const userHistory = []

    for (const sessionItem of allSessions) {
      if (sessionItem.key === 'session:current') continue

      const sessionData = sessionItem.value
      if (!sessionData.participants?.includes(userId)) continue

      const sessionDate = new Date(sessionData.date)
      if (sessionDate < twoWeeksAgo) continue

      const diaryId = await kv.get(`diary:session:${sessionData.sessionId}:user:${userId}`)
      const diary = diaryId ? await kv.get(`diary:${diaryId}`) : null

      let response = null
      let review = null

      if (diary) {
        const responseId = await kv.get(`response:diary:${diaryId}`)
        if (responseId) {
          response = await kv.get(`response:${responseId}`)
          const reviewId = await kv.get(`review:response:${responseId}`)
          if (reviewId) {
            review = await kv.get(`review:${reviewId}`)
          }
        }
      }

      userHistory.push({
        sessionId: sessionData.sessionId,
        date: sessionData.date,
        participated: !!diary,
        diary,
        response,
        review,
      })
    }

    userHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return c.json({ history: userHistory })
  } catch (error: any) {
    console.error(`[DIARY] history_error error=${error.message}`)
    return c.json({ error: error.message || 'Internal server error' }, 500)
  }
})

// ========== RESPONSE ENDPOINTS ==========

// Write response
app.post('/make-server-1d29bb00/response/write', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const userId = user.id
    const { diaryId, content } = await c.req.json()

    const diary = await kv.get(`diary:${diaryId}`)

    const responseId = `response_${userId}_${Date.now()}`
    const response = {
      responseId,
      diaryId,
      userId,
      content,
      completedAt: new Date().toISOString(),
    }

    await kv.set(`response:${responseId}`, response)
    await kv.set(`response:diary:${diaryId}`, responseId)

    // Update matching in session
    if (diary && diary.sessionId) {
      const session = await kv.get(`session:${diary.sessionId}`)
      if (session) {
        if (!session.matches) {
          session.matches = {}
        }
        session.matches[userId] = diary.userId
        await kv.set(`session:${diary.sessionId}`, session)
      }
    }

    console.log(`[RESPONSE] written user=${userId} diaryId=${diaryId} responseId=${responseId} chars=${content?.length || 0} diaryAuthor=${diary?.userId}`)

    return c.json({ response })
  } catch (error: any) {
    console.error(`[RESPONSE] write_error error=${error.message}`)
    return c.json({ error: error.message || 'Internal server error' }, 500)
  }
})

// Get response for my diary
app.get('/make-server-1d29bb00/response/my-diary', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const userId = user.id

    const currentSessionId = await kv.get('session:current')
    if (!currentSessionId) {
      return c.json({ error: 'No active session' }, 400)
    }

    const diaryId = await kv.get(`diary:session:${currentSessionId}:user:${userId}`)
    if (!diaryId) {
      return c.json({ error: 'No diary found' }, 404)
    }

    const responseId = await kv.get(`response:diary:${diaryId}`)
    if (!responseId) {
      return c.json({ response: null })
    }

    const response = await kv.get(`response:${responseId}`)
    const diary = await kv.get(`diary:${diaryId}`)

    const responderData = await kv.get(`user:${response.userId}`)
    const responseWithName = {
      ...response,
      respondentName: responderData?.name || 'Unknown',
    }

    return c.json({ response: responseWithName, diary })
  } catch (error: any) {
    console.error(`[RESPONSE] my_diary_error error=${error.message}`)
    return c.json({ error: error.message || 'Internal server error' }, 500)
  }
})

// ========== REVIEW ENDPOINTS ==========

// Write review
app.post('/make-server-1d29bb00/review/write', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const userId = user.id
    const { responseId, highlights, comment } = await c.req.json()

    const reviewId = `review_${userId}_${Date.now()}`
    const review = {
      reviewId,
      responseId,
      userId,
      highlights,
      comment,
      completedAt: new Date().toISOString(),
    }

    await kv.set(`review:${reviewId}`, review)
    await kv.set(`review:response:${responseId}`, reviewId)

    console.log(`[REVIEW] written user=${userId} responseId=${responseId} reviewId=${reviewId} highlights=${highlights?.length || 0}`)

    return c.json({ review })
  } catch (error: any) {
    console.error(`[REVIEW] write_error error=${error.message}`)
    return c.json({ error: error.message || 'Internal server error' }, 500)
  }
})

// ========== ADMIN ENDPOINTS ==========

// Get all users
app.get('/make-server-1d29bb00/admin/users', authMiddleware, adminMiddleware, async (c) => {
  try {
    const allUsers = await kv.getByPrefix('user:')
    const users = allUsers.map((u) => u.value)
    return c.json({ users })
  } catch (error: any) {
    console.error(`[ADMIN] get_users_error error=${error.message}`)
    return c.json({ error: error.message || 'Internal server error' }, 500)
  }
})

// Start session
app.post('/make-server-1d29bb00/admin/session/start', authMiddleware, adminMiddleware, async (c) => {
  try {
    const currentSessionId = await kv.get('session:current')

    if (!currentSessionId) {
      return c.json({ error: 'No session to start' }, 400)
    }

    const session = await kv.get(`session:${currentSessionId}`)

    if (!session) {
      return c.json({ error: 'Session not found' }, 404)
    }

    // Transition to writing phase
    session.status = 'writing'
    session.startedAt = new Date().toISOString()
    session.phaseStartedAt = new Date().toISOString()
    session.initialTime = 600 // 10 minutes for writing
    session.timeRemaining = 600
    session.timeRequests = []

    // Pre-calculate matching and save for reuse at responding phase
    try {
      const matchingResult = await generateMatches(session.participants)
      session.matchingWarning = matchingResult.hasWarning
      session.preCalculatedMatches = matchingResult.matches
    } catch (matchingError: any) {
      console.error(`[MATCHING] precalc_error error=${matchingError.message}`)
      session.matchingWarning = true
    }

    await kv.set(`session:${currentSessionId}`, session)

    console.log(
      `[PHASE] started session=${currentSessionId} phase=writing participants=${session.participants.length} matchingWarning=${session.matchingWarning}`,
    )

    return c.json({ session })
  } catch (error: any) {
    console.error(`[PHASE] start_error error=${error.message}`)
    return c.json({ error: error.message || 'Internal server error' }, 500)
  }
})

// Next phase
app.post('/make-server-1d29bb00/admin/session/next', authMiddleware, adminMiddleware, async (c) => {
  try {
    const currentSessionId = await kv.get('session:current')

    if (!currentSessionId) {
      return c.json({ error: 'No active session' }, 400)
    }

    const session = await kv.get(`session:${currentSessionId}`)

    const statusOrder = ['waiting', 'writing', 'responding', 'reviewing', 'completed']
    const currentIndex = statusOrder.indexOf(session.status)

    if (currentIndex === -1 || currentIndex >= statusOrder.length - 1) {
      return c.json({ error: 'Cannot advance session' }, 400)
    }

    const nextStatus = statusOrder[currentIndex + 1]
    session.status = nextStatus

    // Set timer for each phase
    if (nextStatus === 'writing') {
      session.phaseStartedAt = new Date().toISOString()
      session.initialTime = 600
      session.timeRemaining = 600
      session.timeRequests = []

      const matchingResult = await generateMatches(session.participants)
      session.matchingWarning = matchingResult.hasWarning
      session.preCalculatedMatches = matchingResult.matches
    } else if (nextStatus === 'responding') {
      session.phaseStartedAt = new Date().toISOString()
      session.initialTime = 300
      session.timeRemaining = 300
      session.timeRequests = []

      // Reuse pre-calculated matches from writing phase
      if (session.preCalculatedMatches && Object.keys(session.preCalculatedMatches).length > 0) {
        session.matches = session.preCalculatedMatches
      } else {
        // Fallback: generate new matches
        const matchingResult = await generateMatches(session.participants)
        session.matches = matchingResult.matches
        session.matchingWarning = matchingResult.hasWarning
      }
      delete session.preCalculatedMatches
    } else if (nextStatus === 'reviewing') {
      session.phaseStartedAt = new Date().toISOString()
      session.initialTime = 300
      session.timeRemaining = 300
      session.timeRequests = []
    }

    if (nextStatus === 'completed') {
      await kv.del('session:current')
    }

    await kv.set(`session:${currentSessionId}`, session)

    console.log(`[PHASE] advanced session=${currentSessionId} from=${statusOrder[currentIndex]} to=${nextStatus}`)

    return c.json({ session })
  } catch (error: any) {
    console.error(`[PHASE] next_error error=${error.message}`)
    return c.json({ error: error.message || 'Internal server error' }, 500)
  }
})

// Set matching exclusions
app.post('/make-server-1d29bb00/admin/matching/exclude', authMiddleware, adminMiddleware, async (c) => {
  try {
    const body = await c.req.json()
    const { excludedPairs } = body

    if (!excludedPairs) {
      return c.json({ error: 'excludedPairs is required' }, 400)
    }

    if (!Array.isArray(excludedPairs)) {
      return c.json({ error: 'excludedPairs must be an array' }, 400)
    }

    await kv.set('matching:config', { excludedPairs })

    console.log(`[ADMIN] matching_config_saved pairs=${excludedPairs.length}`)

    return c.json({ success: true })
  } catch (error: any) {
    console.error(`[ADMIN] matching_config_error error=${error.message}`)
    return c.json({ error: error.message || 'Internal server error' }, 500)
  }
})

// Get matching config
app.get('/make-server-1d29bb00/admin/matching/config', authMiddleware, adminMiddleware, async (c) => {
  try {
    const config = (await kv.get('matching:config')) || { excludedPairs: [] }
    return c.json({ config })
  } catch (error: any) {
    console.error(`[ADMIN] get_matching_config_error error=${error.message}`)
    return c.json({ error: error.message || 'Internal server error' }, 500)
  }
})

// Get last matching result (admin only)
app.get('/make-server-1d29bb00/admin/matching/result', authMiddleware, adminMiddleware, async (c) => {
  try {
    const result = await kv.get('matching:last_result')

    if (!result) {
      return c.json({ result: null })
    }

    const enrichedMatches: Record<string, any> = {}
    for (const [userId, targetId] of Object.entries(result.matches)) {
      const user = await kv.get(`user:${userId}`)
      const target = await kv.get(`user:${targetId}`)

      enrichedMatches[userId] = {
        targetId,
        userName: user?.name || 'Unknown',
        targetName: target?.name || 'Unknown',
      }
    }

    return c.json({
      result: {
        ...result,
        enrichedMatches,
      },
    })
  } catch (error: any) {
    console.error(`[ADMIN] get_matching_result_error error=${error.message}`)
    return c.json({ error: error.message || 'Internal server error' }, 500)
  }
})

// Get participant statuses
app.get('/make-server-1d29bb00/admin/session/statuses', authMiddleware, adminMiddleware, async (c) => {
  try {
    const currentSessionId = await kv.get('session:current')

    if (!currentSessionId) {
      return c.json({ statuses: [] })
    }

    const session = await kv.get(`session:${currentSessionId}`)

    const statuses = []

    for (const userId of session.participants) {
      const user = await kv.get(`user:${userId}`)

      if (!user) continue

      // Skip admin users
      if (user.isAdmin || user.email === 'conch.of.magic@gmail.com') continue

      let completed = false

      if (session.status === 'writing') {
        const diaryId = await kv.get(`diary:session:${currentSessionId}:user:${userId}`)
        completed = !!diaryId
      } else if (session.status === 'responding') {
        const assignedUserId = session.matches?.[userId]

        if (assignedUserId) {
          const assignedDiaryId = await kv.get(`diary:session:${currentSessionId}:user:${assignedUserId}`)
          if (assignedDiaryId) {
            const responseId = await kv.get(`response:diary:${assignedDiaryId}`)
            if (responseId) {
              const response = await kv.get(`response:${responseId}`)
              if (response && response.userId === userId) {
                completed = true
              }
            }
          }
        }

        // Fallback: scan all responses
        if (!completed) {
          const allResponses = await kv.getByPrefix('response:')
          for (const responseItem of allResponses) {
            if (responseItem.key.startsWith('response:diary:')) continue

            const response = responseItem.value
            if (response.userId === userId) {
              const diary = await kv.get(`diary:${response.diaryId}`)
              if (diary && diary.sessionId === currentSessionId) {
                completed = true
                break
              }
            }
          }
        }
      } else if (session.status === 'reviewing') {
        const diaryId = await kv.get(`diary:session:${currentSessionId}:user:${userId}`)
        if (diaryId) {
          const responseId = await kv.get(`response:diary:${diaryId}`)
          if (responseId) {
            const reviewId = await kv.get(`review:response:${responseId}`)
            completed = !!reviewId
          }
        }
      }

      statuses.push({
        userId,
        name: user?.name || 'Unknown',
        email: user?.email || '',
        completed,
      })
    }

    return c.json({ statuses, session })
  } catch (error: any) {
    console.error(`[ADMIN] statuses_error error=${error.message}`)
    return c.json({ error: error.message || 'Internal server error' }, 500)
  }
})

// Delete user (admin only)
app.post('/make-server-1d29bb00/admin/user/delete', authMiddleware, adminMiddleware, async (c) => {
  try {
    const { userId } = await c.req.json()

    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400)
    }

    const userData = await kv.get(`user:${userId}`)
    if (!userData) {
      return c.json({ error: 'User not found' }, 404)
    }

    // Delete user data
    await kv.del(`user:${userId}`)

    // Remove user from current session
    const currentSessionId = await kv.get('session:current')
    if (currentSessionId) {
      const session = await kv.get(`session:${currentSessionId}`)
      if (session && session.participants.includes(userId)) {
        session.participants = session.participants.filter((id: string) => id !== userId)
        await kv.set(`session:${currentSessionId}`, session)
      }
    }

    // Remove user from matching exclusions
    const matchingConfig = (await kv.get('matching:config')) || { excludedPairs: [] }
    const originalPairCount = matchingConfig.excludedPairs.length
    matchingConfig.excludedPairs = matchingConfig.excludedPairs.filter((pair: string[]) => !pair.includes(userId))
    await kv.set('matching:config', matchingConfig)

    console.log(`[ADMIN] user_deleted userId=${userId} email=${userData.email} removedPairs=${originalPairCount - matchingConfig.excludedPairs.length}`)

    return c.json({ success: true })
  } catch (error: any) {
    console.error(`[ADMIN] delete_user_error error=${error.message}`)
    return c.json({ error: error.message || 'Internal server error' }, 500)
  }
})

// Reset current session only (admin only)
app.post('/make-server-1d29bb00/admin/session/reset', authMiddleware, adminMiddleware, async (c) => {
  try {
    const currentSessionId = await kv.get('session:current')

    if (!currentSessionId) {
      return c.json({
        success: true,
        message: 'No active session to reset',
      })
    }

    const keysToDelete: string[] = []

    // Delete current session pointer
    keysToDelete.push('session:current')

    // Delete current session data
    keysToDelete.push(`session:${currentSessionId}`)

    // Delete pokes for current session
    const pokeKeys = await kv.getByPrefix(`poke:${currentSessionId}:`)
    keysToDelete.push(...pokeKeys.map((p: any) => p.key))

    // Execute deletions
    if (keysToDelete.length > 0) {
      await kv.mdel(keysToDelete)
    }

    console.log(`[ADMIN] session_reset sessionId=${currentSessionId} deleted=${keysToDelete.length} keys`)

    return c.json({
      success: true,
      message: 'Current session reset successfully (history preserved)',
      deleted: {
        sessionId: currentSessionId,
        totalKeys: keysToDelete.length,
      },
    })
  } catch (error: any) {
    console.error(`[ADMIN] reset_error error=${error.message}`)
    return c.json({ error: error.message || 'Internal server error' }, 500)
  }
})

// Update session timer (admin only)
app.post('/make-server-1d29bb00/admin/session/timer', authMiddleware, adminMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const { timeRemaining } = await c.req.json()

    const currentSessionId = await kv.get('session:current')
    if (!currentSessionId) {
      return c.json({ error: 'No active session' }, 400)
    }

    const session = await kv.get(`session:${currentSessionId}`)

    const prevTime = session.timeRemaining
    const delta = timeRemaining - prevTime
    const clearedRequests = session.timeRequests?.length || 0

    session.phaseStartedAt = new Date().toISOString()
    session.initialTime = timeRemaining
    session.timeRemaining = timeRemaining
    session.timeRequests = []

    await kv.set(`session:${currentSessionId}`, session)

    console.log(
      `[TIMER_ADJUST] admin=${user.id} session=${currentSessionId} phase=${session.status} prevTime=${prevTime} newTime=${timeRemaining} delta=${delta > 0 ? '+' : ''}${delta}s clearedRequests=${clearedRequests}`,
    )

    return c.json({ session })
  } catch (error: any) {
    console.error(`[TIMER_ADJUST] error=${error.message}`)
    return c.json({ error: error.message || 'Internal server error' }, 500)
  }
})

// Helper function to generate matches
async function generateMatches(participants: string[]) {
  try {
    // Filter out admin users from matching
    const nonAdminParticipants: string[] = []
    for (const userId of participants) {
      const userData = await kv.get(`user:${userId}`)
      if (userData && !userData.isAdmin) {
        nonAdminParticipants.push(userId)
      }
    }

    if (nonAdminParticipants.length <= 1) {
      return { matches: {}, hasWarning: true }
    }

    const matchingConfig = (await kv.get('matching:config')) || { excludedPairs: [] }
    const excluded = new Set(matchingConfig.excludedPairs.map((pair: string[]) => pair.sort().join('|')))

    const canMatch = (userId1: string, userId2: string) => {
      const pairKey = [userId1, userId2].sort().join('|')
      return !excluded.has(pairKey)
    }

    // Try circular matching: A→B→C→D→A
    const shuffled = [...nonAdminParticipants].sort(() => Math.random() - 0.5)

    let matches: Record<string, string> = {}
    let success = false

    for (let attempt = 0; attempt < 100; attempt++) {
      matches = {}
      let valid = true

      for (let i = 0; i < shuffled.length; i++) {
        const current = shuffled[i]
        const next = shuffled[(i + 1) % shuffled.length]

        if (!canMatch(current, next)) {
          valid = false
          break
        }

        matches[current] = next
      }

      if (valid) {
        success = true
        break
      }

      shuffled.sort(() => Math.random() - 0.5)
    }

    // Fallback: best-effort matching (violate exclusions if necessary)
    if (!success) {
      matches = {}

      const receivers = [...nonAdminParticipants]
      const availableWriters = [...nonAdminParticipants]

      receivers.sort(() => Math.random() - 0.5)

      for (const receiver of receivers) {
        const validWriters = availableWriters.filter((writer) => writer !== receiver && canMatch(writer, receiver))

        let selectedWriter: string | null = null

        if (validWriters.length > 0) {
          selectedWriter = validWriters[Math.floor(Math.random() * validWriters.length)]
        } else {
          const forcedWriters = availableWriters.filter((w) => w !== receiver)
          if (forcedWriters.length > 0) {
            selectedWriter = forcedWriters[Math.floor(Math.random() * forcedWriters.length)]
          }
        }

        if (selectedWriter) {
          matches[selectedWriter] = receiver
          const writerIndex = availableWriters.indexOf(selectedWriter)
          if (writerIndex !== -1) {
            availableWriters.splice(writerIndex, 1)
          }
        }
      }
    }

    // Check matching quality
    const writers = Object.keys(matches)
    const receiversSet = new Set(Object.values(matches))
    const noResponse = nonAdminParticipants.filter((id) => !receiversSet.has(id))
    const noWrite = nonAdminParticipants.filter((id) => !matches[id])

    let hasExclusionViolations = false
    const violatedPairs: string[][] = []

    for (const [writer, receiver] of Object.entries(matches)) {
      if (!canMatch(writer, receiver)) {
        hasExclusionViolations = true
        violatedPairs.push([writer, receiver])
      }
    }

    // Save matching results
    const matchingResult = {
      timestamp: new Date().toISOString(),
      algorithm: success ? 'circular' : 'best-effort',
      totalParticipants: nonAdminParticipants.length,
      totalMatches: writers.length,
      allUsersMatched: noResponse.length === 0 && noWrite.length === 0,
      hasExclusionViolations,
      violatedPairs,
      matches,
      usersWithoutResponse: noResponse,
      usersWithoutAssignment: noWrite,
    }

    await kv.set('matching:last_result', matchingResult)

    const hasWarning = !success || noResponse.length > 0 || noWrite.length > 0 || hasExclusionViolations

    console.log(
      `[MATCHING] algorithm=${success ? 'circular' : 'best-effort'} participants=${nonAdminParticipants.length} matches=${writers.length} exclusionViolations=${violatedPairs.length} warning=${hasWarning}`,
    )

    return {
      matches,
      hasWarning,
      allUsersMatched: matchingResult.allUsersMatched,
    }
  } catch (error: any) {
    console.error(`[MATCHING] error=${error.message}`)
    return { matches: {}, hasWarning: true }
  }
}

Deno.serve(app.fetch)
