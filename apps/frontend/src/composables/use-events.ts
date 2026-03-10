import { ref } from 'vue'
import { apiFetch } from '../lib/api'
import { usePageRefetch } from './use-page-refetch'
import type {
  CalendarEvent,
  CreateEventData,
  UpdateEventData,
  EventOperationResult,
  EventsListResult,
} from '../types/calendar.types'

/**
 * Ensure a date string is acceptable to PocketBase's date field.
 * Schedule-X emits "YYYY-MM-DD HH:mm" (no seconds); PocketBase needs at
 * least "YYYY-MM-DD HH:mm:ss".
 */
function toPocketBaseDate(dateStr: string): string {
  if (!dateStr || dateStr.length !== 16) return dateStr // all-day (10) or already has seconds
  return `${dateStr}:00`
}

export function useEvents() {
  const events = ref<CalendarEvent[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetch all events for the current user
   */
  async function fetchEvents(): Promise<EventsListResult> {
    loading.value = true
    error.value = null

    try {
      const records = await apiFetch<CalendarEvent[]>('/api/events')
      events.value = records
      return { success: true, data: records }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch events'
      error.value = errorMessage
      console.error('Error fetching events:', err)
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a new event
   */
  async function createEvent(data: CreateEventData): Promise<EventOperationResult> {
    loading.value = true
    error.value = null

    try {
      const record = await apiFetch<CalendarEvent>('/api/events', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          start: toPocketBaseDate(data.start),
          end: toPocketBaseDate(data.end),
        }),
      })

      events.value.unshift(record)
      return { success: true, data: record }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to create event'
      error.value = errorMessage
      console.error('Error creating event:', err)
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  /**
   * Update an existing event
   */
  async function updateEvent(id: string, data: UpdateEventData): Promise<EventOperationResult> {
    loading.value = true
    error.value = null

    try {
      const record = await apiFetch<CalendarEvent>(`/api/events/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          ...data,
          ...(data.start && { start: toPocketBaseDate(data.start) }),
          ...(data.end && { end: toPocketBaseDate(data.end) }),
        }),
      })

      const index = events.value.findIndex((e) => e.id === id)
      if (index !== -1) {
        events.value[index] = record
      }

      return { success: true, data: record }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to update event'
      error.value = errorMessage
      console.error('Error updating event:', err)
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete an event
   */
  async function deleteEvent(id: string): Promise<EventOperationResult> {
    loading.value = true
    error.value = null

    try {
      await apiFetch<void>(`/api/events/${id}`, { method: 'DELETE' })

      events.value = events.value.filter((e) => e.id !== id)
      return { success: true }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to delete event'
      error.value = errorMessage
      console.error('Error deleting event:', err)
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  usePageRefetch(fetchEvents)

  return {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  }
}
