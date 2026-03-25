<template>
  <div>
    <div class="page-header">
      <div class="page-header-left">
        <h1>Settings</h1>
        <p>Manage your profile and account preferences</p>
      </div>
    </div>

    <div class="settings-layout">
      <!-- Profile settings -->
      <div class="card">
        <div class="card-header"><h3 class="card-title">Profile Information</h3></div>
        <div v-if="profileSuccess" class="alert alert-success">Profile updated successfully!</div>
        <div v-if="profileError" class="alert alert-error">{{ profileError }}</div>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">First Name</label>
            <input v-model="profileForm.first_name" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Last Name</label>
            <input v-model="profileForm.last_name" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input v-model="profileForm.email" type="email" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Phone</label>
            <input v-model="profileForm.phone" class="form-input" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Role</label>
          <div class="role-display">
            <span class="badge" :class="`badge-${auth.user?.role}`">{{ auth.user?.role }}</span>
            <span style="font-size:12px;color:var(--text-muted)">Contact an admin to change your role</span>
          </div>
        </div>
        <button class="btn btn-primary" @click="saveProfile" :disabled="savingProfile">
          <span v-if="savingProfile" class="spinner" style="width:14px;height:14px;border-width:2px;border-top-color:#fff"></span>
          Save Profile
        </button>
      </div>

      <!-- Change Password -->
      <div class="card">
        <div class="card-header"><h3 class="card-title">Change Password</h3></div>
        <div v-if="passSuccess" class="alert alert-success">Password changed successfully!</div>
        <div v-if="passError" class="alert alert-error">{{ passError }}</div>
        <div class="form-group">
          <label class="form-label">Current Password</label>
          <input v-model="passForm.old_password" type="password" class="form-input" autocomplete="current-password" />
        </div>
        <div class="form-group">
          <label class="form-label">New Password</label>
          <input v-model="passForm.new_password" type="password" class="form-input" autocomplete="new-password" />
        </div>
        <button class="btn btn-primary" @click="changePassword" :disabled="savingPass">
          <span v-if="savingPass" class="spinner" style="width:14px;height:14px;border-width:2px;border-top-color:#fff"></span>
          Change Password
        </button>
      </div>

      <!-- App info -->
      <div class="card">
        <div class="card-header"><h3 class="card-title">Application Info</h3></div>
        <div class="info-grid">
          <div class="info-item"><span class="info-label">Version</span><span class="info-val">1.0.0</span></div>
          <div class="info-item"><span class="info-label">Backend</span><span class="info-val">Django 4.2 + DRF</span></div>
          <div class="info-item"><span class="info-label">Frontend</span><span class="info-val">Vue 3 + Pinia</span></div>
          <div class="info-item"><span class="info-label">Your Role</span><span class="info-val"><span class="badge" :class="`badge-${auth.user?.role}`">{{ auth.user?.role }}</span></span></div>
          <div class="info-item"><span class="info-label">Username</span><span class="info-val mono">{{ auth.user?.username }}</span></div>
          <div class="info-item"><span class="info-label">API Base</span><span class="info-val mono">http://localhost:8000/api</span></div>
        </div>
      </div>

      <!-- Permissions Reference -->
      <div class="card">
        <div class="card-header"><h3 class="card-title">Permissions Reference</h3></div>
        <div class="perms-table">
          <div class="perm-row perm-header">
            <div class="perm-action">Action</div>
            <div class="perm-role">Admin</div>
            <div class="perm-role">Manager</div>
            <div class="perm-role">Viewer</div>
          </div>
          <div v-for="perm in permissions" :key="perm.action" class="perm-row">
            <div class="perm-action">{{ perm.action }}</div>
            <div class="perm-role"><span :class="perm.admin ? 'check' : 'cross'">{{ perm.admin ? '✓' : '✗' }}</span></div>
            <div class="perm-role"><span :class="perm.manager ? 'check' : 'cross'">{{ perm.manager ? '✓' : '✗' }}</span></div>
            <div class="perm-role"><span :class="perm.viewer ? 'check' : 'cross'">{{ perm.viewer ? '✓' : '✗' }}</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { authAPI } from '@/api'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const savingProfile = ref(false)
const savingPass = ref(false)
const profileSuccess = ref(false)
const profileError = ref('')
const passSuccess = ref(false)
const passError = ref('')

const profileForm = ref({
  first_name: auth.user?.first_name || '',
  last_name: auth.user?.last_name || '',
  email: auth.user?.email || '',
  phone: auth.user?.phone || '',
})

const passForm = ref({ old_password: '', new_password: '' })

const permissions = [
  { action: 'View Dashboard', admin: true, manager: true, viewer: true },
  { action: 'View All Accounts', admin: true, manager: true, viewer: false },
  { action: 'Create Accounts', admin: true, manager: true, viewer: false },
  { action: 'Edit Accounts', admin: true, manager: true, viewer: false },
  { action: 'Delete Accounts', admin: true, manager: false, viewer: false },
  { action: 'Manage Pages', admin: true, manager: true, viewer: false },
  { action: 'Update Page Stats', admin: true, manager: true, viewer: false },
  { action: 'Manage Users', admin: true, manager: false, viewer: false },
  { action: 'View Own Accounts', admin: true, manager: true, viewer: true },
]

async function saveProfile() {
  savingProfile.value = true
  profileSuccess.value = false
  profileError.value = ''
  try {
    await authAPI.updateMe(profileForm.value)
    await auth.fetchMe()
    profileSuccess.value = true
    setTimeout(() => profileSuccess.value = false, 3000)
  } catch (e) {
    profileError.value = 'Failed to update profile'
  } finally {
    savingProfile.value = false
  }
}

async function changePassword() {
  savingPass.value = true
  passSuccess.value = false
  passError.value = ''
  try {
    await authAPI.changePassword(passForm.value)
    passSuccess.value = true
    passForm.value = { old_password: '', new_password: '' }
    setTimeout(() => passSuccess.value = false, 3000)
  } catch (e) {
    const errs = e.response?.data
    if (errs) passError.value = Object.values(errs).flat().join(' ')
    else passError.value = 'Failed to change password'
  } finally {
    savingPass.value = false
  }
}
</script>

<style scoped>
.settings-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.role-display { display: flex; align-items: center; gap: 10px; padding: 8px 0; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.info-item { display: flex; gap: 8px; flex-direction: column; background: var(--bg-card-hover); border-radius: var(--radius-sm); padding: 12px; }
.info-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); font-weight: 600; }
.info-val { font-size: 13px; font-weight: 600; }
.mono { font-family: 'JetBrains Mono', monospace; font-size: 12px; }

.perms-table { display: flex; flex-direction: column; }
.perm-row { display: grid; grid-template-columns: 1fr 80px 80px 80px; gap: 0; padding: 9px 12px; border-radius: var(--radius-sm); }
.perm-row:nth-child(even) { background: var(--bg-card-hover); }
.perm-header { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); font-weight: 700; margin-bottom: 4px; }
.perm-action { font-size: 13px; color: var(--text-secondary); }
.perm-role { text-align: center; font-size: 13px; font-weight: 700; }
.check { color: var(--green); }
.cross { color: var(--red); opacity: 0.5; }
@media (max-width: 800px) { .settings-layout { grid-template-columns: 1fr; } }

@media (max-width: 700px) {
  .settings-layout { grid-template-columns: 1fr !important; }
  .settings-sidebar { border-right: none; border-bottom: 1px solid var(--border); padding-bottom: 16px; }
}
@media (max-width: 480px) {
  .form-grid { grid-template-columns: 1fr !important; }
}

</style>
