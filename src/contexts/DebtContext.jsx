import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const DebtContext = createContext(null)

export function DebtProvider({ children }) {
  const { user } = useAuth()
  const [debtors, setDebtors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadDebtors()
    }
  }, [user])

  const loadDebtors = () => {
    if (!user) return

    const savedDebtors = localStorage.getItem(`isis_debtors_${user.id}`)
    if (savedDebtors) {
      setDebtors(JSON.parse(savedDebtors))
    } else {
      // Datos de ejemplo para el demo
      const sampleDebtors = [
        {
          id: '1',
          name: 'Carlos Martínez',
          email: 'carlos@email.com',
          phone: '+52 555 123 4567',
          totalDebt: 5800,
          status: 'pending',
          accountType: 'Cuenta SBN4532 • Negocio Activo',
          walletAddress: 'GDHX...KL9P',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          payments: [
            {
              id: 'p1',
              amount: 1200,
              date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'verified',
              txHash: 'a1b2c3d4e5f6',
            },
          ],
        },
        {
          id: '2',
          name: 'María González',
          email: 'maria@email.com',
          phone: '+52 555 234 5678',
          totalDebt: 5000,
          status: 'pending',
          accountType: 'Cuenta SBN8821 • Negocio Activo',
          walletAddress: 'GBJK...MN3Q',
          createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
          payments: [],
        },
        {
          id: '3',
          name: 'Roberto Sánchez',
          email: 'roberto@email.com',
          phone: '+52 555 345 6789',
          totalDebt: 3000,
          status: 'pending',
          accountType: 'Cuenta SBN2341 • Negocio Activo',
          walletAddress: 'GCPL...RT7S',
          createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          payments: [],
        },
        {
          id: '4',
          name: 'Ana López',
          email: 'ana@email.com',
          phone: '+52 555 456 7890',
          totalDebt: 2500,
          status: 'verified',
          accountType: 'Cuenta SBN5623 • Negocio Activo',
          walletAddress: 'GDWX...UV4T',
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          payments: [
            {
              id: 'p2',
              amount: 2500,
              date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'verified',
              txHash: 'x9y8z7w6v5u4',
            },
          ],
        },
      ]
      setDebtors(sampleDebtors)
      saveDebtors(sampleDebtors)
    }

    setLoading(false)
  }

  const saveDebtors = (debtorsData) => {
    if (!user) return
    localStorage.setItem(`isis_debtors_${user.id}`, JSON.stringify(debtorsData))
  }

  const addDebtor = (debtorData) => {
    const newDebtor = {
      id: Date.now().toString(),
      ...debtorData,
      status: 'pending',
      accountType: `Cuenta SBN${Math.floor(1000 + Math.random() * 9000)} • Negocio Activo`,
      walletAddress: `G${Math.random().toString(36).substring(2, 8).toUpperCase()}...${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      payments: [],
    }

    const updatedDebtors = [...debtors, newDebtor]
    setDebtors(updatedDebtors)
    saveDebtors(updatedDebtors)
    toast.success('Deudor agregado exitosamente')
    return newDebtor
  }

  const updateDebtor = (id, updates) => {
    const updatedDebtors = debtors.map((d) =>
      d.id === id ? { ...d, ...updates } : d
    )
    setDebtors(updatedDebtors)
    saveDebtors(updatedDebtors)
    toast.success('Deudor actualizado')
  }

  const deleteDebtor = (id) => {
    const updatedDebtors = debtors.filter((d) => d.id !== id)
    setDebtors(updatedDebtors)
    saveDebtors(updatedDebtors)
    toast.success('Deudor eliminado')
  }

  const addPayment = (debtorId, paymentData) => {
    const newPayment = {
      id: `p${Date.now()}`,
      ...paymentData,
      status: 'reviewing', // Por defecto en revisión
      date: new Date().toISOString(),
      txHash: Math.random().toString(36).substring(2, 15),
    }

    const updatedDebtors = debtors.map((d) => {
      if (d.id === debtorId) {
        return {
          ...d,
          payments: [...d.payments, newPayment],
        }
      }
      return d
    })

    setDebtors(updatedDebtors)
    saveDebtors(updatedDebtors)
    toast.success('Pago registrado, pendiente de revisión')
  }

  const approvePayment = (debtorId, paymentId) => {
    const updatedDebtors = debtors.map((d) => {
      if (d.id === debtorId) {
        const payment = d.payments.find((p) => p.id === paymentId)
        const updatedPayments = d.payments.map((p) =>
          p.id === paymentId ? { ...p, status: 'verified' } : p
        )
        const newDebt = d.totalDebt - (payment?.amount || 0)
        return {
          ...d,
          payments: updatedPayments,
          totalDebt: newDebt > 0 ? newDebt : 0,
          status: newDebt <= 0 ? 'verified' : d.status,
        }
      }
      return d
    })

    setDebtors(updatedDebtors)
    saveDebtors(updatedDebtors)
    toast.success('Pago aprobado')
  }

  const rejectPayment = (debtorId, paymentId) => {
    const updatedDebtors = debtors.map((d) => {
      if (d.id === debtorId) {
        return {
          ...d,
          payments: d.payments.filter((p) => p.id !== paymentId),
        }
      }
      return d
    })

    setDebtors(updatedDebtors)
    saveDebtors(updatedDebtors)
    toast.success('Pago rechazado')
  }

  const getStats = () => {
    const total = debtors.reduce((sum, d) => sum + d.totalDebt, 0)
    const pending = debtors.filter((d) => d.status === 'pending').length
    const verified = debtors.filter((d) => d.status === 'verified').length

    return {
      totalDebtors: debtors.length,
      totalDebt: total,
      pendingCount: pending,
      verifiedCount: verified,
    }
  }

  return (
    <DebtContext.Provider
      value={{
        debtors,
        loading,
        addDebtor,
        updateDebtor,
        deleteDebtor,
        addPayment,
        approvePayment,
        rejectPayment,
        getStats,
      }}
    >
      {children}
    </DebtContext.Provider>
  )
}

export function useDebt() {
  const context = useContext(DebtContext)
  if (!context) {
    throw new Error('useDebt debe usarse dentro de un DebtProvider')
  }
  return context
}
