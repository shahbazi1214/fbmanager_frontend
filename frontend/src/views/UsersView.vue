<template>
  <div>
    <div class="page-header">
      <div class="page-header-left">
        <h1>Users & Roles</h1>
        <p>Manage team members and assign accounts to managers</p>
      </div>
      <button class="btn btn-primary" @click="openCreate">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add User
      </button>
    </div>

    <!-- Role info cards -->
    <div class="role-cards">
      <div v-for="role in roles" :key="role.name" class="role-card">
        <div class="role-icon">{{ role.emoji }}</div>
        <div>
          <div class="role-name">{{ role.label }}</div>
          <div class="role-desc">{{ role.desc }}</div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-full"><div class="spinner"></div></div>

    <div v-else class="card">
      <div class="card-header">
        <h3 class="card-title">Team Members ({{ users.length }})</h3>
      </div>
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Email</th>
              <th class="hide-sm">Status</th>
              <th class="hide-sm">Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>
                <div class="user-cell">
                  <div class="user-av">{{ user.first_name?.[0] || user.username[0] }}</div>
                  <div>
                    <div class="fw600">{{ user.first_name }} {{ user.last_name }}</div>
                    <div class="text-muted text-xs">@{{ user.username }}</div>
                  </div>
                </div>
              </td>
              <td><span class="badge" :class="`badge-${user.role}`">{{ user.role }}</span></td>
              <td class="text-secondary">{{ user.email || '—' }}</td>
              <td class="hide-sm"><span class="badge" :class="user.is_active ? 'badge-active' : 'badge-suspended'">{{ user.is_active ? 'Active' : 'Disabled' }}</span></td>
              <td class="text-muted text-xs hide-sm">{{ formatDate(user.created_at) }}</td>
              <td>
                <div class="actions">
                  <button
                    v-if="user.role === 'manager'"
                    class="btn btn-sm btn-secondary"
                    @click="openAssign(user)"
                    title="Assign Accounts"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    <span class="hide-sm">Assign</span>
                  </button>
                  <button class="btn-icon" @click="openEdit(user)" title="Edit">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button class="btn-icon" @click="confirmDelete(user)" title="Delete" :disabled="user.id === auth.user.id">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Manager Assignments Overview -->
    <div v-if="managers.length" class="card" style="margin-top:20px">
      <div class="card-header">
        <h3 class="card-title">Manager Assignments</h3>
        <p style="font-size:12px;color:var(--text-muted);margin:0">Overview of which accounts each manager handles</p>
      </div>
      <div class="manager-assignments">
        <div v-for="mgr in managers" :key="mgr.id" class="manager-row">
          <div class="manager-info">
            <div class="user-av">{{ mgr.first_name?.[0] || mgr.username[0] }}</div>
            <div>
              <div class="fw600">{{ mgr.first_name || mgr.username }} {{ mgr.last_name }}</div>
              <div class="text-muted text-xs">{{ mgr.assigned_accounts_count || 0 }} accounts assigned</div>
            </div>
          </div>
          <div class="manager-accounts">
            <span v-if="!mgr.assigned_accounts?.length" class="text-muted text-xs">No accounts assigned</span>
            <span
              v-for="acc in mgr.assigned_accounts?.slice(0,5)"
              :key="acc.id"
              class="account-chip"
            >{{ acc.name }}</span>
            <span v-if="(mgr.assigned_accounts?.length || 0) > 5" class="account-chip chip-more">
              +{{ mgr.assigned_accounts.length - 5 }} more
            </span>
          </div>
          <button class="btn btn-sm btn-secondary" @click="openAssign(mgr)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit
          </button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal">
          <div class="modal-header">
            <h3>{{ editingUser ? 'Edit User' : 'Create User' }}</h3>
            <button class="btn-icon" @click="showModal = false"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
          <div class="modal-body">
            <div v-if="formError" class="alert alert-error">{{ formError }}</div>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Username *</label>
                <input v-model="form.username" class="form-input" :disabled="!!editingUser" />
              </div>
              <div class="form-group">
                <label class="form-label">Email</label>
                <input v-model="form.email" type="email" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">First Name</label>
                <input v-model="form.first_name" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Last Name</label>
                <input v-model="form.last_name" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Role</label>
                <select v-model="form.role" class="form-select">
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Phone</label>
                <input v-model="form.phone" class="form-input" placeholder="+1234567890" />
              </div>
            </div>
            <template v-if="!editingUser">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Password *</label>
                  <input v-model="form.password" type="password" class="form-input" />
                </div>
                <div class="form-group">
                  <label class="form-label">Confirm Password *</label>
                  <input v-model="form.password2" type="password" class="form-input" />
                </div>
              </div>
            </template>
            <div v-if="editingUser" class="form-group">
              <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
                <input type="checkbox" v-model="form.is_active" />
                <span style="font-size:13px">Account Active</span>
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showModal = false">Cancel</button>
            <button class="btn btn-primary" @click="saveUser" :disabled="saving">
              <span v-if="saving" class="spinner" style="width:14px;height:14px;border-width:2px;border-top-color:#fff"></span>
              {{ editingUser ? 'Save Changes' : 'Create User' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Assign Accounts Modal -->
      <div v-if="showAssignModal" class="modal-overlay" @click.self="showAssignModal = false">
        <div class="modal modal-lg">
          <div class="modal-header">
            <h3>Assign Accounts — {{ assignTarget?.first_name || assignTarget?.username }}</h3>
            <button class="btn-icon" @click="showAssignModal = false"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
          <div class="modal-body">
            <p class="text-secondary" style="margin-bottom:14px;font-size:13px">Select which Facebook accounts this manager can access and manage.</p>
            <div class="assign-search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input v-model="assignSearch" class="form-input" placeholder="Search accounts..." />
            </div>
            <div class="assign-select-all">
              <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px">
                <input type="checkbox" :checked="allSelected" @change="toggleAll" />
                Select all ({{ filteredAllAccounts.length }})
              </label>
              <span class="text-muted text-xs">{{ selectedAccountIds.length }} selected</span>
            </div>
            <div class="accounts-checklist" v-if="allAccountsLoading"><div class="spinner" style="margin:20px auto"></div></div>
            <div class="accounts-checklist" v-else>
              <label
                v-for="acc in filteredAllAccounts"
                :key="acc.id"
                class="checklist-item"
                :class="{ selected: selectedAccountIds.includes(acc.id) }"
              >
                <input type="checkbox" :value="acc.id" v-model="selectedAccountIds" />
                <div class="acc-check-avatar">{{ acc.name[0] }}</div>
                <div class="acc-check-info">
                  <div class="fw600">{{ acc.name }}</div>
                  <div class="text-muted text-xs">{{ acc.email }} · {{ acc.pages_count }} pages</div>
                </div>
                <span class="badge" :class="`badge-${acc.status}`">{{ acc.status }}</span>
              </label>
              <div v-if="!filteredAllAccounts.length" class="text-muted" style="padding:20px;text-align:center">No accounts found</div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showAssignModal = false">Cancel</button>
            <button class="btn btn-primary" @click="saveAssignment" :disabled="saving">
              <span v-if="saving" class="spinner" style="width:14px;height:14px;border-width:2px;border-top-color:#fff"></span>
              Save Assignment
            </button>
          </div>
        </div>
      </div>

      <!-- Delete Modal -->
      <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
        <div class="modal" style="max-width:380px">
          <div class="modal-header">
            <h3>Delete User</h3>
            <button class="btn-icon" @click="deleteTarget = null"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
          <div class="modal-body">
            <p style="color:var(--text-secondary)">Delete <strong style="color:var(--text-primary)">{{ deleteTarget.username }}</strong>? This cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="deleteTarget = null">Cancel</button>
            <button class="btn btn-danger" @click="doDelete" :disabled="saving">Delete</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usersAPI, accountsAPI } from '@/api'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const users = ref([])
const loading = ref(true)
const showModal = ref(false)
const editingUser = ref(null)
const deleteTarget = ref(null)
const saving = ref(false)
const formError = ref('')

// Assign accounts
const showAssignModal = ref(false)
const assignTarget = ref(null)
const selectedAccountIds = ref([])
const allAccounts = ref([])
const allAccountsLoading = ref(false)
const assignSearch = ref('')

const roles = [
  { name: 'admin', label: 'Admin', emoji: '👑', desc: 'Full access to everything' },
  { name: 'manager', label: 'Manager', emoji: '⚙️', desc: 'Manages assigned accounts & pages' },
]

const managers = computed(() => users.value.filter(u => u.role === 'manager'))

const filteredAllAccounts = computed(() => {
  if (!assignSearch.value) return allAccounts.value
  const q = assignSearch.value.toLowerCase()
  return allAccounts.value.filter(a => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q))
})

