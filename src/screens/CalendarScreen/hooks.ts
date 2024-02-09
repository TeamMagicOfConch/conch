import { useMemo } from 'react'

export function useCalendar({ year, month }: { year: number; month: number }) {
  const calendar = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDay = firstDay.getDay()
    const endDay = lastDay.getDay()

    const calendarArray = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1))
    const paddingStart = Array.from({ length: startDay }, (_, i) => new Date(year, month, 0 - i)).reverse()
    const paddingEnd = Array.from({ length: 6 - endDay }, (_, i) => new Date(year, month + 1, i + 1))

    return paddingStart.concat(calendarArray, paddingEnd).reduce<Date[][]>((acc, date) => {
      if (acc.length === 0 || acc[acc.length - 1].length === 7) {
        acc.push([date])
      } else {
        acc[acc.length - 1].push(date)
      }
      return acc
    }, [])
  }, [year, month])

  return { calendar }
}
