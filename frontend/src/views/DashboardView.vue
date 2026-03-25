<template>
  <div>
    <div class="page-header">
      <div class="page-header-left">
        <h1>Dashboard</h1>
        <p>{{ auth.isAdmin ? 'Overview of all accounts and managers' : 'Your assigned accounts and pages' }}</p>
      </div>
      <div style="display:flex;gap:10px" v-if="auth.isAdmin">
        <RouterLink to="/accounts" class="btn btn-secondary btn-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Account
        </RouterLink>
      </div>
    </div>

    <div v-if="loading" class="loading-full"><div class="spinner"></div> Loading dashboard...</div>

    <template v-else-if="data">
      <!-- Summary stats -->
      <div class="stats-row stats-row-4">
        <div class="stat-card">
          <div class="stat-card-header">
            <div class="stat-icon stat-icon-blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
          </div>
          <div class="stat-value">{{ data.summary.total_accounts }}</div>
          <div class="stat-label">{{ auth.isAdmin ? 'Total Accounts' : 'Assigned Accounts' }}</div>
          <div class="stat-change pos">{{ data.summary.active_accounts }} active</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-header">
            <div class="stat-icon stat-icon-purple">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
          </div>
          <div class="stat-value">{{ data.summary.total_pages }}</div>
          <div class="stat-label">Total Pages</div>
          <div class="stat-change pos">{{ data.summary.active_pages }} active</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-header">
            <div class="stat-icon stat-icon-green">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
          </div>
          <div class="stat-value">{{ formatNum(data.summary.total_followers) }}</div>
          <div class="stat-label">Total Followers</div>
          <div class="stat-change pos">+{{ formatNum(data.summary.new_followers_7d) }} this week</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-header">
            <div class="stat-icon stat-icon-orange">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
            </div>
          </div>
          <div class="stat-value">{{ data.summary.new_reels_today }}</div>
          <div class="stat-label">Reels Today</div>
          <div class="stat-change pos">{{ data.summary.new_posts_today }} posts today</div>
        </div>
      </div>

      <!-- Admin: Manager overview section -->
      <div v-if="auth.isAdmin && data.manager_stats?.length" class="card manager-overview-card">
        <div class="card-header">
          <h3 class="card-title">Managers Overview</h3>
          <RouterLink to="/users" class="btn btn-secondary btn-sm">Manage</RouterLink>
        </div>
        <div class="manager-overview-grid">
          <div v-for="mgr in data.manager_stats" :key="mgr.id" class="mgr-stat-card">
            <div class="mgr-avatar">{{ mgr.first_name?.[0] || mgr.username[0] }}</div>
            <div class="mgr-info">
              <div class="mgr-name">{{ mgr.first_name || mgr.username }} {{ mgr.last_name }}</div>
              <div class="mgr-stats-row">
                <span class="mgr-pill">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  {{ mgr.accounts_count }} accs
                </span>
                <span class="mgr-pill">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
                  {{ mgr.pages_count }} pages
                </span>
                <span class="mgr-pill">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  {{ formatNum(mgr.total_followers) }} followers
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts row -->
      <div class="charts-row">
        <div class="card chart-card">
          <div class="card-header">
            <h3 class="card-title">Followers Growth (7 days)</h3>
            <div class="chart-legend">
              <span class="leg-dot" style="background:var(--accent)"></span><span>Followers</span>
              <span class="leg-dot" style="background:var(--purple)"></span><span>Views</span>
            </div>
          </div>
          <div style="position:relative;height:200px">
            <canvas ref="growthChart"></canvas>
          </div>
        </div>

        <div class="card chart-card chart-sm">
          <div class="card-header">
            <h3 class="card-title">Content Activity</h3>
          </div>
          <div style="position:relative;height:200px">
            <canvas ref="contentChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Bottom row -->
      <div class="bottom-row">
        <!-- Top pages -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Top Pages by Followers</h3>
            <RouterLink to="/pages" class="btn btn-secondary btn-sm">View All</RouterLink>
          </div>
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>Page</th>
                  <th class="hide-sm">Account</th>
                  <th>Followers</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in data.top_pages" :key="p.id">
                  <td>
                    <RouterLink :to="`/pages/${p.id}`" class="page-link">
                      <div class="page-avatar">{{ p.page_name[0] }}</div>
                      <div>
                        <div style="font-weight:600">{{ p.page_name }}</div>
                        <div style="font-size:11px;color:var(--text-muted)">{{ p.page_id }}</div>
                      </div>
                    </RouterLink>
                  </td>
                  <td class="hide-sm" style="color:var(--text-secondary)">{{ p.account_name }}</td>
                  <td><strong>{{ formatNum(p.followers_count) }}</strong></td>
                  <td><span class="badge" :class="`badge-${p.status}`">{{ p.status }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Recent activity -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Recent Activity</h3>
          </div>
          <div class="activity-list">
            <div v-for="act in data.recent_activities" :key="act.id" class="activity-item">
              <div class="act-icon">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div class="act-body">
                <div class="act-desc">{{ act.description }}</div>
                <div class="act-meta">{{ act.user_name }} · {{ timeAgo(act.created_at) }}</div>
              </div>
            </div>
            <div v-if="!data.recent_activities?.length" class="empty-state" style="padding:24px">
              <p>No activity yet</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Status breakdowns -->
      <div class="status-row">
        <div class="card">
          <div class="card-header"><h3 class="card-title">Account Status</h3></div>
          <div class="status-bars">
            <div v-for="(count, status) in data.account_statuses" :key="status" class="status-bar-item">
              <div class="status-bar-label">
                <span class="badge" :class="`badge-${status}`">{{ status }}</span>
                <span class="status-count">{{ count }}</span>
              </div>
              <div class="status-bar-track">
                <div class="status-bar-fill" :class="`fill-${status}`" :style="{width: (count / data.summary.total_accounts * 100) + '%'}"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><h3 class="card-title">Page Status</h3></div>
          <div class="status-bars">
            <div v-for="(count, status) in data.page_statuses" :key="status" class="status-bar-item">
              <div class="status-bar-label">
                <span class="badge" :class="`badge-${status}`">{{ status }}</span>
                <span class="status-count">{{ count }}</span>
              </div>
              <div class="status-bar-track">
                <div class="status-bar-fill" :class="`fill-${status}`" :style="{width: (count / data.summary.total_pages * 100) + '%'}"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { RouterLink } from 'vue-router'
import { dashboardAPI } from '@/api'
import { useAuthStore } from '@/stores/auth'
import Chart from 'chart.js/auto'

const auth = useAuthStore()
const loading = ref(true)
const data = ref(null)
const growthChart = ref(null)
const contentChart = ref(null)
let growthChartInst = null
let contentChartInst = null

const formatNum = (n) => {
  if (!n) return '0'
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toString()
}

function timeAgo(dateStr) {
  const d = new Date(dateStr)
  const diff = (Date.now() - d) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago'
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago'
  return Math.floor(diff / 86400) + 'd ago'
}

async function fetchDashboard() {
  loading.value = true
  try {
    const { data: d } = await dashboardAPI.get()
    data.value = d
    await nextTick()
    initCharts()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function initCharts() {
  const chartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: 'rgba(30,45,71,0.5)' }, ticks: { color: '#8899b4', font: { size: 11 } } },
      y: { grid: { color: 'rgba(30,45,71,0.5)' }, ticks: { color: '#8899b4', font: { size: 11 } } }
    }
  }

  const labels = data.value.chart_data.map(d => {
    const dt = new Date(d.date)
    return dt.toLocaleDateString('en', { month: 'short', day: 'numeric' })
  })

  if (growthChartInst) growthChartInst.destroy()
  if (growthChart.value) {
    growthChartInst = new Chart(growthChart.value, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'New Followers', data: data.value.chart_data.map(d => d.new_followers), borderColor: '#1877f2', backgroundColor: 'rgba(24,119,242,0.1)', fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#1877f2' },
          { label: 'Page Views', data: data.value.chart_data.map(d => d.page_views), borderColor: '#a855f7', backgroundColor: 'rgba(168,85,247,0.1)', fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#a855f7' },
        ]
      },
      options: { ...chartOpts }
    })
  }

  if (contentChartInst) contentChartInst.destroy()
  if (contentChart.value) {
    contentChartInst = new Chart(contentChart.value, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Posts', data: data.value.chart_data.map(d => d.new_posts), backgroundColor: 'rgba(24,119,242,0.7)', borderRadius: 4 },
          { label: 'Reels', data: data.value.chart_data.map(d => d.new_reels), backgroundColor: 'rgba(255,107,53,0.7)', borderRadius: 4 },
        ]
      },
      options: { ...chartOpts, plugins: { legend: { display: true, labels: { color: '#8899b4', font: { size: 11 }, boxWidth: 12 } } } }
    })
  }
}

