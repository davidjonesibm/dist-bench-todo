<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth.store'
import type { LoginCredentials } from '../../types/auth.types'

const router = useRouter()
const authStore = useAuthStore()

const email = ref<string>('')
const password = ref<string>('')
const error = ref<string | null>(null)
const isLoading = ref<boolean>(false)

const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

const handleSubmit = async (): Promise<void> => {
  error.value = null

  // Validation
  if (!email.value || !password.value) {
    error.value = 'Please fill in all fields'
    return
  }

  if (!validateEmail(email.value)) {
    error.value = 'Please enter a valid email address'
    return
  }

  isLoading.value = true

  try {
    const credentials: LoginCredentials = {
      email: email.value,
      password: password.value,
    }

    await authStore.login(credentials)
    await router.push('/')
  } catch (err: any) {
    error.value = err.message || 'Login failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="card bg-base-100 shadow-xl w-full max-w-md">
    <div class="card-body">
      <h2 class="card-title text-2xl font-bold mb-4">Login</h2>

      <form @submit.prevent="handleSubmit">
        <!-- Email Input -->
        <div class="form-control mb-4">
          <label class="label" for="email">
            <span class="label-text">Email</span>
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="your@email.com"
            class="input input-bordered w-full"
            :disabled="isLoading"
            required
          />
        </div>

        <!-- Password Input -->
        <div class="form-control mb-4">
          <label class="label" for="password">
            <span class="label-text">Password</span>
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            class="input input-bordered w-full"
            :disabled="isLoading"
            required
          />
        </div>

        <!-- Error Alert -->
        <div v-if="error" class="alert alert-error mb-4">
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
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{{ error }}</span>
        </div>

        <!-- Submit Button -->
        <div class="form-control mt-6">
          <button type="submit" class="btn btn-primary" :disabled="isLoading">
            <span v-if="isLoading" class="loading loading-spinner"></span>
            {{ isLoading ? 'Logging in...' : 'Login' }}
          </button>
        </div>
      </form>

      <!-- Register Link -->
      <div class="text-center mt-4">
        <p class="text-sm">
          Don't have an account?
          <router-link to="/register" class="link link-primary">Register here</router-link>
        </p>
      </div>
    </div>
  </div>
</template>
