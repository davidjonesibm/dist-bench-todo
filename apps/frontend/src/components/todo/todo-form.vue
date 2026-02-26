<script setup lang="ts">
import { ref } from 'vue'
import type { CreateTodoDto } from '@todo-app/shared'

const emit = defineEmits<{
  submit: [dto: CreateTodoDto]
}>()

const title = ref('')
const isSubmitting = ref(false)

async function handleSubmit() {
  const trimmed = title.value.trim()
  if (!trimmed) return

  isSubmitting.value = true
  try {
    emit('submit', { title: trimmed })
    title.value = ''
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form class="flex gap-2" @submit.prevent="handleSubmit">
    <input
      v-model="title"
      type="text"
      placeholder="What needs to be done?"
      class="input input-bordered flex-1"
      :disabled="isSubmitting"
      autofocus
    />
    <button type="submit" class="btn btn-primary" :disabled="isSubmitting || !title.trim()">
      <span v-if="isSubmitting" class="loading loading-spinner loading-sm" />
      <span v-else>Add</span>
    </button>
  </form>
</template>
