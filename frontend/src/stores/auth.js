import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: '',
    usuario: null,
    documentos: {},
  }),
  getters: {
    esAdmin: (state) => state.usuario?.rol === 'ADMIN',
    // Primero el documento que viene del backend en la sesion (el que el
    // admin puso al crear el usuario); el mapa local es solo respaldo para
    // sesiones antiguas donde el usuario lo guardo en "Mi perfil".
    documento: (state) =>
      state.usuario?.documento || state.documentos[state.usuario?._id] || '',
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