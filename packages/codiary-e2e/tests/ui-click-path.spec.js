import { expect, test } from '@playwright/test'

const projectId = process.env.CODIARY_PROJECT_ID ?? 'avdjlznhehigqgmeubpb'
const anonKey =
  process.env.CODIARY_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2ZGpsem5oZWhpZ3FnbWV1YnBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MTk5OTQsImV4cCI6MjA4NDk5NTk5NH0.8HG1GMYIME6cGbdMMGl74Zmooib06JBsWw3Ek1Ldxkc'
const apiBase = `https://${projectId}.supabase.co/functions/v1/make-server-1d29bb00`

const adminEmail = 'conch.of.magic@gmail.com'
const userEmail = 'alice@example.com'
const helperEmail = 'bob@example.com'

const toToken = (email) => `simple_user_${email.replace(/[@.]/g, '_')}`

const authHeaders = (token) => ({
  Authorization: `Bearer ${anonKey}`,
  ...(token ? { 'X-User-Token': token } : {}),
})

test('ui render and click path smoke across user/admin flows', async ({ browser, request, baseURL }) => {
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

  const waitForValue = async (producer, timeoutMs = 20000, stepMs = 1000) => {
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
  await post('/auth/signin', { email: userEmail })
  await post('/auth/signin', { email: helperEmail })

  const userContext = await browser.newContext()
  const adminContext = await browser.newContext()
  const userPage = await userContext.newPage()
  const adminPage = await adminContext.newPage()

  await userPage.goto(baseURL || 'http://127.0.0.1:4173')
  await userPage.getByTestId('auth-email-input').fill(userEmail)
  await userPage.getByTestId('auth-submit-button').click()
  await expect(userPage.getByTestId('waiting-room')).toBeVisible({ timeout: 20000 })
  await post('/session/join', {}, toToken(helperEmail))

  await userPage.getByTestId('waiting-calendar-button').click()
  await expect(userPage.getByTestId('calendar-view')).toBeVisible({ timeout: 10000 })
  await userPage.getByTestId('calendar-back-button').click()
  await expect(userPage.getByTestId('waiting-room')).toBeVisible({ timeout: 10000 })

  await adminPage.goto(baseURL || 'http://127.0.0.1:4173')
  await adminPage.getByTestId('auth-email-input').fill(adminEmail)
  await adminPage.getByTestId('auth-submit-button').click()
  await expect(adminPage.getByTestId('admin-waiting-room')).toBeVisible({ timeout: 20000 })

  await adminPage.getByTestId('admin-matching-button').click()
  await expect(adminPage.getByTestId('matching-config')).toBeVisible({ timeout: 10000 })
  await adminPage.getByTestId('matching-close-button').click()
  await expect(adminPage.getByTestId('admin-waiting-room')).toBeVisible({ timeout: 10000 })

  const joinedCount = await waitForValue(async () => {
    const statuses = await get('/admin/session/statuses', adminToken)
    const list = statuses.statuses ?? []
    return list.length >= 1 ? list.length : null
  })
  expect(joinedCount).toBeGreaterThanOrEqual(1)

  await adminPage.getByTestId('admin-start-session-button').click()
  await expect(adminPage.getByTestId('admin-session-control')).toBeVisible({ timeout: 10000 })

  await expect(userPage.getByTestId('diary-editor')).toBeVisible({ timeout: 15000 })
  await userPage.getByTestId('diary-textarea').fill('ui smoke diary content')

  const ring = userPage.getByTestId('diary-submit-ring')
  const box = await ring.boundingBox()
  expect(box).toBeTruthy()
  await userPage.mouse.move(box.x + 8, box.y + 8)
  await userPage.mouse.down()
  await userPage.mouse.move(box.x + 160, box.y + 8)
  await userPage.mouse.up()

  await post('/diary/write', { content: 'ui smoke diary content fallback' }, toToken(userEmail))
  await post('/diary/write', { content: 'ui helper diary content fallback' }, toToken(helperEmail))

  await adminPage.getByTestId('control-next-phase-button').click()
  await expect(userPage.getByTestId('response-editor')).toBeVisible({ timeout: 15000 })
  await userPage.getByTestId('response-textarea').fill('ui smoke response content')
  await userPage.getByTestId('response-submit-button').click()

  const assigned = await get('/diary/assigned', toToken(userEmail))
  await post('/response/write', { diaryId: assigned.diary.diaryId, content: 'ui smoke response content fallback' }, toToken(userEmail))
  const helperAssigned = await get('/diary/assigned', toToken(helperEmail))
  await post('/response/write', { diaryId: helperAssigned.diary.diaryId, content: 'ui helper response content fallback' }, toToken(helperEmail))

  await adminPage.getByTestId('control-next-phase-button').click()
  await expect(userPage.getByTestId('review-editor')).toBeVisible({ timeout: 15000 })
  await userPage.getByTestId('review-comment-textarea').fill('ui smoke review comment')

  await userPage.evaluate(() => {
    const container = document.getElementById('response-content')
    const target = container?.querySelector('p')
    if (!container || !target || !target.firstChild) return
    const range = document.createRange()
    range.setStart(target.firstChild, 0)
    range.setEnd(target.firstChild, 2)
    const selection = window.getSelection()
    if (!selection) return
    selection.removeAllRanges()
    selection.addRange(range)
    container.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
  })

  await expect(userPage.getByTestId('review-submit-button')).toBeDisabled()

  const myResponse = await get('/response/my-diary', toToken(userEmail))
  await post(
    '/review/write',
    {
      responseId: myResponse.response.responseId,
      highlights: [{ text: 'ui', startIdx: 0, endIdx: 2 }],
      comment: 'ui smoke review fallback',
    },
    toToken(userEmail),
  )
  await adminPage.getByTestId('control-next-phase-button').click()

  await expect(userPage.getByTestId('waiting-room')).toBeVisible({ timeout: 20000 })

  await userContext.close()
  await adminContext.close()
})
