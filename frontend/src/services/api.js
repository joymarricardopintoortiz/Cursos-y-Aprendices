import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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