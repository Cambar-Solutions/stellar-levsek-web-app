import { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { loginUser as apiLoginUser, validateSession, logoutUser as apiLogoutUser, registerUser as apiRegisterUser } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // No validar sesión en páginas públicas
    const publicPaths = ['/login', '/register']
    const isPublicPath = publicPaths.some(path => window.location.pathname.includes(path))

    if (!isPublicPath) {
      checkAuth()
    } else {
      setLoading(false)
    }
  }, [])

  const checkAuth = async () => {
    try {
      // Check if token exists in localStorage
      const token = localStorage.getItem('access_token')

      if (!token) {
        setLoading(false)
        return
      }

      // Validate the token with the backend
      const response = await validateSession()
      const userData = response.data || response

      if (userData && userData.user) {
        setUser(userData.user)
        localStorage.setItem('isis_user', JSON.stringify(userData.user))
      }
    } catch (error) {
      console.error('Auth validation failed:', error)
      localStorage.removeItem('isis_user')
      localStorage.removeItem('access_token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await apiLoginUser(email, password)

      // El backend puede devolver { data: { user, message } } o directamente { user, message }
      const loginData = response.data || response

      if (loginData.user) {
        setUser(loginData.user)
        localStorage.setItem('isis_user', JSON.stringify(loginData.user))
        toast.success('¡Bienvenido de nuevo!')
        return { success: true }
      }

      toast.error('Credenciales incorrectas')
      return { success: false, error: 'Credenciales incorrectas' }
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error.message || 'Error al iniciar sesión')
      return { success: false, error: error.message }
    }
  }

  const register = async (data) => {
    try {
      // Llamar al endpoint de registro del backend
      const response = await apiRegisterUser({
        name: data.name,
        email: data.email,
        password: data.password,
      })

      // El backend devuelve { data: { user, site, message } }
      const userData = response.data || response

      if (userData && userData.user) {
        toast.success('¡Cuenta creada exitosamente!')

        // Hacer login automático después del registro
        const loginResult = await login(data.email, data.password)
        return loginResult
      }

      toast.error('Error al registrar usuario')
      return { success: false, error: 'Error en el registro' }
    } catch (error) {
      console.error('Register error:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Error al registrar usuario'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const logout = async () => {
    try {
      await apiLogoutUser()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      localStorage.removeItem('isis_user')
      toast.success('Sesión cerrada')
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}
