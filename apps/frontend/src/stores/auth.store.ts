import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiFetch } from '../lib/api'

function isTokenValid(token: string): boolean {
  if (!token) return false
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp > Date.now() / 1000
  } catch {
    return false
  }
}
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
    try {
      const raw = localStorage.getItem('pocketbase_auth')
      if (raw) {
        const { token: storedToken, model } = JSON.parse(raw)
        if (storedToken && isTokenValid(storedToken) && model) {
          user.value = model as User
          token.value = storedToken
          return
        }
      }
    } catch {
      // ignore malformed stored data
    }
    user.value = null
    token.value = ''
  }

  /**
   * Login with email and password
   */
  async function login(credentials: LoginCredentials): Promise<void> {
    try {
      const { token: authToken, record } = await apiFetch<{ token: string; record: User }>(
        '/api/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ email: credentials.email, password: credentials.password }),
        },
      )

      localStorage.setItem('pocketbase_auth', JSON.stringify({ token: authToken, model: record }))
      user.value = record
      token.value = authToken
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
      const { token: authToken, record } = await apiFetch<{ token: string; record: User }>(
        '/api/auth/register',
        {
          method: 'POST',
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
            passwordConfirm: credentials.passwordConfirm,
            name: credentials.name,
          }),
        },
      )

      localStorage.setItem('pocketbase_auth', JSON.stringify({ token: authToken, model: record }))
      user.value = record
      token.value = authToken
    } catch (error: any) {
      console.error('Registration error:', error)
      throw new Error(error?.message || 'Registration failed. Please try again.')
    }
  }

  /**
   * Logout current user
   */
  function logout(): void {
    localStorage.removeItem('pocketbase_auth')
    user.value = null
    token.value = ''
  }

  /**
   * Refresh the authentication token
   */
  async function refreshAuth(): Promise<void> {
    try {
      if (token.value && isTokenValid(token.value)) {
        const { token: authToken, record } = await apiFetch<{ token: string; record: User }>(
          '/api/auth/refresh',
          { method: 'POST' },
        )
        localStorage.setItem('pocketbase_auth', JSON.stringify({ token: authToken, model: record }))
        user.value = record
        token.value = authToken
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

      const updatedUser = await apiFetch<User>(`/api/auth/profile/${user.value.id}`, {
        method: 'PUT',
        body: formData,
      })
      user.value = updatedUser
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
    const pbUrl = import.meta.env.VITE_POCKETBASE_URL || 'http://localhost:8090'
    return `${pbUrl}/api/files/users/${user.id}/${user.avatar}?thumb=${size}x${size}`
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
