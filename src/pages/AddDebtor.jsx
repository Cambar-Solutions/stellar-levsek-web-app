import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDebt } from '../contexts/DebtContext'
import { Layout } from '../components/Layout'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Label } from '../components/ui/Input'
import { User, Mail, Phone, DollarSign, ArrowLeft } from 'lucide-react'

export function AddDebtor() {
  const navigate = useNavigate()
  const { addDebtor } = useDebt()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    totalDebt: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name) newErrors.name = 'El nombre es requerido'
    if (!formData.email) newErrors.email = 'El correo es requerido'
    if (!formData.totalDebt || formData.totalDebt <= 0) {
      newErrors.totalDebt = 'El monto de deuda debe ser mayor a 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    addDebtor({
      ...formData,
      totalDebt: parseFloat(formData.totalDebt),
    })

    navigate('/dashboard')
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Volver al Dashboard
        </Button>

        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold text-gray-900">
              Registrar Nuevo Deudor
            </h2>
            <p className="text-gray-600 mt-1">
              Agrega un nuevo deudor a tu registro de cuentas por cobrar
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label required>Nombre completo</Label>
                <Input
                  type="text"
                  placeholder="Juan Pérez"
                  icon={User}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  error={errors.name}
                />
              </div>

              <div>
                <Label required>Correo electrónico</Label>
                <Input
                  type="email"
                  placeholder="juan@email.com"
                  icon={Mail}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  error={errors.email}
                />
              </div>

              <div>
                <Label>Teléfono</Label>
                <Input
                  type="tel"
                  placeholder="+52 555 123 4567"
                  icon={Phone}
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>

              <div>
                <Label required>Monto de la deuda (MXN)</Label>
                <Input
                  type="number"
                  placeholder="1000.00"
                  icon={DollarSign}
                  step="0.01"
                  min="0"
                  value={formData.totalDebt}
                  onChange={(e) =>
                    setFormData({ ...formData, totalDebt: e.target.value })
                  }
                  error={errors.totalDebt}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? 'Registrando...' : 'Registrar Deudor'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
