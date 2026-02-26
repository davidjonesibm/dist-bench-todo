<script setup lang="ts">
import { ref } from 'vue'

const themes = ['light', 'dark', 'cupcake'] as const
type Theme = (typeof themes)[number]

const currentTheme = ref<Theme>('light')

function setTheme(theme: Theme) {
  currentTheme.value = theme
  document.documentElement.setAttribute('data-theme', theme)
}
</script>

<template>
  <div :data-theme="currentTheme" class="min-h-screen bg-base-200">
    <nav class="navbar bg-base-100 shadow-sm px-4">
      <div class="flex-1">
        <span class="text-xl font-bold text-primary">✓ Todo App</span>
      </div>
      <div class="flex-none gap-2">
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-ghost btn-sm">
            Theme
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
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
    </nav>
    <RouterView />
  </div>
</template>
