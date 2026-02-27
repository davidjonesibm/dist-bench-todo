<script setup lang="ts">
import { ref } from 'vue'

const themes = ['light', 'dark', 'cupcake'] as const
type Theme = (typeof themes)[number]

const currentTheme = ref<Theme>('light')

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
</script>

<template>
  <div class="min-h-screen bg-base-200 flex flex-col">
    <!-- Minimal Header with Branding -->
    <div class="navbar bg-base-100 shadow-sm px-4">
      <div class="flex-1">
        <RouterLink to="/login" class="flex items-center gap-2 text-xl font-bold text-primary">
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
          <span>ProductivityHub</span>
        </RouterLink>
      </div>
      <div class="flex-none">
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
            Theme
          </div>
          <ul
            tabindex="0"
            class="dropdown-content menu bg-base-100 rounded-box z-[1] w-36 p-2 shadow"
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
      </div>
    </div>

    <!-- Centered Content Area -->
    <main class="flex-1 flex items-center justify-center px-4 py-8">
      <div class="w-full max-w-md">
        <RouterView />
      </div>
    </main>

    <!-- Footer -->
    <footer class="footer footer-center p-4 bg-base-300 text-base-content">
      <aside>
        <p class="text-sm">© {{ new Date().getFullYear() }} ProductivityHub</p>
      </aside>
    </footer>
  </div>
</template>
