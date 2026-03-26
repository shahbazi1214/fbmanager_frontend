import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    dark: localStorage.getItem('theme') !== 'light',
  }),
  actions: {
    toggle() {
      this.dark = !this.dark
      localStorage.setItem('theme', this.dark ? 'dark' : 'light')
      this.apply()
    },
    apply() {
      document.documentElement.setAttribute('data-theme', this.dark ? 'dark' : 'light')
    },
    init() {
      this.apply()
    }
  }
})
