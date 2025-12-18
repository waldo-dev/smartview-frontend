import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Verificar si hay un token guardado al cargar la app
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    console.log('🔄 Iniciando verificación de sesión...')
    console.log('🔑 Token en localStorage:', token ? 'Sí' : 'No')
    console.log('👤 Usuario en localStorage:', savedUser ? 'Sí' : 'No')
    
    if (token) {
      // Intentar cargar usuario desde localStorage primero (más rápido)
      // Esto permite mostrar la UI inmediatamente mientras se verifica el token
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser)
          setUser(userData)
          console.log('✅ Usuario cargado desde localStorage (temporal, esperando verificación)')
        } catch (e) {
          console.error('❌ Error parsing saved user:', e)
        }
      }
      
      // Verificar token con el backend en segundo plano
      authService.verifyToken(token)
        .then(userData => {
          if (userData) {
            setUser(userData)
            // Actualizar usuario guardado
            localStorage.setItem('user', JSON.stringify(userData))
            console.log('✅ Sesión restaurada correctamente desde el backend')
          } else {
            console.warn('⚠️ verifyToken no devolvió datos del usuario')
            // Si no hay datos pero no hay error, mantener el usuario guardado
            if (!savedUser) {
              console.warn('⚠️ No hay usuario guardado, limpiando sesión')
              localStorage.removeItem('token')
              setUser(null)
            } else {
              console.log('ℹ️ Manteniendo usuario guardado localmente (sin verificación del backend)')
            }
          }
        })
        .catch((error) => {
          console.error('❌ Error verifying token:', error)
          console.error('Detalles:', {
            status: error.response?.status,
            message: error.response?.data?.message || error.message,
            url: error.config?.url
          })
          
          // Si el error es 404, el endpoint no existe
          if (error.response?.status === 404) {
            console.error('🚨 El endpoint /auth/verify no existe en el backend')
            console.error('💡 Implementa el endpoint según la guía: SESSION_PERSISTENCE_GUIDE.md')
            // Si el endpoint no existe, mantener el usuario guardado localmente
            if (savedUser) {
              console.log('ℹ️ Manteniendo sesión local ya que el endpoint verify no existe')
              // No limpiar la sesión, mantener el usuario
              return
            }
          }
          // Si el error es 401, el token es inválido o expirado
          else if (error.response?.status === 401) {
            console.error('🚨 Token inválido o expirado')
            // Solo limpiar si realmente es un 401 (token inválido)
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            setUser(null)
            return
          }
          // Si hay un error de red o del servidor (500, etc), mantener la sesión local
          else if (error.response?.status >= 500 || !error.response) {
            console.warn('⚠️ Error del servidor o de red, manteniendo sesión local')
            if (savedUser) {
              console.log('ℹ️ Manteniendo usuario guardado localmente debido a error del servidor')
              // No limpiar, mantener el usuario
              return
            }
          }
          
          // Para otros errores, limpiar solo si no hay usuario guardado
          if (!savedUser) {
            console.warn('⚠️ No hay usuario guardado y la verificación falló, limpiando sesión')
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            setUser(null)
          } else {
            console.log('ℹ️ Manteniendo usuario guardado localmente a pesar del error')
          }
        })
        .finally(() => {
          setLoading(false)
          console.log('✅ Verificación de sesión completada')
        })
    } else {
      console.log('ℹ️ No hay token guardado, usuario no autenticado')
      // Si no hay token, limpiar usuario guardado
      if (savedUser) {
        localStorage.removeItem('user')
      }
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    try {
      setError(null)
      const response = await authService.login(email, password)
      
      console.log('📥 Respuesta del login:', response)
      
      // Manejar diferentes estructuras de respuesta del backend
      let userData = null
      let token = null
      
      // Estructura 1: { success: true, data: { user: {...}, token: "..." } }
      if (response.success && response.data) {
        userData = response.data.user
        token = response.data.token
      }
      // Estructura 2: { success: true, user: {...}, token: "..." }
      else if (response.success) {
        userData = response.user
        token = response.token
      }
      // Estructura 3: { user: {...}, token: "..." }
      else if (response.user || response.token) {
        userData = response.user
        token = response.token
      }
      
      console.log('🔑 Token recibido:', token ? 'Sí' : 'No', token ? `(${token.substring(0, 20)}...)` : '')
      console.log('👤 Usuario recibido:', userData ? 'Sí' : 'No')
      
      if (token) {
        localStorage.setItem('token', token)
        console.log('✅ Token guardado en localStorage')
      } else {
        console.warn('⚠️ No se recibió token en la respuesta')
      }
      
      if (userData) {
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
        console.log('✅ Usuario guardado en localStorage')
      } else {
        console.warn('⚠️ No se recibió usuario en la respuesta')
      }
      
      if (!token || !userData) {
        throw new Error('La respuesta del servidor no contiene token o usuario')
      }
      
      return { success: true }
    } catch (err) {
      console.error('❌ Error en login:', err)
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Error al iniciar sesión'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const register = async (userData) => {
    try {
      setError(null)
      const response = await authService.register(userData)
      
      // Manejar la estructura de respuesta del backend
      if (response.success && response.data) {
        const { user: newUser, token } = response.data
        
        if (token) {
          localStorage.setItem('token', token)
        }
        
        if (newUser) {
          setUser(newUser)
          // Guardar usuario en localStorage para persistencia
          localStorage.setItem('user', JSON.stringify(newUser))
        }
        
        return { success: true }
      } else {
        throw new Error(response.message || 'Error al registrarse')
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Error al registrarse'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setError(null)
  }

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}


