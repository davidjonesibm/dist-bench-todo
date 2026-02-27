<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useEvents } from '../composables/use-events'
import CalendarView from '../components/calendar/calendar-view.vue'
import EventForm from '../components/calendar/event-form.vue'
import EventDetail from '../components/calendar/event-detail.vue'
import ErrorAlert from '../components/ui/error-alert.vue'
import type { CalendarEvent, CreateEventData, ScheduleXEvent } from '../types/calendar.types'

const {
  events,
  loading,
  error,
  fetchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  subscribeToEvents,
} = useEvents()

// Modal states
const showEventForm = ref(false)
const showEventDetail = ref(false)
const selectedEvent = ref<CalendarEvent | undefined>(undefined)
const formLoading = ref(false)
const formError = ref<string | null>(null)

onMounted(async () => {
  await fetchEvents()
  subscribeToEvents()
})

function handleCreateEvent() {
  selectedEvent.value = undefined
  formError.value = null
  showEventForm.value = true
}

function handleEventClick(event: CalendarEvent) {
  selectedEvent.value = event
  showEventDetail.value = true
}

function handleEventUpdate(updatedScheduleXEvent: ScheduleXEvent) {
  // When user drags/drops an event to reschedule it
  const eventToUpdate = events.value.find((e) => e.id === updatedScheduleXEvent.id)
  if (eventToUpdate) {
    updateEvent(updatedScheduleXEvent.id, {
      start: updatedScheduleXEvent.start,
      end: updatedScheduleXEvent.end,
    })
  }
}

function handleEditEvent(event: CalendarEvent) {
  selectedEvent.value = event
  showEventDetail.value = false
  formError.value = null
  showEventForm.value = true
}

async function handleSaveEvent(data: CreateEventData) {
  formLoading.value = true
  formError.value = null

  let result

  if (selectedEvent.value) {
    // Update existing event
    result = await updateEvent(selectedEvent.value.id, data)
  } else {
    // Create new event
    result = await createEvent(data)
  }

  formLoading.value = false

  if (result.success) {
    showEventForm.value = false
    selectedEvent.value = undefined
  } else {
    formError.value = result.error || 'Failed to save event'
  }
}

async function handleDeleteEvent(eventId: string) {
  formLoading.value = true
  formError.value = null

  const result = await deleteEvent(eventId)

  formLoading.value = false

  if (result.success) {
    showEventDetail.value = false
    selectedEvent.value = undefined
  } else {
    formError.value = result.error || 'Failed to delete event'
  }
}

function handleCloseEventForm() {
  showEventForm.value = false
  selectedEvent.value = undefined
  formError.value = null
}

function handleCloseEventDetail() {
  showEventDetail.value = false
  selectedEvent.value = undefined
  formError.value = null
}

function handleDismissError() {
  formError.value = null
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold">Calendar</h1>
      <p class="text-base-content/70 mt-2">Manage your events and schedule</p>
    </div>

    <!-- Error Alert -->
    <ErrorAlert v-if="error" :message="error" class="mb-4" />

    <!-- Form Error Alert -->
    <ErrorAlert v-if="formError" :message="formError" class="mb-4" @dismiss="handleDismissError" />

    <!-- Loading State -->
    <div v-if="loading && events.length === 0" class="flex items-center justify-center h-96">
      <div class="text-center">
        <span class="loading loading-spinner loading-lg"></span>
        <p class="mt-4 text-base-content/70">Loading calendar...</p>
      </div>
    </div>

    <!-- Calendar -->
    <div v-else class="bg-base-100 rounded-lg shadow-lg p-6">
      <CalendarView
        :events="events"
        :loading="loading"
        @event-click="handleEventClick"
        @event-update="handleEventUpdate"
        @create-event="handleCreateEvent"
      />
    </div>

    <!-- Event Form Modal -->
    <EventForm
      :open="showEventForm"
      :event="selectedEvent"
      :loading="formLoading"
      @close="handleCloseEventForm"
      @save="handleSaveEvent"
    />

    <!-- Event Detail Modal -->
    <EventDetail
      :open="showEventDetail"
      :event="selectedEvent"
      :loading="formLoading"
      @close="handleCloseEventDetail"
      @edit="handleEditEvent"
      @delete="handleDeleteEvent"
    />
  </div>
</template>
