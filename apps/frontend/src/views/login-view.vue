<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'
import LoginForm from '../components/auth/login-form.vue'

const router = useRouter()
const authStore = useAuthStore()

// Redirect to home if already authenticated
onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push('/')
  }
})
</script>

<template>
  <LoginForm />
</template>
