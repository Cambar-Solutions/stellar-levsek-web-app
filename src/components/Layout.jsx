import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useDebt } from '../contexts/DebtContext'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { ThemeToggle } from './ui/ThemeToggle'
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Globe,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  Clock,
} from 'lucide-react'
import { useState } from 'react'

export function Layout({ children }) {
  const { user, logout } = useAuth()
  const { debtors } = useDebt()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Contar pagos pendientes
  const pendingPaymentsCount = debtors.reduce((count, debtor) => {
    return count + debtor.payments.filter((p) => p.status === 'reviewing').length
  }, 0)

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Deudores', href: '/debtors', icon: Users },
    {
      name: 'Pagos Pendientes',
      href: '/pending-payments',
      icon: Clock,
      badge: pendingPaymentsCount > 0 ? pendingPaymentsCount : null
    },
    { name: 'Estadísticas', href: '/stats', icon: BarChart3 },
    { name: 'Vista Pública', href: `/public/${user?.siteId}`, icon: Globe },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br  rounded-xl flex items-center justify-center shadow-lg">
                <img src="/isis.png" alt="" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">ISIS</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.businessName}</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon size={18} />
                    {item.name}
                    {item.badge && (
                      <Badge variant="danger" className="ml-1 px-2 py-0 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="hidden md:flex dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <LogOut size={18} />
              </Button>

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="px-4 py-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`relative flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon size={18} />
                    {item.name}
                    {item.badge && (
                      <Badge variant="danger" className="ml-auto px-2 py-0 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                )
              })}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut size={18} />
                Cerrar Sesión
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 mt-12 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Sistema en línea • Datos actualizados en tiempo real
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Powered by Stellar Blockchain</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
