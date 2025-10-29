import { apiGet, apiPost, apiPatch, apiDelete, apiPublicGet } from './api'
import { API_ENDPOINTS } from '../constants/api'

/**
 * Get all debts
 */
export async function getAllDebts() {
  return await apiGet(API_ENDPOINTS.DEBTS)
}

/**
 * Get debts by site
 */
export async function getDebtsBySite(siteId) {
  return await apiGet(API_ENDPOINTS.DEBTS_BY_SITE(siteId))
}

/**
 * Get debts by customer
 */
export async function getDebtsByCustomer(customerId) {
  return await apiGet(API_ENDPOINTS.DEBTS_BY_CUSTOMER(customerId))
}

/**
 * Get debt by ID
 */
export async function getDebtById(id) {
  return await apiGet(API_ENDPOINTS.DEBT_BY_ID(id))
}

/**
 * Create new debt
 */
export async function createDebt(debtData) {
  return await apiPost(API_ENDPOINTS.DEBTS, debtData)
}

/**
 * Update debt
 */
export async function updateDebt(id, updates) {
  return await apiPatch(API_ENDPOINTS.DEBT_BY_ID(id), updates)
}

/**
 * Delete debt
 */
export async function deleteDebt(id) {
  return await apiDelete(API_ENDPOINTS.DEBT_BY_ID(id))
}

/**
 * Register payment for a debt
 */
export async function registerPayment(debtId, paymentData) {
  return await apiPatch(API_ENDPOINTS.REGISTER_PAYMENT(debtId), paymentData)
}

/**
 * Get all customers
 */
export async function getAllCustomers() {
  return await apiGet(API_ENDPOINTS.CUSTOMERS)
}

/**
 * Get customers by site
 */
export async function getCustomersBySite(siteId) {
  return await apiGet(API_ENDPOINTS.CUSTOMERS_BY_SITE(siteId))
}

/**
 * Get customer by ID
 */
export async function getCustomerById(id) {
  return await apiGet(API_ENDPOINTS.CUSTOMER_BY_ID(id))
}

/**
 * Create new customer
 */
export async function createCustomer(customerData) {
  return await apiPost(API_ENDPOINTS.CUSTOMERS, customerData)
}

/**
 * Update customer
 */
export async function updateCustomer(id, updates) {
  return await apiPatch(API_ENDPOINTS.CUSTOMER_BY_ID(id), updates)
}

/**
 * Delete customer
 */
export async function deleteCustomer(id) {
  return await apiDelete(API_ENDPOINTS.CUSTOMER_BY_ID(id))
}

/**
 * Get public site information (no authentication)
 */
export async function getPublicSiteInfo(siteId) {
  return await apiPublicGet(`/sites/public/${siteId}`)
}
