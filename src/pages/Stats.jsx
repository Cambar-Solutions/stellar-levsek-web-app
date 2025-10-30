import { useAuth } from '../contexts/AuthContext'
import { useDebt } from '../contexts/DebtContext'
import { Layout } from '../components/Layout'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  Calendar,
  Activity,
} from 'lucide-react'

export function Stats() {
  const { user } = useAuth()
  const { debtors, getStats } = useDebt()
  const stats = getStats()

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount)
  }

  const totalPaid = debtors.reduce((sum, debtor) => {
    const paid = debtor.payments
      .filter((p) => p.status === 'verified')
      .reduce((s, p) => s + p.amount, 0)
    return sum + paid
  }, 0)

  const recentPayments = debtors
    .flatMap((debtor) =>
      debtor.payments
        .filter((p) => p.status === 'verified')
        .map((payment) => ({
          ...payment,
          debtorName: debtor.name,
        }))
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10)

  const topDebtors = [...debtors]
    .sort((a, b) => b.totalDebt - a.totalDebt)
    .slice(0, 5)

  const averageDebt =
    debtors.length > 0 ? stats.totalDebt / debtors.length : 0

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Estadísticas Avanzadas
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Análisis detallado de las cuentas por cobrar de {user?.businessName}
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Deuda Total"
          value={formatCurrency(stats.totalDebt)}
          icon={<DollarSign className="w-6 h-6" />}
          color="red"
          trend={-12}
        />
        <StatsCard
          title="Total Cobrado"
          value={formatCurrency(totalPaid)}
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
          trend={+23}
        />
        <StatsCard
          title="Total Deudores"
          value={stats.totalDebtors}
          icon={<Users className="w-6 h-6" />}
          color="blue"
        />
        <StatsCard
          title="Promedio/Deudor"
          value={formatCurrency(averageDebt)}
          icon={<Activity className="w-6 h-6" />}
          color="purple"
        />
      </div>

      {/* Status Breakdown */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Estado de Cuentas</h3>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <StatusItem
                icon={<Clock className="w-5 h-5 text-orange-600" />}
                label="Cuentas Pendientes"
                value={stats.pendingCount}
                percentage={(stats.pendingCount / stats.totalDebtors) * 100}
                color="orange"
              />
              <StatusItem
                icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
                label="Cuentas Verificadas"
                value={stats.verifiedCount}
                percentage={(stats.verifiedCount / stats.totalDebtors) * 100}
                color="green"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Distribución de Deuda
            </h3>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <DebtRangeItem
                range="$0 - $1,000"
                count={debtors.filter((d) => d.totalDebt <= 1000).length}
              />
              <DebtRangeItem
                range="$1,001 - $3,000"
                count={
                  debtors.filter((d) => d.totalDebt > 1000 && d.totalDebt <= 3000)
                    .length
                }
              />
              <DebtRangeItem
                range="$3,001 - $5,000"
                count={
                  debtors.filter((d) => d.totalDebt > 3000 && d.totalDebt <= 5000)
                    .length
                }
              />
              <DebtRangeItem
                range="Más de $5,000"
                count={debtors.filter((d) => d.totalDebt > 5000).length}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Debtors */}
      <Card className="mb-8">
        <CardHeader>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Top 5 Deudores (Mayor Saldo)
          </h3>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-200">
            {topDebtors.map((debtor, index) => (
              <div
                key={debtor.id}
                className="p-6 flex items-center justify-between hover:bg-gray-50 dark:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-bold text-blue-700">
                      #{index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{debtor.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{debtor.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-red-600">
                    {formatCurrency(debtor.totalDebt)}
                  </p>
                  <Badge variant={debtor.status === 'verified' ? 'verified' : 'pending'}>
                    {debtor.status === 'verified' ? 'Verificado' : 'Pendiente'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Pagos Recientes
          </h3>
        </CardHeader>
        <CardContent className="p-0">
          {recentPayments.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              No hay pagos registrados
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="p-6 flex items-center justify-between hover:bg-gray-50 dark:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {payment.debtorName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(payment.date).toLocaleDateString('es-MX', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(payment.amount)}
                    </p>
                    <code className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                      TX: {payment.txHash}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Layout>
  )
}

function StatsCard({ title, value, icon, color, trend }) {
  const colorClasses = {
    red: 'from-red-500 to-red-600',
    green: 'from-green-500 to-green-600',
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</p>
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white shadow-lg`}
          >
            {icon}
          </div>
        </div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{value}</p>
        {trend !== undefined && (
          <div className="flex items-center gap-1 text-sm">
            {trend > 0 ? (
              <>
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-green-600 font-semibold">+{trend}%</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-4 h-4 text-red-600" />
                <span className="text-red-600 font-semibold">{trend}%</span>
              </>
            )}
            <span className="text-gray-500 dark:text-gray-400 ml-1">vs mes anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function StatusItem({ icon, label, value, percentage, color }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-medium text-gray-900 dark:text-white">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-32 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full bg-${color}-600`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <span className="text-sm font-bold text-gray-900 dark:text-white w-8">{value}</span>
      </div>
    </div>
  )
}

function DebtRangeItem({ range, count }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-700 dark:text-gray-200">{range}</span>
      <Badge variant="default">{count} deudores</Badge>
    </div>
  )
}
