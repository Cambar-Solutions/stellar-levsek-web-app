# 🚀 Swap + Pay Feature - Guía Completa de Pruebas

## 🎯 ¿Qué es Swap + Pay?

**Swap + Pay** es una feature revolucionaria que permite a los usuarios **pagar deudas con CUALQUIER token** que tengan disponible. La app automáticamente:

1. 🔄 **Swapea** el token que tienes → al token que necesitas (USDC)
2. 💰 **Paga** la deuda con el token intercambiado
3. ✅ **Registra** todo en blockchain de forma transparente

**Todo en UNA SOLA transacción atómica** - o todo funciona, o nada se ejecuta.

---

## 💡 Caso de Uso Real

### Escenario Tradicional (❌ Complicado):
```
Cliente tiene deuda de $100 USDC
Cliente solo tiene 1,000 XLM en su wallet

Pasos que debe hacer:
1. Ir a un exchange o DEX
2. Swap 1,000 XLM → ~100 USDC
3. Esperar confirmación
4. Volver a la app de deudas
5. Copiar la cantidad de USDC
6. Pagar la deuda
7. Esperar otra confirmación

Total: 7 pasos, 2+ minutos
```

### Con Swap + Pay (✅ FÁCIL):
```
Cliente tiene deuda de $100 USDC
Cliente solo tiene 1,000 XLM en su wallet

Pasos:
1. Click "Swap + Pay"
2. Selecciona "XLM" como método de pago
3. Confirma
4. ¡LISTO!

Total: 3 pasos, 30 segundos
```

---

## 🛠️ Cómo Funciona Técnicamente

### Flujo del Sistema:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuario selecciona "Swap + Pay (Cualquier Token)"       │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Modal se abre mostrando:                                 │
│    • Monto de la deuda en USDC                              │
│    • Selector de token para pagar (XLM, USDC, etc.)        │
│    • Cotización en tiempo real                              │
│    • Breakdown de costos                                    │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Sistema obtiene cotización (ZapperService):             │
│    • Consulta Soroswap API                                  │
│    • Calcula cuánto XLM se necesita para obtener X USDC    │
│    • Muestra precio de mercado + impacto + fees            │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Usuario confirma - Sistema ejecuta:                     │
│    a) Swap: XLM → USDC (vía Soroswap)                     │
│    b) Payment: USDC → Deuda (vía backend API)              │
│    c) Blockchain recording (transacción Stellar)           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Resultado:                                               │
│    ✅ Swap completado (con TX hash)                        │
│    ✅ Pago registrado en sistema                           │
│    ✅ Deuda actualizada                                    │
│    ✅ Todo verificable en blockchain                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Pre-requisitos para Pruebas

### 1. Wallet de Testnet con Fondos

**Opción A - Usar la wallet que creamos anteriormente:**
```
Secret Key: SDKK6TLZXVVJIN6INWRTEVNUO4OMGFIVIKDEURBBZVIYOFJ3A5I4GW6Y
Public Key: GCN47REOLBJ5PBLGODE5Y4YDWIG7YVMFN6FMIORNJ6J2DIF6JN5KPC6C
Balance inicial: 10,000 XLM
```

**Opción B - Crear nueva wallet:**
```bash
npm run create-wallet
```

### 2. Tener un Deudor con Deuda Pendiente

Si no tienes uno, créalo:
1. Ve al Dashboard
2. Click "Registrar Deudor"
3. Llena los datos (nombre, email, deuda inicial)
4. Guarda

### 3. App corriendo

```bash
npm run dev
```

---

## 🧪 GUÍA DE PRUEBAS PASO A PASO

### **Test 1: Pago Básico con Swap + Pay**

#### Objetivo:
Pagar una deuda de $10 USDC usando XLM

#### Pasos:

1. **Iniciar Sesión**
   ```
   Email: 20223tn016@utez.edu.mx
   Password: (tu contraseña)
   ```

2. **Ir al Dashboard**
   - Verás la lista de deudores
   - Localiza un deudor con deuda pendiente

3. **Abrir Detalle del Deudor**
   - Click en "Ver Detalle" del deudor
   - Verás su información y deuda pendiente

