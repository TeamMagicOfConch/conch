export function formatYearMonthDate(date: { year: number; month: number }) {
  const { year, month } = date
  const leftPadMonth = String(month).padStart(2, '0')

  return `${year}.${leftPadMonth}`
}
