import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: '',
    usuario: null,
  }),
  getters: {
    esAdmin: (state) => state.usuario?.rol === 'ADMIN',
  },
  actions: {
    setSesion({ token, usuario }) {
      this.token = token
      this.usuario = usuario
    },
    logout() {
      this.token = ''
      this.usuario = null
    },
  },
  persist: true,
})