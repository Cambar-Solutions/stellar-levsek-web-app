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
  getAllPendingPayments,
  approvePendingPayment,
  rejectPendingPayment,
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

      // Load customers, debts and pending payments from API
      const [customersResponse, debtsResponse, pendingPaymentsResponse] = await Promise.all([
        getAllCustomers(),
        getAllDebts(),
        getAllPendingPayments(),
      ])

      // Extract data from backend response wrapper { data: [...], status: 200, message: "success" }
      const customersData = customersResponse.data || customersResponse || []
      const debtsData = debtsResponse.data || debtsResponse || []
      const pendingPaymentsData = pendingPaymentsResponse.data || pendingPaymentsResponse || []

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

        }
      })

      // Agregar pending payments como pagos "reviewing"
      console.log('🔍 Processing pending payments:', pendingPaymentsData.length, 'pending payments')
      pendingPaymentsData.forEach((pendingPayment) => {
        if (debtorsMap.has(pendingPayment.customerId)) {
          const debtor = debtorsMap.get(pendingPayment.customerId)

          // Solo agregar pending payments con status 'pending' o 'approved'
          // Los 'rejected' no se muestran
          if (pendingPayment.status === 'pending') {
            debtor.payments.push({
              id: `pending_${pendingPayment.id}`,
              amount: Number(pendingPayment.amount),
              date: pendingPayment.createdAt || pendingPayment.created_at,
              status: 'reviewing',
              txHash: pendingPayment.stellarTxHash || pendingPayment.stellar_tx_hash || 'N/A',
              reference: pendingPayment.reference,
              debtId: pendingPayment.debtId,
              pendingPaymentId: pendingPayment.id, // Para poder aprobar/rechazar
              publicPayment: true,
            })
          } else if (pendingPayment.status === 'approved') {
            // Los pagos aprobados se muestran como "verified"
            debtor.payments.push({
              id: `approved_${pendingPayment.id}`,
              amount: Number(pendingPayment.amount),
              date: pendingPayment.updatedAt || pendingPayment.updated_at,
              status: 'verified',
              txHash: pendingPayment.stellarTxHash || pendingPayment.stellar_tx_hash || 'N/A',
              reference: pendingPayment.reference,
              debtId: pendingPayment.debtId,
              pendingPaymentId: pendingPayment.id,
              publicPayment: true,
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
      // Split full name into name and lastName
      const fullName = debtorData.name.trim()
      const nameParts = fullName.split(' ')
      const firstName = nameParts[0]
      const lastName = nameParts.slice(1).join(' ') || firstName // Si no hay apellido, usar el nombre

      // Create customer first
      const customerData = {
        siteId: user.siteId || 1,
        name: firstName,
        lastName: lastName,
        phoneNumber: debtorData.phone || '0000000000',
        email: debtorData.email || null,
        birthDate: '2000-01-01',
        gender: 'MALE',
      }

      console.log('📤 Creating customer with data:', customerData)
      const customerResponse = await createCustomer(customerData)
      const newCustomer = customerResponse.data || customerResponse
      console.log('✅ Customer created:', newCustomer)

      // Then create the debt if amount > 0
      if (parseFloat(debtorData.totalDebt) > 0) {
        const debtData = {
          siteId: user.siteId || 1,
          customerId: newCustomer.id,
          createdByUserId: Number(user.id) || 1,
          totalAmount: parseFloat(debtorData.totalDebt),
          description: debtorData.description || 'Deuda inicial',
        }

        console.log('📤 Creating debt with data:', debtData)
        await createDebt(debtData)
        console.log('✅ Debt created successfully')
      }

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

      // Verificar si el deudor tiene deudas asociadas
      const customerDebts = debts.filter((d) => d.customerId === customerId)

      if (customerDebts.length > 0) {
        toast.error('No se puede eliminar: el deudor tiene deudas registradas')
        return // No lanzar error, solo retornar
      }

      // Verificar si el deudor tiene pagos (verificar en debtors)
      const debtor = debtors.find((d) => d.id === customerId)
      if (debtor && debtor.payments && debtor.payments.length > 0) {
        toast.error('No se puede eliminar: el deudor tiene pagos registrados')
        return // No lanzar error, solo retornar
      }

      // Si no hay deudas ni pagos, eliminar el customer
      await deleteCustomer(customerId)
      await loadData()
      toast.success('Deudor eliminado exitosamente')
    } catch (error) {
      console.error('Error deleting debtor:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Error al eliminar deudor'
      toast.error(errorMessage)
      // No lanzar el error para que no rompa la UI
    }
  }

  const addPayment = async (debtorId, paymentData) => {
    try {
      console.log('🔔 addPayment called for debtorId:', debtorId, 'amount:', paymentData.amount)
      // Normalize debtorId to number
      const customerId = Number(debtorId)

      // Find the first pending debt for this customer
      const customerDebt = debts.find((d) => {
        const pending = d.pendingAmount || d.pending_amount || 0
        return d.customerId === customerId && pending > 0
      })

      if (!customerDebt) {
        console.log('❌ No pending debts found. Available debts:', debts.filter(d => d.customerId === customerId))
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
    // Normalize debtorId to number
    const customerId = Number(debtorId)

    // Find the debtor and payment
    const debtor = debtors.find((d) => d.id === customerId)
    if (!debtor) {
      throw new Error('Deudor no encontrado')
    }

    const payment = debtor.payments.find((p) => p.id === paymentId)
    if (!payment) {
      throw new Error('Pago no encontrado')
    }

    // Verificar si tiene pendingPaymentId (nuevo flujo) o debtId (flujo antiguo)
    if (payment.pendingPaymentId) {
      // Nuevo flujo: aprobar pending payment
      await approvePendingPayment(payment.pendingPaymentId)
      console.log('✅ Pending payment aprobado:', payment.pendingPaymentId)
    } else if (payment.debtId) {
      // Flujo antiguo: actualizar el status de la deuda
      await updateDebt(payment.debtId, {
        status: 'paid'
      })
      console.log('✅ Pago aprobado, deuda marcada como pagada:', payment)
    } else {
      throw new Error('No se puede aprobar: pago sin ID válido')
    }

    // Recargar datos para reflejar cambios
    await loadData()
  }

  const rejectPayment = async (debtorId, paymentId) => {
    const customerId = Number(debtorId)

    // Find the debtor and payment
    const debtor = debtors.find((d) => d.id === customerId)
    if (!debtor) {
      throw new Error('Deudor no encontrado')
    }

    const payment = debtor.payments.find((p) => p.id === paymentId)
    if (!payment) {
      throw new Error('Pago no encontrado')
    }

    // Verificar si tiene pendingPaymentId (nuevo flujo)
    if (payment.pendingPaymentId) {
      // Nuevo flujo: rechazar pending payment (NO toca la deuda)
      await rejectPendingPayment(payment.pendingPaymentId)
      console.log('🗑️ Pending payment rechazado:', payment.pendingPaymentId)
    } else if (payment.debtId) {
      // Flujo antiguo: eliminar la deuda (PELIGROSO - solo para backward compatibility)
      await deleteDebt(payment.debtId)
      console.log('🗑️ Pago rechazado y deuda eliminada (flujo antiguo):', payment)
    } else {
      throw new Error('No se puede rechazar: pago sin ID válido')
    }

    await loadData()
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
        reloadData: loadData,
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
