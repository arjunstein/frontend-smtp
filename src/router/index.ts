import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import DashboardView from '@/views/DashboardView.vue'
import SmtpConfigsView from '@/views/SmtpConfigsView.vue'
import SendEmailView from '@/views/SendEmailView.vue'
import SettingsView from '@/views/SettingsView.vue'
import LoginView from '@/views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { title: 'Sign In & Register', guestOnly: true, isAuthPage: true }
    },
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: { title: 'Dashboard & Overview', requiresAuth: true }
    },
    {
      path: '/configs',
      name: 'smtp-configs',
      component: SmtpConfigsView,
      meta: { title: 'SMTP Configurations', requiresAuth: true }
    },
    {
      path: '/send',
      name: 'send-email',
      component: SendEmailView,
      meta: { title: 'Email Dispatch Studio', requiresAuth: true }
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
      meta: { title: 'Connection Settings', requiresAuth: true }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // If token is present but user profile is not loaded yet, fetch it
  if (authStore.isAuthenticated && !authStore.user) {
    await authStore.fetchMe()
  }

  const title = to.meta.title ? `${to.meta.title} — SMTP Agent` : 'SMTP Agent'
  document.title = title

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (to.meta.guestOnly && authStore.isAuthenticated) {
    next({ path: '/' })
  } else {
    next()
  }
})

export default router

