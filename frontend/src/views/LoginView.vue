<template>
  <div class="login-page">
    <div class="login-bg">
      <div class="login-orb orb-1"></div>
      <div class="login-orb orb-2"></div>
      <div class="grid-overlay"></div>
    </div>
    <div class="login-container">
      <div class="login-card">
        <div class="login-logo">
          <div class="logo-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </div>
          <div>
            <h1>FB Manager</h1>
            <p>Accounts & Pages Platform</p>
          </div>
        </div>

        <div v-if="error" class="alert alert-error">{{ error }}</div>

        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label class="form-label">Username</label>
            <input v-model="form.username" class="form-input" placeholder="Enter username" required autocomplete="username" />
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <div class="password-wrap">
              <input
                v-model="form.password"
                :type="showPass ? 'text' : 'password'"
                class="form-input"
                placeholder="Enter password"
                required
                autocomplete="current-password"
              />
              <button type="button" class="pass-toggle" @click="showPass = !showPass">
                <svg v-if="!showPass" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
          </div>
          <button type="submit" class="btn btn-primary login-btn" :disabled="loading">
            <span v-if="loading" class="spinner" style="width:16px;height:16px;border-width:2px;border-top-color:#fff"></span>
            <span>{{ loading ? 'Signing in...' : 'Sign In' }}</span>
          </button>
        </form>

        <div class="demo-creds">
          <p>Demo credentials:</p>
          <div class="cred-row" v-for="c in creds" :key="c.user" @click="fillCred(c)">
            <span class="cred-badge" :class="c.role">{{ c.role }}</span>
            <span>{{ c.user }} / {{ c.pass }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const form = ref({ username: '', password: '' })
const loading = ref(false)
const error = ref('')
const showPass = ref(false)

const creds = [
  { user: 'admin', pass: 'admin123', role: 'admin' },
  { user: 'manager', pass: 'manager123', role: 'manager' },
  { user: 'viewer', pass: 'viewer123', role: 'viewer' },
]

function fillCred(c) {
  form.value.username = c.user
  form.value.password = c.pass
}

async function handleLogin() {
  loading.value = true
  error.value = ''
  const res = await auth.login(form.value)
  loading.value = false
  if (res.success) router.push('/dashboard')
  else error.value = res.error
}
</script>

<style scoped>
.login-page {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  position: relative; overflow: hidden; background: var(--bg-primary);
}
.login-bg { position: absolute; inset: 0; pointer-events: none; }
.login-orb {
  position: absolute; border-radius: 50%;
  filter: blur(80px); opacity: 0.15;
}
.orb-1 { width: 500px; height: 500px; background: var(--accent); top: -100px; left: -100px; }
.orb-2 { width: 400px; height: 400px; background: var(--purple); bottom: -80px; right: -80px; }
.grid-overlay {
  position: absolute; inset: 0;
  background-image: linear-gradient(var(--border) 1px, transparent 1px),
    linear-gradient(90deg, var(--border) 1px, transparent 1px);
  background-size: 40px 40px;
  opacity: 0.3;
}
.login-container { position: relative; z-index: 1; width: 100%; max-width: 420px; padding: 20px; }
.login-card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 16px; padding: 36px;
  box-shadow: 0 24px 64px rgba(0,0,0,0.5);
}
.login-logo { display: flex; align-items: center; gap: 14px; margin-bottom: 32px; }
.logo-icon {
  width: 52px; height: 52px; background: var(--accent);
  border-radius: 14px; display: flex; align-items: center; justify-content: center;
  color: #fff; flex-shrink: 0;
}
.login-logo h1 { font-size: 22px; font-weight: 700; }
.login-logo p { font-size: 12px; color: var(--text-secondary); }

.password-wrap { position: relative; }
.password-wrap .form-input { padding-right: 44px; }
.pass-toggle {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; color: var(--text-muted);
  display: flex; align-items: center; padding: 0;
}
.pass-toggle:hover { color: var(--text-secondary); }

.login-btn { width: 100%; justify-content: center; padding: 12px; font-size: 14px; margin-top: 4px; }

.demo-creds { margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border); }
.demo-creds p { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); margin-bottom: 10px; font-weight: 600; }
.cred-row {
  display: flex; align-items: center; gap: 10px; padding: 8px 10px;
  border-radius: var(--radius-sm); cursor: pointer; transition: background 0.15s;
  font-size: 13px; color: var(--text-secondary); margin-bottom: 4px;
}
.cred-row:hover { background: var(--bg-card-hover); color: var(--text-primary); }
.cred-badge {
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  padding: 2px 8px; border-radius: 20px; letter-spacing: 0.5px;
}
.cred-badge.admin { background: var(--purple-bg); color: var(--purple); }
.cred-badge.manager { background: var(--accent-glow); color: var(--accent); }
.cred-badge.viewer { background: var(--bg-card-hover); color: var(--text-muted); border: 1px solid var(--border); }

@media (max-width: 480px) {
  .login-card { padding: 28px 20px; margin: 12px; border-radius: var(--radius); }
  .login-logo h1 { font-size: 22px; }
}

</style>
