import { defineStore } from 'pinia'
import { authAPI } from '@/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    accessToken: localStorage.getItem('access_token'),
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (s) => !!s.accessToken && !!s.user,
    isAdmin: (s) => s.user?.role === 'admin',
    isManager: (s) => ['admin', 'manager'].includes(s.user?.role),
    userRole: (s) => s.user?.role || 'manager',
  },

  actions: {
    async login(credentials) {
      this.loading = true
      this.error = null
      try {
        const { data } = await authAPI.login(credentials)
        this.accessToken = data.access
        this.user = data.user
        localStorage.setItem('access_token', data.access)
        localStorage.setItem('refresh_token', data.refresh)
        localStorage.setItem('user', JSON.stringify(data.user))
        return { success: true }
      } catch (err) {
        this.error = err.response?.data?.detail || 'Login failed'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async logout() {
      try {
        const refresh = localStorage.getItem('refresh_token')
        if (refresh) await authAPI.logout({ refresh })
      } catch {}
      this.user = null
      this.accessToken = null
      localStorage.clear()
    },

    async fetchMe() {
      try {
        const { data } = await authAPI.me()
        this.user = data
        localStorage.setItem('user', JSON.stringify(data))
      } catch {}
    },
  }
})
