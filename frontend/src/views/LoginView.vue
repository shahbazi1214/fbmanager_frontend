<template>
  <div class="login-page">
    <div class="login-bg">
      <div class="login-orb orb-1"></div>
      <div class="login-orb orb-2"></div>
      <div class="login-orb orb-3"></div>
      <div class="grid-overlay"></div>
    </div>

    <div class="login-container">
      <div class="login-card">
        <div class="login-logo">
          <div class="logo-icon">
            <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 10h16M8 16h10M8 22h13" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
              <circle cx="25" cy="22" r="3.5" fill="rgba(255,255,255,0.3)" stroke="white" stroke-width="1.5"/>
              <path d="M23.7 22l1 1 1.8-1.8" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div>
            <h1>SocialVault</h1>
            <p>Facebook Management Platform</p>
          </div>
        </div>

        <div class="login-welcome">
          <h2>Welcome back</h2>
          <p>Sign in to manage your Facebook accounts & pages</p>
        </div>

        <div v-if="error" class="alert alert-error">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          {{ error }}
        </div>

        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label class="form-label">Username</label>
            <div class="input-with-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <input v-model="form.username" class="form-input" placeholder="Enter your username" required autocomplete="username" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <div class="password-wrap input-with-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input
                v-model="form.password"
                :type="showPass ? 'text' : 'password'"
                class="form-input"
                placeholder="Enter your password"
                required autocomplete="current-password"
              />
              <button type="button" class="pass-toggle" @click="showPass = !showPass">
                <svg v-if="!showPass" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
          </div>

          <button type="submit" class="btn btn-primary login-btn" :disabled="loading">
            <span v-if="loading" class="spinner" style="width:16px;height:16px;border-width:2px;border-top-color:#fff"></span>
            <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <div class="login-footer">
          <div class="security-note">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Secured with JWT authentication
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
  position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.12;
}
.orb-1 { width: 600px; height: 600px; background: var(--accent); top: -200px; left: -150px; animation: orbFloat1 12s ease-in-out infinite; }
.orb-2 { width: 400px; height: 400px; background: var(--purple); bottom: -100px; right: -80px; animation: orbFloat2 10s ease-in-out infinite; }
.orb-3 { width: 200px; height: 200px; background: var(--green); top: 50%; right: 20%; animation: orbFloat1 8s ease-in-out infinite reverse; opacity: 0.07; }
.grid-overlay {
  position: absolute; inset: 0;
  background-image: linear-gradient(var(--border) 1px, transparent 1px),
    linear-gradient(90deg, var(--border) 1px, transparent 1px);
  background-size: 48px 48px; opacity: 0.25;
}
@keyframes orbFloat1 { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px, 20px) scale(1.05); } }
@keyframes orbFloat2 { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-20px, -30px) scale(1.08); } }

.login-container { position: relative; z-index: 1; width: 100%; max-width: 440px; padding: 20px; }

.login-card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 20px; padding: 40px;
  box-shadow: 0 32px 80px rgba(0,0,0,0.5);
  animation: slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.login-logo {
  display: flex; align-items: center; gap: 14px; margin-bottom: 32px;
}
.logo-icon {
  width: 52px; height: 52px;
  background: linear-gradient(135deg, var(--accent), var(--purple));
  border-radius: 14px; display: flex; align-items: center; justify-content: center;
  color: #fff; flex-shrink: 0;
  box-shadow: 0 8px 24px rgba(24,119,242,0.4);
}
.login-logo h1 { font-size: 22px; font-weight: 800; }
.login-logo p { font-size: 11px; color: var(--text-secondary); margin-top: 2px; }

.login-welcome { margin-bottom: 28px; }
.login-welcome h2 { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
.login-welcome p { font-size: 13px; color: var(--text-secondary); }

.input-with-icon { position: relative; }
.input-with-icon svg:first-child { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; z-index: 1; }
.input-with-icon .form-input { padding-left: 40px; }
.password-wrap .form-input { padding-right: 44px; }

.login-btn { width: 100%; justify-content: center; padding: 13px; font-size: 14px; margin-top: 8px; gap: 8px; border-radius: var(--radius-sm); }

.login-footer { margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border); }
.security-note { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--text-muted); justify-content: center; }

@media (max-width: 480px) {
  .login-card { padding: 28px 20px; margin: 12px; border-radius: var(--radius); }
}
</style>