onMounted(fetchDashboard)
</script>

<style scoped>
.charts-row { display: grid; grid-template-columns: 1fr 360px; gap: 16px; margin-bottom: 16px; }
.chart-card { padding: 20px; }
.chart-legend { display: flex; align-items: center; gap: 12px; font-size: 12px; color: var(--text-secondary); }
.leg-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 4px; }

.bottom-row { display: grid; grid-template-columns: 1fr 340px; gap: 16px; margin-bottom: 16px; }

.status-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.status-bars { display: flex; flex-direction: column; gap: 12px; }
.status-bar-label { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.status-count { font-size: 13px; font-weight: 700; color: var(--text-primary); }
.status-bar-track { height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
.status-bar-fill { height: 100%; border-radius: 3px; transition: width 0.5s ease; }
.fill-active { background: var(--green); }
.fill-inactive { background: var(--text-muted); }
.fill-suspended { background: var(--red); }
.fill-checkpoint { background: var(--yellow); }
.fill-restricted { background: var(--yellow); }
.fill-disabled { background: var(--red); }

.activity-list { display: flex; flex-direction: column; max-height: 340px; overflow-y: auto; }
.activity-item { display: flex; align-items: flex-start; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--border); }
.activity-item:last-child { border-bottom: none; }
.act-icon { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: var(--green-bg); color: var(--green); margin-top: 1px; }
.act-body { flex: 1; min-width: 0; }
.act-desc { font-size: 13px; color: var(--text-primary); line-height: 1.4; }
.act-meta { font-size: 11px; color: var(--text-muted); margin-top: 2px; }

.page-link { display: flex; align-items: center; gap: 10px; text-decoration: none; color: inherit; }
.page-avatar { width: 32px; height: 32px; background: var(--accent-glow); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: var(--accent); flex-shrink: 0; }

/* Manager overview */
.manager-overview-card { margin-bottom: 16px; }
.manager-overview-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
.mgr-stat-card { display: flex; align-items: center; gap: 10px; background: var(--bg-card-hover); border-radius: var(--radius-sm); padding: 12px; border: 1px solid var(--border); }
.mgr-avatar { width: 36px; height: 36px; background: linear-gradient(135deg, var(--accent), var(--purple)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: #fff; flex-shrink: 0; }
.mgr-name { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
.mgr-stats-row { display: flex; flex-wrap: wrap; gap: 4px; }
.mgr-pill { display: inline-flex; align-items: center; gap: 3px; font-size: 10px; color: var(--text-muted); background: var(--border); padding: 1px 6px; border-radius: 20px; }

@media (max-width: 1100px) {
  .charts-row { grid-template-columns: 1fr; }
  .bottom-row { grid-template-columns: 1fr; }
  .status-row { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .hide-sm { display: none; }
  .manager-overview-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 400px) {
  .manager-overview-grid { grid-template-columns: 1fr; }
}
</style>
