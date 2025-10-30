import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { Input, Label } from '../components/ui/Input'
import { Card, CardContent } from '../components/ui/Card'
import { StepProgress } from '../components/ui/StepProgress'
import { Mail, Lock, User, Building2, ShieldCheck, Sparkles, ArrowRight, ArrowLeft, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react'

const STEPS = [
  { id: 'personal', label: 'Personal' },
  { id: 'security', label: 'Seguridad' },
]

export function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Validación por campo (Heurística: Prevención de errores)
  const validateField = (name, value) => {
    const newErrors = { ...errors }

    switch (name) {
      case 'name':
        if (!value) {
          newErrors.name = 'El nombre completo es requerido'
        } else if (value.length < 3) {
          newErrors.name = 'El nombre debe tener al menos 3 caracteres'
        } else {
          delete newErrors.name
        }
        break
      case 'email':
        if (!value) {
          newErrors.email = 'El correo electrónico es requerido'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Por favor ingresa un correo electrónico válido'
        } else {
          delete newErrors.email
        }
        break
      case 'password':
        if (!value) {
          newErrors.password = 'La contraseña es requerida'
        } else if (value.length < 8) {
          newErrors.password = 'La contraseña debe tener al menos 8 caracteres'
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          newErrors.password = 'Debe contener mayúsculas, minúsculas y números'
        } else {
          delete newErrors.password
        }
        // Re-validar confirmación si ya fue tocada
        if (touched.confirmPassword && formData.confirmPassword) {
          if (value !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden'
          } else {
            delete newErrors.confirmPassword
          }
        }
        break
      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'Debes confirmar tu contraseña'
        } else if (value !== formData.password) {
          newErrors.confirmPassword = 'Las contraseñas no coinciden'
        } else {
          delete newErrors.confirmPassword
        }
        break
    }

    setErrors(newErrors)
    return !newErrors[name]
  }

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true })
    validateField(field, formData[field])
  }

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
    if (touched[field]) {
      validateField(field, value)
    }
  }

  // Validar paso actual antes de avanzar
  const validateCurrentStep = () => {
    let isValid = true
    const fieldsToValidate = {
      1: ['name', 'email'],
      2: ['password', 'confirmPassword'],
    }

    const fields = fieldsToValidate[currentStep]
    const newTouched = { ...touched }

    fields.forEach((field) => {
      newTouched[field] = true
      if (!validateField(field, formData[field])) {
        isValid = false
      }
    })

    setTouched(newTouched)
    return isValid
  }

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length))
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && isStepValid()) {
      e.preventDefault()
      if (currentStep < STEPS.length) {
        handleNext()
      } else {
        handleSubmit(e)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateCurrentStep()) return

    setLoading(true)
    const result = await register(formData)

    if (result.success) {
      navigate('/dashboard')
    } else {
      setErrors({
        submit: result.error || 'Error al crear la cuenta. Por favor intenta de nuevo.'
      })
    }

    setLoading(false)
  }

  // Verificar si el paso actual es válido
  const isStepValid = () => {
    const stepFields = {
      1: ['name', 'email'],
      2: ['password', 'confirmPassword'],
    }

    return stepFields[currentStep].every(
      (field) => formData[field] && !errors[field]
    )
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
            <Link
              to="/login"
              className="text inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
              <span className="text-md font-medium">Volver</span>
            </Link>

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
            <div className="mb-6 text-center">
              <div className="inline-flex items-center justify-center mb-3">
                <img
                  src="/isis.png"
                  alt="ISIS Logo"
                  className="w-20 h-20 object-contain"
                />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Crear Cuenta</h2>
            </div>

            {/* Indicador de progreso */}
            <StepProgress steps={STEPS} currentStep={currentStep} />

            {/* Error general */}
            {errors.submit && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{errors.submit}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Paso 1: Información Personal */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <Label required>Nombre completo</Label>
                    <Input
                      type="text"
                      placeholder="Ej: Juan Pérez García"
                      icon={User}
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      onBlur={() => handleBlur('name')}
                      onKeyPress={handleKeyPress}
                      autoFocus
                      autoComplete="name"
                    />
                    <div className="min-h-[20px] mt-1.5">
                      {touched.name && errors.name && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label required>Correo electrónico</Label>
                    <Input
                      type="email"
                      placeholder="ejemplo@correo.com"
                      icon={Mail}
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      onKeyPress={handleKeyPress}
                      autoComplete="email"
                    />
                    <div className="min-h-[20px] mt-1.5">
                      {touched.email && errors.email && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

              
                </div>
              )}

              {/* Paso 2: Seguridad (Contraseñas) */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label required>Contraseña</Label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                      >
                        {showPassword ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            Ocultar
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            Mostrar
                          </>
                        )}
                      </button>
                    </div>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 8 caracteres"
                      icon={Lock}
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      onBlur={() => handleBlur('password')}
                      onKeyPress={handleKeyPress}
                      autoFocus
                      autoComplete="new-password"
                    />
                    <div className="min-h-[20px] mt-1.5">
                      {touched.password && errors.password && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.password}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    
                    <div className="flex items-center justify-between mb-1">
                      <Label required>Confirmar contraseña</Label>
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!formData.password}
                      >
                        {showConfirmPassword ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            Ocultar
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            Mostrar
                          </>
                        )}
                      </button>
                    </div>
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirma tu contraseña"
                      icon={Lock}
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      onBlur={() => handleBlur('confirmPassword')}
                      onKeyPress={handleKeyPress}
                      autoComplete="new-password"
                      disabled={!formData.password}
                    />
                    <div className="min-h-[20px] mt-1.5">
                      {touched.confirmPassword && errors.confirmPassword ? (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.confirmPassword}
                        </p>
                      ) : touched.confirmPassword && !errors.confirmPassword && formData.confirmPassword ? (
                        <p className="text-sm text-green-600 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Las contraseñas coinciden
                        </p>
                      ) : null}
                    </div>
                  </div>

                 
                </div>
              )}

              {/* Botones de navegación */}
              <div className="flex items-center gap-3 pt-2">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    onClick={handleBack}
                    className="px-4"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                )}

                {currentStep < STEPS.length ? (
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    onClick={handleNext}
                    disabled={!isStepValid()}
                    className="flex-1"
                  >
                    Siguiente
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={loading || !isStepValid()}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Creando cuenta...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        Crear Cuenta
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="font-semibold text-purple-600 hover:text-purple-700">
                  Inicia sesión
                </Link>
              </p>
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
