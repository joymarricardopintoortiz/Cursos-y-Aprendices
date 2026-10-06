import api from './api'

export const usuariosService = {
  login: (data) => api.post('/usuarios/login', data),
  registrar: (data) => api.post('/usuarios/register', data),
}