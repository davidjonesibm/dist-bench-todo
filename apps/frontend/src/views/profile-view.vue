<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth.store'
import LogoutButton from '../components/auth/logout-button.vue'

const authStore = useAuthStore()

const name = ref<string>(authStore.user?.name || '')
const avatarFile = ref<File | null>(null)
const avatarPreview = ref<string | null>(null)
const error = ref<string | null>(null)
const success = ref<string | null>(null)
const isLoading = ref<boolean>(false)

const currentAvatarUrl = computed(() => {
  if (authStore.user) {
    return authStore.getAvatarUrl(authStore.user, 120)
  }
  return ''
})

const handleAvatarChange = (event: Event): void => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      error.value = 'Please select a valid image file'
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      error.value = 'Image size must be less than 5MB'
      return
    }

    avatarFile.value = file

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)

    error.value = null
  }
}

const handleSubmit = async (): Promise<void> => {
  error.value = null
  success.value = null

  if (!name.value) {
    error.value = 'Name is required'
    return
  }

  isLoading.value = true

  try {
    await authStore.updateProfile({
      name: name.value,
      avatar: avatarFile.value || undefined,
    })

    success.value = 'Profile updated successfully!'
    avatarFile.value = null
    avatarPreview.value = null

    // Update local name to match the store
    name.value = authStore.user?.name || ''
  } catch (err: any) {
    error.value = err.message || 'Failed to update profile'
  } finally {
    isLoading.value = false
  }
}

const clearAvatarSelection = (): void => {
  avatarFile.value = null
  avatarPreview.value = null
  const fileInput = document.getElementById('avatar') as HTMLInputElement
  if (fileInput) {
    fileInput.value = ''
  }
}
</script>

<template>
  <div>
    <div class="max-w-2xl mx-auto">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-3xl font-bold mb-6">Profile</h2>

          <!-- Current User Info -->
          <div class="mb-6 flex items-center gap-4">
            <div class="avatar">
              <div class="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img :src="currentAvatarUrl" :alt="authStore.user?.name" />
              </div>
            </div>
            <div>
              <h3 class="text-xl font-semibold">{{ authStore.user?.name }}</h3>
              <p class="text-sm text-base-content/70">{{ authStore.user?.email }}</p>
            </div>
          </div>

          <div class="divider"></div>

          <!-- Update Profile Form -->
          <form @submit.prevent="handleSubmit">
            <!-- Name Input -->
            <div class="form-control mb-4">
              <label class="label" for="name">
                <span class="label-text font-semibold">Name</span>
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

            <!-- Email (Read-only) -->
            <div class="form-control mb-4">
              <label class="label" for="email">
                <span class="label-text font-semibold">Email</span>
              </label>
              <input
                id="email"
                :value="authStore.user?.email"
                type="email"
                class="input input-bordered w-full"
                disabled
                readonly
              />
              <label class="label">
                <span class="label-text-alt">Email cannot be changed</span>
              </label>
            </div>

            <!-- Avatar Upload -->
            <div class="form-control mb-4">
              <label class="label" for="avatar">
                <span class="label-text font-semibold">Avatar</span>
              </label>
              <input
                id="avatar"
                type="file"
                accept="image/*"
                class="file-input file-input-bordered w-full"
                :disabled="isLoading"
                @change="handleAvatarChange"
              />
              <label class="label">
                <span class="label-text-alt">Max size: 5MB. Supported: JPG, PNG, GIF</span>
              </label>
            </div>

            <!-- Avatar Preview -->
            <div v-if="avatarPreview" class="mb-4">
              <label class="label">
                <span class="label-text font-semibold">Preview</span>
              </label>
              <div class="flex items-center gap-4">
                <div class="avatar">
                  <div class="w-20 rounded-full">
                    <img :src="avatarPreview" alt="Avatar preview" />
                  </div>
                </div>
                <button type="button" class="btn btn-sm btn-ghost" @click="clearAvatarSelection">
                  Clear
                </button>
              </div>
            </div>

            <!-- Success Alert -->
            <div v-if="success" class="alert alert-success mb-4">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{{ success }}</span>
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

            <!-- Action Buttons -->
            <div class="form-control mt-6 flex flex-row gap-4">
              <button type="submit" class="btn btn-primary flex-1" :disabled="isLoading">
                <span v-if="isLoading" class="loading loading-spinner"></span>
                {{ isLoading ? 'Updating...' : 'Update Profile' }}
              </button>
              <LogoutButton />
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
