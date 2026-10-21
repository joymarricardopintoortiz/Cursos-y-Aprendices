import { defineStore } from 'pinia'

export const useSolicitudesStore = defineStore('solicitudes', {
  state: () => ({
    solicitudes: [],
  }),
  getters: {
    yaSolicitado: (state) => (email, cursoId) =>
      state.solicitudes.some(
        (s) => s.usuarioEmail === email && s.cursoId === cursoId && s.estado !== 'rechazada',
      ),
  },
  actions: {
    crearSolicitud({ usuarioNombre, usuarioEmail, usuarioDocumento, cursoId, cursoNombre }) {
      if (this.yaSolicitado(usuarioEmail, cursoId)) return false
      this.solicitudes.unshift({
        id: Date.now(),
        usuarioNombre,
        usuarioEmail,
        usuarioDocumento,
        cursoId,
        cursoNombre,
        estado: 'pendiente',
        fecha: new Date().toLocaleString(),
        vista: false,
      })
      return true
    },
    cambiarEstado(id, estado) {
      const idx = this.solicitudes.findIndex((x) => x.id === id)
      if (idx !== -1) {
        const s = this.solicitudes[idx]
        s.estado = estado
        s.vista = false
        this.solicitudes.splice(idx, 1)
        this.solicitudes.unshift(s)
      }
    },
    marcarVista(id) {
      const s = this.solicitudes.find((x) => x.id === id)
      if (s) s.vista = true
    },
  },
  persist: true,
})
