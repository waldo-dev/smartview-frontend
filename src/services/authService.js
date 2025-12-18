import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://api.analytics.chilsmart.com/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar respuestas y errores de autenticación
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // No limpiar sesión automáticamente en el endpoint de verify
    // Dejamos que el AuthContext maneje ese caso específico
    const isVerifyEndpoint = error.config?.url?.includes('/auth/verify')
    
    // Si recibimos un 401 (No autorizado) y NO es el endpoint de verify
    if (error.response?.status === 401 && !isVerifyEndpoint) {
      console.warn('⚠️ 401 recibido en endpoint diferente a verify, limpiando sesión')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Redirigir a login solo si no estamos ya en la página de login
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        // Usar setTimeout para evitar conflictos con React Router
        setTimeout(() => {
          window.location.href = '/login'
        }, 100)
      }
    }
    // Si es el endpoint de verify y devuelve 401, solo loguear el error
    // El AuthContext se encargará de limpiar la sesión
    else if (error.response?.status === 401 && isVerifyEndpoint) {
      console.warn('⚠️ Token inválido en verify, el AuthContext manejará la limpieza')
    }
    
    return Promise.reject(error)
  }
)

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  async verifyToken(token) {
    try {
      console.log('🔍 Verificando token...', token ? `(${token.substring(0, 20)}...)` : 'No hay token')
      
      const response = await api.get('/auth/verify', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      console.log('📥 Respuesta de verify:', response.data)
      
      // Manejar diferentes estructuras de respuesta
      let userData = null
      
      // Estructura 1: { success: true, data: { user: {...} } }
      if (response.data.success && response.data.data) {
        userData = response.data.data.user || response.data.data
      }
      // Estructura 2: { success: true, user: {...} }
      else if (response.data.success && response.data.user) {
        userData = response.data.user
      }
      // Estructura 3: { user: {...} }
      else if (response.data.user) {
        userData = response.data.user
      }
      // Estructura 4: datos directos
      else {
        userData = response.data
      }
      
      console.log('👤 Usuario extraído:', userData ? 'Sí' : 'No')
      
      // Guardar usuario en localStorage como respaldo
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData))
        console.log('✅ Usuario guardado en localStorage')
      } else {
        console.warn('⚠️ verifyToken no devolvió datos del usuario')
      }
      
      return userData
    } catch (error) {
      console.error('❌ Error en verifyToken:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.response?.data?.message || error.message,
        data: error.response?.data
      })
      
      // Si falla la verificación, limpiar todo
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      throw error
    }
  },

  async logout() {
    // Limpiar token localmente
    localStorage.removeItem('token')
  }
}

export default api


