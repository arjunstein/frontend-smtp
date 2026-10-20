import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'
import SmtpConfigsView from '@/views/SmtpConfigsView.vue'
import SendEmailView from '@/views/SendEmailView.vue'
import SettingsView from '@/views/SettingsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: { title: 'Dashboard & Overview' }
    },
    {
      path: '/configs',
      name: 'smtp-configs',
      component: SmtpConfigsView,
      meta: { title: 'SMTP Configurations' }
    },
    {
      path: '/send',
      name: 'send-email',
      component: SendEmailView,
      meta: { title: 'Email Dispatch Studio' }
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
      meta: { title: 'Connection Settings' }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

router.beforeEach((to) => {
  const title = to.meta.title ? `${to.meta.title} — SMTP Agent` : 'SMTP Agent'
  document.title = title
})

export default router
