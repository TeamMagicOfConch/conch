import { createConchSwaggerClient } from '@conch/api'

let client: ReturnType<typeof createConchSwaggerClient> | null = null

export function getConchClient(baseURL = process.env.EXPO_PUBLIC_API_URL as string) {
  if (!client) {
    client = createConchSwaggerClient(baseURL)
  }
  return client
}

export function setConchToken(token: string | null) {
  getConchClient().setSecurityData(token)
}

export function resetConchClient() {
  client = null
}


