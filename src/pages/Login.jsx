import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { Input, Label } from '../components/ui/Input'
import { Card, CardContent } from '../components/ui/Card'
import { Mail, Lock, ShieldCheck, TrendingUp, Users, Wallet } from 'lucide-react'

export function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await login(formData.email, formData.password)

    if (result.success) {
      navigate('/dashboard')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left side - Branding */}
        <div className="text-white space-y-8 hidden md:block">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-sm font-semibold">Powered by Stellar Blockchain</span>
            </div>

            <h1 className="text-5xl font-bold leading-tight">
              Gestión Transparente de Deudas
            </h1>

            <p className="text-xl text-blue-100">
              Administra las deudas de tu negocio con la seguridad y transparencia de blockchain
            </p>
          </div>

          <div className="space-y-4">
            <FeatureItem
              icon={<Wallet className="w-6 h-6" />}
              title="Pagos en Blockchain"
              description="Registros inmutables y verificables"
            />
            <FeatureItem
              icon={<Users className="w-6 h-6" />}
              title="Gestión de Deudores"
              description="Control total de tus cuentas por cobrar"
            />
            <FeatureItem
              icon={<TrendingUp className="w-6 h-6" />}
              title="Estadísticas Avanzadas"
              description="Visualiza el estado financiero en tiempo real"
            />
          </div>
        </div>

        {/* Right side - Login Form */}
        <Card className="shadow-2xl">
          <CardContent className="p-8">
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Bienvenido a ISIS</h2>
              <p className="text-gray-600 mt-2">Inicia sesión en tu cuenta</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label required>Correo electrónico</Label>
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  icon={Mail}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
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
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿No tienes cuenta?{' '}
                <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
                  Regístrate aquí
                </Link>
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <ShieldCheck className="w-4 h-4" />
                <span>Conexión segura con Stellar</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function FeatureItem({ icon, title, description }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-blue-100 text-sm">{description}</p>
      </div>
    </div>
  )
}
