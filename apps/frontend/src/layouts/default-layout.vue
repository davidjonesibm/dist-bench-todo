<script setup lang="ts">
import AppHeader from '../components/navigation/app-header.vue'
</script>

<template>
  <div class="min-h-screen bg-base-200 flex flex-col">
    <!-- Header -->
    <AppHeader />

    <!-- Main Content -->
    <main class="flex-1 container mx-auto px-4 py-6 max-w-7xl">
      <RouterView />
    </main>

    <!-- Footer -->
    <footer class="footer footer-center p-4 bg-base-300 text-base-content">
      <aside>
        <p class="text-sm">
          © {{ new Date().getFullYear() }} ProductivityHub - Built with Vue 3 & DaisyUI
        </p>
      </aside>
    </footer>
  </div>
</template>
