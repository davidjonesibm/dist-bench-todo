<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { CalendarEvent, CreateEventData, EventColor } from '../../types/calendar.types'
import { EVENT_COLORS } from '../../types/calendar.types'

const props = defineProps<{
  open: boolean
  event?: CalendarEvent
  loading?: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [data: CreateEventData]
}>()

const isEditMode = computed(() => !!props.event)

// Form fields
const title = ref('')
const description = ref('')
const startDate = ref('')
const startTime = ref('')
const endDate = ref('')
const endTime = ref('')
const isAllDay = ref(false)
const color = ref<EventColor>('primary')

// Validation
const errors = ref<Record<string, string>>({})

// Initialize form when event changes
watch(
  () => props.event,
  (event) => {
    if (event) {
      title.value = event.title
      description.value = event.description || ''

      // Schedule-X stores dates as "YYYY-MM-DD HH:mm" or "YYYY-MM-DD" for all-day
      const [startDatePart, startTimePart] = event.start.split(' ')
      const [endDatePart, endTimePart] = event.end.split(' ')

      startDate.value = startDatePart
      startTime.value = startTimePart || '00:00'
      endDate.value = endDatePart
      endTime.value = endTimePart || '23:59'

      isAllDay.value = event.isAllDay

      // Find matching color or default to primary
      const colorKey = Object.entries(EVENT_COLORS).find(
        ([, value]) => value === event.color,
      )?.[0] as EventColor
      color.value = colorKey || 'primary'
    } else {
      resetForm()
    }
  },
  { immediate: true },
)

// Reset form when modal closes
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen && !props.event) {
      resetForm()
    }
    errors.value = {}
  },
)