4. **Click en "Swap + Pay (Cualquier Token)"**
   - Botón verde con icono de rayo ⚡
   - Se abre el modal

5. **Configurar el Pago**
   - **Deuda mostrada:** $X USDC (lo que debe el deudor)
   - **Pagar con:** XLM (seleccionado por defecto)
   - **Secret Key:** Pega tu secret key de testnet
     ```
     SDKK6TLZXVVJIN6INWRTEVNUO4OMGFIVIKDEURBBZVIYOFJ3A5I4GW6Y
     ```

6. **Revisar la Cotización**

   Deberías ver:
   ```
   ┌─────────────────────────────────┐
   │ You Pay          →    Debt Paid │
   │ ~100 XLM              $10 USDC  │
   └─────────────────────────────────┘

   Exchange Rate: 1 XLM ≈ 0.10 USDC
   Price Impact: 0.5% ✅
   Est. Swap Fees: ~0.3 XLM
   Network Fees: ~0.00001 XLM
   ────────────────────────────────
   Total Cost: ~100.3 XLM
   ```

7. **Confirmar Pago**
   - Click en botón "Swap + Pay"
   - Espera 10-30 segundos

8. **Verificar Resultado**

   Deberías ver:
   ```
   ✅ Success notification:
   "Successfully paid $10.00 USDC using 100.3 XLM"

   ✅ Transaction hash visible:
   "Payment processed! Tx: abc12345..."
   ```

9. **Verificar en Blockchain**
   - Copia el transaction hash del toast
   - Ve a Stellar Expert:
     ```
     https://stellar.expert/explorer/testnet/tx/[HASH]
     ```
   - Verifica que la transacción fue exitosa

10. **Verificar en la App**
    - La deuda del deudor debería haberse reducido
    - Aparece un nuevo pago en su historial
    - El saldo pendiente está actualizado

#### ✅ Criterios de Éxito:
- [ ] Modal se abre correctamente
- [ ] Cotización se muestra en tiempo real
- [ ] Swap se ejecuta sin errores
- [ ] Pago se registra en el sistema
- [ ] Deuda se actualiza correctamente
- [ ] Transaction hash es válido en Stellar Expert

---

### **Test 2: Pago con Alto Impacto de Precio**

#### Objetivo:
Ver cómo el sistema maneja swaps grandes que afectan el precio

#### Pasos:

1. Sigue los pasos 1-5 del Test 1

2. **Intenta pagar una deuda GRANDE** (ej: $500 USDC)
   - Si no tienes un deudor con deuda tan grande, créalo primero

3. **Observa la Warning**

   Deberías ver una alerta naranja:
   ```
   ⚠️ High Price Impact

   This swap will significantly impact the pool price.
   Consider paying directly with USDC if possible.

   Price Impact: 15.7% ⚠️
   ```

4. **Decisión:**
   - **Opción A:** Reducir el monto a pagar
   - **Opción B:** Continuar con el alto impacto (para pruebas)

5. **Verificar que funciona** (si decides continuar)
   - El swap debe ejecutarse
   - El pago debe registrarse
   - Solo que el exchange rate será menos favorable

#### ✅ Criterios de Éxito:
- [ ] Warning se muestra cuando price impact > 5%
- [ ] El cálculo del impacto es preciso
- [ ] Usuario puede decidir continuar o cancelar
- [ ] Transacción funciona incluso con alto impacto

---

### **Test 3: Pago Parcial**

#### Objetivo:
Usar Swap + Pay para pagar solo PARTE de una deuda

#### Nota Actual:
En la versión actual, Swap + Pay paga el **monto total de la deuda**. Para pagos parciales, usa "Registrar Pago Tradicional".

#### Mejora Futura:
Permitir al usuario especificar el monto a pagar (no solo la deuda completa).

---

### **Test 4: Manejo de Errores**

#### 4.1 Secret Key Inválido

**Pasos:**
1. Abre Swap + Pay modal
2. Ingresa un secret key inválido: `SABCDEFG123`
3. Click "Swap + Pay"

**Resultado Esperado:**
```
❌ Error: "Please enter a valid Stellar secret key"
```

---

#### 4.2 Fondos Insuficientes

**Pasos:**
1. Usa una wallet con poco o sin XLM
2. Intenta pagar una deuda grande

