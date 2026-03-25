<template>
  <div>
    <div class="page-header">
      <div class="page-header-left">
        <h1>Facebook Accounts</h1>
        <p>{{ auth.isAdmin ? 'All accounts across all managers' : 'Your assigned Facebook accounts' }}</p>
      </div>
      <button v-if="auth.isAdmin" class="btn btn-primary" @click="openCreate">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        <span class="hide-xs">Add Account</span>
        <span class="show-xs">Add</span>
      </button>
    </div>

    <!-- Filters -->
    <div class="filter-bar">
      <div class="search-input">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="search" class="form-input" placeholder="Search accounts..." @input="debouncedFetch" />
      </div>
      <select v-model="statusFilter" class="form-select status-select" @change="fetchAccounts">
        <option value="">All Statuses</option>
        <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
      </select>
      <div class="total-badge">{{ accounts.length }} accounts</div>
    </div>

    <div v-if="loading" class="loading-full"><div class="spinner"></div></div>

    <template v-else>
      <!-- Accounts grid -->
      <div class="accounts-grid" v-if="accounts.length">
        <div v-for="acc in accounts" :key="acc.id" class="account-card">
          <div class="account-card-header">
            <div class="account-avatar">{{ acc.name[0] }}</div>
            <div class="account-info">
              <div class="account-name">{{ acc.name }}</div>
              <div class="account-email">{{ acc.email }}</div>
            </div>
            <span class="badge" :class="`badge-${acc.status}`">{{ acc.status }}</span>
          </div>
          <div class="account-meta">
            <div class="meta-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
              <span>{{ acc.pages_count }} pages</span>
            </div>
            <div class="meta-item" v-if="acc.profile_url">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              <a :href="acc.profile_url" target="_blank" class="meta-link">Profile</a>
            </div>
            <div class="meta-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>{{ acc.last_login ? timeAgo(acc.last_login) : 'Never' }}</span>
            </div>
          </div>
          <div v-if="auth.isAdmin && acc.owner_name" class="account-owner">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span>{{ acc.owner_name }}</span>
          </div>
          <div class="account-actions">
            <RouterLink :to="`/accounts/${acc.id}`" class="btn btn-secondary btn-sm">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              View
            </RouterLink>
            <button class="btn btn-secondary btn-sm" @click="openEdit(acc)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit
            </button>
            <button v-if="auth.isAdmin" class="btn btn-danger btn-sm" @click="confirmDelete(acc)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
              <span class="hide-xs">Delete</span>
            </button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state card">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <h3>No accounts found</h3>
        <p v-if="auth.isAdmin">Add your first Facebook account to get started</p>
        <p v-else>No accounts have been assigned to you yet. Contact your admin.</p>
        <button v-if="auth.isAdmin" class="btn btn-primary" style="margin-top:16px" @click="openCreate">Add Account</button>
      </div>
    </template>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal modal-lg">
          <div class="modal-header">
            <h3>{{ editingAccount ? 'Edit Account' : 'Add Facebook Account' }}</h3>
            <button class="btn-icon" @click="showModal = false">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <div v-if="formError" class="alert alert-error">{{ formError }}</div>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Full Name *</label>
                <input v-model="form.name" class="form-input" placeholder="John Smith" required />
              </div>
              <div class="form-group">
                <label class="form-label">Email *</label>
                <input v-model="form.email" type="email" class="form-input" placeholder="john@gmail.com" required />
              </div>
              <div class="form-group">
                <label class="form-label">Password *</label>
                <div class="password-wrap">
                  <input v-model="form.password" :type="showFormPass ? 'text' : 'password'" class="form-input" placeholder="Account password" />
                  <button type="button" class="pass-toggle" @click="showFormPass = !showFormPass">
                    <svg v-if="!showFormPass" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  </button>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">2FA Secret Code</label>
                <input v-model="form.two_fa_code" class="form-input" placeholder="JBSWY3DPEHPK3PXP" style="font-family:'JetBrains Mono',monospace" />
              </div>
              <div class="form-group">
                <label class="form-label">Date of Birth</label>
                <input v-model="form.date_of_birth" type="date" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Profile URL</label>
                <input v-model="form.profile_url" class="form-input" placeholder="https://facebook.com/username" />
              </div>
              <div class="form-group">
                <label class="form-label">Facebook Profile ID</label>
                <input v-model="form.profile_id" class="form-input" placeholder="100012345678" />
              </div>
              <div class="form-group">
                <label class="form-label">Phone Number</label>
                <input v-model="form.phone_number" class="form-input" placeholder="+1234567890" />
              </div>
              <div class="form-group">
                <label class="form-label">Recovery Email</label>
                <input v-model="form.recovery_email" type="email" class="form-input" placeholder="recovery@mail.com" />
              </div>
              <div class="form-group">
                <label class="form-label">Proxy (IP:PORT)</label>
                <input v-model="form.proxy" class="form-input" placeholder="192.168.1.1:8080" style="font-family:'JetBrains Mono',monospace" />
              </div>
              <div class="form-group">
                <label class="form-label">Status</label>
                <select v-model="form.status" class="form-select">
                  <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
                </select>
              </div>
              <div class="form-group" v-if="auth.isAdmin">
                <label class="form-label">Assigned Manager</label>
                <select v-model="form.owner" class="form-select">
                  <option v-for="u in managerUsers" :key="u.id" :value="u.id">{{ u.username }} ({{ u.role }})</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Notes</label>
              <textarea v-model="form.notes" class="form-textarea" placeholder="Any notes about this account..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showModal = false">Cancel</button>
            <button class="btn btn-primary" @click="saveAccount" :disabled="saving">
              <span v-if="saving" class="spinner" style="width:14px;height:14px;border-width:2px;border-top-color:#fff"></span>
              {{ editingAccount ? 'Save Changes' : 'Create Account' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Delete confirm -->
      <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
        <div class="modal" style="max-width:420px">
          <div class="modal-header">
            <h3>Delete Account</h3>
            <button class="btn-icon" @click="deleteTarget = null">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <p style="color:var(--text-secondary)">Delete <strong style="color:var(--text-primary)">{{ deleteTarget.name }}</strong>? This will also delete all pages and data.</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="deleteTarget = null">Cancel</button>
            <button class="btn btn-danger" @click="doDelete" :disabled="saving">Delete Account</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { accountsAPI, usersAPI } from '@/api'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const accounts = ref([])
const users = ref([])
const loading = ref(true)
const saving = ref(false)
const showModal = ref(false)
const editingAccount = ref(null)
const deleteTarget = ref(null)
const formError = ref('')
const search = ref('')
const statusFilter = ref('')
const showFormPass = ref(false)

const statuses = ['active', 'inactive', 'suspended', 'checkpoint', 'disabled']
const managerUsers = computed(() => users.value.filter(u => ['admin','manager'].includes(u.role)))

let debounceTimer = null
function debouncedFetch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(fetchAccounts, 300)
}

const defaultForm = () => ({
  name: '', email: '', password: '', two_fa_code: '', date_of_birth: '',
  profile_url: '', profile_id: '', phone_number: '', recovery_email: '',
  proxy: '', status: 'active', notes: '', owner: auth.user?.id,
})
const form = ref(defaultForm())

function timeAgo(dateStr) {
  const d = new Date(dateStr)
  const diff = (Date.now() - d) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago'
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago'
  return Math.floor(diff / 86400) + 'd ago'
}

async function fetchAccounts() {
  try {
    const params = {}
    if (search.value) params.search = search.value
    if (statusFilter.value) params.status = statusFilter.value
    const { data } = await accountsAPI.list(params)
    accounts.value = data.results || data
  } catch (e) { console.error(e) }
}

async function fetchUsers() {
  if (!auth.isAdmin) return
  try {
    const { data } = await usersAPI.list()
    users.value = data.results || data
  } catch {}
}

function openCreate() {
  editingAccount.value = null
  form.value = defaultForm()
  formError.value = ''
  showFormPass.value = false
  showModal.value = true
}

function openEdit(acc) {
  editingAccount.value = acc
  form.value = {
    name: acc.name, email: acc.email, password: '', two_fa_code: '',
    date_of_birth: acc.date_of_birth || '', profile_url: acc.profile_url || '',
    profile_id: acc.profile_id || '', phone_number: acc.phone_number || '',
    recovery_email: acc.recovery_email || '', proxy: acc.proxy || '',
    status: acc.status, notes: acc.notes || '', owner: acc.owner,
  }
  formError.value = ''
  showFormPass.value = false
  showModal.value = true
}

async function saveAccount() {
  saving.value = true
  formError.value = ''
  try {
    const payload = { ...form.value }
    if (!payload.password) delete payload.password
    if (!payload.date_of_birth) delete payload.date_of_birth
    if (editingAccount.value) {
      await accountsAPI.update(editingAccount.value.id, payload)
    } else {
      await accountsAPI.create(payload)
    }
    showModal.value = false
    await fetchAccounts()
  } catch (e) {
    const errs = e.response?.data
    if (errs) formError.value = Object.values(errs).flat().join(' ')
    else formError.value = 'An error occurred'
  } finally { saving.value = false }
}

function confirmDelete(acc) { deleteTarget.value = acc }

async function doDelete() {
  saving.value = true
  try {
    await accountsAPI.delete(deleteTarget.value.id)
    deleteTarget.value = null
    await fetchAccounts()
  } catch {} finally { saving.value = false }
}

onMounted(async () => {
  loading.value = true
  await Promise.all([fetchAccounts(), fetchUsers()])
  loading.value = false
})
</script>

<style scoped>
.accounts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}
.account-card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 18px;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.account-card:hover { border-color: var(--border-light); box-shadow: var(--shadow-sm); }
.account-card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
.account-avatar {
  width: 44px; height: 44px; background: linear-gradient(135deg, var(--accent), var(--purple));
  border-radius: 12px; display: flex; align-items: center; justify-content: center;
  font-size: 18px; font-weight: 700; color: #fff; flex-shrink: 0;
}
.account-info { flex: 1; min-width: 0; }
.account-name { font-weight: 700; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.account-email { font-size: 12px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.account-meta {
  display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 10px;
  padding: 10px 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
}
.meta-item { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--text-secondary); }
.meta-link { color: var(--accent); text-decoration: none; }
.meta-link:hover { text-decoration: underline; }
.account-owner { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-muted); margin-bottom: 14px; }
.account-actions { display: flex; gap: 8px; flex-wrap: wrap; }

.filter-bar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.total-badge { font-size: 12px; color: var(--text-muted); background: var(--bg-card); border: 1px solid var(--border); padding: 6px 12px; border-radius: var(--radius-sm); margin-left: auto; }
.status-select { width: 150px; flex-shrink: 0; }

.password-wrap { position: relative; }
.password-wrap .form-input { padding-right: 40px; }
.pass-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-muted); display: flex; align-items: center; padding: 0; }

.hide-xs { display: inline; }
.show-xs { display: none; }

@media (max-width: 640px) {
  .accounts-grid { grid-template-columns: 1fr; }
  .status-select { width: 120px; }
  .hide-xs { display: none; }
  .show-xs { display: inline; }
}
</style>
