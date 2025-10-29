import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'
import {
  getAllDebts,
  getDebtsBySite,
  createDebt,
  updateDebt,
  deleteDebt,
  registerPayment,
  getAllCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../services/debtService'

const DebtContext = createContext(null)

export function DebtProvider({ children }) {
  const { user } = useAuth()
  const [debtors, setDebtors] = useState([])
  const [customers, setCustomers] = useState([])
  const [debts, setDebts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Load customers and debts from API
      const [customersResponse, debtsResponse] = await Promise.all([
        getAllCustomers(),
        getAllDebts(),
      ])

      // Extract data from backend response wrapper { data: [...], status: 200, message: "success" }
      const customersData = customersResponse.data || customersResponse || []
      const debtsData = debtsResponse.data || debtsResponse || []

      setCustomers(customersData)
      setDebts(debtsData)

      // Transform data to match frontend format (debtors with combined debt info)
      const debtorsMap = new Map()

      // First, create debtors from customers
      customersData.forEach((customer) => {
        debtorsMap.set(customer.id, {
          id: customer.id,
          name: `${customer.name} ${customer.last_name}`,
          email: customer.email,
          phone: customer.phone_number,
          totalDebt: 0,
          status: 'verified', // Default
          accountType: customer.stellar_public_key
            ? `Cuenta ${customer.stellar_public_key.substring(0, 8)}... • Blockchain`
            : 'Cuenta Local',
          walletAddress: customer.stellar_public_key || null,
          createdAt: customer.created_at || customer.createdAt,
          payments: [],
        })
      })

      // Then, add debt information
      debtsData.forEach((debt) => {
        if (debtorsMap.has(debt.customerId)) {
          const debtor = debtorsMap.get(debt.customerId)

          // Sum up total debt from all debts for this customer
          debtor.totalDebt += Number(debt.pending_amount || 0)

          // Update status based on debt status
          if (debt.status === 'pending' && debtor.status !== 'pending') {
            debtor.status = 'pending'
          }

          // Add payment info if exists
          if (debt.paid_amount > 0) {
            debtor.payments.push({
              id: `payment_${debt.id}`,
              amount: Number(debt.paid_amount),
              date: debt.updated_at || debt.updatedAt,
              status: debt.status === 'paid' ? 'verified' : 'reviewing',
              txHash: debt.stellar_tx_hash || null,
              debtId: debt.id,
            })
          }
        }
      })

      setDebtors(Array.from(debtorsMap.values()))
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  const addDebtor = async (debtorData) => {
    try {
      // Create customer first
      const customerData = {
        siteId: user.siteId || 1,
        name: debtorData.name, // Enviar nombre completo
        phoneNumber: debtorData.phone || '0000000000', // camelCase y valor por defecto
        email: debtorData.email || null,
        birthDate: '2000-01-01', // camelCase
        gender: 'MALE',
      }

      const customerResponse = await createCustomer(customerData)
      const newCustomer = customerResponse.data || customerResponse

      // Then create the debt
      const debtData = {
        siteId: user.siteId || 1,
        customerId: newCustomer.id,
        createdByUserId: Number(user.id) || 1,
        totalAmount: parseFloat(debtorData.totalDebt) || 0,
        description: debtorData.description || 'Deuda inicial',
      }

      const newDebt = await createDebt(debtData)

      // Reload data to get updated list
      await loadData()

      toast.success('Deudor agregado exitosamente')
      return newCustomer
    } catch (error) {
      console.error('Error adding debtor:', error)
      toast.error(error.message || 'Error al agregar deudor')
      throw error
    }
  }

  const updateDebtor = async (id, updates) => {
    try {
      await updateCustomer(id, updates)
      await loadData()
      toast.success('Deudor actualizado')
    } catch (error) {
      console.error('Error updating debtor:', error)
      toast.error('Error al actualizar deudor')
      throw error
    }
  }

  const deleteDebtor = async (id) => {
    try {
      // Normalize id to number
      const customerId = Number(id)

      // Delete all debts for this customer first
      const customerDebts = debts.filter((d) => d.customerId === customerId)
      await Promise.all(customerDebts.map((debt) => deleteDebt(debt.id)))

      // Then delete the customer
      await deleteCustomer(customerId)
      await loadData()
      toast.success('Deudor eliminado')
    } catch (error) {
      console.error('Error deleting debtor:', error)
      toast.error('Error al eliminar deudor')
      throw error
    }
  }

  const addPayment = async (debtorId, paymentData) => {
    try {
      // Normalize debtorId to number
      const customerId = Number(debtorId)

      // Find the first pending debt for this customer
      const customerDebt = debts.find(
        (d) => d.customerId === customerId && d.status !== 'paid'
      )

      if (!customerDebt) {
        toast.error('No hay deudas pendientes para este cliente')
        return
      }

      // Register payment
      const paymentPayload = {
        amount: parseFloat(paymentData.amount) || 0,
        paymentType: paymentData.paymentType || 'cash',
        notes: paymentData.notes || null,
      }

      await registerPayment(customerDebt.id, paymentPayload)
      await loadData()

      toast.success('Pago registrado exitosamente en blockchain')
    } catch (error) {
      console.error('Error adding payment:', error)
      toast.error(error.message || 'Error al registrar pago')
      throw error
    }
  }

  const approvePayment = async (debtorId, paymentId) => {
    // This is now automatic in the backend when payment is registered
    toast.success('Pago aprobado')
    await loadData()
  }

  const rejectPayment = async (debtorId, paymentId) => {
    // For now, this would require backend support to reverse a payment
    toast.error('Funcionalidad no disponible aún')
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
