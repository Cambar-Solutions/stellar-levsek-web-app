import { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent, CardFooter } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { cn } from '../lib/utils'
import {
  getPaymentQuote,
  executeSwapAndPay,
  getPaymentTokens,
  estimatePaymentCost,
} from '../services/zapperService'
import { TOKENS, formatTokenAmount } from '../services/soroswapService'
import toast from 'react-hot-toast'
import { ArrowRight, Zap, AlertCircle } from 'lucide-react'

export function SwapAndPayModal({
  isOpen,
  onClose,
  debtId,
  debtAmount,
  debtorName,
  userSecretKey: providedSecretKey,
  onPaymentComplete,
}) {
  const [selectedToken, setSelectedToken] = useState(null)
  const [secretKey, setSecretKey] = useState(providedSecretKey || '')
  const [quote, setQuote] = useState(null)
  const [cost, setCost] = useState(null)
  const [loading, setLoading] = useState(false)
  const [paying, setPaying] = useState(false)
  const [tokens] = useState(getPaymentTokens())

  // Initialize with XLM
  useEffect(() => {
    if (tokens.length > 0) {
      setSelectedToken(tokens[0]) // XLM by default
    }
  }, [tokens])

  // Update secret key when provided
  useEffect(() => {
    if (providedSecretKey) {
      setSecretKey(providedSecretKey)
    }
  }, [providedSecretKey])

  // Get quote whenever token changes
  useEffect(() => {
    const fetchQuote = async () => {
      if (!selectedToken || !debtAmount || debtAmount <= 0) {
        setQuote(null)
        setCost(null)
        return
      }

      // Check if trying to swap same token
      if (selectedToken.address === TOKENS.USDC.address) {
        setQuote(null)
        setCost(null)
        return
      }

      try {
        setLoading(true)

        // Get quote (swap selectedToken → USDC for debt payment)
        const quoteResult = await getPaymentQuote(
          selectedToken.address,
          TOKENS.USDC.address,
          debtAmount.toString()
        )

        setQuote(quoteResult)

        // Get cost estimate
        const costEstimate = await estimatePaymentCost(
          selectedToken.address,
          TOKENS.USDC.address,
          debtAmount.toString()
        )

        setCost(costEstimate)
      } catch (error) {
        console.error('Error getting quote:', error)
        setQuote(null)
        setCost(null)
        toast.error('Failed to get payment quote')
      } finally {
        setLoading(false)
      }
    }

    // Debounce quote requests
    const timeoutId = setTimeout(fetchQuote, 500)
    return () => clearTimeout(timeoutId)
  }, [selectedToken, debtAmount])

  const handlePay = async () => {
    if (!secretKey || secretKey.length < 56) {
      toast.error('Please enter a valid Stellar secret key')
      return
    }

    if (!selectedToken || !quote) {
      toast.error('Please wait for quote to load')
      return
    }

    try {
      setPaying(true)

      toast.loading('Processing Swap + Pay...', { id: 'zapper' })

      const result = await executeSwapAndPay(
        secretKey,
        debtId,
        selectedToken.address,
        TOKENS.USDC.address,
        debtAmount.toString(),
        {
          paymentType: 'crypto',
          notes: `Paid via Swap + Pay with ${selectedToken.symbol}`,
        }
      )

      toast.success(result.message, { id: 'zapper', duration: 5000 })

      // Notify parent component
      if (onPaymentComplete) {
        onPaymentComplete(result)
      }

      // Close modal after delay
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (error) {
      console.error('Swap + Pay error:', error)
      toast.error(`Payment failed: ${error.message}`, { id: 'zapper', duration: 6000 })
    } finally {
      setPaying(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg my-auto">
        <Card className="max-h-[90vh] flex flex-col">
          <CardHeader className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Zap className="w-6 h-6 text-yellow-500" />
                Swap + Pay
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Pay {debtorName}'s debt with any token
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </CardHeader>

          <CardContent className="space-y-3 overflow-y-auto flex-1">
            {/* Secret Key Input */}
            {!providedSecretKey && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Stellar Secret Key
                </label>
                <Input
                  type="password"
                  placeholder="S..."
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Required to sign the transaction. Never stored.
                </p>
              </div>
            )}

            {/* Debt Amount Display */}
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800">
              <div className="text-xs text-gray-600 dark:text-gray-400">Debt Amount</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                ${debtAmount.toFixed(2)} USDC
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                For: {debtorName}
              </div>
            </div>

            {/* Token Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Pay With
              </label>
              <select
                value={selectedToken?.symbol || ''}
                onChange={(e) => {
                  const token = tokens.find((t) => t.symbol === e.target.value)
                  setSelectedToken(token)
                }}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {tokens.map((token) => (
                  <option key={token.symbol} value={token.symbol}>
                    {token.symbol} - {token.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Quote Display */}
            {selectedToken?.address === TOKENS.USDC.address ? (
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-blue-900 dark:text-blue-200">
                      No Swap Needed
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                      You selected USDC, which is the same as the debt currency. Please use the regular payment button instead of Swap + Pay.
                    </p>
                  </div>
                </div>
              </div>
            ) : loading ? (
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Getting quote...</span>
                </div>
              </div>
            ) : quote && cost ? (
              <>
                {/* Swap Preview */}
                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                      <div className="text-xs text-gray-600 dark:text-gray-400">You Pay</div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">
                        {cost.tokenInAmount}
                      </div>
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {selectedToken.symbol}
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 mx-2" />
                    <div className="text-center flex-1">
                      <div className="text-xs text-gray-600 dark:text-gray-400">Debt Paid</div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">
                        {debtAmount.toFixed(2)}
                      </div>
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        USDC
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Exchange Rate</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        1 {selectedToken.symbol} ≈{' '}
                        {(debtAmount / Number(cost.tokenInAmount)).toFixed(4)} USDC
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Price Impact</span>
                      <span
                        className={cn(
                          'font-medium',
                          Number(quote.priceImpactPct) > 5
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-green-600 dark:text-green-400'
                        )}
                      >
                        {Number(quote.priceImpactPct).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Est. Swap Fees</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ~{cost.swapFees.toFixed(4)} {selectedToken.symbol}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Network Fees</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ~{cost.networkFees} XLM
                      </span>
                    </div>
                    <div className="pt-2 border-t border-gray-300 dark:border-gray-600">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          Total Cost
                        </span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          ~{cost.totalCost.toFixed(4)} {selectedToken.symbol}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* High Price Impact Warning */}
                {Number(quote.priceImpactPct) > 5 && (
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <div className="flex gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-amber-900 dark:text-amber-200">
                          High Price Impact
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                          Consider paying directly with USDC if possible.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* How It Works */}
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="text-xs font-medium text-blue-900 dark:text-blue-200 mb-1">
                    How This Works:
                  </div>
                  <ol className="text-xs text-blue-700 dark:text-blue-300 space-y-0.5 list-decimal list-inside">
                    <li>Swap {cost.tokenInAmount} {selectedToken.symbol} → {debtAmount.toFixed(2)} USDC</li>
                    <li>Pay {debtAmount.toFixed(2)} USDC to {debtorName}'s debt</li>
                    <li>Recorded on Stellar blockchain</li>
                  </ol>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    ⚡ All in one atomic transaction
                  </p>
                </div>
              </>
            ) : null}
          </CardContent>

          <CardFooter className="flex gap-3">
            <Button variant="secondary" onClick={onClose} className="flex-1" disabled={paying}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handlePay}
              className="flex-1"
              disabled={!quote || paying || loading || !secretKey || selectedToken?.address === TOKENS.USDC.address}
            >
              {paying ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Swap + Pay
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
