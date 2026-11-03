import api from './api'

export const usuariosService = {
  login: (data) => api.post('/usuarios/login', data),
  registrar: (data) => api.post('/usuarios/register', data),
  listar: () => api.get('/usuarios'),
  actualizar: (id, data) => api.put(`/usuarios/update/${id}`, data),
  verificarEmail: (email) => api.get('/usuarios/email-disponible', { params: { email } }),
}