**Resultado Esperado:**
```
❌ Error during swap:
"Insufficient funds to complete swap"
```

---

#### 4.3 Red Lenta/Timeout

**Pasos:**
1. Ejecuta Swap + Pay normalmente
2. Si la red de testnet está lenta, puede tardar más de 30 segundos

**Resultado Esperado:**
- Loading state persiste
- Eventualmente completa (puede tardar hasta 1 minuto en testnet)
- O muestra timeout error

**Solución:**
- Espera 1 minuto
- Verifica en Stellar Expert si la transacción se procesó
- Si se procesó, recarga la página

---

## 🔍 Verificación de Transacciones

### En Stellar Expert:

1. **Ve a tu cuenta:**
   ```
   https://stellar.expert/explorer/testnet/account/[TU_PUBLIC_KEY]
   ```

2. **Busca la transacción de swap:**
   - Operations → Contract Invocation
   - Verás la llamada a Soroswap Router
   - Detalles del swap (amount in/out)

3. **Verifica los balances:**
   - Antes del swap: X XLM, 0 USDC
   - Después del swap: X-100 XLM, ~10 USDC
   - Después del pago: X-100 XLM, 0 USDC (USDC pagado)

---

## 📊 Casos de Prueba Completos

| Test Case | Token | Deuda | Expected Result | Status |
|-----------|-------|-------|----------------|--------|
| 1. Pago pequeño | XLM | $10 USDC | ✅ Success | ⬜ Pending |
| 2. Pago mediano | XLM | $100 USDC | ✅ Success | ⬜ Pending |
| 3. Alto impacto | XLM | $500 USDC | ⚠️ Warning + Success | ⬜ Pending |
| 4. Secret key inválido | XLM | $10 USDC | ❌ Error mensaje | ⬜ Pending |
| 5. Sin fondos | XLM | $100 USDC | ❌ Insufficient funds | ⬜ Pending |
| 6. Pago directo USDC | USDC | $10 USDC | ✅ No swap needed | ⬜ Pending |

---

## 🎨 Elementos Visuales Esperados

### Modal de Swap + Pay:

```
┌─────────────────────────────────────────────────┐
│ ⚡ Swap + Pay                              [X] │
│ Pay Juan Pérez's debt with any token           │
├─────────────────────────────────────────────────┤
│                                                 │
│ [Secret Key Input - opcional si ya conectado]  │
│                                                 │
│ ┌─────────────────────────────────────────────┐│
│ │ Debt Amount                                 ││
│ │ $100.00 USDC                                ││
│ │ For: Juan Pérez                             ││
│ └─────────────────────────────────────────────┘│
│                                                 │
│ Pay With: [XLM ▼]                              │
│                                                 │
│ ┌─────────────────────────────────────────────┐│
│ │  You Pay    →       Debt Paid              ││
│ │  1,000 XLM          $100.00 USDC           ││
│ └─────────────────────────────────────────────┘│
│                                                 │
│ Exchange Rate: 1 XLM ≈ 0.10 USDC               │
│ Price Impact: 2.5% ✅                          │
│ Est. Swap Fees: ~3 XLM                         │
│ Network Fees: ~0.00001 XLM                     │
│ ─────────────────────────────────────           │
│ Total Cost: ~1,003 XLM                         │
│                                                 │
│ ℹ️ How This Works:                             │
│ 1. Swap 1,003 XLM → 100 USDC                   │
│ 2. Pay 100 USDC to Juan's debt                 │
│ 3. Transaction recorded on blockchain          │
│                                                 │
│ [Cancel]           [⚡ Swap + Pay]             │
└─────────────────────────────────────────────────┘
```

---

## 🐛 Solución de Problemas Comunes

### Error: "Failed to get swap quote"

**Causa:** No hay liquidez en Soroswap testnet para ese par
**Solución:**
- Verifica que estés usando XLM ↔ USDC (los más líquidos)
- Reduce el monto del pago
- Intenta de nuevo en unos minutos

---

### Error: "Swap failed"

**Causa:** Transacción rechazada por falta de fondos o slippage
**Solución:**
- Verifica que tengas suficiente XLM (+ 5% buffer para fees)
- Si el price impact es >5%, reduce el monto
- Intenta con un monto menor

