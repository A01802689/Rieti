/** Time zone the dashboard shows dates in */
export const DASHBOARD_TIME_ZONE = 'America/Mexico_City'

/** Short weekday names in the order of the weekday number, as Intl gives them in en-US */
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** Reads the hour and the weekday of a date in the dashboard time zone */
const hourAndWeekdayFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: DASHBOARD_TIME_ZONE,
  hour: 'numeric',
  hourCycle: 'h23',
  weekday: 'short',
})

/** Reads the year and the month of a date in the dashboard time zone */
const yearAndMonthFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: DASHBOARD_TIME_ZONE,
  year: 'numeric',
  month: 'numeric',
})

/**
 * Parses a date sent by the API; a timestamp without zone or offset is UTC
 *
 * @param value - ISO 8601 text, with or without a zone
 * @returns The date it represents
 */
export const parseApiDate = (value: string) => {
  // the API sends microseconds and Date only understands milliseconds
  const text = value.replace(/(\.\d{3})\d+/, '$1')
  const hasTime = /T\d{2}:\d{2}/.test(text)
  const hasZone = /(?:Z|[+-]\d{2}(?::?\d{2})?)$/i.test(text)
  return new Date(hasTime && !hasZone ? `${text}Z` : text)
}

/**
 * Gives the hour and the weekday a date has in the dashboard time zone
 *
 * @param date - Date to read
 * @returns The hour (0-23) and the weekday (0 = sunday ... 6 = saturday)
 */
export const dashboardHourAndWeekday = (date: Date) => {
  const parts = hourAndWeekdayFormat.formatToParts(date)
  return {
    hour: Number(parts.find((p) => p.type === 'hour')?.value),
    weekday: WEEKDAYS.indexOf(parts.find((p) => p.type === 'weekday')?.value ?? ''),
  }
}

/**
 * Gives the year and the month a date has in the dashboard time zone
 *
 * @param date - Date to read
 * @returns The year and the month (0 = january ... 11 = december)
 */
export const dashboardYearAndMonth = (date: Date) => {
  const parts = yearAndMonthFormat.formatToParts(date)
  return {
    year: Number(parts.find((p) => p.type === 'year')?.value),
    month: Number(parts.find((p) => p.type === 'month')?.value) - 1,
  }
}
