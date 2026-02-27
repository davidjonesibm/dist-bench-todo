<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CalendarEvent } from '../../types/calendar.types'

const props = defineProps<{
  open: boolean
  event?: CalendarEvent
  loading?: boolean
}>()

const emit = defineEmits<{
  close: []
  edit: [event: CalendarEvent]
  delete: [eventId: string]
}>()

const showDeleteConfirm = ref(false)

/** Parse a Schedule-X date string ("YYYY-MM-DD HH:mm" or "YYYY-MM-DD") safely */
function parseScheduleXDate(value: string): Date {
  // Schedule-X uses space separator; replace with T for spec-compliant ISO parsing
  return new Date(value.length === 10 ? `${value}T00:00:00` : value.replace(' ', 'T'))
}

const formattedStart = computed(() => {
  if (!props.event) return ''
  const date = parseScheduleXDate(props.event.start)
  if (props.event.isAllDay) {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
  return date.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
})

const formattedEnd = computed(() => {
  if (!props.event) return ''
  const date = parseScheduleXDate(props.event.end)
  if (props.event.isAllDay) {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
  return date.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
})

function handleEdit() {
  if (props.event) {
    emit('edit', props.event)
  }
}

function handleDeleteClick() {
  showDeleteConfirm.value = true
}

function handleDeleteConfirm() {
  if (props.event) {
    emit('delete', props.event.id)
  }
  showDeleteConfirm.value = false
}

function handleDeleteCancel() {
  showDeleteConfirm.value = false
}

function handleClose() {
  showDeleteConfirm.value = false
  emit('close')
}
</script>

<template>
  <div class="modal" :class="{ 'modal-open': open }">
    <div class="modal-box max-w-2xl">
      <div v-if="event">
        <!-- Header -->
        <div class="flex items-start justify-between mb-6">
          <div class="flex items-start gap-3">
            <div
              class="w-4 h-4 rounded-full mt-1.5"
              :style="{ backgroundColor: event.color || '#570DF8' }"
            ></div>
            <div>
              <h3 class="font-bold text-2xl">{{ event.title }}</h3>
              <div v-if="event.isAllDay" class="badge badge-info badge-sm mt-2">All Day</div>
            </div>
          </div>
          <button class="btn btn-sm btn-circle btn-ghost" @click="handleClose">✕</button>
        </div>

        <!-- Event Details -->
        <div class="space-y-4 mb-6">
          <!-- Date/Time -->
          <div class="flex gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-base-content/70 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <div>
              <p class="font-medium">{{ formattedStart }}</p>
              <p class="text-sm text-base-content/70">to {{ formattedEnd }}</p>
            </div>
          </div>

          <!-- Description -->
          <div v-if="event.description" class="flex gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-base-content/70 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
            <p class="text-base-content/90 whitespace-pre-wrap">{{ event.description }}</p>
          </div>

          <!-- Tags (if available) -->
          <div v-if="event.tags && event.tags.length > 0" class="flex gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-base-content/70 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            <div class="flex gap-2 flex-wrap">
              <span v-for="tag in event.tags" :key="tag" class="badge badge-outline badge-sm">
                {{ tag }}
              </span>
            </div>
          </div>
        </div>

        <!-- Delete Confirmation -->
        <div v-if="showDeleteConfirm" class="alert alert-warning mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <h3 class="font-bold">Confirm Delete</h3>
            <div class="text-xs">
              Are you sure you want to delete this event? This action cannot be undone.
            </div>
          </div>
          <div class="flex gap-2">
            <button class="btn btn-sm" @click="handleDeleteCancel">Cancel</button>
            <button class="btn btn-sm btn-error" @click="handleDeleteConfirm">Delete</button>
          </div>
        </div>

        <!-- Actions -->
        <div class="modal-action">
          <button
            v-if="!showDeleteConfirm"
            class="btn btn-error btn-outline"
            :disabled="loading"
            @click="handleDeleteClick"
          >
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete
          </button>
          <button
            v-if="!showDeleteConfirm"
            class="btn btn-primary"
            :disabled="loading"
            @click="handleEdit"
          >
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit
          </button>
        </div>
      </div>
    </div>
    <div class="modal-backdrop" @click="handleClose"></div>
  </div>
</template>
