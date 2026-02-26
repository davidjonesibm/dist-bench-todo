<script setup lang="ts">
import type { TodoFilter } from '@todo-app/shared'

defineProps<{
  modelValue: TodoFilter
}>()

const emit = defineEmits<{
  'update:modelValue': [value: TodoFilter]
}>()

const filters: { label: string; value: TodoFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
]
</script>

<template>
  <div role="tablist" class="tabs tabs-boxed bg-base-200">
    <button
      v-for="f in filters"
      :key="f.value"
      role="tab"
      :class="['tab', { 'tab-active': modelValue === f.value }]"
      @click="emit('update:modelValue', f.value)"
    >
      {{ f.label }}
    </button>
  </div>
</template>
