import { useEffect, useState } from 'react'
import { useDebt } from '../contexts/DebtContext'
import { useConfirm } from '../hooks/useConfirm'
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
  TrendingUp,
  Activity,
  Zap,
} from 'lucide-react'
import toast from 'react-hot-toast'
import confetti from 'canvas-confetti'

export function PendingPayments() {
  const { debtors, approvePayment, rejectPayment, reloadData } = useDebt()
  const { confirm, ConfirmDialog } = useConfirm()
  const [processingPayments, setProcessingPayments] = useState(new Set())

  // Recargar datos solo al entrar a la vista
  useEffect(() => {
    reloadData()
  }, [])

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

  // Detectar pagos nuevos (últimos 5 minutos)
  const isNewPayment = (paymentDate) => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    return new Date(paymentDate) > fiveMinutesAgo
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
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copiado al portapapeles')
  }

  // Efecto de confetti al aprobar pago
  const celebrateApproval = () => {
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)

      // Confetti desde la izquierda
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0']
      })

      // Confetti desde la derecha
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe']
      })
    }, 250)
  }

  const handleApprove = async (debtorId, paymentId, amount) => {
    const confirmed = await confirm({
      title: 'Aprobar pago',
      message: `¿Confirmas que quieres aprobar este pago de ${formatCurrency(amount)}? El saldo del deudor se actualizará automáticamente.`,
      type: 'success',
      confirmText: 'Aprobar',
      cancelText: 'Cancelar'
    })

    if (confirmed) {
      setProcessingPayments(prev => new Set(prev).add(paymentId))

      try {
        await toast.promise(
          approvePayment(debtorId, paymentId),
          {
            loading: 'Aprobando pago y actualizando deuda...',
            success: '¡Pago aprobado! La deuda ha sido actualizada correctamente.',
            error: (err) => `Error: ${err.message || 'Error al aprobar el pago'}`
          }
        )

        // Celebración con confetti al aprobar exitosamente
        celebrateApproval()
      } catch (error) {
        console.error('Error approving payment:', error)
      } finally {
        setProcessingPayments(prev => {
          const newSet = new Set(prev)
          newSet.delete(paymentId)
          return newSet
        })
      }
    }
  }

  const handleReject = async (debtorId, paymentId) => {
    const confirmed = await confirm({
      title: 'Rechazar pago',
      message: '¿Estás seguro de rechazar este pago? Esta acción no se puede deshacer.',
      type: 'danger',
      confirmText: 'Rechazar',
      cancelText: 'Cancelar'
    })

    if (confirmed) {
      setProcessingPayments(prev => new Set(prev).add(paymentId))

      try {
        await toast.promise(
          rejectPayment(debtorId, paymentId),
          {
            loading: 'Rechazando pago...',
            success: 'Pago rechazado exitosamente',
            error: (err) => `Error: ${err.message || 'Error al rechazar el pago'}`
          }
        )
      } catch (error) {
        console.error('Error rejecting payment:', error)
      } finally {
        setProcessingPayments(prev => {
          const newSet = new Set(prev)
          newSet.delete(paymentId)
          return newSet
        })
      }
    }
  }

  // Calcular estadísticas en tiempo real
  const totalPendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0)
  const newPaymentsCount = pendingPayments.filter(p => isNewPayment(p.date)).length

  return (
    <Layout>
      <ConfirmDialog />

      {/* Header with Real-time Stats */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Pagos Pendientes de Revisión
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Gestiona y aprueba pagos de forma rápida y segura
            </p>
          </div>
        </div>

        {/* Stats Cards - Innovación: Dashboard en tiempo real */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                    Pagos Pendientes
                  </p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                    {pendingPayments.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-700 dark:text-blue-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                    Monto Total
                  </p>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                    {formatCurrency(totalPendingAmount)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-700 dark:text-green-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">
                    Pagos Nuevos
                  </p>
                  <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                    {newPaymentsCount}
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-400">últimos 5 min</p>
                </div>
                <div className="w-12 h-12 bg-purple-200 dark:bg-purple-800 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-purple-700 dark:text-purple-300 animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Alert */}
      {pendingPayments.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border border-orange-200 dark:border-orange-700 rounded-xl p-4 mb-6 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-orange-900 dark:text-orange-100 mb-1">
                Tienes {pendingPayments.length} pago{pendingPayments.length !== 1 ? 's' : ''} pendiente{pendingPayments.length !== 1 ? 's' : ''} de revisión
              </p>
              <p className="text-xs text-orange-700 dark:text-orange-300">
                Revisa la información y aprueba o rechaza cada pago para actualizar los saldos
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payments List */}
      {pendingPayments.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-200 dark:border-gray-700">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No hay pagos pendientes
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Todos los pagos han sido revisados
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingPayments.map((payment) => {
            const isProcessing = processingPayments.has(payment.id)
            const isNew = isNewPayment(payment.date)

            return (
              <Card
                key={payment.id}
                className={`hover:shadow-lg transition-all duration-300 ${
                  isNew ? 'ring-2 ring-purple-400 dark:ring-purple-600 animate-pulse-slow' : ''
                } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left: Payment Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={payment.debtor.name} size="lg" />
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                              {payment.debtor.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {payment.debtor.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="warning">En Revisión</Badge>
                          {isNew && (
                            <Badge variant="success" className="animate-bounce">
                              ¡Nuevo!
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-700">
                          <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <p className="text-xs text-green-700 dark:text-green-300 font-medium">
                              Monto del Pago
                            </p>
                          </div>
                          <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                            {formatCurrency(payment.amount)}
                          </p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                              Fecha de Pago
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {formatDate(payment.date)}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                        <div>
                          <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">
                            Transaction Hash
                          </p>
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-mono text-blue-900 dark:text-blue-100 flex-1 break-all">
                              {payment.txHash}
                            </code>
                            <button
                              onClick={() => copyToClipboard(payment.txHash)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                            >
                              <Copy size={16} />
                            </button>
                          </div>
                        </div>

                        {payment.reference && (
                          <div>
                            <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">
                              Referencia / Concepto
                            </p>
                            <p className="text-sm text-blue-900 dark:text-blue-100 font-medium">
                              {payment.reference}
                            </p>
                          </div>
                        )}

                        {payment.publicPayment && (
                          <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300 pt-2 border-t border-blue-200 dark:border-blue-700">
                            <Activity size={14} />
                            <span>Pago realizado desde portal público</span>
                          </div>
                        )}
                      </div>

                      {/* Innovación: Visualización de impacto del pago */}
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                          <TrendingUp size={14} />
                          IMPACTO DEL PAGO
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Deuda actual:</span>
                            <span className="font-bold text-red-600 dark:text-red-400">
                              {formatCurrency(payment.debtor.totalDebt)}
                            </span>
                          </div>
                          <div className="relative pt-2">
                            <div className="flex mb-2 items-center justify-between">
                              <div>
                                <span className="text-xs font-semibold inline-block text-green-600 dark:text-green-400">
                                  Después del pago:
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-semibold inline-block text-green-600 dark:text-green-400">
                                  {formatCurrency(payment.debtor.totalDebt - payment.amount)}
                                </span>
                              </div>
                            </div>
                            <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                              <div
                                style={{ width: `${Math.min(100, (payment.amount / payment.debtor.totalDebt) * 100)}%` }}
                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-green-400 to-green-600"
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Reducción del {Math.min(100, ((payment.amount / payment.debtor.totalDebt) * 100).toFixed(1))}% de la deuda
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="lg:w-48 flex flex-col gap-3">
                      <Button
                        variant="success"
                        size="lg"
                        onClick={() => handleApprove(payment.debtor.id, payment.id, payment.amount)}
                        className="flex items-center justify-center gap-2 hover:scale-105 transition-transform"
                        disabled={isProcessing}
                      >
                        <Check size={20} />
                        Aprobar
                      </Button>
                      <Button
                        variant="danger"
                        size="lg"
                        onClick={() => handleReject(payment.debtor.id, payment.id)}
                        className="flex items-center justify-center gap-2 hover:scale-105 transition-transform"
                        disabled={isProcessing}
                      >
                        <X size={20} />
                        Rechazar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </Layout>
  )
}