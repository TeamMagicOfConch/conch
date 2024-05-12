export function getToday() {
  const now = new Date()

  return {
    year: now.getFullYear(),
    month: now.getMonth(),
    date: now.getDate(),
  }
}
