import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDebt } from '../contexts/DebtContext'
import { Layout } from '../components/Layout'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Label } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'
import {
  ArrowLeft,
  DollarSign,
  Mail,
  Phone,
  Wallet,
  Copy,
  CheckCircle2,
  Clock,
  ExternalLink,
  AlertCircle,
  Check,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'

export function DebtorDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { debtors, addPayment, approvePayment, rejectPayment } = useDebt()
  const [paymentAmount, setPaymentAmount] = useState('')
  const [showPaymentForm, setShowPaymentForm] = useState(false)

  // Convert id from URL params to number for comparison
  const debtorId = Number(id)
  const debtor = debtors.find((d) => d.id === debtorId)

  if (!debtor) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-600">Deudor no encontrado</p>
          <Button
            variant="primary"
            onClick={() => navigate('/dashboard')}
            className="mt-4"
          >
            Volver al Dashboard
          </Button>
        </div>
      </Layout>
    )
  }

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
    })
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copiado al portapapeles')
  }

  const handleAddPayment = (e) => {
    e.preventDefault()
    const amount = parseFloat(paymentAmount)

    if (!amount || amount <= 0) {
      toast.error('Ingresa un monto válido')
      return
    }

    addPayment(debtor.id, {
      amount,
    })

    setPaymentAmount('')
    setShowPaymentForm(false)
  }

  const handleApprovePayment = (paymentId) => {
    if (window.confirm('¿Aprobar este pago?')) {
      approvePayment(debtor.id, paymentId)
    }
  }

  const handleRejectPayment = (paymentId) => {
    if (window.confirm('¿Rechazar y eliminar este pago?')) {
      rejectPayment(debtor.id, paymentId)
    }
  }

  const totalPaid = debtor.payments
    .filter((p) => p.status === 'verified')
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Volver al Dashboard
        </Button>

        {/* Debtor Info Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <Avatar name={debtor.name} size="xl" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {debtor.name}
                  </h1>
                  <Badge
                    variant={debtor.status === 'verified' ? 'verified' : 'pending'}
                    className="mt-2"
                  >
                    {debtor.status === 'verified' ? 'Verificado' : 'Pendiente'}
                  </Badge>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white min-w-[250px]">
                <p className="text-sm text-blue-100 mb-1">Saldo Pendiente</p>
                <p className="text-3xl font-bold">{formatCurrency(debtor.totalDebt)}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
              <InfoItem icon={<Mail size={18} />} label="Email" value={debtor.email} />
              <InfoItem
                icon={<Phone size={18} />}
                label="Teléfono"
                value={debtor.phone || 'No registrado'}
              />
              <InfoItem
                icon={<Wallet size={18} />}
                label="Wallet"
                value={debtor.walletAddress}
                copyable
                onCopy={() => copyToClipboard(debtor.walletAddress)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-gray-600 mb-1">Total Pagado</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totalPaid)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-gray-600 mb-1">Pagos Registrados</p>
              <p className="text-2xl font-bold text-blue-600">
                {debtor.payments.length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-gray-600 mb-1">Cuenta desde</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatDate(debtor.createdAt)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Add Payment Button */}
        {debtor.totalDebt > 0 && !showPaymentForm && (
          <Button
            variant="primary"
            size="lg"
            onClick={() => setShowPaymentForm(true)}
            className="w-full mb-6"
          >
            <DollarSign size={20} />
            Registrar Pago
          </Button>
        )}

        {/* Payment Form */}
        {showPaymentForm && (
          <Card className="mb-6">
            <CardHeader>
              <h3 className="text-lg font-bold text-gray-900">Registrar Nuevo Pago</h3>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleAddPayment} className="space-y-4">
                <div>
                  <Label required>Monto del pago (MXN)</Label>
                  <Input
                    type="number"
                    placeholder="1000.00"
                    icon={DollarSign}
                    step="0.01"
                    min="0"
                    max={debtor.totalDebt}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Máximo: {formatCurrency(debtor.totalDebt)}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowPaymentForm(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1">
                    Confirmar Pago
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Debts Breakdown */}
        {debtor.debts && debtor.debts.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <h3 className="text-lg font-bold text-gray-900">Desglose de Deudas</h3>
              <p className="text-sm text-gray-600 mt-1">
                {debtor.debts.length} {debtor.debts.length === 1 ? 'deuda registrada' : 'deudas registradas'}
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200">
                {debtor.debts.map((debt) => (
                  <div
                    key={debt.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {debt.description || 'Sin descripción'}
                          </h4>
                          <Badge
                            variant={
                              debt.status === 'paid'
                                ? 'verified'
                                : debt.status === 'partial'
                                ? 'warning'
                                : debt.status === 'pending'
                                ? 'pending'
                                : 'default'
                            }
                          >
                            {debt.status === 'paid'
                              ? 'Pagada'
                              : debt.status === 'partial'
                              ? 'Parcial'
                              : debt.status === 'pending'
                              ? 'Pendiente'
                              : debt.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mb-3">
                          Registrada el {formatDate(debt.createdAt)}
                        </p>

                        <div className="grid grid-cols-3 gap-4 mt-3">
                          <div className="bg-blue-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600 mb-1">Monto Total</p>
                            <p className="text-lg font-bold text-blue-600">
                              {formatCurrency(debt.totalAmount)}
                            </p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600 mb-1">Pagado</p>
                            <p className="text-lg font-bold text-green-600">
                              {formatCurrency(debt.paidAmount)}
                            </p>
                          </div>
                          <div className="bg-orange-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600 mb-1">Pendiente</p>
                            <p className="text-lg font-bold text-orange-600">
                              {formatCurrency(debt.pendingAmount)}
                            </p>
                          </div>
                        </div>

                        {debt.stellarTxHash && (
                          <div className="mt-3 flex items-center gap-2">
                            <code className="text-xs text-gray-500 font-mono">
                              TX: {debt.stellarTxHash.substring(0, 16)}...
                            </code>
                            <button
                              onClick={() => copyToClipboard(debt.stellarTxHash)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment History */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-bold text-gray-900">Historial de Pagos</h3>
          </CardHeader>
          <CardContent className="p-0">
            {debtor.payments.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                No hay pagos registrados
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {debtor.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            payment.status === 'verified'
                              ? 'bg-green-100'
                              : payment.status === 'reviewing'
                              ? 'bg-orange-100'
                              : 'bg-gray-100'
                          }`}
                        >
                          {payment.status === 'verified' ? (
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                          ) : payment.status === 'reviewing' ? (
                            <Clock className="w-6 h-6 text-orange-600" />
                          ) : (
                            <AlertCircle className="w-6 h-6 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(payment.amount)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(payment.date)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            payment.status === 'verified'
                              ? 'verified'
                              : payment.status === 'reviewing'
                              ? 'warning'
                              : 'default'
                          }
                        >
                          {payment.status === 'verified'
                            ? 'Verificado'
                            : payment.status === 'reviewing'
                            ? 'En Revisión'
                            : 'Pendiente'}
                        </Badge>
                        <div className="flex items-center gap-2 mt-2">
                          <code className="text-xs text-gray-500 font-mono">
                            TX: {payment.txHash}
                          </code>
                          <button
                            onClick={() => copyToClipboard(payment.txHash)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Botones de aprobación/rechazo para pagos en revisión */}
                    {payment.status === 'reviewing' && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleApprovePayment(payment.id)}
                          className="flex-1 flex items-center justify-center gap-2"
                        >
                          <Check size={16} />
                          Aprobar Pago
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRejectPayment(payment.id)}
                          className="flex-1 flex items-center justify-center gap-2"
                        >
                          <X size={16} />
                          Rechazar
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

function InfoItem({ icon, label, value, copyable, onCopy }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-900 truncate">{value}</p>
          {copyable && (
            <button
              onClick={onCopy}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              <Copy size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
