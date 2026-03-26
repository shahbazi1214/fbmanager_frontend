<template>
  <div>
    <div v-if="loading" class="loading-full"><div class="spinner"></div></div>

    <template v-else-if="page">
      <!-- Header -->
      <div class="page-header">
        <div class="page-header-left" style="display:flex;align-items:center;gap:12px">
          <RouterLink to="/pages" class="btn-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
          </RouterLink>
          <div>
            <div style="display:flex;align-items:center;gap:8px">
              <h1>{{ page.page_name }}</h1>
              <svg v-if="page.verified" width="18" height="18" viewBox="0 0 24 24" fill="#1877f2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <p>{{ page.account_name }} · {{ page.category }}</p>
          </div>
        </div>
        <div style="display:flex;gap:10px;align-items:center">
          <span class="badge" :class="`badge-${page.status}`" style="font-size:12px;padding:6px 14px">{{ page.status }}</span>
          <button v-if="page.monetization_enabled" class="badge badge-active" style="border:none;cursor:default;font-size:12px;padding:6px 14px">Monetized</button>
          <button v-if="auth.isManager" class="btn btn-primary btn-sm" @click="showAddStats = true">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Update Stats
          </button>
          <button v-if="auth.isManager" class="btn btn-secondary btn-sm" @click="showEdit = true">Edit</button>
        </div>
      </div>

      <!-- Top Stats -->
      <div class="stats-row stats-row-4" style="margin-bottom:16px">
        <div class="stat-card">
          <div class="stat-icon stat-icon-blue" style="margin-bottom:10px"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
          <div class="stat-value">{{ formatNum(page.followers_count) }}</div>
          <div class="stat-label">Followers</div>
          <div class="stat-change pos" v-if="progress?.summary?.total_new_followers">+{{ formatNum(progress.summary.total_new_followers) }} this week</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-purple" style="margin-bottom:10px"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></div>
          <div class="stat-value">{{ formatNum(page.likes_count) }}</div>
          <div class="stat-label">Likes</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-green" style="margin-bottom:10px"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg></div>
          <div class="stat-value">{{ page.total_posts }}</div>
          <div class="stat-label">Total Posts</div>
          <div class="stat-change pos" v-if="progress?.summary?.total_new_posts">+{{ progress.summary.total_new_posts }} this week</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-orange" style="margin-bottom:10px"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg></div>
          <div class="stat-value">{{ page.total_reels }}</div>
          <div class="stat-label">Total Reels</div>
          <div class="stat-change pos" v-if="progress?.summary?.total_new_reels">+{{ progress.summary.total_new_reels }} this week</div>
        </div>
      </div>

      <!-- Charts -->
      <div class="charts-grid">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Followers Growth</h3>
            <div class="day-select">
              <button v-for="d in [3,7,14]" :key="d" :class="['day-btn', selectedDays === d ? 'active' : '']" @click="changeDays(d)">{{ d }}d</button>
            </div>
          </div>
          <canvas ref="followersChart" height="220"></canvas>
        </div>
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Page Views & Engagement</h3>
          </div>
          <canvas ref="viewsChart" height="220"></canvas>
        </div>
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Content Activity</h3>
          </div>
          <canvas ref="contentChart" height="220"></canvas>
        </div>
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Engagement Breakdown</h3>
          </div>
          <canvas ref="engagementChart" height="220"></canvas>
        </div>
      </div>

      <!-- Daily stats table -->
      <div class="card" style="margin-top:16px">
        <div class="card-header">
          <h3 class="card-title">Daily Stats History</h3>
        </div>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Followers</th>
                <th>New</th>
                <th>Views</th>
                <th>Reach</th>
                <th>Posts</th>
                <th>Reels</th>
                <th>Engagement</th>
                <th>Reactions</th>
                <th>Comments</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="stat in progress?.stats?.slice().reverse()" :key="stat.id">
                <td style="font-family:'JetBrains Mono',monospace;font-size:12px">{{ stat.date }}</td>
                <td><strong>{{ formatNum(stat.followers_count) }}</strong></td>
                <td>
                  <span :class="stat.new_followers >= 0 ? 'change-pos' : 'change-neg'">
                    {{ stat.new_followers >= 0 ? '+' : '' }}{{ formatNum(stat.new_followers) }}
                  </span>
                </td>
                <td>{{ formatNum(stat.page_views) }}</td>
                <td>{{ formatNum(stat.post_reach) }}</td>
                <td>{{ stat.new_posts }}</td>
                <td>{{ stat.new_reels }}</td>
                <td>{{ stat.engagement_rate }}%</td>
                <td>{{ formatNum(stat.total_reactions) }}</td>
                <td>{{ stat.comments_count }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- Add Stats Modal -->
    <Teleport to="body">
      <div v-if="showAddStats" class="modal-overlay" @click.self="showAddStats = false">
        <div class="modal modal-lg">
          <div class="modal-header">
            <h3>Update Daily Stats</h3>
            <button class="btn-icon" @click="showAddStats = false"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
          <div class="modal-body">
            <div v-if="statsError" class="alert alert-error">{{ statsError }}</div>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Date *</label>
                <input v-model="statsForm.date" type="date" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Total Followers</label>
                <input v-model.number="statsForm.followers_count" type="number" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">New Followers</label>
                <input v-model.number="statsForm.new_followers" type="number" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Page Views</label>
                <input v-model.number="statsForm.page_views" type="number" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Post Reach</label>
                <input v-model.number="statsForm.post_reach" type="number" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">New Posts</label>
                <input v-model.number="statsForm.new_posts" type="number" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">New Reels</label>
                <input v-model.number="statsForm.new_reels" type="number" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">New Likes</label>
                <input v-model.number="statsForm.new_likes" type="number" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Total Reactions</label>
                <input v-model.number="statsForm.total_reactions" type="number" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Comments</label>
                <input v-model.number="statsForm.comments_count" type="number" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Shares</label>
                <input v-model.number="statsForm.shares_count" type="number" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Engagement Rate (%)</label>
                <input v-model.number="statsForm.engagement_rate" type="number" step="0.01" class="form-input" />
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showAddStats = false">Cancel</button>
            <button class="btn btn-primary" @click="saveStats" :disabled="savingStats">
              <span v-if="savingStats" class="spinner" style="width:14px;height:14px;border-width:2px;border-top-color:#fff"></span>
              Save Stats
            </button>
          </div>
        </div>
      </div>

      <!-- Edit Page Modal -->
      <div v-if="showEdit" class="modal-overlay" @click.self="showEdit = false">
        <div class="modal modal-lg">
          <div class="modal-header">
            <h3>Edit Page</h3>
            <button class="btn-icon" @click="showEdit = false"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
          <div class="modal-body">
            <div class="form-grid">
              <div class="form-group"><label class="form-label">Page Name</label><input v-model="editForm.page_name" class="form-input" /></div>
              <div class="form-group"><label class="form-label">Page ID</label><input v-model="editForm.page_id" class="form-input" /></div>
              <div class="form-group"><label class="form-label">Page URL</label><input v-model="editForm.page_url" class="form-input" /></div>
              <div class="form-group"><label class="form-label">Followers Count</label><input v-model.number="editForm.followers_count" type="number" class="form-input" /></div>
              <div class="form-group"><label class="form-label">Total Posts</label><input v-model.number="editForm.total_posts" type="number" class="form-input" /></div>
              <div class="form-group"><label class="form-label">Total Reels</label><input v-model.number="editForm.total_reels" type="number" class="form-input" /></div>
              <div class="form-group">
                <label class="form-label">Status</label>
                <select v-model="editForm.status" class="form-select">
                  <option v-for="s in ['active','inactive','restricted','unpublished','banned']" :key="s" :value="s">{{ s }}</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Options</label>
                <div style="display:flex;gap:16px;padding-top:8px">
                  <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px"><input type="checkbox" v-model="editForm.verified" /> Verified</label>
                  <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px"><input type="checkbox" v-model="editForm.monetization_enabled" /> Monetized</label>
                </div>
              </div>
            </div>
            <div class="form-group"><label class="form-label">Notes</label><textarea v-model="editForm.notes" class="form-textarea"></textarea></div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showEdit = false">Cancel</button>
            <button class="btn btn-primary" @click="savePage" :disabled="savingEdit">Save Changes</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, RouterLink, useRouter } from 'vue-router'
