<template>
  <RouterView />
  <!-- Global Toast Container -->
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast-anim" tag="div" style="display:flex;flex-direction:column;gap:10px">
        <div
          v-for="t in toast.toasts"
          :key="t.id"
          class="toast"
          :class="`toast-${t.type}`"
          @click="toast.remove(t.id)"
        >
          <div class="toast-icon">
            <svg v-if="t.type === 'success'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
            <svg v-else-if="t.type === 'error'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <span class="toast-message">{{ t.message }}</span>
          <div class="toast-bar"></div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { RouterView } from 'vue-router'
import { useToastStore } from '@/stores/toast'
const toast = useToastStore()
</script>

<style>
.toast-anim-enter-active { animation: toastSlide 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
.toast-anim-leave-active { animation: toastSlide 0.25s ease reverse; }
</style>