const allSelected = computed(() => filteredAllAccounts.value.length > 0 && filteredAllAccounts.value.every(a => selectedAccountIds.value.includes(a.id)))

function toggleAll() {
  const ids = filteredAllAccounts.value.map(a => a.id)
  if (allSelected.value) {
    selectedAccountIds.value = selectedAccountIds.value.filter(id => !ids.includes(id))
  } else {
    const merged = new Set([...selectedAccountIds.value, ...ids])
    selectedAccountIds.value = [...merged]
  }
}

const defaultForm = () => ({ username: '', email: '', first_name: '', last_name: '', role: 'manager', phone: '', password: '', password2: '', is_active: true })
const form = ref(defaultForm())

function formatDate(d) { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }

async function fetchUsers() {
  loading.value = true
  try {
    const { data } = await usersAPI.list()
    const list = data.results || data
    // Fetch assigned accounts for each manager
    await Promise.all(list.filter(u => u.role === 'manager').map(async mgr => {
      try {
        const { data: assigned } = await usersAPI.getAssignedAccounts(mgr.id)
        mgr.assigned_accounts = assigned.results || assigned
        mgr.assigned_accounts_count = mgr.assigned_accounts.length
      } catch { mgr.assigned_accounts = []; mgr.assigned_accounts_count = 0 }
    }))
    users.value = list
  } catch {} finally { loading.value = false }
}

