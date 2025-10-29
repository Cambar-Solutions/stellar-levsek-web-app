import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { Input, Label } from '../components/ui/Input'
import { Card, CardContent } from '../components/ui/Card'
import { Mail, Lock, User, Building2, ShieldCheck, Sparkles } from 'lucide-react'

export function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name) newErrors.name = 'El nombre es requerido'
    if (!formData.email) newErrors.email = 'El correo es requerido'
    if (!formData.password) newErrors.password = 'La contraseña es requerida'
    if (formData.password.length < 8) newErrors.password = 'La contraseña debe tener al menos 8 caracteres'
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    const result = await register(formData)

    if (result.success) {
      navigate('/dashboard')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-700 to-blue-600 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left side - Branding */}
        <div className="text-white space-y-8 hidden md:block">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-semibold">Únete a ISIS</span>
            </div>

            <h1 className="text-5xl font-bold leading-tight">
              Crea tu cuenta
            </h1>

            <p className="text-xl text-purple-100">
              Comienza a gestionar deudas con transparencia blockchain
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 space-y-4">
            <h3 className="font-semibold text-lg">¿Qué obtienes?</h3>
            <ul className="space-y-3">
              <BenefitItem text="Wallet Stellar generada automáticamente" />
              <BenefitItem text="Panel de control completo" />
              <BenefitItem text="Registro inmutable de transacciones" />
              <BenefitItem text="URL pública para transparencia" />
              <BenefitItem text="Estadísticas en tiempo real" />
            </ul>
          </div>
        </div>

        {/* Right side - Register Form */}
        <Card className="shadow-2xl">
          <CardContent className="p-8">
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl mb-4 shadow-lg">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Crear Cuenta</h2>
              <p className="text-gray-600 mt-2">Regístrate en ISIS</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label required>Nombre completo</Label>
                <Input
                  type="text"
                  placeholder="Juan Pérez"
                  icon={User}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  error={errors.name}
                />
              </div>

              <div>
                <Label required>Correo electrónico</Label>
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  icon={Mail}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  error={errors.email}
                />
              </div>

              <div>
                <Label required>Contraseña</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  icon={Lock}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  error={errors.password}
                />
              </div>

              <div>
                <Label required>Confirmar contraseña</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  icon={Lock}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  error={errors.confirmPassword}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-6"
                disabled={loading}
              >
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="font-semibold text-purple-600 hover:text-purple-700">
                  Inicia sesión
                </Link>
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <ShieldCheck className="w-4 h-4" />
                <span>Tu wallet Stellar se generará automáticamente</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function BenefitItem({ text }) {
  return (
    <li className="flex items-center gap-2">
      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
      <span className="text-sm">{text}</span>
    </li>
  )
}
