<script setup lang="ts">
defineProps<{
  size?: 'sm' | 'md' | 'lg'
  label?: string
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-2 py-8">
    <span
      :class="[
        'loading loading-spinner',
        size === 'sm' ? 'loading-sm' : size === 'lg' ? 'loading-lg' : 'loading-md',
        'text-primary',
      ]"
    />
    <span v-if="label" class="text-sm text-base-content/60">{{ label }}</span>
  </div>
</template>
