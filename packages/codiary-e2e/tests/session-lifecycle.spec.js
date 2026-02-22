import { expect, test } from '@playwright/test'

const projectId = process.env.CODIARY_PROJECT_ID ?? 'avdjlznhehigqgmeubpb'
const anonKey =
  process.env.CODIARY_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2ZGpsem5oZWhpZ3FnbWV1YnBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MTk5OTQsImV4cCI6MjA4NDk5NTk5NH0.8HG1GMYIME6cGbdMMGl74Zmooib06JBsWw3Ek1Ldxkc'
const apiBase = `https://${projectId}.supabase.co/functions/v1/make-server-1d29bb00`

const adminEmail = 'conch.of.magic@gmail.com'
const userEmails = ['alice@example.com', 'bob@example.com', 'charlie@example.com']

const toToken = (email) => `simple_user_${email.replace(/[@.]/g, '_')}`

const authHeaders = (token) => ({
  Authorization: `Bearer ${anonKey}`,
  ...(token ? { 'X-User-Token': token } : {}),
})

test('exchange-diary lifecycle persists diary/response/review chains', async ({ request }) => {
  const runId = `e2e-${Date.now()}`
  const users = userEmails.map((email) => ({ email, token: toToken(email) }))
  const adminToken = toToken(adminEmail)

  const post = async (path, payload, token) => {
    const response = await request.post(`${apiBase}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(token),
      },
      data: payload,
    })

    expect(response.ok(), `${path} failed with ${response.status()}`).toBeTruthy()
    return response.json()
  }

  const get = async (path, token) => {
    const response = await request.get(`${apiBase}${path}`, {
      headers: authHeaders(token),
    })

    expect(response.ok(), `${path} failed with ${response.status()}`).toBeTruthy()
    return response.json()
  }

  const waitForValue = async (producer, timeoutMs = 30000, stepMs = 1000) => {
    const startedAt = Date.now()
    while (Date.now() - startedAt < timeoutMs) {
      const value = await producer()
      if (value) return value
      await new Promise((resolve) => {
        setTimeout(resolve, stepMs)
      })
    }
    return null
  }

  await post('/admin/session/reset', {}, adminToken)

  await post('/auth/signin', { email: adminEmail })
  for (const user of users) {
    await post('/auth/signin', { email: user.email })
  }

  for (const user of users) {
    await post('/session/join', {}, user.token)
  }

  const joinedCount = await waitForValue(async () => {
    const statuses = await get('/admin/session/statuses', adminToken)
    const list = statuses.statuses ?? []
    return list.length >= users.length ? list.length : null
  })
  expect(joinedCount).toBe(users.length)

  const started = await post('/admin/session/start', {}, adminToken)
  expect(started.session?.status).toBe('writing')

  await Promise.all(users.map((user) => post('/diary/write', { content: `${runId} diary from ${user.email}` }, user.token)))

  const responding = await post('/admin/session/next', {}, adminToken)
  expect(responding.session?.status).toBe('responding')

  for (const user of users) {
    const diaryId = await waitForValue(async () => {
      const response = await request.get(`${apiBase}/diary/assigned`, {
        headers: authHeaders(user.token),
      })
      if (!response.ok()) return null
      const assigned = await response.json()
      return assigned.diary?.diaryId ?? null
    })
    expect(diaryId).toBeTruthy()
    await post('/response/write', { diaryId, content: `${runId} response from ${user.email}` }, user.token)
  }

  const reviewing = await post('/admin/session/next', {}, adminToken)
  expect(reviewing.session?.status).toBe('reviewing')

  for (const user of users) {
    const mine = await waitForValue(async () => {
      const response = await request.get(`${apiBase}/response/my-diary`, {
        headers: authHeaders(user.token),
      })
      if (!response.ok()) return null
      const payload = await response.json()
      if (!payload.response?.responseId) return null
      return payload.response
    })
    expect(mine).toBeTruthy()
    const responseId = mine.responseId
    const responseText = mine.content ?? ''
    expect(responseId).toBeTruthy()

    const text = responseText.length >= 2 ? responseText.slice(0, 2) : responseText || runId.slice(0, 2)
    await post(
      '/review/write',
      {
        responseId,
        highlights: [{ text, startIdx: 0, endIdx: Math.max(1, text.length) }],
        comment: `${runId} review from ${user.email}`,
      },
      user.token,
    )
  }

  const completed = await post('/admin/session/next', {}, adminToken)
  expect(completed.session?.status).toBe('completed')

  await expect
    .poll(
      async () => {
        const debugData = await get('/debug/data')
        const items = debugData.data ?? []
        return items.some((item) => JSON.stringify(item.value).includes(runId))
      },
      {
        timeout: 45000,
        intervals: [1000, 2000, 3000],
      },
    )
    .toBeTruthy()

  const debug = await get('/debug/data')
  const data = debug.data ?? []
  const completedSession = data
    .filter((item) => item.key.startsWith('session:') && item.key !== 'session:current')
    .find((item) => item.value?.status === 'completed' && item.value?.participants?.length === users.length)

  expect(completedSession).toBeTruthy()
})
