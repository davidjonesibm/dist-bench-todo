<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useCalendar } from '../../composables/use-calendar'
import type { CalendarEvent, ScheduleXEvent } from '../../types/calendar.types'
import '@schedule-x/theme-default/dist/index.css'

const props = defineProps<{
  events: CalendarEvent[]
  loading?: boolean
}>()

const emit = defineEmits<{
  eventClick: [event: CalendarEvent]
  eventUpdate: [event: ScheduleXEvent]
  createEvent: []
}>()

const calendarEl = ref<HTMLElement | null>(null)
const currentView = ref<'day' | 'week' | 'month'>('week')

const { initCalendar, setView, goToToday, addEvent, updateEvent, removeEvent } = useCalendar()

onMounted(() => {
  if (calendarEl.value) {
    const calendar = initCalendar(props.events, {
      onEventClick: (scheduleXEvent) => {
        // Find the full CalendarEvent data
        const fullEvent = props.events.find((e) => e.id === scheduleXEvent.id)
        if (fullEvent) {
          emit('eventClick', fullEvent)
        }
      },
      onEventUpdate: (updatedEvent) => {
        emit('eventUpdate', updatedEvent)
      },
    })

    calendar.render(calendarEl.value)
  }
})

// Watch for event changes and sync with calendar
watch(
  () => props.events,
  (newEvents, oldEvents) => {
    if (!oldEvents || oldEvents.length === 0) {
      return // Initial load handled by initCalendar
    }

    // Find added events
    const addedEvents = newEvents.filter(
      (newEvent) => !oldEvents.some((oldEvent) => oldEvent.id === newEvent.id),
    )
    addedEvents.forEach((event) => addEvent(event))

    // Find removed events
    const removedEvents = oldEvents.filter(
      (oldEvent) => !newEvents.some((newEvent) => newEvent.id === oldEvent.id),
    )
    removedEvents.forEach((event) => removeEvent(event.id))

    // Find updated events
    newEvents.forEach((newEvent) => {
      const oldEvent = oldEvents.find((e) => e.id === newEvent.id)
      if (oldEvent && JSON.stringify(oldEvent) !== JSON.stringify(newEvent)) {
        updateEvent(newEvent)
      }
    })
  },
  { deep: true },
)

function handleViewChange(view: 'day' | 'week' | 'month') {
  currentView.value = view
  setView(view)
}

function handleToday() {
  goToToday()
}

function handleNewEvent() {
  emit('createEvent')
}
</script>

<template>
  <div class="calendar-container">
    <!-- Toolbar -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex gap-2">
        <button class="btn btn-sm btn-primary" @click="handleNewEvent">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Event
        </button>
        <button class="btn btn-sm btn-ghost" @click="handleToday">Today</button>
      </div>

      <div class="btn-group">
        <button
          class="btn btn-sm"
          :class="{ 'btn-active': currentView === 'day' }"
          @click="handleViewChange('day')"
        >
          Day
        </button>
        <button
          class="btn btn-sm"
          :class="{ 'btn-active': currentView === 'week' }"
          @click="handleViewChange('week')"
        >
          Week
        </button>
        <button
          class="btn btn-sm"
          :class="{ 'btn-active': currentView === 'month' }"
          @click="handleViewChange('month')"
        >
          Month
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center h-96">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- Calendar -->
    <div v-show="!loading" ref="calendarEl" class="sx-vue-calendar"></div>
  </div>
</template>

<style scoped>
.calendar-container {
  width: 100%;
  height: 100%;
}

.sx-vue-calendar {
  height: calc(100vh - 250px);
  min-height: 600px;
}

/* DaisyUI integration for calendar theme */
:deep(.sx__calendar-wrapper) {
  font-family: inherit;
}

:deep(.sx__week-grid__lines-wrapper) {
  border-color: oklch(var(--bc) / 0.1);
}

:deep(.sx__event) {
  border-radius: 0.5rem;
}

:deep(.sx__date-grid-cell) {
  border-color: oklch(var(--bc) / 0.1);
}

:deep(.sx__time-grid-cell) {
  border-color: oklch(var(--bc) / 0.1);
}

:deep(.sx__today) {
  background-color: oklch(var(--p) / 0.05);
}
</style>