function resetForm() {
  title.value = ''
  description.value = ''

  const now = new Date()
  const later = new Date(now.getTime() + 60 * 60 * 1000) // 1 hour later

  // Use local date/time (pad to ensure YYYY-MM-DD and HH:mm)
  const pad = (n: number) => String(n).padStart(2, '0')
  const localDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  const localTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`

  startDate.value = localDate(now)
  startTime.value = localTime(now)
  endDate.value = localDate(later)
  endTime.value = localTime(later)

  isAllDay.value = false
  color.value = 'primary'
}

function validate(): boolean {
  errors.value = {}

  if (!title.value.trim()) {
    errors.value.title = 'Title is required'
  }

  if (!startDate.value) {
    errors.value.startDate = 'Start date is required'
  }

  if (!endDate.value) {
    errors.value.endDate = 'End date is required'
  }

  if (!isAllDay.value && !startTime.value) {
    errors.value.startTime = 'Start time is required'
  }

  if (!isAllDay.value && !endTime.value) {
    errors.value.endTime = 'End time is required'
  }

  // Validate end is after start
  if (startDate.value && endDate.value) {
    const start = isAllDay.value
      ? new Date(startDate.value)
      : new Date(`${startDate.value}T${startTime.value}`)
    const end = isAllDay.value
      ? new Date(endDate.value)
      : new Date(`${endDate.value}T${endTime.value}`)

    if (end <= start) {
      errors.value.endDate = 'End must be after start'
    }
  }

  return Object.keys(errors.value).length === 0
}

/** Format a date string for Schedule-X: "YYYY-MM-DD HH:mm" */
function toScheduleXFormat(date: string, time: string): string {
  return `${date} ${time}`
}

function handleSave() {
  if (!validate()) {
    return
  }

  const start = isAllDay.value
    ? startDate.value
    : toScheduleXFormat(startDate.value, startTime.value)

  const end = isAllDay.value ? endDate.value : toScheduleXFormat(endDate.value, endTime.value)

  const eventData: CreateEventData = {
    title: title.value.trim(),
    description: description.value.trim() || undefined,
    start,
    end,
    isAllDay: isAllDay.value,
    color: EVENT_COLORS[color.value],
  }

  emit('save', eventData)
}

function handleClose() {
  emit('close')
}

function handleAllDayChange() {
  if (isAllDay.value) {
    startTime.value = '00:00'
    endTime.value = '23:59'
  }
}
</script>

<template>
  <div class="modal" :class="{ 'modal-open': open }">
    <div class="modal-box max-w-2xl">
      <h3 class="font-bold text-lg mb-4">
        {{ isEditMode ? 'Edit Event' : 'Create Event' }}
      </h3>

      <form @submit.prevent="handleSave">
        <!-- Title -->
        <div class="form-control w-full mb-4">
          <label class="label">
            <span class="label-text">Title <span class="text-error">*</span></span>
          </label>
          <input
            v-model="title"
            type="text"
            placeholder="Event title"
            class="input input-bordered w-full"
            :class="{ 'input-error': errors.title }"
          />
          <label v-if="errors.title" class="label">
            <span class="label-text-alt text-error">{{ errors.title }}</span>
          </label>
        </div>

        <!-- Description -->
        <div class="form-control w-full mb-4">
          <label class="label">
            <span class="label-text">Description</span>
          </label>
          <textarea
            v-model="description"
            placeholder="Event description"
            class="textarea textarea-bordered h-24"
          ></textarea>
        </div>

        <!-- All-day checkbox -->
        <div class="form-control mb-4">
          <label class="label cursor-pointer justify-start gap-3">
            <input
              v-model="isAllDay"
              type="checkbox"
              class="checkbox checkbox-primary"
              @change="handleAllDayChange"
            />
            <span class="label-text">All-day event</span>
          </label>
        </div>

        <!-- Start date and time -->
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Start Date <span class="text-error">*</span></span>
            </label>
            <input
              v-model="startDate"
              type="date"
              class="input input-bordered"
              :class="{ 'input-error': errors.startDate }"
            />
            <label v-if="errors.startDate" class="label">
              <span class="label-text-alt text-error">{{ errors.startDate }}</span>
            </label>
          </div>

          <div v-if="!isAllDay" class="form-control">
            <label class="label">
              <span class="label-text">Start Time <span class="text-error">*</span></span>
            </label>
            <input
              v-model="startTime"
              type="time"
              class="input input-bordered"
              :class="{ 'input-error': errors.startTime }"
            />
            <label v-if="errors.startTime" class="label">
              <span class="label-text-alt text-error">{{ errors.startTime }}</span>
            </label>
          </div>
        </div>

        <!-- End date and time -->
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">End Date <span class="text-error">*</span></span>
            </label>
            <input
              v-model="endDate"
              type="date"
              class="input input-bordered"
              :class="{ 'input-error': errors.endDate }"
            />
            <label v-if="errors.endDate" class="label">
              <span class="label-text-alt text-error">{{ errors.endDate }}</span>
            </label>
          </div>

          <div v-if="!isAllDay" class="form-control">
            <label class="label">
              <span class="label-text">End Time <span class="text-error">*</span></span>
            </label>
            <input
              v-model="endTime"
              type="time"
              class="input input-bordered"
              :class="{ 'input-error': errors.endTime }"
            />
            <label v-if="errors.endTime" class="label">
              <span class="label-text-alt text-error">{{ errors.endTime }}</span>
            </label>
          </div>
        </div>

        <!-- Color picker -->
        <div class="form-control mb-6">
          <label class="label">
            <span class="label-text">Color</span>
          </label>
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="(colorValue, colorKey) in EVENT_COLORS"
              :key="colorKey"
              type="button"
              class="btn btn-sm btn-circle"
              :class="{
                'ring-2 ring-offset-2 ring-base-content': color === colorKey,
              }"
              :style="{ backgroundColor: colorValue }"
              @click="color = colorKey as EventColor"
            >
              <span class="sr-only">{{ colorKey }}</span>
            </button>
          </div>
        </div>

        <!-- Actions -->
        <div class="modal-action">
          <button type="button" class="btn btn-ghost" :disabled="loading" @click="handleClose">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            <span v-if="loading" class="loading loading-spinner"></span>
            {{ isEditMode ? 'Update' : 'Create' }}
          </button>
        </div>
      </form>
    </div>
    <div class="modal-backdrop" @click="handleClose"></div>
  </div>
</template>
