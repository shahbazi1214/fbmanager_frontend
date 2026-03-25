<template>
  <div>
    <div class="page-header">
      <div class="page-header-left">
        <h1>Facebook Pages</h1>
        <p>{{ auth.isAdmin ? 'All pages across all accounts' : 'Pages from your assigned accounts' }}</p>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-input">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="search" class="form-input" placeholder="Search pages..." @input="debouncedFetch" />
      </div>
      <select v-model="statusFilter" class="form-select filter-select" @change="fetchPages">
        <option value="">All Statuses</option>
        <option v-for="s in pageStatuses" :key="s" :value="s">{{ s }}</option>
      </select>
      <select v-model="accountFilter" class="form-select filter-select-lg" @change="fetchPages">
        <option value="">All Accounts</option>
        <option v-for="a in accounts" :key="a.id" :value="a.id">{{ a.name }}</option>
      </select>
      <span class="total-badge">{{ pages.length }} pages</span>
    </div>

    <div v-if="loading" class="loading-full"><div class="spinner"></div></div>

    <template v-else>
      <div class="pages-grid" v-if="pages.length">
        <div v-for="page in pages" :key="page.id" class="page-card">
          <div class="page-card-top">
            <div class="page-icon">{{ page.page_name[0] }}</div>
            <div class="page-header-info">
              <div class="page-title-row">
                <span class="page-title">{{ page.page_name }}</span>
                <span v-if="page.verified" class="verified-badge" title="Verified">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#1877f2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </span>
                <span v-if="page.monetization_enabled" title="Monetized">💰</span>
              </div>
              <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px">
                <span class="badge" :class="`badge-${page.status}`">{{ page.status }}</span>
                <span class="badge badge-inactive">{{ page.category }}</span>
              </div>
            </div>
          </div>

          <div class="page-stats-grid">
            <div class="ps-item">
              <div class="ps-val">{{ formatNum(page.followers_count) }}</div>
              <div class="ps-label">Followers</div>
            </div>
            <div class="ps-item">
              <div class="ps-val">{{ formatNum(page.likes_count) }}</div>
              <div class="ps-label">Likes</div>
            </div>
            <div class="ps-item">
              <div class="ps-val">{{ page.total_posts }}</div>
              <div class="ps-label">Posts</div>
            </div>
            <div class="ps-item">
              <div class="ps-val">{{ page.total_reels }}</div>
              <div class="ps-label">Reels</div>
            </div>
          </div>

          <div v-if="page.latest_stats" class="page-latest-stat">
            <div class="stat-pill">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>
              +{{ page.latest_stats.new_followers || 0 }} today
            </div>
            <div class="stat-pill stat-pill-views">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/></svg>
              {{ formatNum(page.latest_stats.page_views || 0) }} views
            </div>
          </div>

          <div class="page-footer">
            <span style="font-size:11px;color:var(--text-muted)">{{ page.account_name }}</span>
            <RouterLink :to="`/pages/${page.id}`" class="btn btn-secondary btn-sm">
              View →
            </RouterLink>
          </div>
        </div>
      </div>

      <div v-else class="empty-state card">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        <h3>No pages found</h3>
        <p v-if="auth.isAdmin">Add pages through a Facebook account</p>
        <p v-else>No pages found in your assigned accounts</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { pagesAPI, accountsAPI } from '@/api'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const pages = ref([])
const accounts = ref([])
const loading = ref(true)
const search = ref('')
const statusFilter = ref('')
const accountFilter = ref('')
const pageStatuses = ['active', 'inactive', 'restricted', 'unpublished', 'banned']

let debounceTimer = null
function debouncedFetch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(fetchPages, 300)
}

function formatNum(n) {
  if (!n) return '0'
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toString()
}

async function fetchPages() {
  try {
    const params = {}
    if (search.value) params.search = search.value
    if (statusFilter.value) params.status = statusFilter.value
    if (accountFilter.value) params.account = accountFilter.value
    const { data } = await pagesAPI.list(params)
    pages.value = data.results || data
  } catch (e) { console.error(e) }
}

async function fetchAccounts() {
  try {
    const { data } = await accountsAPI.list()
    accounts.value = data.results || data
  } catch {}
}

onMounted(async () => {
  loading.value = true
  await Promise.all([fetchPages(), fetchAccounts()])
  loading.value = false
})
</script>

<style scoped>
.pages-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.page-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; transition: border-color 0.2s; display: flex; flex-direction: column; gap: 14px; }
.page-card:hover { border-color: var(--border-light); }

.page-card-top { display: flex; align-items: flex-start; gap: 12px; }
.page-icon { width: 44px; height: 44px; background: linear-gradient(135deg, #1877f2, #a855f7); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; color: #fff; flex-shrink: 0; }
.page-header-info { flex: 1; min-width: 0; }
.page-title-row { display: flex; align-items: center; gap: 6px; }
.page-title { font-weight: 700; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.page-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.ps-item { background: var(--bg-card-hover); border-radius: var(--radius-sm); padding: 8px; text-align: center; }
.ps-val { font-size: 14px; font-weight: 700; }
.ps-label { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.3px; }

.page-latest-stat { display: flex; gap: 8px; flex-wrap: wrap; }
.stat-pill { display: flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; background: var(--green-bg); color: var(--green); border: 1px solid rgba(0,214,143,0.2); }
.stat-pill-views { background: var(--accent-glow); color: var(--accent); border-color: rgba(24,119,242,0.2); }

.page-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 10px; border-top: 1px solid var(--border); }

.total-badge { font-size: 12px; color: var(--text-muted); background: var(--bg-card); border: 1px solid var(--border); padding: 6px 12px; border-radius: var(--radius-sm); margin-left: auto; flex-shrink: 0; }
.filter-select { width: 140px; flex-shrink: 0; }
.filter-select-lg { width: 180px; flex-shrink: 0; }

@media (max-width: 640px) {
  .pages-grid { grid-template-columns: 1fr; }
  .filter-select-lg { display: none; }
  .filter-select { width: 120px; }
}
</style>
