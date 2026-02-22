const conchBaseUrl = process.env.CONCH_BASE_URL || process.env.EXPO_PUBLIC_API_URL || 'https://test.magicofconch.my'
const adminBaseUrl = process.env.ADMIN_BASE_URL || 'https://test.magicofconch.my'
const adminName = process.env.ADMIN_SMOKE_NAME || 'smoke-user'
const adminPassword = process.env.ADMIN_SMOKE_PASSWORD || 'smoke-pass'

async function readResponseBody(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function assertConchLogin(status: number, body: unknown) {
  if (status === 200) return

  if (status === 404 && body && typeof body === 'object') {
    const code = (body as { code?: string }).code
    if (code === 'USR-003') return
  }

  throw new Error(`Conch login smoke failed: status=${status}, body=${JSON.stringify(body)}`)
}

function assertAdminLogin(status: number) {
  if (status === 200 || status === 401) return
  throw new Error(`Admin login smoke failed: status=${status}`)
}

async function main() {
  const conchResponse = await fetch(`${conchBaseUrl}/user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ osId: `fetch-migration-smoke-${Date.now()}` }),
  })
  const conchBody = await readResponseBody(conchResponse)
  assertConchLogin(conchResponse.status, conchBody)

  const adminResponse = await fetch(`${adminBaseUrl}/admin/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminName, password: adminPassword }),
  })
  assertAdminLogin(adminResponse.status)

  console.log(`conch:/user/login status=${conchResponse.status}`)
  console.log(`admin:/admin/api/login status=${adminResponse.status}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
