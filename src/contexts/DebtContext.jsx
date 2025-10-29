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
  approvePayment as approvePaymentAPI,
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
        const stellarKey = customer.stellarPublicKey || customer.stellar_public_key
        debtorsMap.set(customer.id, {
          id: customer.id,
          name: `${customer.name} ${customer.lastName || customer.last_name || ''}`.trim(),
          email: customer.email,
          phone: customer.phoneNumber || customer.phone_number,
          totalDebt: 0,
          status: 'verified', // Default
          accountType: stellarKey
            ? `Cuenta ${stellarKey.substring(0, 8)}... • Blockchain`
            : 'Cuenta Local',
          walletAddress: stellarKey || null,
          createdAt: customer.createdAt || customer.created_at,
          debts: [], // Lista de deudas individuales
          payments: [],
        })
      })

      // Then, add debt information
      console.log('🔍 Processing debts data:', debtsData.length, 'debts')
      debtsData.forEach((debt) => {
        if (debtorsMap.has(debt.customerId)) {
          const debtor = debtorsMap.get(debt.customerId)

          const pendingAmount = Number(debt.pendingAmount || debt.pending_amount || 0)
          const paidAmount = Number(debt.paidAmount || debt.paid_amount || 0)
          const totalAmount = Number(debt.totalAmount || debt.total_amount || 0)

          console.log(`💰 Debt ID ${debt.id} for customer ${debt.customerId}:`, {
            totalAmount,
            paidAmount,
            pendingAmount,
            status: debt.status
          })

          // Add individual debt to the list
          debtor.debts.push({
            id: debt.id,
            totalAmount: totalAmount,
            paidAmount: paidAmount,
            pendingAmount: pendingAmount,
            description: debt.description,
            status: debt.status,
            createdAt: debt.createdAt || debt.created_at,
            updatedAt: debt.updatedAt || debt.updated_at,
            stellarTxHash: debt.stellarTxHash || debt.stellar_tx_hash || null,
            paymentType: debt.paymentType || debt.payment_type || null,
          })

          // Sum up total debt from all debts for this customer
          debtor.totalDebt += pendingAmount
          console.log(`➕ Adding ${pendingAmount} to debtor ${debtor.name}, new total: ${debtor.totalDebt}`)

          // Update status based on debt status
          if (debt.status === 'pending' && debtor.status !== 'pending') {
            debtor.status = 'pending'
          }

          // Add payment info if exists
          if (paidAmount > 0) {
            debtor.payments.push({
              id: `payment_${debt.id}`,
              amount: paidAmount,
              date: debt.updatedAt || debt.updated_at,
              status: debt.status === 'paid' ? 'verified' : 'reviewing',
              txHash: debt.stellarTxHash || debt.stellar_tx_hash || null,
              debtId: debt.id,
            })
          }
        }
      })

      const finalDebtors = Array.from(debtorsMap.values())
      console.log('✅ Final debtors array:', finalDebtors.map(d => ({
        id: d.id,
        name: d.name,
        totalDebt: d.totalDebt,
        debtsCount: d.debts.length
      })))
      setDebtors(finalDebtors)
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

      await createDebt(debtData)

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
      console.log('🔔 addPayment called for debtorId:', debtorId, 'amount:', paymentData.amount)
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

      console.log('📝 Found debt to pay:', {
        debtId: customerDebt.id,
        currentPending: customerDebt.pendingAmount || customerDebt.pending_amount,
        currentPaid: customerDebt.paidAmount || customerDebt.paid_amount
      })

      // Register payment
      const paymentPayload = {
        amount: parseFloat(paymentData.amount) || 0,
        paymentType: paymentData.paymentType || 'cash',
        notes: paymentData.notes || null,
      }

      console.log('🚀 Calling registerPayment API with:', paymentPayload)
      await registerPayment(customerDebt.id, paymentPayload)
      console.log('✅ registerPayment API call completed, now reloading data...')
      await loadData()

      toast.success('Pago registrado exitosamente en blockchain')
    } catch (error) {
      console.error('Error adding payment:', error)
      toast.error(error.message || 'Error al registrar pago')
      throw error
    }
  }

  const approvePayment = async (debtorId, paymentId) => {
    try {
      // Normalize debtorId to number
      const customerId = Number(debtorId)

      // Find the debtor and payment
      const debtor = debtors.find((d) => d.id === customerId)
      if (!debtor) {
        toast.error('Deudor no encontrado')
        return
      }

      const payment = debtor.payments.find((p) => p.id === paymentId)
      if (!payment) {
        toast.error('Pago no encontrado')
        return
      }

      // If payment has a debtId, use the approve endpoint
      if (payment.debtId) {
        await approvePaymentAPI(payment.debtId, {
          amount: payment.amount,
          paymentType: 'cash', // Default, could be extracted from payment data
          notes: `Pago aprobado manualmente - ${payment.txHash || ''}`,
        })
        toast.success('Pago aprobado y registrado')
      } else {
        toast.error('No se puede aprobar: pago sin ID de deuda')
      }

      await loadData()
    } catch (error) {
      console.error('Error approving payment:', error)
      toast.error(error.message || 'Error al aprobar pago')
    }
  }

  const rejectPayment = async (debtorId, paymentId) => {
    try {
      // For now, rejecting a payment just removes it from the view
      // In a real implementation, this would call a backend endpoint
      toast.info('Pago rechazado. Se recargará la información.')
      await loadData()
    } catch (error) {
      console.error('Error rejecting payment:', error)
      toast.error(error.message || 'Error al rechazar pago')
    }
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
