<template>
  <div class="layout">
    <!-- Mobile overlay -->
    <div v-if="mobileOpen" class="sidebar-overlay" @click="mobileOpen = false"></div>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed, 'mobile-open': mobileOpen }">
      <div class="sidebar-logo">
        <div class="logo-icon-sm">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        </div>
        <span v-if="!sidebarCollapsed" class="logo-text">FB Manager</span>
        <button class="collapse-btn desktop-only" @click="sidebarCollapsed = !sidebarCollapsed">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path v-if="!sidebarCollapsed" d="M15 18l-6-6 6-6"/>
            <path v-else d="M9 18l6-6-6-6"/>
          </svg>
        </button>
        <button class="collapse-btn mobile-close-btn" @click="mobileOpen = false">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <nav class="sidebar-nav">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          :title="item.label"
          @click="mobileOpen = false"
        >
          <span class="nav-icon" v-html="item.icon"></span>
          <span v-if="!sidebarCollapsed" class="nav-label">{{ item.label }}</span>
          <span v-if="!sidebarCollapsed && item.badge" class="nav-badge">{{ item.badge }}</span>
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">{{ userInitials }}</div>
          <div v-if="!sidebarCollapsed" class="user-details">
            <span class="user-name">{{ auth.user?.first_name || auth.user?.username }}</span>
            <span class="badge" :class="`badge-${auth.user?.role}`">{{ auth.user?.role }}</span>
          </div>
        </div>
        <button v-if="!sidebarCollapsed" class="btn-icon" @click="handleLogout" title="Logout">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <div class="main-wrap">
      <header class="topbar">
        <div class="topbar-left">
          <button class="btn-icon mobile-menu-btn" @click="mobileOpen = true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div class="breadcrumb">
            <span>{{ currentPageTitle }}</span>
          </div>
        </div>
        <div class="topbar-right">
          <div class="topbar-date">{{ currentDate }}</div>
          <RouterLink to="/settings" class="btn-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </RouterLink>
        </div>
      </header>

      <main class="main-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const sidebarCollapsed = ref(false)
const mobileOpen = ref(false)

const navItems = computed(() => {
  const items = [
    {
      to: '/dashboard', label: 'Dashboard',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`
    },
    {
      to: '/accounts', label: 'FB Accounts',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
    },
    {
      to: '/pages', label: 'FB Pages',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`
    },
  ]
  if (auth.isAdmin) {
    items.push({
      to: '/users', label: 'Users & Roles',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
    })
  }
  items.push({
    to: '/settings', label: 'Settings',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`
  })
  return items
})

const userInitials = computed(() => {
  const u = auth.user
  if (!u) return '?'
  if (u.first_name && u.last_name) return u.first_name[0] + u.last_name[0]
  return u.username[0].toUpperCase()
})

const currentPageTitle = computed(() => {
  const map = { '/dashboard': 'Dashboard', '/accounts': 'Facebook Accounts', '/pages': 'Facebook Pages', '/users': 'Users & Roles', '/settings': 'Settings' }
  return map[route.path] || 'FB Manager'
})

const currentDate = computed(() => new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }))

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.layout { display: flex; height: 100vh; overflow: hidden; }

/* Overlay for mobile */
.sidebar-overlay {
  display: none;
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 99;
}

.sidebar {
  width: var(--sidebar-w); background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  display: flex; flex-direction: column;
  transition: width 0.25s ease; overflow: hidden;
  flex-shrink: 0; z-index: 100;
}
.sidebar.collapsed { width: 64px; }

.sidebar-logo {
  height: var(--header-h); padding: 0 16px;
  display: flex; align-items: center; gap: 10px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.logo-icon-sm {
  width: 32px; height: 32px; background: var(--accent);
  border-radius: 8px; display: flex; align-items: center; justify-content: center;
  color: #fff; flex-shrink: 0;
}
.logo-text { font-size: 15px; font-weight: 700; flex: 1; white-space: nowrap; overflow: hidden; }
.collapse-btn {
  width: 26px; height: 26px; background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 6px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--text-muted); flex-shrink: 0;
  transition: all 0.2s;
}
.collapse-btn:hover { color: var(--text-primary); border-color: var(--border-light); }
.desktop-only { display: flex; }
.mobile-close-btn { display: none; }

.sidebar-nav { flex: 1; padding: 12px 8px; overflow-y: auto; display: flex; flex-direction: column; gap: 2px; }
.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px; border-radius: var(--radius-sm);
  text-decoration: none; color: var(--text-secondary);
  transition: all 0.15s; white-space: nowrap;
  position: relative;
}
.nav-item:hover { background: var(--bg-card); color: var(--text-primary); }
.nav-item.router-link-active { background: var(--accent-glow); color: var(--accent); }
.nav-icon { display: flex; align-items: center; flex-shrink: 0; }
.nav-label { font-size: 13px; font-weight: 500; flex: 1; overflow: hidden; }
.nav-badge { background: var(--accent); color: #fff; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 10px; }

.sidebar-footer {
  padding: 12px; border-top: 1px solid var(--border);
  display: flex; align-items: center; gap: 10px;
  flex-shrink: 0;
}
.user-info { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
.user-avatar {
  width: 32px; height: 32px; background: var(--accent-glow);
  border: 1px solid rgba(24,119,242,0.3);
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; color: var(--accent); flex-shrink: 0;
}
.user-details { display: flex; flex-direction: column; gap: 2px; min-width: 0; overflow: hidden; }
.user-name { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.main-wrap { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }

.topbar {
  height: var(--header-h); background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 16px; flex-shrink: 0;
}
.topbar-left { display: flex; align-items: center; gap: 12px; }
.breadcrumb { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.mobile-menu-btn { display: none; }
.topbar-right { display: flex; align-items: center; gap: 10px; }
.topbar-date { font-size: 12px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

.main-content { flex: 1; overflow-y: auto; padding: 20px; }

/* ===== RESPONSIVE ===== */
@media (max-width: 900px) {
  .topbar { padding: 0 12px; }
  .main-content { padding: 14px; }
  .topbar-date { display: none; }
}

@media (max-width: 768px) {
  .sidebar-overlay { display: block; }
  .sidebar {
    position: fixed; left: 0; top: 0; height: 100%;
    transform: translateX(-100%);
    transition: transform 0.25s ease;
    width: var(--sidebar-w) !important;
  }
  .sidebar.mobile-open {
    transform: translateX(0);
  }
  .mobile-menu-btn { display: flex; }
  .desktop-only { display: none; }
  .mobile-close-btn { display: flex; }
  .main-content { padding: 12px; }
}

@media (max-width: 480px) {
  .main-content { padding: 10px; }
  .breadcrumb { font-size: 13px; }
}
</style>
