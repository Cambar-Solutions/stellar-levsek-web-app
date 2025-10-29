import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useDebt } from '../contexts/DebtContext'
import { Layout } from '../components/Layout'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'
import {
  Search,
  Plus,
  TrendingUp,
  Users,
  DollarSign,
  CheckCircle2,
  Clock,
  ExternalLink,
  Copy,
} from 'lucide-react'
import toast from 'react-hot-toast'

export function Dashboard() {
  const { user } = useAuth()
  const { debtors, getStats } = useDebt()
  const [searchQuery, setSearchQuery] = useState('')
  const stats = getStats()

  const filteredDebtors = debtors.filter((debtor) =>
    debtor.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

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

  return (
    <Layout>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bienvenido, {user?.name}
        </h1>
        <p className="text-gray-600">
          Gestiona las deudas de {user?.businessName} de forma transparente
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Deudores"
          value={stats.totalDebtors}
          icon={<Users className="w-6 h-6" />}
          color="blue"
        />
        <StatsCard
          title="Deuda Total"
          value={formatCurrency(stats.totalDebt)}
          icon={<DollarSign className="w-6 h-6" />}
          color="purple"
        />
        <StatsCard
          title="Pendientes"
          value={stats.pendingCount}
          icon={<Clock className="w-6 h-6" />}
          color="orange"
        />
        <StatsCard
          title="Verificados"
          value={stats.verifiedCount}
          icon={<CheckCircle2 className="w-6 h-6" />}
          color="green"
        />
      </div>

      {/* Wallet Info */}
      <Card className="mb-8 bg-gradient-to-br from-blue-600 to-purple-700 border-0">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="text-white">
              <p className="text-sm font-medium text-blue-100 mb-1">
                Tu Wallet Stellar
              </p>
              <div className="flex items-center gap-3">
                <code className="text-lg font-mono font-semibold">
                  {user?.walletAddress}
                </code>
                <button
                  onClick={() => copyToClipboard(user?.walletAddress)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Copy size={18} />
                </button>
              </div>
            </div>
            <Link to={`/public/${user?.siteId}`}>
              <Button variant="secondary" size="sm" className="flex items-center gap-2">
                <ExternalLink size={16} />
                Ver Vista Pública
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Search and Actions */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            <div className="flex-1">
              <Input
                placeholder="Busca por nombre completo para gestionar tu registro"
                icon={Search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Link to="/debtors/add">
              <Button variant="primary" className="flex items-center gap-2 w-full md:w-auto">
                <Plus size={18} />
                Registrar Deudor
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Debtors Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Control de Deudas</h2>
            <Badge variant="primary">{filteredDebtors.length} registros</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Cuenta
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
                {filteredDebtors.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      No se encontraron deudores
                    </td>
                  </tr>
                ) : (
                  filteredDebtors.map((debtor) => (
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
                            <p className="text-sm text-gray-500">{debtor.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{debtor.accountType}</p>
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
                            debtor.status === 'verified'
                              ? 'verified'
                              : debtor.status === 'pending'
                              ? 'pending'
                              : 'default'
                          }
                        >
                          {debtor.status === 'verified' ? 'Verificado' : 'Pendiente'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link to={`/debtors/${debtor.id}`}>
                          <Button
                            variant="warning"
                            size="sm"
                            className="flex items-center gap-2 mx-auto"
                          >
                            <TrendingUp size={16} />
                            Ver Detalle
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </Layout>
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
