export function formatYearMonthDate(date: { year: number; month: number }) {
  const { year, month } = date
  const leftPadMonth = String(month).padStart(2, '0')

  return `${year}.${leftPadMonth}`
}

export function getApiUrlWithPathAndParams({ path, params }: { path: string; params?: Record<string, string> }) {
  const urlWithParams = new URL(`${process.env.EXPO_PUBLIC_API_URL}${path}`)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      urlWithParams.searchParams.append(key, value)
    })
  }

  return urlWithParams.toString()
}

export function validateInput(input: string | undefined | null): boolean {
  if (!input) return false
  const regex = /^[a-zA-Z0-9가-힣\s]{1,10}$/
  return regex.test(input)
}
