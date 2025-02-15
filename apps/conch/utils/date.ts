export function getToday() {
  const now = new Date()

  return {
    now,
    year: now.getFullYear(),
    month: now.getMonth(),
    date: now.getDate(),
  }
}
