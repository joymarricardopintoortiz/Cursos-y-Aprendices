import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: '',
    usuario: null,
    documentos: {},
  }),
  getters: {
    esAdmin: (state) => state.usuario?.rol === 'ADMIN',
    documento: (state) => state.documentos[state.usuario?._id] ?? '',
  },
  actions: {
    setSesion({ token, usuario }) {
      this.token = token
      this.usuario = usuario
    },
    setDocumento(numero) {
      if (this.usuario?._id) this.documentos[this.usuario._id] = numero
    },
    logout() {
      this.token = ''
      this.usuario = null
    },
  },
  persist: true,
})