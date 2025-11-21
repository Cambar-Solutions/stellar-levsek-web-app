# ⚡ Quick Test Guide - Swap + Pay

## 🚀 Prueba en 3 Minutos

### Paso 1: Preparación (30 segundos)

```bash
# Terminal
npm run create-wallet
```

**Guarda el Secret Key que aparece** (empieza con `S...`)

---

### Paso 2: Inicia la App (10 segundos)

```bash
npm run dev
```

Abre: http://localhost:5173

---

### Paso 3: Login (20 segundos)

```
Email: 20223tn016@utez.edu.mx
Password: [tu contraseña]
```

---

### Paso 4: Ve a un Deudor (15 segundos)

1. Dashboard → Click en cualquier deudor
2. Click "Ver Detalle"

---

### Paso 5: Swap + Pay! (2 minutos)

1. **Click en botón verde:** "Swap + Pay (Cualquier Token)" ⚡

2. **Pega tu Secret Key** (el que guardaste en Paso 1)

3. **Selecciona token:**
   - Pagar con: XLM (default)
   - Deuda en: USDC

4. **Revisa la cotización:**
   ```
   Pagarás: ~1,000 XLM
   Para saldar: $100 USDC

   Exchange Rate: 1 XLM ≈ 0.10 USDC
   Price Impact: 2.5%
   Total Cost: ~1,003 XLM
   ```

5. **Click "Swap + Pay"**

6. **Espera 10-30 segundos...**

7. **✅ ¡Listo!**
   ```
   Success! Swapped 1,003 XLM for 100 USDC
   Payment processed! Tx: abc12345...
   ```

---

## 🎯 ¿Qué Acabas de Hacer?

1. ✅ Creaste una wallet de testnet con 10,000 XLM
2. ✅ Intercambiaste XLM por USDC automáticamente
3. ✅ Pagaste una deuda con el USDC intercambiado
4. ✅ Todo en una sola operación
5. ✅ Verificable en blockchain

---

## 🔍 Verifica en Blockchain

1. Copia el transaction hash del mensaje de éxito
2. Ve a: https://stellar.expert/explorer/testnet/tx/[HASH]
3. Verás:
   - Swap ejecutado
   - Tokens intercambiados
   - Timestamp
   - Todo el detalle técnico

---

## 💡 Pruebas Adicionales

### Test 1: Cambia de Token
- Intenta pagar con USDC directamente (no hace swap)
- Compara los costos

### Test 2: Deuda Grande
- Intenta pagar una deuda de $500 USDC
- Verás warning de "High Price Impact"

### Test 3: Verifica tu Balance
- Ve a: https://stellar.expert/explorer/testnet/account/[TU_PUBLIC_KEY]
- Ve cómo cambian tus balances de XLM y USDC

---

## ❌ Si Algo Falla

### "Invalid secret key"
→ Verifica que empiece con 'S' y tenga 56 caracteres

### "Insufficient funds"
→ Crea una nueva wallet: `npm run create-wallet`

### "Failed to get quote"
→ Reduce el monto de la deuda o intenta de nuevo

### Modal no se abre
→ F12 → Consola → Busca errores en rojo

---

## 📖 Más Información

- **Guía Completa:** `SWAP_AND_PAY_GUIDE.md`
- **Resumen:** `FEATURE_SUMMARY.md`
- **Próximas Features:** `NEXT_FEATURES.md`

---

## 🎉 ¡Disfruta!

Has probado una feature DeFi de nivel profesional.

**Esto que acabas de hacer en 3 minutos, normalmente requiere:**
- Ir a un exchange
- Hacer swap manualmente
- Volver a la app
- Registrar pago
- = 10+ minutos

**Con Swap + Pay: 3 minutos, un solo click.** 🚀
