import { defineStore } from 'pinia'

export const useToastStore = defineStore('toast', {
  state: () => ({
    toasts: [],
    nextId: 1,
  }),
  actions: {
    add(message, type = 'success', duration = 4000) {
      const id = this.nextId++
      this.toasts.push({ id, message, type })
      if (duration > 0) {
        setTimeout(() => this.remove(id), duration)
      }
      return id
    },
    success(message) { return this.add(message, 'success') },
    error(message) { return this.add(message, 'error') },
    info(message) { return this.add(message, 'info') },
    remove(id) {
      const idx = this.toasts.findIndex(t => t.id === id)
      if (idx !== -1) this.toasts.splice(idx, 1)
    }
  }
})
