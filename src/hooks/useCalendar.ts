import { useState, useEffect, useCallback } from 'react'
import {
  subscribeCalendarDay,
  addCalendarEvent,
  removeCalendarEvent,
  getCalendarTheme,
  setCalendarTheme,
  toDateKey,
  CalendarEvent,
  CalendarTheme,
} from '../lib/calendar'

export default function useCalendar(displayName: string) {
  const now = new Date()
  const [theme, setThemeState] = useState<CalendarTheme | null>(null)
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [dayEntries, setDayEntries] = useState<Record<string, CalendarEvent[]>>({})

  useEffect(() => {
    getCalendarTheme().then(setThemeState)
  }, [])

  const subscribeDayEntries = useCallback((dateKey: string) => {
    return subscribeCalendarDay(dateKey, (entries) => {
      setDayEntries((prev) => ({ ...prev, [dateKey]: entries }))
    })
  }, [])

  const addEvent = useCallback(
    async (dateKey: string, text: string, time: string | null) => {
      await addCalendarEvent(dateKey, { text, time, createdBy: displayName })
    },
    [displayName]
  )

  const removeEvent = useCallback(async (dateKey: string, eventId: string) => {
    await removeCalendarEvent(dateKey, eventId)
  }, [])

  const changeTheme = useCallback(async (t: CalendarTheme) => {
    setThemeState(t)
    await setCalendarTheme(t)
  }, [])

  const goToPrevMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1)
        return 11
      }
      return m - 1
    })
  }, [])

  const goToNextMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1)
        return 0
      }
      return m + 1
    })
  }, [])

  return {
    theme,
    dayEntries,
    viewYear,
    viewMonth,
    subscribeDayEntries,
    addEvent,
    removeEvent,
    changeTheme,
    goToPrevMonth,
    goToNextMonth,
    toDateKey,
  }
}
