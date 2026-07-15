// axiosClient.js centraliza la configuración de axios para toda la app.
// Crea una instancia con la URL base del backend y agrega automáticamente
// el token JWT a cada petición, para no repetir esa lógica en cada componente.

import axios from "axios"
import { API_BASE_URL } from './config'

// Instancia de axios apuntando siempre al backend configurado en config.js
const api = axios.create({ baseURL: `${API_BASE_URL}/` })

// Interceptor de request: se ejecuta antes de cada petición.
// Si hay un token guardado en localStorage, lo agrega como header Authorization.
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api