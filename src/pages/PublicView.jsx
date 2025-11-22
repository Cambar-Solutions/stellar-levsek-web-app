import { useParams, Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import {
  ShieldCheck,
  Globe,
  TrendingUp,
  Users,
  DollarSign,
  CheckCircle2,
  ExternalLink,
  Copy,
  CreditCard,
  ArrowLeft,
  Sparkles,
  Lock,
  Eye,
  Award,
  Zap,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getPublicSiteInfo } from '../services/debtService'

export function PublicView() {
  const { siteId } = useParams()
  const navigate = useNavigate()
  const [businessData, setBusinessData] = useState(null)
  const [debtors, setDebtors] = useState([])
  const [loading, setLoading] = useState(true)
  const [hoveredCard, setHoveredCard] = useState(null)
  const [viewMode, setViewMode] = useState('cards') // 'cards' or 'table'

  useEffect(() => {
    loadPublicData()
  }, [siteId])

  const loadPublicData = async () => {
    try {
      setLoading(true)
      const response = await getPublicSiteInfo(siteId)
      const data = response.data || response

      setBusinessData(data.site)
      // Filtrar solo deudores que tengan deuda pendiente
      const activeDebtors = (data.debtors || []).filter(debtor => debtor.totalDebt > 0)
      setDebtors(activeDebtors)
    } catch (error) {
      console.error('Error loading public data:', error)
      toast.error('Error al cargar información pública')
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
    toast.success('Copiado al portapapeles', {
      icon: '📋',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    })
  }

  // Calcular estadísticas del negocio
  const totalDebt = debtors.reduce((sum, d) => sum + d.totalDebt, 0)
  const averageDebt = debtors.length > 0 ? totalDebt / debtors.length : 0
  const maxDebt = debtors.length > 0 ? Math.max(...debtors.map(d => d.totalDebt)) : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 animate-pulse">
            Cargando datos públicos...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Verificando en Stellar Blockchain
          </p>
        </div>
      </div>
    )
  }

  if (!businessData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Globe className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Negocio no encontrado
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              La página pública que buscas no existe o ha sido removida
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/login')}
              className="mx-auto"
            >
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Header */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-2 hover:scale-105 transition-transform"
                >
                  <ArrowLeft size={18} />
                  Volver
                </Button>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl relative group">
                  <ShieldCheck className="w-9 h-9 text-white relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {businessData.name}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <Globe className="w-3 h-3 text-green-600 dark:text-green-400" />
                      <span className="text-xs font-semibold text-green-700 dark:text-green-300">Vista Pública</span>
                    </div>
                  </div>
                </div>
              </div>
              <Badge variant="success" className="flex items-center gap-2 px-4 py-2 text-sm shadow-lg">
                <ShieldCheck className="w-4 h-4" />
                Verificado en Stellar
              </Badge>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-slideInRight">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-700 border-0 shadow-xl hover:shadow-2xl transition-all hover:scale-105 group">
              <CardContent className="p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6" />
                  </div>
                  <Sparkles className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-blue-100 text-sm font-medium mb-1">Deudores Activos</p>
                <p className="text-4xl font-bold">{debtors.length}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-700 border-0 shadow-xl hover:shadow-2xl transition-all hover:scale-105 group">
              <CardContent className="p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <TrendingUp className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-purple-100 text-sm font-medium mb-1">Deuda Total</p>
                <p className="text-3xl font-bold">{formatCurrency(totalDebt)}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-pink-500 to-pink-700 border-0 shadow-xl hover:shadow-2xl transition-all hover:scale-105 group">
              <CardContent className="p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Award className="w-6 h-6" />
                  </div>
                  <Zap className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-pink-100 text-sm font-medium mb-1">Promedio</p>
                <p className="text-3xl font-bold">{formatCurrency(averageDebt)}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-700 border-0 shadow-xl hover:shadow-2xl transition-all hover:scale-105 group">
              <CardContent className="p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <CheckCircle2 className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-orange-100 text-sm font-medium mb-1">Deuda Máxima</p>
                <p className="text-3xl font-bold">{formatCurrency(maxDebt)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Blockchain Info Banner */}
          <Card className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 border-0 shadow-2xl overflow-hidden animate-fadeIn">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTEwIDBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0xMCAwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMCAxMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAgMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
            <CardContent className="p-8 text-white relative z-10">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl">
                  <Lock className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <h2 className="text-2xl font-bold">Transparencia Total</h2>
                    <Badge className="bg-white/20 text-white border-white/30">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Blockchain
                    </Badge>
                  </div>
                  <p className="text-white/90 text-lg leading-relaxed mb-6">
                    Este es un registro público y verificable de las deudas de{' '}
                    <span className="font-bold">{businessData.name}</span>. Todos los datos están
                    respaldados por la red Stellar blockchain, garantizando{' '}
                    <span className="font-semibold underline decoration-wavy decoration-white/50">
                      inmutabilidad y transparencia absoluta
                    </span>.
                  </p>
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 px-5 py-4 rounded-2xl group hover:bg-white/20 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <Eye className="w-4 h-4 opacity-75" />
                        <span className="text-sm font-semibold">Wallet Address:</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(businessData.walletAddress)}
                        className="p-2 hover:bg-white/20 rounded-lg transition-all hover:scale-110"
                        title="Copiar dirección"
                      >
                        <Copy size={18} />
                      </button>
                    </div>
                    <code className="font-mono text-sm mt-2 block break-all bg-black/20 px-3 py-2 rounded-lg">
                      {businessData.walletAddress}
                    </code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Debtors List - Cards View */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Users className="w-7 h-7 text-purple-600" />
                  Registro Público de Deudas
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {debtors.length} deudor{debtors.length !== 1 ? 'es' : ''} registrado{debtors.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {debtors.length === 0 ? (
              <Card className="border-2 border-dashed border-gray-300 dark:border-gray-700">
                <CardContent className="p-16 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    No hay deudores registrados
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Aún no existen registros públicos de deudas
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {debtors.map((debtor, index) => (
                  <Card
                    key={debtor.id}
                    className={`group hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 ${
                      hoveredCard === debtor.id
                        ? 'border-purple-400 dark:border-purple-600 shadow-xl'
                        : 'border-transparent'
                    }`}
                    onMouseEnter={() => setHoveredCard(debtor.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: 'slideInRight 0.5s ease-out forwards'
                    }}
                  >
                    <CardContent className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar name={debtor.name} size="lg" />
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full flex items-center justify-center">
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            </div>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                              {debtor.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {debtor.email || debtor.accountType}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={debtor.status === 'verified' ? 'verified' : 'pending'}
                          className="animate-pulse-slow"
                        >
                          {debtor.status === 'verified' ? 'Verificado' : 'Pendiente'}
                        </Badge>
                      </div>

                      {/* Debt Amount */}
                      <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl p-4 mb-4 border border-red-200 dark:border-red-800">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="w-5 h-5 text-red-600 dark:text-red-400" />
                          <p className="text-xs font-semibold text-red-700 dark:text-red-300 uppercase tracking-wider">
                            Saldo Pendiente
                          </p>
                        </div>
                        <p className="text-4xl font-bold text-red-600 dark:text-red-400">
                          {formatCurrency(debtor.totalDebt)}
                        </p>
                        <div className="mt-2 pt-2 border-t border-red-200 dark:border-red-800">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-red-600 dark:text-red-400 font-medium">
                              {((debtor.totalDebt / totalDebt) * 100).toFixed(1)}% del total
                            </span>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span className="text-red-600 dark:text-red-400">Activo</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Wallet Info */}
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Lock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                            Wallet
                          </p>
                        </div>
                        <code className="text-xs text-gray-700 dark:text-gray-300 font-mono break-all block">
                          {debtor.walletAddress}
                        </code>
                      </div>

                      {/* Action Button */}
                      <Link to={`/public/${siteId}/pay/${debtor.id}`} className="block">
                        <Button
                          variant="primary"
                          className="w-full flex items-center justify-center gap-2 group-hover:scale-105 transition-transform shadow-lg"
                          size="lg"
                        >
                          <CreditCard className="w-5 h-5" />
                          <span className="font-semibold">Realizar Pago</span>
                          <ExternalLink className="w-4 h-4 opacity-50" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="mt-12 text-center pb-8 animate-fadeIn">
            <div className="inline-flex flex-col items-center gap-4">
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-gray-200 dark:border-gray-700">
                <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="font-semibold">Datos verificados en Stellar Blockchain</span>
                <Badge variant="success" className="text-xs">
                  Inmutable
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                <Lock className="w-4 h-4" />
                <span>Registro público descentralizado y verificable</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
