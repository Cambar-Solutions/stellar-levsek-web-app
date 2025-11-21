import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Label } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'
import {
  ShieldCheck,
  ArrowLeft,
  DollarSign,
  Wallet,
  Copy,
  CheckCircle2,
  Info,
  Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getPublicSiteInfo, getDebtsByCustomer, createPendingPayment } from '../services/debtService'

export function PublicPayment() {
  const { siteId, debtorId: debtorIdParam } = useParams()
  const navigate = useNavigate()
  const [businessData, setBusinessData] = useState(null)
  const [debtor, setDebtor] = useState(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [txReference, setTxReference] = useState('')
  const [processing, setProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [loading, setLoading] = useState(true)

  // Convert IDs from URL params to numbers for comparison
  const debtorId = Number(debtorIdParam)

  useEffect(() => {
    loadPublicData()
  }, [siteId, debtorId])

  const loadPublicData = async () => {
    try {
      setLoading(true)
      const response = await getPublicSiteInfo(siteId)
      const data = response.data || response

      setBusinessData(data.site)

      // Buscar el deudor específico
      const debtors = data.debtors || []
      const foundDebtor = debtors.find((d) => d.id === debtorId)
      setDebtor(foundDebtor)
    } catch (error) {
      console.error('Error loading public data:', error)
      toast.error('Error al cargar información del deudor')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copiado al portapapeles')
  }

  const simulateStellarPayment = async (amount) => {
    // Simulación de pago en Stellar
    return new Promise((resolve) => {
      setTimeout(() => {
        const txHash = `STELLAR_${Math.random().toString(36).substring(2, 15).toUpperCase()}`
        resolve({ success: true, txHash })
      }, 2000) // Simula 2 segundos de procesamiento
    })
  }

  const handlePayment = async (e) => {
    e.preventDefault()

    const amount = parseFloat(paymentAmount)

    if (!amount || amount <= 0) {
      toast.error('Ingresa un monto válido')
      return
    }

    if (amount > debtor.totalDebt) {
      toast.error('El monto excede la deuda pendiente')
      return
    }

    if (!txReference.trim()) {
      toast.error('Ingresa una referencia de transacción')
      return
    }

    setProcessing(true)

    try {
      // Simular pago en Stellar blockchain
      const result = await simulateStellarPayment(amount)

      if (result.success) {
        // Obtener las deudas del cliente para encontrar la primera pendiente
        const debtsResponse = await getDebtsByCustomer(debtor.id)
        const customerDebts = debtsResponse.data || debtsResponse || []

        // Buscar la primera deuda que no esté completamente pagada
        const pendingDebt = customerDebts.find(d => {
          const pending = d.pendingAmount || d.pending_amount || 0
          return pending > 0
        })

        if (!pendingDebt) {
          toast.error('No se encontró una deuda pendiente para este cliente')
          return
        }

        // Crear pending payment (NO actualiza la deuda todavía)
        await createPendingPayment({
          debtId: pendingDebt.id,
          customerId: debtor.id,
          amount: amount,
          paymentType: 'stellar',
          reference: txReference,
          notes: `Pago público desde Stellar - TxHash: ${result.txHash}`,
          stellarTxHash: result.txHash
        })

        console.log('✅ Pending payment creado en el backend:', result.txHash)

        // Recargar datos para reflejar el nuevo estado
        await loadPublicData()

        setPaymentSuccess(true)
        toast.success('¡Pago registrado exitosamente! Será revisado por el administrador.')
      }
    } catch (error) {
      console.error('Error al procesar el pago:', error)
      toast.error('Error al procesar el pago')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-12 text-center">
            <Loader2 className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600 dark:text-gray-300">Cargando información...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!businessData || !debtor) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-12 text-center">
            <Info className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Deudor no encontrado</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">No se pudo cargar la información del deudor.</p>
            <Button onClick={() => navigate(`/public/${siteId}`)} variant="primary">
              Volver al Registro Público
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              ¡Pago Registrado!
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Tu pago de <span className="font-bold text-green-600 dark:text-green-400">{formatCurrency(parseFloat(paymentAmount))}</span> ha sido
              registrado exitosamente en la blockchain de Stellar
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-8 text-left">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-900 dark:text-blue-200 font-semibold mb-2">
                    Próximos pasos:
                  </p>
                  <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                    <li>• Tu pago está ahora <strong>en revisión</strong></li>
                    <li>• El administrador de {businessData.name} lo verificará</li>
                    <li>• Recibirás confirmación una vez aprobado</li>
                    <li>• El saldo se actualizará automáticamente</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="ghost"
                onClick={() => navigate(`/public/${siteId}`)}
                className="flex-1"
              >
                Ver Registro Público
              </Button>
              <Button
                variant="primary"
                onClick={() => window.location.reload()}
                className="flex-1"
              >
                Realizar Otro Pago
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {businessData.name}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">Portal de Pagos Públicos</p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/public/${siteId}`)}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Volver</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Debtor Info */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Información del Deudor
              </h3>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Avatar name={debtor.name} size="lg" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{debtor.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">{debtor.email}</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-4">
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">Saldo Pendiente</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(debtor.totalDebt)}
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Cuenta</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {debtor.accountType}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Wallet Address</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono text-gray-700 dark:text-gray-200 flex-1">
                      {debtor.walletAddress}
                    </code>
                    <button
                      onClick={() => copyToClipboard(debtor.walletAddress)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Realizar Pago
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Paga tu deuda a través de Stellar Blockchain
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handlePayment} className="space-y-5">
                <div>
                  <Label required>Monto a pagar (MXN)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    icon={DollarSign}
                    step="0.01"
                    min="0.01"
                    max={debtor.totalDebt}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    disabled={processing}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">
                    Máximo: {formatCurrency(debtor.totalDebt)}
                  </p>
                </div>

                <div>
                  <Label required>Referencia / Concepto</Label>
                  <Input
                    type="text"
                    placeholder="Ej: Pago parcial abono 1"
                    value={txReference}
                    onChange={(e) => setTxReference(e.target.value)}
                    disabled={processing}
                  />
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
                        Wallet de Destino
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono text-blue-700 dark:text-blue-300">
                          {businessData.walletAddress}
                        </code>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(businessData.walletAddress)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-yellow-700 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-800 dark:text-yellow-300">
                      <p className="font-semibold mb-1">Importante:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• El pago será registrado en la blockchain Stellar</li>
                        <li>• Tu pago entrará en estado de revisión</li>
                        <li>• El administrador lo verificará en 24-48 horas</li>
                        <li>• Recibirás confirmación una vez aprobado</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Procesando en Stellar...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={20} />
                      Pagar con Stellar
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-gray-500 dark:text-gray-400 dark:text-gray-500">
                  Transacción segura verificada por Stellar Blockchain
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
