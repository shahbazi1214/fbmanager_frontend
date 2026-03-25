<template>
  <div>
    <div v-if="loading" class="loading-full"><div class="spinner"></div></div>
    <template v-else-if="account">
      <div class="page-header">
        <div class="page-header-left" style="display:flex;align-items:center;gap:12px">
          <RouterLink to="/accounts" class="btn-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
          </RouterLink>
          <div>
            <h1>{{ account.name }}</h1>
            <p>{{ account.email }} · {{ account.pages_count }} pages</p>
          </div>
        </div>
        <div style="display:flex;gap:10px">
          <span class="badge" :class="`badge-${account.status}`" style="font-size:12px;padding:6px 14px">{{ account.status }}</span>
          <button v-if="auth.isManager" class="btn btn-secondary btn-sm" @click="showEdit = true">Edit</button>
        </div>
      </div>

      <div class="detail-layout">
        <!-- Left: account info -->
        <div class="detail-sidebar">
          <div class="card">
            <h3 class="card-title" style="margin-bottom:16px">Account Info</h3>
            <div class="info-list">
              <div class="info-row">
                <span class="info-label">Email</span>
                <span class="info-val">{{ account.email }}</span>
              </div>
              <div class="info-row" v-if="account.profile_id">
                <span class="info-label">Profile ID</span>
                <span class="info-val mono">{{ account.profile_id }}</span>
              </div>
              <div class="info-row" v-if="account.phone_number">
                <span class="info-label">Phone</span>
                <span class="info-val">{{ account.phone_number }}</span>
              </div>
              <div class="info-row" v-if="account.date_of_birth">
                <span class="info-label">Date of Birth</span>
                <span class="info-val">{{ account.date_of_birth }}</span>
              </div>
              <div class="info-row" v-if="account.proxy">
                <span class="info-label">Proxy</span>
                <span class="info-val mono">{{ account.proxy }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Owner</span>
                <span class="info-val">{{ account.owner_name }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Created</span>
                <span class="info-val">{{ formatDate(account.created_at) }}</span>
              </div>
              <div class="info-row" v-if="account.last_login">
                <span class="info-label">Last Login</span>
                <span class="info-val">{{ timeAgo(account.last_login) }}</span>
              </div>
            </div>
            <div v-if="account.profile_url" style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border)">
              <a :href="account.profile_url" target="_blank" class="btn btn-secondary btn-sm" style="width:100%;justify-content:center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                View Profile
              </a>
            </div>
          </div>

          <!-- Notes -->
          <div class="card" v-if="account.notes">
            <h3 class="card-title" style="margin-bottom:10px">Notes</h3>
            <p style="color:var(--text-secondary);font-size:13px;line-height:1.6">{{ account.notes }}</p>
          </div>

          <!-- Quick stats -->
          <div class="card">
            <h3 class="card-title" style="margin-bottom:16px">Quick Stats</h3>
            <div class="quick-stats">
              <div class="qs-item"><span class="qs-val">{{ account.pages_count }}</span><span class="qs-label">Total Pages</span></div>
              <div class="qs-item"><span class="qs-val">{{ account.active_pages_count }}</span><span class="qs-label">Active Pages</span></div>
            </div>
          </div>
        </div>

        <!-- Right: pages + activity -->
        <div class="detail-main">
          <!-- Pages -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Pages ({{ account.pages?.length || 0 }})</h3>
              <button v-if="auth.isManager" class="btn btn-primary btn-sm" @click="showAddPage = true">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Page
              </button>
            </div>
            <div v-if="account.pages?.length">
              <div class="table-wrap">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Page</th>
                      <th>Followers</th>
                      <th>Posts</th>
                      <th>Reels</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="page in account.pages" :key="page.id">
                      <td>
                        <RouterLink :to="`/pages/${page.id}`" class="page-link">
                          <div class="page-av">{{ page.page_name[0] }}</div>
                          <div>
                            <div style="font-weight:600">{{ page.page_name }}</div>
                            <div style="font-size:11px;color:var(--text-muted)">{{ page.category }}</div>
                          </div>
                        </RouterLink>
                      </td>
                      <td><strong>{{ formatNum(page.followers_count) }}</strong></td>
                      <td>{{ page.total_posts }}</td>
                      <td>{{ page.total_reels }}</td>
                      <td><span class="badge" :class="`badge-${page.status}`">{{ page.status }}</span></td>
                      <td>
                        <div class="actions">
                          <RouterLink :to="`/pages/${page.id}`" class="btn-icon btn-sm">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          </RouterLink>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div v-else class="empty-state" style="padding:32px">
              <p>No pages added yet</p>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="card">
            <div class="card-header"><h3 class="card-title">Recent Activity</h3></div>
            <div class="activity-list">
              <div v-for="act in account.recent_activities" :key="act.id" class="activity-item">
                <div class="act-dot"></div>
                <div class="act-body">
                  <div style="font-size:13px">{{ act.description }}</div>
                  <div style="font-size:11px;color:var(--text-muted)">{{ act.user_name }} · {{ timeAgo(act.created_at) }}</div>
                </div>
              </div>
              <div v-if="!account.recent_activities?.length" class="empty-state" style="padding:24px"><p>No activity yet</p></div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Add Page Modal -->
    <Teleport to="body">
      <div v-if="showAddPage" class="modal-overlay" @click.self="showAddPage = false">
        <div class="modal modal-lg">
          <div class="modal-header">
            <h3>Add Facebook Page</h3>
            <button class="btn-icon" @click="showAddPage = false"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
          <div class="modal-body">
            <div v-if="pageFormError" class="alert alert-error">{{ pageFormError }}</div>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Page Name *</label>
                <input v-model="pageForm.page_name" class="form-input" placeholder="My Awesome Page" />
              </div>
              <div class="form-group">
                <label class="form-label">Page ID</label>
                <input v-model="pageForm.page_id" class="form-input" placeholder="123456789" style="font-family:'JetBrains Mono',monospace" />
              </div>
              <div class="form-group">
                <label class="form-label">Page URL</label>
                <input v-model="pageForm.page_url" class="form-input" placeholder="https://facebook.com/pagename" />
              </div>
              <div class="form-group">
                <label class="form-label">Category</label>
                <select v-model="pageForm.category" class="form-select">
                  <option v-for="c in categories" :key="c.value" :value="c.value">{{ c.label }}</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Followers Count</label>
                <input v-model.number="pageForm.followers_count" type="number" class="form-input" placeholder="0" />
              </div>
              <div class="form-group">
                <label class="form-label">Likes Count</label>
                <input v-model.number="pageForm.likes_count" type="number" class="form-input" placeholder="0" />
              </div>
              <div class="form-group">
                <label class="form-label">Total Posts</label>
                <input v-model.number="pageForm.total_posts" type="number" class="form-input" placeholder="0" />
              </div>
              <div class="form-group">
                <label class="form-label">Total Reels</label>
                <input v-model.number="pageForm.total_reels" type="number" class="form-input" placeholder="0" />
              </div>
              <div class="form-group">
                <label class="form-label">Status</label>
                <select v-model="pageForm.status" class="form-select">
                  <option v-for="s in pageStatuses" :key="s" :value="s">{{ s }}</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Options</label>
                <div style="display:flex;gap:16px;padding-top:8px">
                  <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px">
                    <input type="checkbox" v-model="pageForm.verified" /> Verified
                  </label>
                  <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px">
                    <input type="checkbox" v-model="pageForm.monetization_enabled" /> Monetized
                  </label>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea v-model="pageForm.description" class="form-textarea" placeholder="Page description..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showAddPage = false">Cancel</button>
            <button class="btn btn-primary" @click="savePage" :disabled="savingPage">
              <span v-if="savingPage" class="spinner" style="width:14px;height:14px;border-width:2px;border-top-color:#fff"></span>
              Add Page
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { accountsAPI, pagesAPI } from '@/api'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const account = ref(null)
const loading = ref(true)
const showEdit = ref(false)
const showAddPage = ref(false)
const pageFormError = ref('')
const savingPage = ref(false)

const categories = [
  { value: 'business', label: 'Business' }, { value: 'entertainment', label: 'Entertainment' },
  { value: 'news', label: 'News & Media' }, { value: 'community', label: 'Community' },
  { value: 'brand', label: 'Brand' }, { value: 'tech', label: 'Technology' },
  { value: 'other', label: 'Other' },
]
const pageStatuses = ['active', 'inactive', 'restricted', 'unpublished', 'banned']

const defaultPage = () => ({
  page_name: '', page_id: '', page_url: '', category: 'other',
  description: '', followers_count: 0, likes_count: 0, total_posts: 0,
  total_reels: 0, total_videos: 0, status: 'active', verified: false,
  monetization_enabled: false, account: route.params.id,
})
const pageForm = ref(defaultPage())

function formatNum(n) {
  if (!n) return '0'
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toString()
}
function formatDate(d) { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }
function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago'
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago'
  return Math.floor(diff / 86400) + 'd ago'
}

