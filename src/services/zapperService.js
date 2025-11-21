import { getSwapQuote, executeSwap, TOKENS, formatTokenAmount, parseTokenAmount } from './soroswapService'
import { registerPayment } from './debtService'

/**
 * Zapper Service - Combines Swap + Pay in one operation
 * Allows users to pay debts with ANY token
 */

/**
 * Calculate how much of tokenIn is needed to pay a specific amount of tokenOut
 * @param {string} tokenInAddress - Input token address
 * @param {string} tokenOutAddress - Output token address (usually USDC)
 * @param {string} targetAmount - Amount needed in tokenOut (in token units, not stroops)
 * @returns {Promise<Object>} Quote with amountIn needed and swap details
 */
export async function getPaymentQuote(tokenInAddress, tokenOutAddress, targetAmount) {
  try {
    console.log('💡 Calculating payment quote...', {
      tokenIn: tokenInAddress,
      tokenOut: tokenOutAddress,
      targetAmount,
    })

    // Check if tokens are the same
    if (tokenInAddress === tokenOutAddress) {
      throw new Error('Cannot get quote for same token swap')
    }

    // Convert target amount to stroops
    const targetStroops = parseTokenAmount(targetAmount)

    // Get quote for target amount
    // Note: This is "EXACT_OUT" but Soroswap SDK uses EXACT_IN
    // So we'll estimate by getting quote for similar amount
    const estimatedInputStroops = parseTokenAmount(Number(targetAmount) * 10) // Rough estimate

    const quote = await getSwapQuote(tokenInAddress, tokenOutAddress, estimatedInputStroops)

    // Calculate actual ratio
    const ratio = Number(quote.amountIn) / Number(quote.amountOut)
    const neededInputStroops = Math.ceil(Number(targetStroops) * ratio * 1.05) // 5% buffer for slippage

    // Get final quote with calculated amount
    const finalQuote = await getSwapQuote(tokenInAddress, tokenOutAddress, neededInputStroops.toString())

    console.log('💰 Payment quote calculated:', {
      neededInput: formatTokenAmount(finalQuote.amountIn),
      willReceive: formatTokenAmount(finalQuote.amountOut),
      target: targetAmount,
      priceImpact: finalQuote.priceImpactPct,
    })

    return {
      tokenInAmount: finalQuote.amountIn, // How much user needs to swap
      tokenOutAmount: finalQuote.amountOut, // How much they'll receive
      targetAmount: targetStroops, // How much they want to pay
      priceImpactPct: finalQuote.priceImpactPct,
      tokenInSymbol: getTokenSymbol(tokenInAddress),
      tokenOutSymbol: getTokenSymbol(tokenOutAddress),
    }
  } catch (error) {
    console.error('Error getting payment quote:', error)
    throw new Error(`Failed to calculate payment quote: ${error.message}`)
  }
}

/**
 * Execute Swap + Pay operation
 * @param {string} secretKey - User's secret key
 * @param {number} debtId - Debt ID to pay
 * @param {string} tokenInAddress - Token user wants to pay with
 * @param {string} tokenOutAddress - Token the debt requires (usually USDC)
 * @param {string} paymentAmount - Amount to pay (in token units)
 * @param {Object} options - Additional options (paymentType, notes)
 * @returns {Promise<Object>} Result with swap and payment details
 */
