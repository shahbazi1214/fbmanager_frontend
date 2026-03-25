import axios from 'axios'

const api = axios.create({
  baseURL: 'https://industrious-nourishment-production-43f0.up.railway.app/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

// Attach token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh on 401
api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) {
        try {
          const { data } = await axios.post('/api/auth/token/refresh/', { refresh })
          localStorage.setItem('access_token', data.access)
          original.headers.Authorization = `Bearer ${data.access}`
          return api(original)
        } catch {
          localStorage.clear()
          window.location.href = '/login'
        }
      } else {
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login/', data),
  logout: (data) => api.post('/auth/logout/', data),
  me: () => api.get('/auth/me/'),
  updateMe: (data) => api.patch('/auth/me/', data),
  changePassword: (data) => api.post('/auth/change-password/', data),
}

// Users
export const usersAPI = {
  list: () => api.get('/auth/users/'),
  create: (data) => api.post('/auth/users/', data),
  update: (id, data) => api.patch(`/auth/users/${id}/`, data),
  delete: (id) => api.delete(`/auth/users/${id}/`),
  // Manager assignment
  assignAccounts: (managerId, accountIds) => api.post(`/auth/users/${managerId}/assign-accounts/`, { account_ids: accountIds }),
  getAssignedAccounts: (managerId) => api.get(`/auth/users/${managerId}/assigned-accounts/`),
}

// Dashboard
export const dashboardAPI = {
  get: () => api.get('/dashboard/'),
}

// FB Accounts
export const accountsAPI = {
  list: (params) => api.get('/accounts/', { params }),
  get: (id) => api.get(`/accounts/${id}/`),
  create: (data) => api.post('/accounts/', data),
  update: (id, data) => api.patch(`/accounts/${id}/`, data),
  delete: (id) => api.delete(`/accounts/${id}/`),
}

// FB Pages
export const pagesAPI = {
  list: (params) => api.get('/pages/', { params }),
  get: (id) => api.get(`/pages/${id}/`),
  create: (data) => api.post('/pages/', data),
  update: (id, data) => api.patch(`/pages/${id}/`, data),
  delete: (id) => api.delete(`/pages/${id}/`),
  progress: (id, params) => api.get(`/pages/${id}/progress/`, { params }),
}

// Stats
export const statsAPI = {
  list: (pageId, params) => api.get(`/pages/${pageId}/stats/`, { params }),
  create: (pageId, data) => api.post(`/pages/${pageId}/stats/`, data),
  update: (statId, data) => api.patch(`/stats/${statId}/`, data),
  delete: (statId) => api.delete(`/stats/${statId}/`),
}
