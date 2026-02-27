<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/auth.store'
import NavMenu from './nav-menu.vue'
import UserMenu from './user-menu.vue'

const themes = [
  'light',
  'dark',
  'cupcake',
  'bumblebee',
  'emerald',
  'corporate',
  'synthwave',
  'retro',
  'cyberpunk',
  'valentine',
  'halloween',
  'garden',
  'forest',
  'aqua',
  'lofi',
  'pastel',
  'fantasy',
  'wireframe',
  'black',
  'luxury',
  'dracula',
] as const
type Theme = (typeof themes)[number]

const currentTheme = ref<Theme>('light')
const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)

function setTheme(theme: Theme) {
  currentTheme.value = theme
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
}

// Initialize theme from localStorage
const savedTheme = localStorage.getItem('theme') as Theme | null
if (savedTheme && themes.includes(savedTheme)) {
  setTheme(savedTheme)
}

// Mobile menu drawer state
const isDrawerOpen = ref(false)

function toggleDrawer() {
  isDrawerOpen.value = !isDrawerOpen.value
}

function closeDrawer() {
  isDrawerOpen.value = false
}
</script>

<template>
  <div class="navbar bg-base-100 shadow-sm px-4 sticky top-0 z-50">
    <!-- Mobile Hamburger Menu -->
    <div class="flex-none lg:hidden">
      <button class="btn btn-square btn-ghost" @click="toggleDrawer">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          class="inline-block h-5 w-5 stroke-current"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          ></path>
        </svg>
      </button>
    </div>

    <!-- Logo/Brand -->
    <div class="flex-1">
      <RouterLink to="/" class="flex items-center gap-2 text-xl font-bold text-primary">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          />
        </svg>
        <span class="hidden sm:inline">ProductivityHub</span>
      </RouterLink>
    </div>

    <!-- Desktop Navigation -->
    <div v-if="isAuthenticated" class="flex-none hidden lg:block">
      <NavMenu />
    </div>

    <!-- Right Side Actions -->
    <div class="flex-none gap-2">
      <!-- Theme Selector -->
      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost btn-sm gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
            />
          </svg>
          <span class="hidden sm:inline">Theme</span>
        </div>
        <ul
          tabindex="0"
          class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-lg max-h-96 overflow-y-auto"
        >
          <li v-for="theme in themes" :key="theme">
            <button
              class="capitalize"
              :class="{ active: currentTheme === theme }"
              @click="setTheme(theme)"
            >
              {{ theme }}
            </button>
          </li>
        </ul>
      </div>

      <!-- User Menu -->
      <UserMenu v-if="isAuthenticated" />
    </div>
  </div>

  <!-- Mobile Drawer -->
  <div v-if="isAuthenticated" class="drawer drawer-end">
    <input id="mobile-drawer" type="checkbox" class="drawer-toggle" v-model="isDrawerOpen" />
    <div class="drawer-side z-40">
      <label for="mobile-drawer" class="drawer-overlay" @click="closeDrawer"></label>
      <ul class="menu bg-base-100 min-h-full w-80 p-4">
        <li class="menu-title">
          <span class="text-lg font-bold">Navigation</span>
        </li>
        <li>
          <RouterLink to="/" @click="closeDrawer" class="flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            Todos
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/calendar" @click="closeDrawer" class="flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Calendar
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/notes" @click="closeDrawer" class="flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Notes
          </RouterLink>
        </li>
      </ul>
    </div>
  </div>
</template>
