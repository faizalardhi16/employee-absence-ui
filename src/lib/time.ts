const TIME_ZONE = "Asia/Jakarta"

const formatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
})

export function toWibDisplay(isoString: string): string {
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date string: ${isoString}`)
  }

  const parts = formatter.formatToParts(date)
  const values: Record<string, string> = {}
  for (const part of parts) {
    values[part.type] = part.value
  }

  const year = values.year
  const month = values.month
  const day = values.day

  let hour = values.hour
  if (hour === "24") {
    hour = "00"
  }

  return `${year}-${month}-${day} ${hour}:${values.minute}:${values.second} WIB`
}
