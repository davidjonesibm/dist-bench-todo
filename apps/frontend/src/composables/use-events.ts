import { ref, onUnmounted } from 'vue'
import { pb } from '../lib/pocketbase'
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

  let unsubscribe: (() => void) | null = null

  /**
   * Fetch all events for the current user
   */
  async function fetchEvents(): Promise<EventsListResult> {
    loading.value = true
    error.value = null

    try {
      const records = await pb.collection('events').getFullList<CalendarEvent>({
        sort: '-created',
        filter: `userId = "${pb.authStore.model?.id}"`,
      })

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
      const record = await pb.collection('events').create<CalendarEvent>({
        ...data,
        start: toPocketBaseDate(data.start),
        end: toPocketBaseDate(data.end),
        userId: pb.authStore.model?.id,
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
      const record = await pb.collection('events').update<CalendarEvent>(id, {
        ...data,
        ...(data.start && { start: toPocketBaseDate(data.start) }),
        ...(data.end && { end: toPocketBaseDate(data.end) }),
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
      await pb.collection('events').delete(id)

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

  /**
   * Subscribe to real-time event updates
   */
  async function subscribeToEvents() {
    if (!pb.authStore.model?.id) {
      console.warn('Cannot subscribe to events: user not authenticated')
      return
    }

    unsubscribe = await pb.collection('events').subscribe<CalendarEvent>('*', (e) => {
      // Only process events for the current user
      if (e.record?.userId !== pb.authStore.model?.id) {
        return
      }

      if (e.action === 'create') {
        const exists = events.value.some((evt) => evt.id === e.record.id)
        if (!exists) {
          events.value.unshift(e.record)
        }
      } else if (e.action === 'update') {
        const index = events.value.findIndex((evt) => evt.id === e.record.id)
        if (index !== -1) {
          events.value[index] = e.record
        }
      } else if (e.action === 'delete') {
        events.value = events.value.filter((evt) => evt.id !== e.record.id)
      }
    })
  }

  /**
   * Unsubscribe from real-time updates
   */
  function unsubscribeFromEvents() {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }

  // Cleanup on unmount
  onUnmounted(() => {
    unsubscribeFromEvents()
  })

  return {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    subscribeToEvents,
    unsubscribeFromEvents,
  }
}