async function fetchAccount() {
  loading.value = true
  try {
    const { data } = await accountsAPI.get(route.params.id)
    account.value = data
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

async function savePage() {
  savingPage.value = true
  pageFormError.value = ''
  try {
    pageForm.value.account = parseInt(route.params.id)
    await pagesAPI.create(pageForm.value)
    showAddPage.value = false
    pageForm.value = defaultPage()
    await fetchAccount()
  } catch (e) {
    const errs = e.response?.data
    if (errs) pageFormError.value = Object.values(errs).flat().join(' ')
    else pageFormError.value = 'Failed to add page'
  } finally {
    savingPage.value = false
  }
}

onMounted(fetchAccount)
</script>

<style scoped>
.detail-layout { display: grid; grid-template-columns: 320px 1fr; gap: 16px; align-items: start; }
.detail-sidebar { display: flex; flex-direction: column; gap: 16px; }
.detail-main { display: flex; flex-direction: column; gap: 16px; }

.info-list { display: flex; flex-direction: column; gap: 10px; }
.info-row { display: flex; gap: 10px; }
.info-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); width: 100px; flex-shrink: 0; padding-top: 1px; }
.info-val { font-size: 13px; color: var(--text-primary); word-break: break-all; }
.mono { font-family: 'JetBrains Mono', monospace; font-size: 12px; }