import { pagesAPI, statsAPI } from '@/api'
import { useToastStore } from '@/stores/toast'
import { useAuthStore } from '@/stores/auth'
import Chart from 'chart.js/auto'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const toast = useToastStore()
const page = ref(null)
const progress = ref(null)
const loading = ref(true)
const showAddStats = ref(false)
const showEdit = ref(false)
const statsError = ref('')
const savingStats = ref(false)
const savingEdit = ref(false)
const selectedDays = ref(7)

const followersChart = ref(null)
const viewsChart = ref(null)
const contentChart = ref(null)
const engagementChart = ref(null)
let charts = {}

const formatNum = (n) => {
  if (n == null) return '0'
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toString()
}

const today = new Date().toISOString().split('T')[0]
const defaultStats = () => ({
  date: today, followers_count: page.value?.followers_count || 0,
  new_followers: 0, lost_followers: 0, page_views: 0, post_reach: 0,
  new_posts: 0, new_reels: 0, new_videos: 0, new_likes: 0,
  total_reactions: 0, comments_count: 0, shares_count: 0, engagement_rate: 0,
})
const statsForm = ref(defaultStats())
const editForm = ref({})

async function fetchPage() {
  const { data } = await pagesAPI.get(route.params.id)
  page.value = data
  editForm.value = {
    page_name: data.page_name, page_id: data.page_id, page_url: data.page_url,
    followers_count: data.followers_count, likes_count: data.likes_count,
    total_posts: data.total_posts, total_reels: data.total_reels,
    status: data.status, verified: data.verified,
    monetization_enabled: data.monetization_enabled, notes: data.notes || '',
  }
}

