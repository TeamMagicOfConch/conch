export function formatYearMonthDate(date: { year: number; month: number }) {
  const { year, month } = date
  const leftPadMonth = String(month).padStart(2, '0')

  return `${year}.${leftPadMonth}`
}

export function getApiUrlWithPathAndParams({ path, params }: { path: string; params: Record<string, string> }) {
  const urlWithParams = new URL(`${process.env.API_URL}${path}`)

  Object.entries(params).forEach(([key, value]) => {
    urlWithParams.searchParams.append(key, value)
  })

  return urlWithParams.toString()
}
