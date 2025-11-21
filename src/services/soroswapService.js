import { SoroswapSDK, SupportedNetworks, SupportedProtocols, TradeType } from '@soroswap/sdk'
import {
  Horizon,
  rpc,
  Networks,
  TransactionBuilder,
  Keypair,
  Contract,
  Address,
  scValToNative,
} from '@stellar/stellar-sdk'

// Network Configuration
const TESTNET_HORIZON_URL = 'https://horizon-testnet.stellar.org'
const TESTNET_SOROBAN_URL = 'https://soroban-testnet.stellar.org'
const SOROSWAP_API_URL = 'https://api.soroswap.finance'

// Common Token Addresses on Testnet
export const TOKENS = {
  XLM: {
    address: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
    symbol: 'XLM',
    name: 'Stellar Lumens',
    decimals: 7,
  },
  USDC: {
    address: 'CDWEFYYHMGEZEFC5TBUDXM3IJJ7K7W5BDGE765UIYQEV4JFWDOLSTOEK',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 7,
  },
}

// Initialize servers
const horizonServer = new Horizon.Server(TESTNET_HORIZON_URL)
const sorobanServer = new rpc.Server(TESTNET_SOROBAN_URL)

// Initialize Soroswap SDK
const soroswapSDK = new SoroswapSDK({
  apiKey: import.meta.env.VITE_SOROSWAP_API_KEY || 'sk_7cc8ed943f9dc60115f478e5f86aa997f2c038a4587883634e4b6941dc4a8602',
  baseUrl: SOROSWAP_API_URL,
  defaultNetwork: SupportedNetworks.TESTNET,
})

/**
 * Get swap quote
 * @param {string} tokenInAddress - Input token contract address
 * @param {string} tokenOutAddress - Output token contract address
 * @param {string} amount - Amount to swap (in stroops - 7 decimals)
 * @returns {Promise<Object>} Quote with amountIn, amountOut, priceImpactPct, xdr
 */
export async function getSwapQuote(tokenInAddress, tokenOutAddress, amount) {
  try {
    console.log('🔍 Getting swap quote...', {
      tokenIn: tokenInAddress,
      tokenOut: tokenOutAddress,
      amount,
    })

    const quote = await soroswapSDK.quote({
      assetIn: tokenInAddress,
      assetOut: tokenOutAddress,
      amount: amount,
      slippageBps: 500, // 5% slippage tolerance
      tradeType: TradeType.EXACT_IN,
      protocols: [SupportedProtocols.SOROSWAP], // Specify protocol to use
    })

    console.log('💰 Quote received:', {
      amountIn: quote.amountIn.toString(),
      amountOut: quote.amountOut.toString(),
      priceImpact: quote.priceImpactPct,
    })

    return {
      amountIn: quote.amountIn,
      amountOut: quote.amountOut,
      priceImpactPct: quote.priceImpactPct,
      platform: quote.platform,
    }
  } catch (error) {
    console.error('Error getting swap quote:', error)
    throw new Error(`Failed to get swap quote: ${error.message}`)
  }
}

/**
 * Execute token swap
 * @param {string} secretKey - User's Stellar secret key
 * @param {string} tokenInAddress - Input token contract address
 * @param {string} tokenOutAddress - Output token contract address
 * @param {string} amount - Amount to swap (in stroops)
 * @returns {Promise<Object>} Transaction result with hash and status
 */
