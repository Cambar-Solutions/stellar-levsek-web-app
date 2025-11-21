# 🧪 Guía de Prueba: Token Swap con Soroswap

## Opción 1: Crear cuenta nueva de testnet

### Método A: Usar Stellar Laboratory (Recomendado)

1. Ve a: https://laboratory.stellar.org/#account-creator?network=test
2. Haz clic en "Generate keypair"
3. **GUARDA ESTOS DATOS:**
   - Public Key: G... (tu dirección pública)
   - Secret Key: S... (tu clave privada - **NUNCA LA COMPARTAS**)
4. Haz clic en "Fund account with Friendbot" para recibir 10,000 XLM de testnet

### Método B: Usar el script que creé

Ejecuta en tu terminal:
```bash
node scripts/create-test-wallet.js
```

---

## Opción 2: Usar cuenta existente

Si ya tienes una cuenta de testnet con fondos, úsala directamente.

**Verificar fondos:**
- Ve a: https://stellar.expert/explorer/testnet/account/TU_PUBLIC_KEY
- Verifica que tengas XLM

---

## 🚀 Pasos para Probar el Swap

### 1. Inicia sesión en tu app
```
Email: 20223tn016@utez.edu.mx
Password: (tu contraseña)
```

### 2. Ve al Dashboard

Deberías ver un botón verde **"Swap Tokens"** en la sección de tu wallet.

### 3. Abre el Modal de Swap

Haz clic en el botón "Swap Tokens"

### 4. Ingresa tu Secret Key

En el campo "Stellar Secret Key", pega tu secret key (empieza con S...)

**⚠️ IMPORTANTE:**
- Solo usa secret keys de TESTNET
- NUNCA uses tu secret key de mainnet
- El secret key no se guarda, solo se usa para la transacción

### 5. Configura el Swap

**Ejemplo simple:**
- **From:** XLM
- **Amount:** 1
- **To:** USDC

Deberías ver:
- Cotización en tiempo real
- Tasa de cambio aproximada
- Impacto de precio
- Cantidad estimada a recibir

### 6. Ejecuta el Swap

Haz clic en el botón **"Swap"**

**Proceso:**
1. Se obtiene la cotización final
2. Se construye la transacción
3. Se firma con tu secret key
4. Se envía a Soroswap
5. Se espera confirmación (puede tardar 10-30 segundos)

### 7. Verifica el Resultado

Deberías ver:
- ✅ Notificación de éxito
- Mensaje con los montos intercambiados
- El modal se cierra automáticamente

---

## 🔍 Verificar la Transacción

### En Stellar Expert:
```
https://stellar.expert/explorer/testnet/account/TU_PUBLIC_KEY
```

Busca en el historial de transacciones la operación de swap.

### Verificar Balance:

Ve a la pestaña "Balances" y deberías ver:
- XLM reducido
- USDC incrementado (o el token que hayas elegido)

---

## 📊 Casos de Prueba Sugeridos

### Prueba 1: Swap Pequeño
```
From: XLM (1)
To: USDC
Expected: ~$0.10 USDC (precio variable)
```

### Prueba 2: Swap Mediano
```
From: XLM (100)
To: USDC
Expected: ~$10 USDC
Note: Puede tener mayor impacto de precio
```

### Prueba 3: Swap Inverso
```
From: USDC (1)
To: XLM
Expected: ~10 XLM
```

---

## ❌ Errores Comunes y Soluciones

### Error: "Please enter a valid Stellar secret key"
**Causa:** Secret key inválido o vacío
**Solución:** Verifica que el secret key empiece con 'S' y tenga 56 caracteres

### Error: "Failed to get swap quote"
**Causa:** No hay liquidez para ese par de tokens
**Solución:**
- Verifica que los tokens estén soportados en Soroswap testnet
- Reduce el monto a intercambiar

### Error: "Swap failed: insufficient funds"
**Causa:** No tienes suficientes tokens
**Solución:**
- Para XLM: usa Friendbot https://laboratory.stellar.org/#account-creator?network=test
- Para USDC: primero haz un swap de XLM a USDC

### Error: "Transaction confirmation timeout"
**Causa:** La red de testnet está lenta
**Solución:**
- Espera 1 minuto e intenta de nuevo
- Verifica en Stellar Expert si la transacción se procesó

### Warning: "High Price Impact"
**Causa:** El monto a intercambiar es muy grande para la liquidez disponible
**Solución:**
- Reduce el monto
- Acepta el impacto y continúa si estás de acuerdo

---

## 🎯 ¿Qué deberías ver?

### Antes del Swap:
```
Tu Balance:
- XLM: 10,000
- USDC: 0
```

### Después del Swap (ejemplo con 1 XLM):
```
Tu Balance:
- XLM: 9,998.99999 (1 XLM swapped + fees)
- USDC: ~0.10 (valor recibido)
```

---

## 🔐 Seguridad

- ✅ El secret key solo se usa para firmar la transacción
- ✅ No se guarda en ningún lado
- ✅ Solo funciona en testnet
- ✅ Transacciones verificables en blockchain
- ⚠️ NUNCA uses secret keys de mainnet en ambiente de prueba

---

## 📝 Logs de Desarrollo

Abre la consola del navegador (F12) para ver:
```
🔍 Getting swap quote...
💰 Quote received: { amountIn, amountOut, priceImpact }
🔄 Starting swap execution...
🔨 Transaction built
✍️ Transaction signed
✅ Swap executed successfully
```

---

## 🆘 ¿Necesitas Ayuda?

1. Verifica los logs de la consola
2. Checa el estado de la transacción en Stellar Expert
3. Verifica que tengas fondos suficientes
4. Asegúrate de estar en testnet

