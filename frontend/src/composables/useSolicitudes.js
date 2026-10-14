import { ref } from 'vue'

const KEY = 'solicitudes'

const leer = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

const guardar = (lista) => localStorage.setItem(KEY, JSON.stringify(lista))

const solicitudes = ref(leer())

export function useSolicitudes() {
  const recargar = () => {
    solicitudes.value = leer()
  }

  const yaSolicitado = (email, cursoId) =>
    solicitudes.value.some((s) => s.usuarioEmail === email && s.cursoId === cursoId && s.estado !== 'rechazada')

  const crearSolicitud = ({ usuarioNombre, usuarioEmail, usuarioDocumento, cursoId, cursoNombre }) => {
    if (yaSolicitado(usuarioEmail, cursoId)) return false
    solicitudes.value.unshift({
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
    guardar(solicitudes.value)
    return true
  }

  const cambiarEstado = (id, estado) => {
    const idx = solicitudes.value.findIndex((x) => x.id === id)
    if (idx !== -1) {
      const s = solicitudes.value[idx]
      s.estado = estado
      s.vista = false
      solicitudes.value.splice(idx, 1)
      solicitudes.value.unshift(s)
      guardar(solicitudes.value)
    }
  }

  const marcarVista = (id) => {
    const s = solicitudes.value.find((x) => x.id === id)
    if (s) {
      s.vista = true
      guardar(solicitudes.value)
    }
  }

  return { solicitudes, recargar, crearSolicitud, cambiarEstado, marcarVista, yaSolicitado }
}
