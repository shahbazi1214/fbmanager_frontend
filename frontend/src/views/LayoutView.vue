<template>
  <div class="layout">
    <div v-if="mobileOpen" class="sidebar-overlay" @click="mobileOpen = false"></div>

    <!-- Auto-collapse/expand sidebar on hover -->
    <aside
      class="sidebar"
      :class="{ expanded: sidebarExpanded || sidebarPinned, 'mobile-open': mobileOpen }"
      @mouseenter="sidebarExpanded = true"
      @mouseleave="sidebarExpanded = false"
    >
      <div class="sidebar-logo">
        <div class="logo-mark">
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="url(#g1)"/>
            <path d="M8 10h16M8 16h10M8 22h13" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
            <circle cx="25" cy="22" r="3.5" fill="rgba(255,255,255,0.25)" stroke="white" stroke-width="1.5"/>
            <path d="M23.7 22l1 1 1.8-1.8" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop stop-color="#1877f2"/>
                <stop offset="1" stop-color="#7c3aed"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <Transition name="label-fade">
          <span v-if="sidebarExpanded || sidebarPinned" class="logo-text">SocialVault</span>
        </Transition>
        <button v-if="sidebarExpanded || sidebarPinned" class="pin-btn desktop-only" :class="{ active: sidebarPinned }" @click.stop="sidebarPinned = !sidebarPinned" title="Pin sidebar">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 4.5-8.5 8.5M20 9l-5-5"/><path d="m5 19 5.5-5.5"/><path d="M14.5 4 20 9.5l-5 5-2-1.5-3 3-2-2 3-3L9.5 9.5z"/></svg>
        </button>
        <button class="pin-btn mobile-close-btn" @click="mobileOpen = false">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <nav class="sidebar-nav">
        <RouterLink
          v-for="(item, i) in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          :title="!(sidebarExpanded || sidebarPinned) ? item.label : ''"
          @click="mobileOpen = false"
        >
          <span class="nav-icon" v-html="item.icon"></span>
          <Transition name="label-fade">
            <span v-if="sidebarExpanded || sidebarPinned" class="nav-label">{{ item.label }}</span>
          </Transition>
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">{{ userInitials }}</div>
          <Transition name="label-fade">
            <div v-if="sidebarExpanded || sidebarPinned" class="user-details">
              <span class="user-name">{{ auth.user?.first_name || auth.user?.username }}</span>
              <span class="badge" :class="`badge-${auth.user?.role}`">{{ auth.user?.role }}</span>
            </div>
          </Transition>
        </div>
        <Transition name="label-fade">
          <button v-if="sidebarExpanded || sidebarPinned" class="btn-icon" @click="handleLogout" title="Logout">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </Transition>
      </div>
    </aside>

    <!-- Main -->
    <div class="main-wrap">
      <header class="topbar">
        <div class="topbar-left">
          <button class="btn-icon mobile-menu-btn" @click="mobileOpen = true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div class="breadcrumb">
            <span class="breadcrumb-root">SocialVault</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            <span>{{ currentPageTitle }}</span>
          </div>
        </div>
        <div class="topbar-right">
          <span class="topbar-date">{{ currentDate }}</span>
          <button class="btn-icon theme-btn" @click="themeStore.toggle()" :title="themeStore.dark ? 'Switch to Light' : 'Switch to Dark'">
            <Transition name="icon-fade" mode="out-in">
              <svg v-if="themeStore.dark" key="moon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              <svg v-else key="sun" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            </Transition>
          </button>
          <RouterLink to="/settings" class="btn-icon" title="Settings">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </RouterLink>
        </div>
      </header>

      <main class="main-content">
        <RouterView v-slot="{ Component }">
          <Transition name="page-anim" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, RouterLink, RouterView, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'

const auth = useAuthStore()
const themeStore = useThemeStore()
const router = useRouter()
const route = useRoute()
const sidebarExpanded = ref(false)
const sidebarPinned = ref(false)
const mobileOpen = ref(false)

