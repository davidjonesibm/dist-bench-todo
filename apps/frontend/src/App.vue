<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth.store'
import DefaultLayout from './layouts/default-layout.vue'
import AuthLayout from './layouts/auth-layout.vue'

const route = useRoute()
const authStore = useAuthStore()

const currentLayout = computed(() => {
  const layout = route.meta.layout as string | undefined
  return layout === 'auth' ? AuthLayout : DefaultLayout
})

// Initialize auth on app startup
onMounted(() => {
  authStore.initAuth()
})
</script>

<template>
  <component :is="currentLayout">
    <RouterView />
  </component>
</template>
