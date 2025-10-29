import { useParams, Link } from 'react-router-dom'
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
} from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export function PublicView() {
  const { userId: userIdParam } = useParams()
  const [businessData, setBusinessData] = useState(null)
  const [debtors, setDebtors] = useState([])

  // Convert userId from URL params to number for comparison
  const userId = Number(userIdParam)

  useEffect(() => {
    // Cargar datos del negocio y deudores desde localStorage
    const users = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key.startsWith('isis_user_')) {
        const userData = JSON.parse(localStorage.getItem(key))
        if (userData.id === userId) {
          setBusinessData(userData)

          // Cargar deudores
          const debtorsData = localStorage.getItem(`isis_debtors_${userId}`)
          if (debtorsData) {
            setDebtors(JSON.parse(debtorsData))
          }
          break
        }
      }
    }
  }, [userId])

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

  const totalDebt = debtors.reduce((sum, d) => sum + d.totalDebt, 0)
  const pendingCount = debtors.filter((d) => d.status === 'pending').length
  const verifiedCount = debtors.filter((d) => d.status === 'verified').length

  if (!businessData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-12 text-center">
            <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Negocio no encontrado
            </h2>
            <p className="text-gray-600">
              La página pública que buscas no existe
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {businessData.businessName}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Globe className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-600">Vista Pública</span>
                </div>
              </div>
            </div>
            <Badge variant="success" className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Verificado en Stellar
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <Card className="mb-8 bg-gradient-to-br from-blue-600 to-purple-700 border-0">
          <CardContent className="p-8 text-white">
            <div className="flex items-start gap-4 mb-4">
              <ShieldCheck className="w-8 h-8 flex-shrink-0" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">Transparencia Blockchain</h2>
                <p className="text-blue-100 text-lg">
                  Este es un registro público y verificable de las deudas de{' '}
                  {businessData.businessName}. Todos los datos están respaldados por
                  la red Stellar blockchain, garantizando inmutabilidad y transparencia.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl mt-6">
              <span className="text-sm font-medium">Wallet Address:</span>
              <code className="font-mono text-sm flex-1">{businessData.walletAddress}</code>
              <button
                onClick={() => copyToClipboard(businessData.walletAddress)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Copy size={18} />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Debtors List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Registro Público de Deudas
              </h2>
              <Badge variant="primary">{debtors.length} registros</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Deudor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Wallet
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Saldo Pendiente
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {debtors.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                        No hay deudores registrados
                      </td>
                    </tr>
                  ) : (
                    debtors.map((debtor) => (
                      <tr
                        key={debtor.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={debtor.name} />
                            <div>
                              <p className="font-semibold text-gray-900">
                                {debtor.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {debtor.accountType}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <code className="text-xs text-gray-600 font-mono">
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
                                : 'text-gray-900'
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
                            <Link to={`/public/${userId}/pay/${debtor.id}`}>
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
                            <span className="text-sm text-gray-400">Sin deuda</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-full shadow-sm">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            <span>Datos verificados en Stellar Blockchain</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatsCard({ title, value, icon, color }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    green: 'from-green-500 to-green-600',
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white shadow-lg`}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
