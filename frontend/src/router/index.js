import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/login', name: 'Login', component: () => import('@/views/LoginView.vue'), meta: { guest: true } },
  {
    path: '/',
    component: () => import('@/views/LayoutView.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/dashboard' },
      { path: 'dashboard', name: 'Dashboard', component: () => import('@/views/DashboardView.vue') },
      { path: 'accounts', name: 'Accounts', component: () => import('@/views/AccountsView.vue') },
      { path: 'accounts/:id', name: 'AccountDetail', component: () => import('@/views/AccountDetailView.vue') },
      { path: 'pages', name: 'Pages', component: () => import('@/views/PagesView.vue') },
      { path: 'pages/:id', name: 'PageDetail', component: () => import('@/views/PageDetailView.vue') },
      { path: 'users', name: 'Users', component: () => import('@/views/UsersView.vue'), meta: { role: 'admin' } },
      { path: 'settings', name: 'Settings', component: () => import('@/views/SettingsView.vue') },
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) return next('/login')
  if (to.meta.guest && auth.isAuthenticated) return next('/dashboard')
  if (to.meta.role === 'admin' && !auth.isAdmin) return next('/dashboard')
  next()
})

export default router
