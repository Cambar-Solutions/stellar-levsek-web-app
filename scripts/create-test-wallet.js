#!/usr/bin/env node

/**
 * Script para crear una wallet de testnet de Stellar con fondos
 * Ejecutar: node scripts/create-test-wallet.js
 */

import { Keypair, Horizon } from '@stellar/stellar-sdk'

const TESTNET_HORIZON_URL = 'https://horizon-testnet.stellar.org'

console.log('🚀 Creando nueva wallet de testnet de Stellar...\n')

// Generar nuevo keypair
const keypair = Keypair.random()
const publicKey = keypair.publicKey()
const secretKey = keypair.secret()

console.log('✅ Wallet creada exitosamente!\n')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('📋 GUARDA ESTA INFORMACIÓN EN UN LUGAR SEGURO:')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('')
console.log('🔑 Public Key (Dirección pública):')
console.log(`   ${publicKey}`)
console.log('')
console.log('🔐 Secret Key (Clave privada - NUNCA LA COMPARTAS):')
console.log(`   ${secretKey}`)
console.log('')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

// Intentar fondear la cuenta con Friendbot
console.log('\n💰 Fondeando cuenta con Friendbot (testnet)...')

const horizonServer = new Horizon.Server(TESTNET_HORIZON_URL)

try {
  const response = await horizonServer.friendbot(publicKey).call()

  console.log('✅ Cuenta fondeada exitosamente!')
  console.log('💵 Balance inicial: 10,000 XLM (testnet)')
  console.log('')
  console.log('🔗 Ver cuenta en Stellar Expert:')
  console.log(`   https://stellar.expert/explorer/testnet/account/${publicKey}`)
  console.log('')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')
  console.log('📝 Próximos pasos:')
  console.log('   1. Copia el Secret Key')
  console.log('   2. Ve al Dashboard de tu app')
  console.log('   3. Haz clic en "Swap Tokens"')
  console.log('   4. Pega tu Secret Key')
  console.log('   5. Intenta hacer un swap de 1 XLM a USDC')
  console.log('')
  console.log('⚠️  IMPORTANTE: Esta es una cuenta de TESTNET')
  console.log('   Solo úsala para pruebas, no tiene valor real.')
  console.log('')

} catch (error) {
  console.error('❌ Error al fondear cuenta:', error.message)
  console.log('')
  console.log('💡 Puedes fondear manualmente aquí:')
  console.log(`   https://laboratory.stellar.org/#account-creator?network=test`)
  console.log('')
  console.log('   O intenta de nuevo en unos segundos.')
}
