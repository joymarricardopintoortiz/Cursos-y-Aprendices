import { Notify } from 'quasar'

export function useNotify() {
  const ok = (msg) => {
    Notify.create({ type: 'positive', message: msg, icon: 'check_circle' })
  }

  const aviso = (msg) => {
    Notify.create({ message: msg, icon: 'warning', color: 'yellow-4', textColor: 'black' })
  }

  // Naranja con letras negras: para acciones negativas que SI se ejecutaron
  // (como rechazar), no es un error pero tampoco algo positivo.
  const naranja = (msg) => {
    Notify.create({ message: msg, icon: 'cancel', color: 'orange', textColor: 'black' })
  }

  const listaErrores = (e) => {
    const lista = e.response?.data?.errors
    if (lista?.length) return lista
    return [e.response?.data?.msg || 'Error de conexión con el servidor']
  }

  const error = (e) => {
    const lista = listaErrores(e)
    Notify.create({ type: 'negative', message: lista.join('. '), icon: 'error' })
    return lista
  }

  return { ok, error, listaErrores, aviso, naranja }
}