function openCreate() {
  editingUser.value = null
  form.value = defaultForm()
  formError.value = ''
  showModal.value = true
}

function openEdit(user) {
  editingUser.value = user
  form.value = { username: user.username, email: user.email || '', first_name: user.first_name || '', last_name: user.last_name || '', role: user.role, phone: user.phone || '', is_active: user.is_active, password: '', password2: '' }
  formError.value = ''
  showModal.value = true
}

async function openAssign(user) {
  assignTarget.value = user
  selectedAccountIds.value = (user.assigned_accounts || []).map(a => a.id)
  assignSearch.value = ''
  showAssignModal.value = true
  allAccountsLoading.value = true
  try {
    const { data } = await accountsAPI.list({ page_size: 1000 })
    allAccounts.value = data.results || data
  } catch {} finally { allAccountsLoading.value = false }
}

async function saveAssignment() {
  saving.value = true
  try {
    await usersAPI.assignAccounts(assignTarget.value.id, selectedAccountIds.value)
    showAssignModal.value = false
    await fetchUsers()
  } catch (e) {
    alert('Failed to save assignment')
  } finally { saving.value = false }
}

async function saveUser() {
  saving.value = true
  formError.value = ''
  try {
    if (editingUser.value) {
      await usersAPI.update(editingUser.value.id, { email: form.value.email, first_name: form.value.first_name, last_name: form.value.last_name, role: form.value.role, phone: form.value.phone, is_active: form.value.is_active })
    } else {
      await usersAPI.create(form.value)
    }
    showModal.value = false
    await fetchUsers()
  } catch (e) {
    const errs = e.response?.data
    if (errs) formError.value = Object.values(errs).flat().join(' ')
    else formError.value = 'An error occurred'
  } finally { saving.value = false }
}

function confirmDelete(user) { deleteTarget.value = user }

async function doDelete() {
  saving.value = true
  try {
    await usersAPI.delete(deleteTarget.value.id)
    deleteTarget.value = null
    await fetchUsers()
  } catch {} finally { saving.value = false }
}

onMounted(fetchUsers)
</script>

<style scoped>
.role-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 20px; }
.role-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; display: flex; align-items: center; gap: 12px; }
.role-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; background: var(--bg-card-hover); flex-shrink: 0; }
.role-name { font-weight: 700; font-size: 14px; }
.role-desc { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
.user-av { width: 32px; height: 32px; background: linear-gradient(135deg, var(--accent), var(--purple)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #fff; flex-shrink: 0; }
.user-cell { display: flex; align-items: center; gap: 10px; }
.fw600 { font-weight: 600; }
.text-secondary { color: var(--text-secondary); }
.text-muted { color: var(--text-muted); }
.text-xs { font-size: 11px; }

/* Manager assignments section */
.manager-assignments { display: flex; flex-direction: column; gap: 0; }
.manager-row { display: flex; align-items: center; gap: 16px; padding: 14px 20px; border-bottom: 1px solid var(--border); flex-wrap: wrap; }
.manager-row:last-child { border-bottom: none; }
.manager-info { display: flex; align-items: center; gap: 10px; min-width: 160px; }
.manager-accounts { display: flex; flex-wrap: wrap; gap: 6px; flex: 1; }
.account-chip { background: var(--accent-glow); color: var(--accent); border: 1px solid rgba(24,119,242,0.2); border-radius: 20px; padding: 2px 10px; font-size: 11px; font-weight: 500; }
.chip-more { background: var(--bg-card-hover); color: var(--text-muted); border-color: var(--border); }

/* Assign modal */
.assign-search { position: relative; margin-bottom: 10px; }
.assign-search svg { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
.assign-search .form-input { padding-left: 32px; }
.assign-select-all { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border); margin-bottom: 8px; }
.accounts-checklist { max-height: 320px; overflow-y: auto; display: flex; flex-direction: column; gap: 2px; }
.checklist-item { display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: var(--radius-sm); cursor: pointer; border: 1px solid transparent; transition: all 0.15s; }
.checklist-item:hover { background: var(--bg-card); }
.checklist-item.selected { background: var(--accent-glow); border-color: rgba(24,119,242,0.2); }
.checklist-item input[type=checkbox] { flex-shrink: 0; }
.acc-check-avatar { width: 28px; height: 28px; background: linear-gradient(135deg, var(--accent), var(--purple)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #fff; flex-shrink: 0; }
.acc-check-info { flex: 1; min-width: 0; }

.modal-lg { max-width: 560px; }

@media (max-width: 640px) {
  .hide-sm { display: none; }
  .manager-row { gap: 10px; }
  .manager-info { min-width: unset; width: 100%; }
  .manager-accounts { width: 100%; }
}
</style>