const navItems = computed(() => {
  const items = [
    { to: '/dashboard', label: 'Dashboard', icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>` },
    { to: '/accounts', label: 'FB Accounts', icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>` },
    { to: '/pages', label: 'FB Pages', icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>` },
  ]
  if (auth.isAdmin) {
    items.push({ to: '/users', label: 'Users & Roles', icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>` })
  }
  items.push({ to: '/settings', label: 'Settings', icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>` })
  return items
})

const userInitials = computed(() => {
  const u = auth.user
  if (!u) return '?'
  if (u.first_name && u.last_name) return u.first_name[0] + u.last_name[0]
  return u.username[0].toUpperCase()
})

const currentPageTitle = computed(() => {
  const map = { '/dashboard': 'Dashboard', '/accounts': 'FB Accounts', '/pages': 'FB Pages', '/users': 'Users & Roles', '/settings': 'Settings' }
  return map[route.path] || 'Overview'
})

const currentDate = computed(() => new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }))

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.layout { display: flex; height: 100vh; overflow: hidden; }
.sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 99; }

.sidebar {
  width: 62px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  display: flex; flex-direction: column;
  transition: width 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden; flex-shrink: 0; z-index: 100;
}
.sidebar.expanded { width: var(--sidebar-w); }

.sidebar-logo {
  height: var(--header-h); padding: 0 14px;
  display: flex; align-items: center; gap: 10px;
  border-bottom: 1px solid var(--border); flex-shrink: 0; overflow: hidden;
}
.logo-mark {
  width: 34px; height: 34px; border-radius: 9px; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; box-shadow: 0 4px 12px rgba(24,119,242,0.3);
}
.logo-text {
  font-size: 15px; font-weight: 800; flex: 1; white-space: nowrap;
  background: linear-gradient(135deg, #1877f2, #7c3aed);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.pin-btn { width: 26px; height: 26px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-muted); flex-shrink: 0; transition: all 0.2s; }
.pin-btn:hover, .pin-btn.active { color: var(--accent); border-color: rgba(24,119,242,0.3); background: var(--accent-glow); }
.desktop-only { display: flex; }
.mobile-close-btn { display: none; }

.sidebar-nav { flex: 1; padding: 10px 8px; overflow-y: auto; display: flex; flex-direction: column; gap: 2px; }
.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px; border-radius: var(--radius-sm);
  text-decoration: none; color: var(--text-secondary);
  transition: all 0.18s; white-space: nowrap;
  border: 1px solid transparent;
}
.nav-item:hover { background: var(--bg-card); color: var(--text-primary); transform: translateX(2px); }
.nav-item.router-link-active { background: var(--accent-glow); color: var(--accent); border-color: rgba(24,119,242,0.2); }
.nav-icon { display: flex; align-items: center; flex-shrink: 0; width: 18px; height: 18px; }
.nav-label { font-size: 13px; font-weight: 500; flex: 1; overflow: hidden; }

.sidebar-footer { padding: 10px; border-top: 1px solid var(--border); display: flex; align-items: center; gap: 10px; flex-shrink: 0; overflow: hidden; }
.user-info { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
.user-avatar { width: 32px; height: 32px; background: var(--accent-glow); border: 1px solid rgba(24,119,242,0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: var(--accent); flex-shrink: 0; }
.user-details { display: flex; flex-direction: column; gap: 2px; min-width: 0; overflow: hidden; }
.user-name { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.main-wrap { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
.topbar { height: var(--header-h); background: var(--bg-secondary); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 20px; flex-shrink: 0; transition: background 0.3s; }
.topbar-left { display: flex; align-items: center; gap: 12px; }
.breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 13px; }
.breadcrumb-root { color: var(--text-muted); }
.breadcrumb span:last-child { font-weight: 700; color: var(--text-primary); font-size: 14px; }
.mobile-menu-btn { display: none; }
.topbar-right { display: flex; align-items: center; gap: 8px; }
.topbar-date { font-size: 11px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

.main-content { flex: 1; overflow-y: auto; padding: 24px; }

/* Transitions */
.page-anim-enter-active { animation: fadeInUp 0.25s ease; }
.page-anim-leave-active { opacity: 0; transition: opacity 0.1s ease; }
.label-fade-enter-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.label-fade-leave-active { transition: opacity 0.1s ease; }
.label-fade-enter-from { opacity: 0; transform: translateX(-8px); }
.label-fade-leave-to { opacity: 0; }
.icon-fade-enter-active, .icon-fade-leave-active { transition: opacity 0.15s, transform 0.15s; }
.icon-fade-enter-from, .icon-fade-leave-to { opacity: 0; transform: scale(0.8); }

@media (max-width: 900px) { .topbar { padding: 0 14px; } .main-content { padding: 16px; } .topbar-date { display: none; } }
@media (max-width: 768px) {
  .sidebar-overlay { display: block; }
  .sidebar { position: fixed; left: 0; top: 0; height: 100%; transform: translateX(-100%); transition: transform 0.28s ease; width: var(--sidebar-w) !important; }
  .sidebar.mobile-open { transform: translateX(0); }
  .mobile-menu-btn { display: flex; }
  .desktop-only { display: none; }
  .mobile-close-btn { display: flex; }
  .main-content { padding: 12px; }
  .breadcrumb-root, .breadcrumb svg { display: none; }
}
@media (max-width: 480px) { .main-content { padding: 10px; } }
</style>