async function fetchProgress() {
  const { data } = await pagesAPI.progress(route.params.id, { days: selectedDays.value })
  progress.value = data
}

async function changeDays(d) {
  selectedDays.value = d
  await fetchProgress()
  await nextTick()
  initCharts()
}

function initCharts() {
  const stats = progress.value?.stats || []
  const labels = stats.map(s => {
    const dt = new Date(s.date)
    return dt.toLocaleDateString('en', { month: 'short', day: 'numeric' })
  })
  const baseOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: 'rgba(30,45,71,0.4)' }, ticks: { color: '#8899b4', font: { size: 11 } } },
      y: { grid: { color: 'rgba(30,45,71,0.4)' }, ticks: { color: '#8899b4', font: { size: 11 } } }
    }
  }

  const makeChart = (ref, type, datasets, opts = {}) => {
    if (charts[ref]) charts[ref].destroy()
    const canvas = { followersChart, viewsChart, contentChart, engagementChart }[ref]
    if (!canvas.value) return
    charts[ref] = new Chart(canvas.value, {
      type,
      data: { labels, datasets },
      options: { ...baseOpts, ...opts }
    })
  }

  makeChart('followersChart', 'line', [{
    label: 'New Followers', data: stats.map(s => s.new_followers),
    borderColor: '#1877f2', backgroundColor: 'rgba(24,119,242,0.12)',
    fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#1877f2',
  }])

  makeChart('viewsChart', 'bar', [
    { label: 'Page Views', data: stats.map(s => s.page_views), backgroundColor: 'rgba(168,85,247,0.7)', borderRadius: 4 },
    { label: 'Reach', data: stats.map(s => s.post_reach), backgroundColor: 'rgba(24,119,242,0.5)', borderRadius: 4 },
  ], { plugins: { legend: { display: true, labels: { color: '#8899b4', font: { size: 11 }, boxWidth: 12 } } } })

  makeChart('contentChart', 'bar', [
    { label: 'Posts', data: stats.map(s => s.new_posts), backgroundColor: 'rgba(0,214,143,0.7)', borderRadius: 4 },
    { label: 'Reels', data: stats.map(s => s.new_reels), backgroundColor: 'rgba(255,107,53,0.7)', borderRadius: 4 },
  ], { plugins: { legend: { display: true, labels: { color: '#8899b4', font: { size: 11 }, boxWidth: 12 } } } })

  makeChart('engagementChart', 'line', [
    { label: 'Engagement %', data: stats.map(s => s.engagement_rate), borderColor: '#00d68f', backgroundColor: 'rgba(0,214,143,0.1)', fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#00d68f' },
    { label: 'Reactions', data: stats.map(s => s.total_reactions), borderColor: '#ffd60a', backgroundColor: 'rgba(255,214,10,0.1)', fill: false, tension: 0.4, pointRadius: 3, yAxisID: 'y2' },
  ], {
    plugins: { legend: { display: true, labels: { color: '#8899b4', font: { size: 11 }, boxWidth: 12 } } },
    scales: {
      x: { grid: { color: 'rgba(30,45,71,0.4)' }, ticks: { color: '#8899b4', font: { size: 11 } } },
      y: { grid: { color: 'rgba(30,45,71,0.4)' }, ticks: { color: '#8899b4', font: { size: 11 } } },
      y2: { position: 'right', grid: { display: false }, ticks: { color: '#8899b4', font: { size: 11 } } }
    }
  })
}

