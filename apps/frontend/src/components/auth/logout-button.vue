<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = async (): Promise<void> => {
  authStore.logout()
  await router.push('/login')
}
</script>

<template>
  <button class="btn btn-outline btn-error" @click="handleLogout">Logout</button>
</template>
