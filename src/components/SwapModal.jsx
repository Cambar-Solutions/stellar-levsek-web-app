import { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent, CardFooter } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { cn } from '../lib/utils'
import {
  getSwapQuote,
  executeSwap,
  getSupportedTokens,
  formatTokenAmount,
  parseTokenAmount,
} from '../services/soroswapService'
import toast from 'react-hot-toast'

export function SwapModal({ isOpen, onClose, userSecretKey: providedSecretKey, onSwapComplete }) {
  const [tokenIn, setTokenIn] = useState(null)
  const [tokenOut, setTokenOut] = useState(null)
  const [amountIn, setAmountIn] = useState('')
  const [secretKey, setSecretKey] = useState(providedSecretKey || '')
  const [quote, setQuote] = useState(null)
  const [loading, setLoading] = useState(false)
  const [swapping, setSwapping] = useState(false)
  const [tokens] = useState(getSupportedTokens())

  // Initialize default tokens
  useEffect(() => {
    if (tokens.length >= 2) {
      setTokenIn(tokens[0]) // XLM
      setTokenOut(tokens[1]) // USDC
    }
  }, [tokens])

  // Update secret key when providedSecretKey changes
  useEffect(() => {
    if (providedSecretKey) {
      setSecretKey(providedSecretKey)
    }
  }, [providedSecretKey])

  // Get quote whenever inputs change
  useEffect(() => {
    const getQuote = async () => {
      if (!tokenIn || !tokenOut || !amountIn || Number(amountIn) <= 0) {
        setQuote(null)
        return
      }

      try {
        setLoading(true)
        const stroops = parseTokenAmount(amountIn)
        const quoteResult = await getSwapQuote(tokenIn.address, tokenOut.address, stroops)
        setQuote(quoteResult)
      } catch (error) {
        console.error('Error getting quote:', error)
        setQuote(null)
      } finally {
        setLoading(false)
      }
    }

    // Debounce quote requests
    const timeoutId = setTimeout(getQuote, 500)
    return () => clearTimeout(timeoutId)
  }, [tokenIn, tokenOut, amountIn])

  const handleSwap = async () => {
    if (!secretKey || secretKey.length < 56) {
      toast.error('Please enter a valid Stellar secret key')
      return
    }

    if (!tokenIn || !tokenOut || !amountIn || Number(amountIn) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    try {
      setSwapping(true)
      const stroops = parseTokenAmount(amountIn)

      toast.loading('Executing swap...', { id: 'swap' })

      const result = await executeSwap(
        secretKey,
        tokenIn.address,
        tokenOut.address,
        stroops
      )

      toast.success('Swap completed successfully!', { id: 'swap' })

      // Notify parent component
      if (onSwapComplete) {
        onSwapComplete({
          tokenIn: tokenIn.symbol,
          tokenOut: tokenOut.symbol,
          amountIn: formatTokenAmount(result.amountIn),
          amountOut: formatTokenAmount(result.amountOut),
          hash: result.hash,
        })
      }

      // Reset form
      setAmountIn('')
      setQuote(null)

      // Close modal after short delay
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (error) {
      console.error('Swap error:', error)
      toast.error(`Swap failed: ${error.message}`, { id: 'swap' })
    } finally {
      setSwapping(false)
    }
  }

  const handleTokenSwitch = () => {
    setTokenIn(tokenOut)
    setTokenOut(tokenIn)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-md my-auto">
        <Card className="max-h-[90vh] flex flex-col">
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Token Swap</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
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
                  Your secret key is used only for this transaction and is never stored.
                </p>
              </div>
            )}

            {/* From Token */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                From
              </label>
              <div className="flex gap-2">
                <select
                  value={tokenIn?.symbol || ''}
                  onChange={(e) => {
                    const token = tokens.find((t) => t.symbol === e.target.value)
                    setTokenIn(token)
                  }}
                  className="flex-shrink-0 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {tokens.map((token) => (
                    <option key={token.symbol} value={token.symbol}>
                      {token.symbol}
                    </option>
                  ))}
                </select>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amountIn}
                  onChange={(e) => setAmountIn(e.target.value)}
                  className="flex-1"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Swap Direction Button */}
            <div className="flex justify-center -my-2">
              <button
                onClick={handleTokenSwitch}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-600 dark:text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  />
                </svg>
              </button>
            </div>

            {/* To Token */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                To (estimated)
              </label>
              <div className="flex gap-2">
                <select
                  value={tokenOut?.symbol || ''}
                  onChange={(e) => {
                    const token = tokens.find((t) => t.symbol === e.target.value)
                    setTokenOut(token)
                  }}
                  className="flex-shrink-0 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {tokens.map((token) => (
                    <option key={token.symbol} value={token.symbol}>
                      {token.symbol}
                    </option>
                  ))}
                </select>
                <div className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white font-medium">
                  {loading ? (
                    <span className="text-gray-400">Loading...</span>
                  ) : quote ? (
                    formatTokenAmount(quote.amountOut)
                  ) : (
                    <span className="text-gray-400">0.00</span>
                  )}
                </div>
              </div>
            </div>

            {/* Quote Information */}
            {quote && (
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Exchange Rate</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      1 {tokenIn?.symbol} ≈{' '}
                      {(Number(formatTokenAmount(quote.amountOut)) / Number(amountIn)).toFixed(4)}{' '}
                      {tokenOut?.symbol}
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
                    <span className="text-gray-600 dark:text-gray-400">Slippage Tolerance</span>
                    <span className="font-medium text-gray-900 dark:text-white">5%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Warning for high price impact */}
            {quote && Number(quote.priceImpactPct) > 5 && (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <div className="flex gap-3">
                  <svg
                    className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                      High Price Impact
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      This swap will significantly impact the pool price. Consider reducing the
                      amount.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex gap-3">
            <Button variant="secondary" onClick={onClose} className="flex-1" disabled={swapping}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSwap}
              className="flex-1"
              disabled={!quote || swapping || loading}
            >
              {swapping ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
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
                  Swapping...
                </>
              ) : (
                'Swap'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
