import axios from 'axios'
import { useAuthStore } from '../stores/auth'

// Si falta frontend/.env, import.meta.env.VITE_API_URL queda undefined y axios
// mandaria las peticiones al propio servidor de Vite (5173) en vez del backend
// (4500), que es lo que se ve como "Error de conexión". Por eso hay un valor
// por defecto: asi el proyecto funciona aunque olviden crear el .env.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4500/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.token) config.headers['x-token'] = auth.token
  return config
})

api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    if (error.response?.status === 401) {
      const auth = useAuthStore()
      if (auth.token) {
        auth.logout()
        window.location.hash = '#/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api