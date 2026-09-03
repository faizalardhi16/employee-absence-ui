/** Zona waktu lokal browser (IANA name), fallback "UTC". */
export function getBrowserTimeZone(): string {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone
    return zone || "UTC"
  } catch {
    return "UTC"
  }
}

/** Singkatan zona waktu lokal browser (mis. "UTC", "WIB", "GMT+7"). */
export function getBrowserTimeZoneAbbreviation(date: Date = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZoneName: "short",
    }).formatToParts(date)
    const name = parts.find((part) => part.type === "timeZoneName")
    if (name && name.value) return name.value
  } catch {
    // fall through ke fallback IANA name
  }
  return getBrowserTimeZone()
}

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
