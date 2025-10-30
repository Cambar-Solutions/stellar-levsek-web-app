import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDebt } from '../contexts/DebtContext'
import { getAllCustomers, createDebt } from '../services/debtService'
import { useAuth } from '../contexts/AuthContext'
import { Layout } from '../components/Layout'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Label } from '../components/ui/Input'
import { User, Mail, Phone, DollarSign, ArrowLeft, UserCheck } from 'lucide-react'
import toast from 'react-hot-toast'

export function AddDebtor() {
  const navigate = useNavigate()
  const { addDebtor } = useDebt()
  const { user } = useAuth()
  const [customers, setCustomers] = useState([])
  const [mode, setMode] = useState('select') // 'select' or 'new'
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    totalDebt: '',
    description: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      const response = await getAllCustomers()
      const customersData = response.data || response || []
      setCustomers(customersData)
    } catch (error) {
      console.error('Error loading customers:', error)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (mode === 'new') {
      if (!formData.name) newErrors.name = 'El nombre es requerido'
      if (!formData.email) newErrors.email = 'El correo es requerido'
    } else {
      if (!selectedCustomer) newErrors.customer = 'Selecciona un cliente'
    }

    // El monto de deuda ya NO es requerido
    if (formData.totalDebt && parseFloat(formData.totalDebt) < 0) {
      newErrors.totalDebt = 'El monto no puede ser negativo'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      if (mode === 'select' && selectedCustomer) {
        // Crear deuda para cliente existente
        const debtAmount = parseFloat(formData.totalDebt) || 0

        if (debtAmount > 0) {
          await createDebt({
            siteId: user.siteId || 1,
            customerId: selectedCustomer.id,
            createdByUserId: Number(user.id) || 1,
            totalAmount: debtAmount,
            description: formData.description || 'Deuda registrada',
          })
          toast.success('Deuda registrada exitosamente')
        } else {
          toast.info('Cliente seleccionado (sin deuda nueva)')
        }
      } else {
        // Crear nuevo cliente y deuda
        await addDebtor({
          ...formData,
          totalDebt: parseFloat(formData.totalDebt) || 0,
          description: formData.description || 'Deuda inicial',
        })
      }

      navigate('/dashboard')
    } catch (error) {
      console.error('Error:', error)
      toast.error(error.message || 'Error al procesar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Registrar Deuda
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Selecciona un cliente existente o crea uno nuevo
            </p>
          </CardHeader>
          <CardContent className="p-6">
            {/* Mode Selector */}
            <div className="flex gap-4 mb-6 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
              <button
                type="button"
                onClick={() => setMode('select')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  mode === 'select'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:text-white'
                }`}
              >
                <UserCheck className="inline-block w-5 h-5 mr-2" />
                Cliente Existente
              </button>
              <button
                type="button"
                onClick={() => setMode('new')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  mode === 'new'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:text-white'
                }`}
              >
                <User className="inline-block w-5 h-5 mr-2" />
                Cliente Nuevo
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === 'select' ? (
                /* Select Existing Customer */
                <div>
                  <Label required>Seleccionar Cliente</Label>
                  <select
                    value={selectedCustomer?.id || ''}
                    onChange={(e) => {
                      const customer = customers.find(
                        (c) => c.id === Number(e.target.value)
                      )
                      setSelectedCustomer(customer)
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Selecciona un cliente --</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} {customer.last_name} - {customer.email}
                      </option>
                    ))}
                  </select>
                  {errors.customer && (
                    <p className="text-red-500 text-sm mt-1">{errors.customer}</p>
                  )}
                </div>
              ) : (
                /* New Customer Fields */
                <>
                  <div>
                    <Label required>Nombre completo</Label>
                    <Input
                      type="text"
                      placeholder="Juan Pérez García"
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
                </>
              )}

              {/* Debt Amount (Optional) */}
              <div>
                <Label>Monto de la deuda (MXN) - Opcional</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  icon={DollarSign}
                  step="0.01"
                  min="0"
                  value={formData.totalDebt}
                  onChange={(e) =>
                    setFormData({ ...formData, totalDebt: e.target.value })
                  }
                  error={errors.totalDebt}
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Deja en blanco si no hay deuda inicial
                </p>
              </div>

              {/* Description */}
              <div>
                <Label>Descripción / Concepto</Label>
                <textarea
                  placeholder="Motivo de la deuda..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px]"
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
                  {loading ? 'Procesando...' : 'Registrar'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
