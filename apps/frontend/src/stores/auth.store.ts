import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { pb } from '../lib/pocketbase'
import type {
  User,
  LoginCredentials,
  RegisterCredentials,
  UpdateProfileData,
} from '../types/auth.types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string>('')

  const isAuthenticated = computed<boolean>(() => !!user.value && !!token.value)

  /**
   * Initialize auth state from PocketBase authStore
   * Call this on app startup to restore session
   */
  function initAuth() {
    if (pb.authStore.isValid && pb.authStore.model) {
      user.value = pb.authStore.model as unknown as User
      token.value = pb.authStore.token
    } else {
      user.value = null
      token.value = ''
    }
  }

  /**
   * Login with email and password
   */
  async function login(credentials: LoginCredentials): Promise<void> {
    try {
      const authData = await pb
        .collection('users')
        .authWithPassword(credentials.email, credentials.password)

      user.value = authData.record as unknown as User
      token.value = pb.authStore.token
    } catch (error: any) {
      console.error('Login error:', error)
      throw new Error(error?.message || 'Login failed. Please check your credentials.')
    }
  }

  /**
   * Register a new user
   */
  async function register(credentials: RegisterCredentials): Promise<void> {
    try {
      // Create the user account
      const record = await pb.collection('users').create({
        email: credentials.email,
        password: credentials.password,
        passwordConfirm: credentials.passwordConfirm,
        name: credentials.name,
        username: credentials.email.split('@')[0], // Generate username from email
      })

      // Auto-login after registration
      await login({
        email: credentials.email,
        password: credentials.password,
      })
    } catch (error: any) {
      console.error('Registration error:', error)

      // Parse PocketBase validation errors
      if (error?.data?.data) {
        const errors = error.data.data
        const errorMessages = Object.entries(errors)
          .map(([field, data]: [string, any]) => `${field}: ${data.message}`)
          .join(', ')
        throw new Error(errorMessages)
      }

      throw new Error(error?.message || 'Registration failed. Please try again.')
    }
  }

  /**
   * Logout current user
   */
  function logout(): void {
    pb.authStore.clear()
    user.value = null
    token.value = ''
  }

  /**
   * Refresh the authentication token
   */
  async function refreshAuth(): Promise<void> {
    try {
      if (pb.authStore.isValid) {
        await pb.collection('users').authRefresh()
        user.value = pb.authStore.model as unknown as User
        token.value = pb.authStore.token
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
      logout()
    }
  }

  /**
   * Update user profile
   */
  async function updateProfile(data: UpdateProfileData): Promise<void> {
    if (!user.value) {
      throw new Error('No user logged in')
    }

    try {
      const formData = new FormData()

      if (data.name) {
        formData.append('name', data.name)
      }

      if (data.avatar) {
        formData.append('avatar', data.avatar)
      }

      const updatedUser = await pb.collection('users').update(user.value.id, formData)
      user.value = updatedUser as unknown as User
    } catch (error: any) {
      console.error('Profile update error:', error)
      throw new Error(error?.message || 'Failed to update profile.')
    }
  }

  /**
   * Get avatar URL for the current user
   */
  function getAvatarUrl(user: User, size = 80): string {
    if (!user.avatar) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=${size}&background=random`
    }
    return pb.files.getUrl(user, user.avatar, { thumb: `${size}x${size}` })
  }

  return {
    user,
    token,
    isAuthenticated,
    initAuth,
    login,
    register,
    logout,
    refreshAuth,
    updateProfile,
    getAvatarUrl,
  }
})
