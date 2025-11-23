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
  AlertCircle,
  TrendingDown,
  Sparkles,
  CreditCard,
  Lock,
  Check,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getPublicSiteInfo, getDebtsByCustomer, createPendingPayment } from '../services/debtService'
import confetti from 'canvas-confetti'

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
  const [amountError, setAmountError] = useState('')
  const [referenceError, setReferenceError] = useState('')
  const [focusedField, setFocusedField] = useState(null)

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

      // Find the specific debtor
      const debtors = data.debtors || []
      const foundDebtor = debtors.find((d) => d.id === debtorId)
      setDebtor(foundDebtor)
    } catch (error) {
      console.error('Error loading public data:', error)
      toast.error('Error loading debtor information')
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
    toast.success('Copied to clipboard', {
      icon: '📋',
      style: {
        borderRadius: '12px',
        background: '#333',
        color: '#fff',
      },
    })
  }

  const validateAmount = (value) => {
    const amount = parseFloat(value)

    if (!value || value.trim() === '') {
      setAmountError('Amount is required')
      return false
    }

    if (isNaN(amount) || amount <= 0) {
      setAmountError('Enter a valid amount greater than $0')
      return false
    }

    if (amount > debtor.totalDebt) {
      setAmountError(`Amount exceeds debt of ${formatCurrency(debtor.totalDebt)}`)
      return false
    }

    setAmountError('')
    return true
  }

  const validateReference = (value) => {
    if (!value || value.trim() === '') {
      setReferenceError('Reference is required')
      return false
    }

    if (value.trim().length < 3) {
      setReferenceError('Reference must be at least 3 characters')
      return false
    }

    setReferenceError('')
    return true
  }

  const handleAmountChange = (e) => {
    const value = e.target.value
    setPaymentAmount(value)
    if (value) {
      validateAmount(value)
    } else {
      setAmountError('')
    }
  }

  const handleReferenceChange = (e) => {
    const value = e.target.value
    setTxReference(value)
    if (value) {
      validateReference(value)
    } else {
      setReferenceError('')
    }
  }

  const simulateStellarPayment = async (amount) => {
    // Stellar payment simulation
    return new Promise((resolve) => {
      setTimeout(() => {
        const txHash = `STELLAR_${Math.random().toString(36).substring(2, 15).toUpperCase()}`
        resolve({ success: true, txHash })
      }, 2000) // Simulates 2 seconds of processing
    })
  }

  const celebrateSuccess = () => {
    const duration = 5000
    const animationEnd = Date.now() + duration

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now()
      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)

      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        origin: {
          x: Math.random(),
          y: Math.random() - 0.2
        },
        colors: ['#10b981', '#34d399', '#6ee7b7', '#3b82f6', '#60a5fa']
      })
    }, 250)
  }

  const handlePayment = async (e) => {
    e.preventDefault()

    // Validate both fields
    const isAmountValid = validateAmount(paymentAmount)
    const isReferenceValid = validateReference(txReference)

    if (!isAmountValid || !isReferenceValid) {
      toast.error('Please correct the errors before continuing', {
        icon: '⚠️',
      })
      return
    }

    const amount = parseFloat(paymentAmount)
    setProcessing(true)

    try {
      // Simulate payment on Stellar blockchain
      const result = await simulateStellarPayment(amount)

      if (result.success) {
        // Get customer debts to find the first pending one
        const debtsResponse = await getDebtsByCustomer(debtor.id)
        const customerDebts = debtsResponse.data || debtsResponse || []

        // Find the first debt that is not fully paid
        const pendingDebt = customerDebts.find(d => {
          const pending = d.pendingAmount || d.pending_amount || 0
          return pending > 0
        })

        if (!pendingDebt) {
          toast.error('No pending debt found for this customer')
          return
        }

        // Create pending payment (does NOT update the debt yet)
        await createPendingPayment({
          debtId: pendingDebt.id,
          customerId: debtor.id,
          amount: amount,
          paymentType: 'stellar',
          reference: txReference,
          notes: `Public payment from Stellar - TxHash: ${result.txHash}`,
          stellarTxHash: result.txHash
        })

        console.log('✅ Pending payment creado en el backend:', result.txHash)

        // Reload data to reflect the new state
        await loadPublicData()

        // Celebration
        celebrateSuccess()
        setPaymentSuccess(true)

        toast.success('Payment registered successfully!', {
          icon: '🎉',
          duration: 4000,
        })
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      toast.error('Error processing payment. Please try again.', {
        icon: '❌',
      })
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-purple-200 dark:border-purple-800 border-t-purple-600 dark:border-t-purple-400 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600 dark:text-purple-400 animate-pulse" />
            </div>
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 animate-pulse">
            Loading payment information...
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Connecting to Stellar Blockchain
          </p>
        </div>
      </div>
    )
  }

  if (!businessData || !debtor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 sm:p-8 md:p-12 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">Debtor not found</h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">Could not load debtor information.</p>
            <Button onClick={() => navigate(`/public/${siteId}`)} variant="primary" className="mx-auto">
              Back to Public Registry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-3xl w-full shadow-2xl">
          <CardContent className="p-6 sm:p-8 md:p-12 text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-2xl animate-bounce">
              <CheckCircle2 className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-white" />
            </div>

            <div className="mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Payment Registered Successfully! 🎉
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300">
                Your payment of <span className="font-bold text-green-600 dark:text-green-400">{formatCurrency(parseFloat(paymentAmount))}</span> has been
                registered on the Stellar blockchain
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                    <p className="text-xs sm:text-sm font-semibold text-green-700 dark:text-green-300">Amount Paid</p>
                  </div>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(parseFloat(paymentAmount))}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-700">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                    <p className="text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-300">Remaining Debt (estimated)</p>
                  </div>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(debtor.totalDebt - parseFloat(paymentAmount))}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-700 mb-6 sm:mb-8">
              <CardContent className="p-4 sm:p-6 text-left">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                    <Info className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-indigo-900 dark:text-indigo-100 mb-2 sm:mb-3">
                      What's next?
                    </h3>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-indigo-200 dark:bg-indigo-800 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs sm:text-sm font-bold text-indigo-700 dark:text-indigo-300">1</span>
                        </div>
                        <p className="text-xs sm:text-sm text-indigo-800 dark:text-indigo-200 pt-1">
                          Your payment is now <strong className="text-indigo-900 dark:text-indigo-100">under review</strong> by the {businessData.name} team
                        </p>
                      </div>
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-indigo-200 dark:bg-indigo-800 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs sm:text-sm font-bold text-indigo-700 dark:text-indigo-300">2</span>
                        </div>
                        <p className="text-xs sm:text-sm text-indigo-800 dark:text-indigo-200 pt-1">
                          The administrator will verify the transaction on the Stellar blockchain
                        </p>
                      </div>
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-indigo-200 dark:bg-indigo-800 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs sm:text-sm font-bold text-indigo-700 dark:text-indigo-300">3</span>
                        </div>
                        <p className="text-xs sm:text-sm text-indigo-800 dark:text-indigo-200 pt-1">
                          Once approved, your debt will be automatically updated in the system
                        </p>
                      </div>
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <p className="text-xs sm:text-sm text-indigo-800 dark:text-indigo-200 pt-1">
                          Estimated review time: <strong className="text-indigo-900 dark:text-indigo-100">24-48 hours</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="ghost"
                size="lg"
                onClick={() => navigate(`/public/${siteId}`)}
                className="flex-1"
              >
                View Public Registry
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={() => window.location.reload()}
                className="flex-1 shadow-lg"
              >
                Make Another Payment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const remainingDebt = debtor.totalDebt - (parseFloat(paymentAmount) || 0)
  const percentagePaid = paymentAmount ? ((parseFloat(paymentAmount) / debtor.totalDebt) * 100).toFixed(1) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                <button
                  onClick={() => navigate(`/public/${siteId}`)}
                  className="flex items-center gap-1 sm:gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors hover:scale-105 flex-shrink-0"
                >
                  <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
                  <span className="font-medium text-sm sm:text-base">Back</span>
                </button>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate">
                    {businessData.name}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">Public Payment Portal</p>
                </div>
              </div>
              <Badge variant="success" className="flex items-center gap-2 shadow-lg text-xs sm:text-sm flex-shrink-0">
                <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                Secure Payment
              </Badge>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Debtor Info - 2/5 of space */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <Card className="shadow-xl border-2 border-purple-200 dark:border-purple-800">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-b border-purple-200 dark:border-purple-800">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                    Debtor Information
                  </h3>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  {/* Avatar and name */}
                  <div className="flex items-center gap-3 sm:gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="relative flex-shrink-0">
                      <Avatar name={debtor.name} size="xl" />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white truncate">{debtor.name}</h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">{debtor.email}</p>
                    </div>
                  </div>

                  {/* Current debt */}
                  <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl sm:rounded-2xl p-4 sm:p-5 border-2 border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
                      <p className="text-xs sm:text-sm font-bold text-red-700 dark:text-red-300 uppercase tracking-wider">
                        Current Outstanding Balance
                      </p>
                    </div>
                    <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-red-600 dark:text-red-400 mb-2 break-words">
                      {formatCurrency(debtor.totalDebt)}
                    </p>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-red-600 dark:text-red-400">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0"></div>
                      <span>Active debt</span>
                    </div>
                  </div>

                  {/* Account type */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                      <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">Account</p>
                    </div>
                    <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                      {debtor.accountType}
                    </p>
                  </div>

                  {/* Wallet address - IMPROVED with word-break */}
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-3 sm:p-4 border border-indigo-200 dark:border-indigo-800">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                      <p className="text-xs sm:text-sm font-bold text-indigo-700 dark:text-indigo-300 uppercase">Wallet Address</p>
                    </div>
                    <div className="bg-white/50 dark:bg-black/20 rounded-lg p-2 sm:p-3 mb-2 sm:mb-3">
                      <code className="text-xs sm:text-sm font-mono text-indigo-900 dark:text-indigo-100 break-all block leading-relaxed">
                        {debtor.walletAddress}
                      </code>
                    </div>
                    <button
                      onClick={() => copyToClipboard(debtor.walletAddress)}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-lg py-2 px-3 sm:px-4 transition-all hover:scale-105 shadow-md"
                    >
                      <Copy size={14} className="sm:w-4 sm:h-4" />
                      <span className="font-semibold text-xs sm:text-sm">Copy Address</span>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Form - 3/5 of space */}
            <div className="lg:col-span-3">
              <Card className="shadow-2xl border-2 border-blue-200 dark:border-blue-800">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-b border-blue-200 dark:border-blue-800">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                        <span>Make Payment</span>
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Pay your debt through Stellar Blockchain
                      </p>
                    </div>
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 md:p-8">
                  <form onSubmit={handlePayment} className="space-y-4 sm:space-y-6">
                    {/* Amount to pay */}
                    <div>
                      <Label required className="text-sm sm:text-base">Amount to pay (MXN)</Label>
                      <div className="relative mt-2">
                        <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2">
                          <DollarSign className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${
                            focusedField === 'amount' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                          }`} />
                        </div>
                        <Input
                          type="number"
                          placeholder="0.00"
                          step="0.01"
                          min="0.01"
                          max={debtor.totalDebt}
                          value={paymentAmount}
                          onChange={handleAmountChange}
                          onFocus={() => setFocusedField('amount')}
                          onBlur={() => setFocusedField(null)}
                          disabled={processing}
                          className={`pl-12 sm:pl-14 pr-3 sm:pr-4 py-3 sm:py-4 text-base sm:text-lg font-semibold border-2 transition-all ${
                            amountError
                              ? 'border-red-500 focus:border-red-600'
                              : focusedField === 'amount'
                              ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                        />
                      </div>
                      {amountError ? (
                        <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>{amountError}</span>
                        </p>
                      ) : (
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2">
                          Maximum: <span className="font-semibold">{formatCurrency(debtor.totalDebt)}</span>
                        </p>
                      )}
                    </div>

                    {/* Payment preview */}
                    {paymentAmount && !amountError && parseFloat(paymentAmount) > 0 && (
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-green-200 dark:border-green-700 animate-fadeIn">
                        <div className="flex items-center gap-2 mb-3 sm:mb-4">
                          <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                          <h4 className="text-xs sm:text-sm font-bold text-green-700 dark:text-green-300 uppercase">Payment Preview</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                          <div>
                            <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 mb-1">You will pay</p>
                            <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-700 dark:text-green-300 break-words">
                              {formatCurrency(parseFloat(paymentAmount))}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 mb-1">Remaining debt</p>
                            <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-700 dark:text-green-300 break-words">
                              {formatCurrency(remainingDebt)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-green-200 dark:border-green-700">
                          <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
                            <span className="text-green-700 dark:text-green-300 font-medium">Debt reduction</span>
                            <span className="text-green-700 dark:text-green-300 font-bold">{percentagePaid}%</span>
                          </div>
                          <div className="w-full bg-green-200 dark:bg-green-900/50 rounded-full h-2 sm:h-3 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-green-500 to-emerald-600 h-full transition-all duration-500 rounded-full"
                              style={{ width: `${Math.min(100, percentagePaid)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Reference */}
                    <div>
                      <Label required className="text-sm sm:text-base">Reference / Description</Label>
                      <div className="relative mt-2">
                        <Input
                          type="text"
                          placeholder="Ex: Partial payment installment 1"
                          value={txReference}
                          onChange={handleReferenceChange}
                          onFocus={() => setFocusedField('reference')}
                          onBlur={() => setFocusedField(null)}
                          disabled={processing}
                          className={`pr-3 sm:pr-4 py-3 sm:py-4 text-sm sm:text-base border-2 transition-all ${
                            referenceError
                              ? 'border-red-500 focus:border-red-600'
                              : focusedField === 'reference'
                              ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                        />
                      </div>
                      {referenceError && (
                        <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>{referenceError}</span>
                        </p>
                      )}
                    </div>

                    {/* Destination wallet */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-purple-200 dark:border-purple-700">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900/50 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                          <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-purple-700 dark:text-purple-300 mb-2">
                            Destination Wallet
                          </p>
                          <div className="bg-white/50 dark:bg-black/20 rounded-lg p-2 sm:p-3 mb-2">
                            <code className="text-xs sm:text-sm font-mono text-purple-900 dark:text-purple-100 break-all block">
                              {businessData.walletAddress}
                            </code>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(businessData.walletAddress)}
                            className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-semibold flex items-center gap-1 transition-colors"
                          >
                            <Copy size={14} className="flex-shrink-0" />
                            <span>Copy address</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Important info */}
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                          <Info className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-700 dark:text-yellow-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base font-bold text-yellow-900 dark:text-yellow-100 mb-2">Important:</p>
                          <ul className="space-y-2 text-xs sm:text-sm text-yellow-800 dark:text-yellow-200">
                            <li className="flex items-start gap-2">
                              <span className="text-yellow-600 dark:text-yellow-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                              <span>Payment will be registered on the Stellar blockchain</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-yellow-600 dark:text-yellow-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                              <span>Your payment will enter <strong>review</strong> status</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-yellow-600 dark:text-yellow-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                              <span>Administrator will verify it within 24-48 hours</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-yellow-600 dark:text-yellow-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                              <span>You will receive confirmation once approved</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Payment button */}
                    <Button
                      type="submit"
                      variant="primary"
                      size="xl"
                      className="w-full shadow-2xl hover:shadow-blue-500/50 transition-all hover:scale-105"
                      disabled={processing || !!amountError || !!referenceError}
                    >
                      {processing ? (
                        <>
                          <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                          <span className="text-base sm:text-lg">Processing on Stellar...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={20} className="sm:w-6 sm:h-6" />
                          <span className="text-base sm:text-lg font-bold">Pay with Stellar</span>
                        </>
                      )}
                    </Button>

                    <p className="text-xs sm:text-sm text-center text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
                      <Lock size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                      <span>Secure transaction verified by Stellar Blockchain</span>
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