export async function executeSwapAndPay(
  secretKey,
  debtId,
  tokenInAddress,
  tokenOutAddress,
  paymentAmount,
  options = {}
) {
  try {
    console.log('🚀 Starting Swap + Pay operation...', {
      debtId,
      paymentAmount,
      tokenIn: getTokenSymbol(tokenInAddress),
      tokenOut: getTokenSymbol(tokenOutAddress),
    })

    // Check if tokens are the same - no swap needed
    if (tokenInAddress === tokenOutAddress) {
      throw new Error(
        `Cannot swap same token. You selected ${getTokenSymbol(tokenInAddress)} to pay a ${getTokenSymbol(tokenOutAddress)} debt. Please pay directly instead of using Swap + Pay.`
      )
    }

    // Step 1: Get quote to know how much to swap
    const quote = await getPaymentQuote(tokenInAddress, tokenOutAddress, paymentAmount)

    console.log('📊 Quote received:', {
      willSwap: formatTokenAmount(quote.tokenInAmount),
      tokenIn: quote.tokenInSymbol,
      willReceive: formatTokenAmount(quote.tokenOutAmount),
      tokenOut: quote.tokenOutSymbol,
    })

    // Step 2: Execute swap
    console.log('🔄 Executing swap...')
    const swapResult = await executeSwap(
      secretKey,
      tokenInAddress,
      tokenOutAddress,
      quote.tokenInAmount.toString()
    )

    console.log('✅ Swap completed:', {
      hash: swapResult.hash,
      received: formatTokenAmount(swapResult.amountOut),
      token: quote.tokenOutSymbol,
    })

    // Step 3: Register payment with the backend
    console.log('💳 Registering payment...')

    const paymentPayload = {
      amount: parseFloat(formatTokenAmount(swapResult.amountOut)),
      paymentType: options.paymentType || 'crypto',
      notes: options.notes || `Paid with ${quote.tokenInSymbol} via Swap + Pay`,
      // Additional metadata for tracking
      swapTxHash: swapResult.hash,
      originalToken: quote.tokenInSymbol,
      originalAmount: formatTokenAmount(quote.tokenInAmount),
      swappedToken: quote.tokenOutSymbol,
      swappedAmount: formatTokenAmount(swapResult.amountOut),
    }

    const paymentResult = await registerPayment(debtId, paymentPayload)

    console.log('✅ Payment registered successfully!')

    return {
      success: true,
      swap: {
        hash: swapResult.hash,
        tokenIn: quote.tokenInSymbol,
        amountIn: formatTokenAmount(quote.tokenInAmount),
        tokenOut: quote.tokenOutSymbol,
        amountOut: formatTokenAmount(swapResult.amountOut),
        priceImpact: swapResult.priceImpactPct,
      },
      payment: {
        debtId,
        amount: paymentPayload.amount,
        paymentType: paymentPayload.paymentType,
        result: paymentResult,
      },
      message: `Successfully paid ${paymentPayload.amount} ${quote.tokenOutSymbol} using ${formatTokenAmount(quote.tokenInAmount)} ${quote.tokenInSymbol}`,
    }
  } catch (error) {
    console.error('❌ Swap + Pay failed:', error)
    throw new Error(`Swap + Pay operation failed: ${error.message}`)
  }
}

/**
 * Get available tokens for payment
 * @returns {Array} List of tokens that can be used to pay
 */
export function getPaymentTokens() {
  return Object.values(TOKENS)
}

/**
 * Get token symbol from address
 * @param {string} address - Token contract address
 * @returns {string} Token symbol (XLM, USDC, etc.)
 */
function getTokenSymbol(address) {
  const token = Object.values(TOKENS).find((t) => t.address === address)
  return token ? token.symbol : 'UNKNOWN'
}

/**
 * Estimate total cost including fees
 * @param {string} tokenInAddress - Input token address
 * @param {string} tokenOutAddress - Output token address
 * @param {string} paymentAmount - Amount to pay
 * @returns {Promise<Object>} Estimated costs
 */
export async function estimatePaymentCost(tokenInAddress, tokenOutAddress, paymentAmount) {
  try {
    const quote = await getPaymentQuote(tokenInAddress, tokenOutAddress, paymentAmount)

    const networkFees = 0.00001 // Stellar network fee (very low)
    const swapFees = Number(formatTokenAmount(quote.tokenInAmount)) * 0.003 // 0.3% swap fee estimate

    return {
      tokenInAmount: formatTokenAmount(quote.tokenInAmount),
      networkFees,
      swapFees,
      totalCost: Number(formatTokenAmount(quote.tokenInAmount)) + networkFees + swapFees,
      tokenInSymbol: quote.tokenInSymbol,
      paymentAmount,
      tokenOutSymbol: quote.tokenOutSymbol,
      priceImpact: quote.priceImpactPct,
    }
  } catch (error) {
    console.error('Error estimating payment cost:', error)
    throw error
  }
}

/**
 * Validate if user has enough balance to make payment
 * @param {string} tokenAddress - Token to pay with
 * @param {string} requiredAmount - Amount needed (in stroops)
 * @param {string} userBalance - User's balance (in stroops)
 * @returns {boolean} Whether user has sufficient balance
 */
export function hasSufficientBalance(tokenAddress, requiredAmount, userBalance) {
  const required = Number(requiredAmount)
  const balance = Number(userBalance)

  // Add 5% buffer for fees and slippage
  const requiredWithBuffer = required * 1.05

  return balance >= requiredWithBuffer
}

export default {
  getPaymentQuote,
  executeSwapAndPay,
  getPaymentTokens,
  estimatePaymentCost,
  hasSufficientBalance,
}
