import { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Cargar usuario desde localStorage
    const savedUser = localStorage.getItem('isis_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    // Simulación de login
    const savedUser = localStorage.getItem(`isis_user_${email}`)

    if (savedUser) {
      const userData = JSON.parse(savedUser)
      if (userData.password === password) {
        setUser(userData)
        localStorage.setItem('isis_user', JSON.stringify(userData))
        toast.success('¡Bienvenido de nuevo!')
        return { success: true }
      }
    }

    toast.error('Credenciales incorrectas')
    return { success: false, error: 'Credenciales incorrectas' }
  }

  const register = async (data) => {
    // Verificar si el usuario ya existe
    const existingUser = localStorage.getItem(`isis_user_${data.email}`)
    if (existingUser) {
      toast.error('Este correo ya está registrado')
      return { success: false, error: 'Usuario ya existe' }
    }

    // Crear nuevo usuario
    const newUser = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      password: data.password,
      businessName: data.businessName,
      walletAddress: `G${Math.random().toString(36).substring(2, 56).toUpperCase()}`,
      createdAt: new Date().toISOString(),
    }

    localStorage.setItem(`isis_user_${data.email}`, JSON.stringify(newUser))
    localStorage.setItem('isis_user', JSON.stringify(newUser))
    setUser(newUser)

    toast.success('¡Cuenta creada exitosamente!')
    return { success: true }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('isis_user')
    toast.success('Sesión cerrada')
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
