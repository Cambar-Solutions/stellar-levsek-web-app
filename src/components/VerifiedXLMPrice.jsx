import { useState, useEffect } from 'react'
import { Card, CardContent } from './ui/Card'
import { ShieldCheck, TrendingUp, AlertCircle, Loader2 } from 'lucide-react'
import { getStellarPrice, formatPrice } from '../services/zkProofService'

/**
 * VerifiedXLMPrice Component
 *
 * Displays verified Stellar (XLM) price with zero-knowledge proof
 * The price is cryptographically proven using Reclaim Protocol
 */
export function VerifiedXLMPrice({ className }) {
  const [priceData, setPriceData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadPrice()
    // Refresh price every 5 minutes
    const interval = setInterval(loadPrice, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const loadPrice = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getStellarPrice()

      if (response.success) {
        setPriceData(response.data)
      } else {
        setError(response.error || 'Failed to load price')
      }
    } catch (err) {
      console.error('Error loading Stellar price:', err)
      setError('Failed to connect to proof service')
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin" />
            <span className="ml-3 text-sm text-gray-600 dark:text-gray-300">
              Loading verified price...
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center text-red-600 dark:text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="ml-3 text-sm">{error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Success state with price data
  if (!priceData) return null

  return (
    <Card className={`${className} hover:shadow-lg transition-shadow`}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          {/* Price Info */}
          <div className="flex-1 min-w-0">
            {/* Label with verification badge */}
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
                Verified XLM Price
              </span>
            </div>

            {/* Price Value */}
            <div className="mb-2">
              <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {formatPrice(priceData.price)}
              </span>
            </div>

            {/* Source and Timestamp */}
            <div className="space-y-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Source: {priceData.source}
              </p>
              {priceData.timestamp && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Updated: {new Date(priceData.timestamp).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>

          {/* Icon */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg flex-shrink-0 ml-4">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Cryptographic Proof Badge */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">
              Cryptographically Verified
            </span>
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Proven</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
