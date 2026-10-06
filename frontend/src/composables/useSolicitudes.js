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

export function useSolicitudes() {
  const solicitudes = ref(leer())

  const recargar = () => {
    solicitudes.value = leer()
  }

  const yaSolicitado = (email, cursoId) =>
    solicitudes.value.some((s) => s.usuarioEmail === email && s.cursoId === cursoId && s.estado !== 'rechazada')

  const crearSolicitud = ({ usuarioNombre, usuarioEmail, cursoId, cursoNombre }) => {
    if (yaSolicitado(usuarioEmail, cursoId)) return false
    solicitudes.value.push({
      id: Date.now(),
      usuarioNombre,
      usuarioEmail,
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
    const s = solicitudes.value.find((x) => x.id === id)
    if (s) {
      s.estado = estado
      s.vista = false
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
