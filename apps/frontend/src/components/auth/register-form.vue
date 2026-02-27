<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth.store'
import type { RegisterCredentials } from '../../types/auth.types'

const router = useRouter()
const authStore = useAuthStore()

const name = ref<string>('')
const email = ref<string>('')
const password = ref<string>('')
const passwordConfirm = ref<string>('')
const error = ref<string | null>(null)
const isLoading = ref<boolean>(false)

const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

const handleSubmit = async (): Promise<void> => {
  error.value = null

  // Validation
  if (!name.value || !email.value || !password.value || !passwordConfirm.value) {
    error.value = 'Please fill in all fields'
    return
  }

  if (!validateEmail(email.value)) {
    error.value = 'Please enter a valid email address'
    return
  }

  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters long'
    return
  }

  if (password.value !== passwordConfirm.value) {
    error.value = 'Passwords do not match'
    return
  }

  isLoading.value = true

  try {
    const credentials: RegisterCredentials = {
      name: name.value,
      email: email.value,
      password: password.value,
      passwordConfirm: passwordConfirm.value,
    }

    await authStore.register(credentials)
    await router.push('/')
  } catch (err: any) {
    error.value = err.message || 'Registration failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="card bg-base-100 shadow-xl w-full max-w-md">
    <div class="card-body">
      <h2 class="card-title text-2xl font-bold mb-4">Register</h2>

      <form @submit.prevent="handleSubmit">
        <!-- Name Input -->
        <div class="form-control mb-4">
          <label class="label" for="name">
            <span class="label-text">Name</span>
          </label>
          <input
            id="name"
            v-model="name"
            type="text"
            placeholder="Your Name"
            class="input input-bordered w-full"
            :disabled="isLoading"
            required
          />
        </div>

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
          <label class="label">
            <span class="label-text-alt">Minimum 8 characters</span>
          </label>
        </div>

        <!-- Confirm Password Input -->
        <div class="form-control mb-4">
          <label class="label" for="passwordConfirm">
            <span class="label-text">Confirm Password</span>
          </label>
          <input
            id="passwordConfirm"
            v-model="passwordConfirm"
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
            {{ isLoading ? 'Creating account...' : 'Register' }}
          </button>
        </div>
      </form>

      <!-- Login Link -->
      <div class="text-center mt-4">
        <p class="text-sm">
          Already have an account?
          <router-link to="/login" class="link link-primary">Login here</router-link>
        </p>
      </div>
    </div>
  </div>
</template>
