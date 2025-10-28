import { useState } from 'react'
import { Link } from 'react-router-dom'
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
  Eye,
  Trash2,
  DollarSign,
} from 'lucide-react'
import toast from 'react-hot-toast'

export function Debtors() {
  const { debtors, deleteDebtor } = useDebt()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredDebtors = debtors.filter((debtor) =>
    debtor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    debtor.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const handleDelete = (id, name) => {
    if (window.confirm(`¿Estás seguro de eliminar a ${name}?`)) {
      deleteDebtor(id)
    }
  }

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestión de Deudores
          </h1>
          <p className="text-gray-600">
            Administra todos los deudores de tu negocio
          </p>
        </div>
        <Link to="/debtors/add">
          <Button variant="primary" size="lg" className="flex items-center gap-2">
            <Plus size={20} />
            Agregar Deudor
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <Input
            placeholder="Buscar por nombre o email..."
            icon={Search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Debtors Grid */}
      {filteredDebtors.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-4">
              {searchQuery ? 'No se encontraron deudores' : 'No tienes deudores registrados'}
            </p>
            <Link to="/debtors/add">
              <Button variant="primary">
                <Plus size={18} />
                Agregar Primer Deudor
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDebtors.map((debtor) => (
            <Card
              key={debtor.id}
              className="hover:shadow-lg transition-all duration-200"
            >
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={debtor.name} size="lg" />
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">
                        {debtor.name}
                      </h3>
                      <p className="text-sm text-gray-500">{debtor.email}</p>
                    </div>
                  </div>
                </div>

                {/* Amount */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 mb-4">
                  <p className="text-xs text-gray-600 mb-1">Saldo Pendiente</p>
                  <p
                    className={`text-2xl font-bold ${
                      debtor.totalDebt > 4000
                        ? 'text-red-600'
                        : debtor.totalDebt > 2000
                        ? 'text-orange-600'
                        : 'text-gray-900'
                    }`}
                  >
                    {formatCurrency(debtor.totalDebt)}
                  </p>
                </div>

                {/* Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Estado:</span>
                    <Badge
                      variant={
                        debtor.status === 'verified' ? 'verified' : 'pending'
                      }
                    >
                      {debtor.status === 'verified' ? 'Verificado' : 'Pendiente'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Pagos:</span>
                    <span className="font-semibold text-gray-900">
                      {debtor.payments.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Desde:</span>
                    <span className="font-semibold text-gray-900">
                      {formatDate(debtor.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link to={`/debtors/${debtor.id}`} className="flex-1">
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <Eye size={16} />
                      Ver Detalle
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(debtor.id, debtor.name)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  )
}