.quick-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.qs-item { background: var(--bg-card-hover); border-radius: var(--radius-sm); padding: 12px; text-align: center; }
.qs-val { display: block; font-size: 24px; font-weight: 700; color: var(--accent); }
.qs-label { font-size: 11px; color: var(--text-muted); }

.activity-list { display: flex; flex-direction: column; gap: 0; }
.activity-item { display: flex; align-items: flex-start; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--border); }
.activity-item:last-child { border-bottom: none; }
.act-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); margin-top: 5px; flex-shrink: 0; }

.page-link { display: flex; align-items: center; gap: 10px; text-decoration: none; color: inherit; }
.page-av { width: 30px; height: 30px; background: var(--accent-glow); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: var(--accent); }

@media (max-width: 900px) { .detail-layout { grid-template-columns: 1fr; } }

@media (max-width: 900px) {
  .detail-grid { grid-template-columns: 1fr; }
  .info-grid { grid-template-columns: 1fr; }
  .stats-row-4 { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 600px) {
  .page-header { flex-direction: column; align-items: flex-start; gap: 12px; }
  .account-header { flex-direction: column; align-items: flex-start; }
  .account-header-actions { flex-wrap: wrap; }
  .stats-row-4 { grid-template-columns: 1fr; }
  .form-grid { grid-template-columns: 1fr !important; }
  .modal-body { padding: 14px; }
}

</style>
