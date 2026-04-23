const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString()
}

const isPastTrip = (endDate?: string) => {
  if (!endDate) return false
  const end = new Date(endDate)

  const endOfDay = new Date(
    end.getFullYear(),
    end.getMonth(),
    end.getDate(),
    23,
    59,
    59,
    999,
  )

  return endOfDay.getTime() < Date.now()
}

export { formatDate, isPastTrip }
