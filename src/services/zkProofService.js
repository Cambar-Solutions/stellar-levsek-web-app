import { apiGet } from './api'
import { API_ENDPOINTS } from '../constants/api'

/**
 * ZK Proof Service
 *
 * Provides methods to fetch verified data with zero-knowledge proofs
 * from the backend API. All data is cryptographically proven using
 * Reclaim Protocol.
 */

/**
 * Get verified Stellar (XLM) price with zero-knowledge proof
 * @returns {Promise<Object>} Response containing verified price and proof data
 */
export async function getStellarPrice() {
  try {
    const response = await apiGet(API_ENDPOINTS.ZK_STELLAR_PRICE)
    console.log('📊 zkProofService - Stellar price response:', response)
    return response
  } catch (error) {
    console.error('❌ zkProofService - Failed to get Stellar price:', error)
    throw error
  }
}

/**
 * Get verified USD/MXN exchange rate with zero-knowledge proof
 * @returns {Promise<Object>} Response containing verified exchange rate and proof data
 */
export async function getExchangeRate() {
  try {
    const response = await apiGet(API_ENDPOINTS.ZK_EXCHANGE_RATE)
    console.log('💱 zkProofService - Exchange rate response:', response)
    return response
  } catch (error) {
    console.error('❌ zkProofService - Failed to get exchange rate:', error)
    throw error
  }
}

/**
 * Check health status of zkProof service
 * @returns {Promise<Object>} Service health status
 */
export async function checkHealth() {
  try {
    const response = await apiGet(API_ENDPOINTS.ZK_HEALTH)
    console.log('✅ zkProofService - Health check response:', response)
    return response
  } catch (error) {
    console.error('❌ zkProofService - Health check failed:', error)
    throw error
  }
}

/**
 * Format price for display with proper currency formatting
 * @param {string|number} price - The price value
 * @returns {string} Formatted price string
 */
export function formatPrice(price) {
  const priceNum = typeof price === 'string' ? parseFloat(price) : price
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(priceNum)
}

/**
 * Format exchange rate for display
 * @param {string|number} rate - The exchange rate value
 * @returns {string} Formatted rate string
 */
export function formatExchangeRate(rate) {
  const rateNum = typeof rate === 'string' ? parseFloat(rate) : rate
  return new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(rateNum)
}