async function saveStats() {
  savingStats.value = true
  statsError.value = ''
  try {
    await statsAPI.create(route.params.id, statsForm.value)
    showAddStats.value = false
    await fetchPage()
    await fetchProgress()
    await nextTick()
    initCharts()
    statsForm.value = defaultStats()
  } catch (e) {
    const errs = e.response?.data
    if (errs) statsError.value = Object.values(errs).flat().join(' ')
    else statsError.value = 'Failed to save stats'
  } finally {
    savingStats.value = false
  }
}

async function savePage() {
  savingEdit.value = true
  try {
    await pagesAPI.update(route.params.id, editForm.value)
    showEdit.value = false
    toast.success('Page updated successfully')
    await fetchPage()
    router.push('/pages/' + route.params.id)
  } catch {} finally { savingEdit.value = false }
}

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([fetchPage(), fetchProgress()])
    await nextTick()
    initCharts()
  } catch (e) { console.error(e) } finally { loading.value = false }
})
</script>

<style scoped>
.charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.day-select { display: flex; gap: 4px; }
.day-btn { padding: 4px 12px; border-radius: 6px; background: var(--bg-card-hover); border: 1px solid var(--border); color: var(--text-secondary); cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.15s; }
.day-btn:hover { border-color: var(--border-light); color: var(--text-primary); }
.day-btn.active { background: var(--accent-glow); border-color: rgba(24,119,242,0.4); color: var(--accent); }
.change-pos { color: var(--green); font-weight: 600; }
.change-neg { color: var(--red); font-weight: 600; }
@media (max-width: 900px) { .charts-grid { grid-template-columns: 1fr; } }

@media (max-width: 900px) {
  .detail-grid { grid-template-columns: 1fr !important; }
  .stats-row-4 { grid-template-columns: repeat(2, 1fr); }
  .page-meta-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 600px) {
  .page-header { flex-direction: column; align-items: flex-start; gap: 12px; }
  .stats-row-4 { grid-template-columns: 1fr; }
  .form-grid { grid-template-columns: 1fr !important; }
  .modal-body { padding: 14px; }
  .page-meta-grid { grid-template-columns: 1fr; }
}

</style>
