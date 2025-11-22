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
    toast.success('Copiado al portapapeles')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-12 text-center">
            <Globe className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Cargando...
            </h2>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!businessData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-12 text-center">
            <Globe className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Negocio no encontrado
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              La página pública que buscas no existe
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/login')}
                className="flex items-center gap-1 sm:gap-2 flex-shrink-0"
              >
                <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden sm:inline">Volver</span>
              </Button>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <ShieldCheck className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate">
                  {businessData.name}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Vista Pública</span>
                </div>
              </div>
            </div>
            <Badge variant="success" className="flex items-center gap-2 flex-shrink-0 text-xs sm:text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="hidden sm:inline">Verificado en Stellar</span>
              <span className="sm:hidden">Verificado</span>
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <Card className="mb-6 sm:mb-8 bg-gradient-to-br from-blue-600 to-purple-700 border-0">
          <CardContent className="p-4 sm:p-6 md:p-8 text-white">
            <div className="flex items-start gap-3 sm:gap-4 mb-4">
              <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2">Transparencia Blockchain</h2>
                <p className="text-blue-100 text-sm sm:text-base md:text-lg leading-relaxed">
                  Este es un registro público y verificable de las deudas de{' '}
                  {businessData.name}. Todos los datos están respaldados por
                  la red Stellar blockchain, garantizando inmutabilidad y transparencia.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-3 rounded-xl mt-4 sm:mt-6">
              <span className="text-xs sm:text-sm font-medium flex-shrink-0">Wallet:</span>
              <code className="font-mono text-xs sm:text-sm flex-1 break-all">{businessData.walletAddress}</code>
              <button
                onClick={() => copyToClipboard(businessData.walletAddress)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0 self-end sm:self-auto"
                aria-label="Copiar wallet address"
              >
                <Copy size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Debtors List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Registro Público de Deudas
              </h2>
              <Badge variant="primary" className="text-xs sm:text-sm">{debtors.length} registros</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {debtors.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                No hay deudores registrados
              </div>
            ) : (
              <>
                {/* Vista Desktop - Tabla */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Deudor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Wallet
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Saldo Pendiente
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Acción
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                      {debtors.map((debtor) => (
                        <tr
                          key={debtor.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar name={debtor.name} />
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {debtor.name}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {debtor.accountType}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <code className="text-xs text-gray-600 dark:text-gray-300 font-mono break-all">
                              {debtor.walletAddress}
                            </code>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <p
                              className={`font-bold text-lg ${
                                debtor.totalDebt > 4000
                                  ? 'text-red-600'
                                  : debtor.totalDebt > 2000
                                  ? 'text-orange-600'
                                  : 'text-gray-900 dark:text-white'
                              }`}
                            >
                              {formatCurrency(debtor.totalDebt)}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Badge
                              variant={
                                debtor.status === 'verified' ? 'verified' : 'pending'
                              }
                            >
                              {debtor.status === 'verified'
                                ? 'Verificado'
                                : 'Pendiente'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {debtor.totalDebt > 0 ? (
                              <Link to={`/public/${siteId}/pay/${debtor.id}`}>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  className="flex items-center gap-2 mx-auto"
                                >
                                  <CreditCard size={16} />
                                  Pagar
                                </Button>
                              </Link>
                            ) : (
                              <span className="text-sm text-gray-400 dark:text-gray-500">Sin deuda</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Vista Mobile - Cards */}
                <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-600">
                  {debtors.map((debtor) => (
                    <div key={debtor.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      {/* Header del Card */}
                      <div className="flex items-start gap-3 mb-3">
                        <Avatar name={debtor.name} />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {debtor.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {debtor.accountType}
                          </p>
                        </div>
                        <Badge
                          variant={debtor.status === 'verified' ? 'verified' : 'pending'}
                          className="text-xs flex-shrink-0"
                        >
                          {debtor.status === 'verified' ? 'Verificado' : 'Pendiente'}
                        </Badge>
                      </div>

                      {/* Wallet */}
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Wallet:</p>
                        <code className="text-xs text-gray-600 dark:text-gray-300 font-mono break-all block">
                          {debtor.walletAddress}
                        </code>
                      </div>

                      {/* Saldo y Acción */}
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Saldo Pendiente:</p>
                          <p
                            className={`font-bold text-lg ${
                              debtor.totalDebt > 4000
                                ? 'text-red-600'
                                : debtor.totalDebt > 2000
                                ? 'text-orange-600'
                                : 'text-gray-900 dark:text-white'
                            }`}
                          >
                            {formatCurrency(debtor.totalDebt)}
                          </p>
                        </div>
                        {debtor.totalDebt > 0 ? (
                          <Link to={`/public/${siteId}/pay/${debtor.id}`}>
                            <Button
                              variant="primary"
                              size="sm"
                              className="flex items-center gap-2"
                            >
                              <CreditCard size={16} />
                              Pagar
                            </Button>
                          </Link>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500">Sin deuda</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="mt-6 sm:mt-8 text-center px-4">
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 px-3 sm:px-4 py-2 rounded-full shadow-sm">
            <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
            <span>Datos verificados en Stellar Blockchain</span>
          </div>
        </div>
      </div>
    </div>
  )
}