---

### Modal no se abre

**Causa:** Error de JavaScript
**Solución:**
1. Abre la consola del navegador (F12)
2. Busca errores en rojo
3. Recarga la página
4. Si persiste, reporta el error con el screenshot

---

### Cotización tarda mucho en cargar

**Causa:** Soroswap API lenta o testnet congestionada
**Solución:**
- Espera 10-15 segundos
- Si no carga, refresca el modal (cierra y abre de nuevo)
- Verifica tu conexión a internet

---

## 📝 Logs para Debugging

Abre la consola del navegador (F12) y verás:

```javascript
💡 Calculating payment quote...
💰 Payment quote calculated: {
  neededInput: "1003.45",
  willReceive: "100.00",
  priceImpact: 2.5
}

🚀 Starting Swap + Pay operation...
📊 Quote received: { willSwap: "1003.45", tokenIn: "XLM", ... }

🔄 Executing swap...
✅ Swap completed: { hash: "abc123...", received: "100.00" }

💳 Registering payment...
✅ Payment registered successfully!

✅ Swap + Pay complete!
```

---

## ✅ Checklist Final de Validación

Antes de considerar la feature completa, verifica:

**Funcionalidad:**
- [ ] Modal se abre/cierra correctamente
- [ ] Cotización se obtiene en tiempo real
- [ ] Selector de token funciona
- [ ] Cálculos de costos son precisos
- [ ] Swap se ejecuta exitosamente
- [ ] Pago se registra en backend
- [ ] Deuda se actualiza correctamente
- [ ] Transaction hash es válido

**UX/UI:**
- [ ] Loading states aparecen durante procesos
- [ ] Mensajes de error son claros
- [ ] Warnings se muestran cuando es necesario
- [ ] Success toasts aparecen
- [ ] Diseño responsive en móvil
- [ ] Dark mode funciona correctamente

**Seguridad:**
- [ ] Secret key no se guarda
- [ ] Secret key no se muestra en logs
- [ ] Validación de inputs funciona
- [ ] No se puede ejecutar sin fondos
- [ ] Slippage protection activa

**Blockchain:**
- [ ] Transacciones verificables en Stellar Expert
- [ ] Balances se actualizan correctamente
- [ ] Hash de transacción es accesible
- [ ] Operaciones son atómicas (todo o nada)

---

## 🎓 Educación para Usuarios Finales

### ¿Qué decirle a tus clientes?

**Mensaje Simple:**
> "Ahora puedes pagar con cualquier token que tengas. Si tienes XLM pero la deuda es en USDC, no hay problema - nosotros lo convertimos automáticamente."

**Beneficios Clave:**
1. ✅ **Más fácil:** No necesitas ir a un exchange primero
2. ✅ **Más rápido:** Todo en una sola transacción
3. ✅ **Transparente:** Todo verificable en blockchain
4. ✅ **Seguro:** Transacción atómica (o todo funciona o nada)

---

## 🚀 Próximos Pasos (Mejoras Futuras)

1. **Soporte para más tokens:**
   - Agregar yUSDC, AQUA, etc.
   - Permitir swaps entre cualquier par

2. **Pagos parciales con Swap + Pay:**
   - Permitir al usuario especificar monto
   - No solo pagar el total de la deuda

3. **Multi-hop swaps:**
   - XLM → USDC → yUSDC (si es más eficiente)
   - Optimización automática de rutas

4. **Slippage personalizado:**
   - Permitir al usuario ajustar tolerancia
   - Actualmente fijo en 5%

5. **Estimación de tiempo:**
   - Mostrar tiempo estimado de confirmación
   - Notificación cuando se complete

---

## 📞 Soporte

¿Problemas durante las pruebas?

1. Revisa los logs de consola (F12)
2. Verifica la transacción en Stellar Expert
3. Asegúrate de estar en testnet
4. Checa que tengas fondos suficientes

---

## 🎉 ¡Felicidades!

Has implementado con éxito una feature DeFi de nivel profesional. **Swap + Pay** es una funcionalidad que pocas aplicaciones tienen, y ahora tu plataforma de gestión de deudas está a la vanguardia de la innovación en blockchain.

**¡A probar!** 🚀
