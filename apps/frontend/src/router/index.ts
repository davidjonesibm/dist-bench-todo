import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/home-view.vue'),
      meta: { requiresAuth: true, layout: 'default' },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/login-view.vue'),
      meta: { requiresGuest: true, layout: 'auth' },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/register-view.vue'),
      meta: { requiresGuest: true, layout: 'auth' },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/profile-view.vue'),
      meta: { requiresAuth: true, layout: 'default' },
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: () => import('../views/calendar-view.vue'),
      meta: { requiresAuth: true, layout: 'default' },
    },
    {
      path: '/notes',
      name: 'notes',
      component: () => import('../views/notes-view.vue'),
      meta: { requiresAuth: true, layout: 'default' },
    },
  ],
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Redirect to login if not authenticated
    next({ name: 'login', query: { redirect: to.fullPath } })
  }
  // Check if route requires guest (login/register pages)
  else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    // Redirect to home if already authenticated
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router
