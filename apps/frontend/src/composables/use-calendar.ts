import { ref, onUnmounted } from 'vue'
import {
  createCalendar,
  createViewWeek,
  createViewMonthGrid,
  createViewDay,
} from '@schedule-x/calendar'
import { createEventModalPlugin } from '@schedule-x/event-modal'
import { createDragAndDropPlugin } from '@schedule-x/drag-and-drop'
import type { CalendarEvent, ScheduleXEvent } from '../types/calendar.types'

export function useCalendar() {
  const calendarInstance = ref<any>(null)
  const selectedDate = ref<string>(new Date().toISOString().split('T')[0])

  /**
   * Convert CalendarEvent to ScheduleX event format
   */
  /**
   * Convert a PocketBase datetime string ("YYYY-MM-DD HH:mm:ss.sssZ") to the
   * "YYYY-MM-DD HH:mm" format required by Schedule-X.  All-day dates
   * ("YYYY-MM-DD", length 10) are returned as-is.
   */
  function toScheduleXDateStr(dateStr: string): string {
    if (!dateStr || dateStr.length <= 16) return dateStr
    return dateStr.slice(0, 16)
  }

  function toScheduleXEvent(event: CalendarEvent): ScheduleXEvent {
    return {
      id: event.id,
      title: event.title,
      start: toScheduleXDateStr(event.start),
      end: toScheduleXDateStr(event.end),
      description: event.description,
      calendarId: event.color || 'default',
    }
  }

  /**
   * Initialize the calendar with plugins and events
   */
  function initCalendar(
    events: CalendarEvent[],
    callbacks?: {
      onEventClick?: (event: ScheduleXEvent) => void
      onEventUpdate?: (event: ScheduleXEvent) => void
      onDateSelect?: (start: string, end: string) => void
    },
  ) {
    const eventModalPlugin = createEventModalPlugin()
    const dragAndDropPlugin = createDragAndDropPlugin()

    const calendar = createCalendar({
      views: [createViewDay(), createViewWeek(), createViewMonthGrid()],
      defaultView: 'week',
      selectedDate: selectedDate.value,
      events: events.map(toScheduleXEvent),
      calendars: {
        default: {
          colorName: 'default',
          lightColors: {
            main: '#570DF8',
            container: '#E0D4FC',
            onContainer: '#1F0047',
          },
        },
        primary: {
          colorName: 'primary',
          lightColors: {
            main: '#570DF8',
            container: '#E0D4FC',
            onContainer: '#1F0047',
          },
        },
        secondary: {
          colorName: 'secondary',
          lightColors: {
            main: '#F000B8',
            container: '#FFD6F3',
            onContainer: '#3D0030',
          },
        },
        accent: {
          colorName: 'accent',
          lightColors: {
            main: '#37CDBE',
            container: '#D1F5F0',
            onContainer: '#003731',
          },
        },
        success: {
          colorName: 'success',
          lightColors: {
            main: '#36D399',
            container: '#D9F5EB',
            onContainer: '#003828',
          },
        },
        warning: {
          colorName: 'warning',
          lightColors: {
            main: '#FBBD23',
            container: '#FFF2D1',
            onContainer: '#4A3800',
          },
        },
        error: {
          colorName: 'error',
          lightColors: {
            main: '#F87272',
            container: '#FFE5E5',
            onContainer: '#4A0000',
          },
        },
      },
      plugins: [eventModalPlugin, dragAndDropPlugin],
      callbacks: {
        onEventClick(calendarEvent: any) {
          if (callbacks?.onEventClick) {
            callbacks.onEventClick(calendarEvent)
          }
        },
        onEventUpdate(updatedEvent: any) {
          if (callbacks?.onEventUpdate) {
            callbacks.onEventUpdate(updatedEvent)
          }
        },
        onSelectedDateUpdate(date: string) {
          selectedDate.value = date
        },
        onRangeUpdate(range: any) {
          // Optional: handle range updates
        },
      },
    })

    calendarInstance.value = calendar
    return calendar
  }

  /**
   * Add an event to the calendar
   */
  function addEvent(event: CalendarEvent) {
    if (calendarInstance.value) {
      calendarInstance.value.events.add(toScheduleXEvent(event))
    }
  }

  /**
   * Update an event in the calendar
   */
  function updateEvent(event: CalendarEvent) {
    if (calendarInstance.value) {
      calendarInstance.value.events.update(toScheduleXEvent(event))
    }
  }

  /**
   * Remove an event from the calendar
   */
  function removeEvent(eventId: string) {
    if (calendarInstance.value) {
      calendarInstance.value.events.remove(eventId)
    }
  }

  /**
   * Get an event by ID
   */
  function getEvent(eventId: string): ScheduleXEvent | undefined {
    if (calendarInstance.value) {
      return calendarInstance.value.events.get(eventId)
    }
    return undefined
  }

  /**
   * Set the calendar view
   */
  function setView(view: 'day' | 'week' | 'month') {
    if (calendarInstance.value) {
      const viewMap = {
        day: 'day',
        week: 'week',
        month: 'month-grid',
      }
      calendarInstance.value.setView(viewMap[view])
    }
  }

  /**
   * Navigate to today
   */
  function goToToday() {
    if (calendarInstance.value) {
      const today = new Date().toISOString().split('T')[0]
      selectedDate.value = today
      calendarInstance.value.setDate(today)
    }
  }

  /**
   * Navigate to a specific date
   */
  function goToDate(date: string) {
    if (calendarInstance.value) {
      selectedDate.value = date
      calendarInstance.value.setDate(date)
    }
  }

  /**
   * Destroy the calendar instance
   */
  function destroy() {
    if (calendarInstance.value) {
      calendarInstance.value.destroy()
      calendarInstance.value = null
    }
  }

  // Cleanup on unmount
  onUnmounted(() => {
    destroy()
  })

  return {
    calendarInstance,
    selectedDate,
    initCalendar,
    addEvent,
    updateEvent,
    removeEvent,
    getEvent,
    setView,
    goToToday,
    goToDate,
    destroy,
  }
}