export async function executeSwap(secretKey, tokenInAddress, tokenOutAddress, amount) {
  try {
    const userWallet = Keypair.fromSecret(secretKey)
    const publicKey = userWallet.publicKey()

    console.log('🔄 Starting swap execution...')
    console.log('👤 User:', publicKey)
    console.log('📊 Swap:', { tokenInAddress, tokenOutAddress, amount })

    // Step 1: Get quote
    const quote = await soroswapSDK.quote({
      assetIn: tokenInAddress,
      assetOut: tokenOutAddress,
      amount: amount,
      slippageBps: 500, // 5% slippage
      tradeType: TradeType.EXACT_IN,
      protocols: [SupportedProtocols.SOROSWAP], // Specify protocol to use
    })

    console.log('💰 Quote:', {
      amountOut: quote.amountOut.toString(),
      priceImpact: quote.priceImpactPct,
    })

    // Step 2: Build transaction
    const buildResponse = await soroswapSDK.build({
      quote: quote,
      from: publicKey,
    })

    console.log('🔨 Transaction built')

    // Step 3: Sign transaction
    const tx = TransactionBuilder.fromXDR(buildResponse.xdr, Networks.TESTNET)
    tx.sign(userWallet)

    console.log('✍️ Transaction signed')

    // Step 4: Submit transaction
    const txXDR = tx.toXDR()
    const result = await soroswapSDK.send(txXDR, false, SupportedNetworks.TESTNET)

    console.log('✅ Swap executed successfully:', result)

    // Wait for confirmation
    const confirmation = await waitForTransactionConfirmation(result.hash)

    return {
      hash: result.hash,
      status: confirmation.status,
      amountIn: quote.amountIn.toString(),
      amountOut: quote.amountOut.toString(),
      priceImpactPct: quote.priceImpactPct,
    }
  } catch (error) {
    console.error('Error executing swap:', error)
    throw new Error(`Swap failed: ${error.message}`)
  }
}

/**
 * Get token balance for an address
 * @param {string} tokenAddress - Token contract address
 * @param {string} userAddress - User's public key
 * @returns {Promise<string>} Balance in stroops
 */
export async function getTokenBalance(tokenAddress, userAddress) {
  try {
    const account = await sorobanServer.getAccount(userAddress)

    // Build balance check transaction
    const contract = new Contract(tokenAddress)
    const tx = new TransactionBuilder(account, {
      fee: '1000',
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        contract.call(
          'balance',
          new Address(userAddress).toScVal()
        )
      )
      .setTimeout(300)
      .build()

    // Simulate to get balance
    const simulation = await sorobanServer.simulateTransaction(tx)

    if (simulation.result) {
      const balance = scValToNative(simulation.result.retval)
      return balance.toString()
    }

    return '0'
  } catch (error) {
    console.error('Error getting token balance:', error)
    return '0'
  }
}

/**
 * Wait for transaction confirmation
 * @param {string} txHash - Transaction hash
 * @returns {Promise<Object>} Transaction status
 */
async function waitForTransactionConfirmation(txHash) {
  console.log('⏳ Waiting for transaction confirmation...')

  const maxAttempts = 30
  let attempts = 0

  while (attempts < maxAttempts) {
    try {
      const txStatus = await sorobanServer.getTransaction(txHash)

      if (txStatus.status !== 'NOT_FOUND') {
        console.log('✅ Transaction confirmed:', txStatus.status)
        return txStatus
      }

      attempts++
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.error('Error checking transaction:', error)
      attempts++
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  throw new Error('Transaction confirmation timeout')
}

/**
 * Format amount for display (convert from stroops to token units)
 * @param {string|number} stroops - Amount in stroops (7 decimals)
 * @returns {string} Formatted amount
 */
export function formatTokenAmount(stroops) {
  const amount = Number(stroops) / 10000000 // 7 decimals
  return amount.toFixed(2)
}

/**
 * Parse amount for transaction (convert from token units to stroops)
 * @param {string|number} amount - Amount in token units
 * @returns {string} Amount in stroops
 */
export function parseTokenAmount(amount) {
  const stroops = Math.floor(Number(amount) * 10000000) // 7 decimals
  return stroops.toString()
}

/**
 * Get all supported tokens
 * @returns {Array} List of supported tokens
 */
export function getSupportedTokens() {
  return Object.values(TOKENS)
}

export { soroswapSDK, horizonServer, sorobanServer }
