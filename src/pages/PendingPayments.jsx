import { useDebt } from '../contexts/DebtContext'
import { Layout } from '../components/Layout'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'
import {
  Clock,
  Check,
  X,
  DollarSign,
  Copy,
  User,
  Calendar,
  AlertCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'

export function PendingPayments() {
  const { debtors, approvePayment, rejectPayment } = useDebt()

  // Obtener todos los pagos pendientes de revisión
  const pendingPayments = debtors
    .flatMap((debtor) =>
      debtor.payments
        .filter((p) => p.status === 'reviewing')
        .map((payment) => ({
          ...payment,
          debtor: debtor,
        }))
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copiado al portapapeles')
  }

  const handleApprove = (debtorId, paymentId) => {
    if (window.confirm('¿Aprobar este pago?')) {
      approvePayment(debtorId, paymentId)
    }
  }

  const handleReject = (debtorId, paymentId) => {
    if (window.confirm('¿Rechazar y eliminar este pago?')) {
      rejectPayment(debtorId, paymentId)
    }
  }

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Pagos Pendientes de Revisión
          </h1>
        </div>
        <p className="text-gray-600">
          Revisa y aprueba los pagos realizados por tus deudores
        </p>
      </div>

      {/* Alert */}
      {pendingPayments.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-orange-900 mb-1">
                Tienes {pendingPayments.length} pago{pendingPayments.length !== 1 ? 's' : ''} pendiente{pendingPayments.length !== 1 ? 's' : ''} de revisión
              </p>
              <p className="text-xs text-orange-700">
                Revisa la información y aprueba o rechaza cada pago
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payments List */}
      {pendingPayments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay pagos pendientes
            </h3>
            <p className="text-gray-600">
              Todos los pagos han sido revisados
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingPayments.map((payment) => (
            <Card key={payment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left: Payment Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={payment.debtor.name} size="lg" />
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">
                            {payment.debtor.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {payment.debtor.email}
                          </p>
                        </div>
                      </div>
                      <Badge variant="warning">En Revisión</Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <p className="text-xs text-green-700 font-medium">
                            Monto del Pago
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-green-700">
                          {formatCurrency(payment.amount)}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-4 h-4 text-gray-600" />
                          <p className="text-xs text-gray-600 font-medium">
                            Fecha de Pago
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatDate(payment.date)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 p-4 bg-blue-50 rounded-xl">
                      <div>
                        <p className="text-xs text-blue-700 font-medium mb-1">
                          Transaction Hash
                        </p>
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono text-blue-900 flex-1">
                            {payment.txHash}
                          </code>
                          <button
                            onClick={() => copyToClipboard(payment.txHash)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                      </div>

                      {payment.reference && (
                        <div>
                          <p className="text-xs text-blue-700 font-medium mb-1">
                            Referencia / Concepto
                          </p>
                          <p className="text-sm text-blue-900 font-medium">
                            {payment.reference}
                          </p>
                        </div>
                      )}

                      {payment.publicPayment && (
                        <div className="flex items-center gap-2 text-xs text-blue-700">
                          <AlertCircle size={14} />
                          <span>Pago realizado desde portal público</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Deuda actual del cliente:</span>
                        <span className="font-bold text-gray-900">
                          {formatCurrency(payment.debtor.totalDebt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-gray-600">Después del pago:</span>
                        <span className="font-bold text-green-600">
                          {formatCurrency(payment.debtor.totalDebt - payment.amount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="lg:w-48 flex flex-col gap-3">
                    <Button
                      variant="success"
                      size="lg"
                      onClick={() => handleApprove(payment.debtor.id, payment.id)}
                      className="flex items-center justify-center gap-2"
                    >
                      <Check size={20} />
                      Aprobar
                    </Button>
                    <Button
                      variant="danger"
                      size="lg"
                      onClick={() => handleReject(payment.debtor.id, payment.id)}
                      className="flex items-center justify-center gap-2"
                    >
                      <X size={20} />
                      Rechazar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  )
}
