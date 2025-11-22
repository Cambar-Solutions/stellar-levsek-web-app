# 🔐 Implementación zkFetch - Levsek

## ¿Qué es zkFetch?

zkFetch es una tecnología de **pruebas de conocimiento cero** (Zero-Knowledge Proofs) que permite verificar criptográficamente datos de APIs externas sin revelar información sensible. Utilizamos el **Reclaim Protocol** para generar pruebas criptográficas de precios de criptomonedas y tasas de cambio.

## 📋 Tabla de Contenidos

1. [Arquitectura](#arquitectura)
2. [Prerequisitos](#prerequisitos)
3. [Instalación](#instalación)
4. [Cómo Probar](#cómo-probar)
5. [Endpoints API](#endpoints-api)
6. [Componentes Frontend](#componentes-frontend)
7. [Configuración](#configuración)
8. [Troubleshooting](#troubleshooting)

---

## 🏗️ Arquitectura

### Backend (NestJS)
```
BACKEND/src/modules/zkproof/
├── zkproof.module.ts       # Módulo NestJS
├── zkproof.controller.ts   # Endpoints REST API
├── zkproof.service.ts      # Lógica de generación de pruebas
└── dto/                    # DTOs (futuro)
```

### Frontend (React)
```
src/
├── services/
│   └── zkProofService.js   # Servicio para llamadas API
├── components/
│   └── VerifiedXLMPrice.jsx # Componente de precio verificado
└── constants/
    └── api.js              # Endpoints API
```

---

## 📦 Prerequisitos

- Node.js >= 16
- npm o yarn
- Backend corriendo en puerto 3000 (por defecto)
- Frontend corriendo en puerto 5173 (por defecto)

---

## 🚀 Instalación

Las dependencias ya están instaladas, pero si necesitas reinstalar:

```bash
# Backend
cd BACKEND
npm install @reclaimprotocol/zk-fetch @reclaimprotocol/js-sdk

# Verificar que se instalaron correctamente
npm list @reclaimprotocol/zk-fetch
npm list @reclaimprotocol/js-sdk
```

---

## 🧪 Cómo Probar

### Paso 1: Iniciar el Backend

```bash
cd BACKEND
npm run start:dev
```

**Salida esperada:**
```
[Nest] INFO [NestApplication] Nest application successfully started
[Nest] INFO [ZkProofService] ReclaimClient initialized successfully
```

### Paso 2: Probar Endpoints API

#### 2.1 Health Check
```bash
curl http://localhost:3000/zkproof/health
```

**Respuesta esperada:**
```json
{
  "success": true,
  "service": "zkProof",
  "status": "healthy",
  "timestamp": "2025-01-22T10:30:00.000Z"
}
```

#### 2.2 Obtener Precio Verificado de XLM
```bash
curl http://localhost:3000/zkproof/stellar-price
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "price": "0.125",
    "timestamp": "2025-01-22T10:30:00.000Z",
    "source": "CoinGecko API"
  },
  "proof": {
    "extractedParameterValues": {
      "price": "0.125"
    },
    "witnessData": {
      "message": "...",
      "signature": "...",
      "publicKey": "..."
    }
  },
  "metadata": {
    "timestamp": "2025-01-22T10:30:00.000Z",
    "extractedValues": {
      "price": "0.125"
    },
    "verified": true
  }
}
```

#### 2.3 Obtener Tasa de Cambio USD/MXN
```bash
curl http://localhost:3000/zkproof/exchange-rate
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "rate": "17.85",
    "timestamp": "2025-01-22T10:30:00.000Z",
    "source": "ExchangeRate API"
  },
  "proof": { ... },
  "metadata": { ... }
}
```

### Paso 3: Iniciar el Frontend

```bash
# En la raíz del proyecto
npm run dev
```

### Paso 4: Ver el Dashboard

1. Abre tu navegador en `http://localhost:5173`
2. Inicia sesión con tus credenciales
3. Ve al Dashboard
4. **¡Verás el componente "Verified XLM Price"!** 🎉

**Lo que verás:**
- 🛡️ Icono de escudo con verificación
- 💰 Precio actual de XLM en USD
- 📊 Fuente: CoinGecko API
- ⏰ Hora de última actualización
- ✅ Badge "Cryptographically Verified"

---

## 🔌 Endpoints API

### GET `/zkproof/health`
Verifica el estado del servicio zkProof.

**Response:**
```typescript
{
  success: boolean
  service: string
  status: string
  timestamp: string
}
```

### GET `/zkproof/stellar-price`
Obtiene el precio verificado de Stellar (XLM) con prueba criptográfica.

**Response:**
```typescript
{
  success: boolean
  data: {
    price: string        // Precio en USD
    timestamp: Date      // Hora de generación
    source: string       // Fuente de datos
  }
  proof: {
    extractedParameterValues: object
    witnessData: object
  }
  metadata: {
    timestamp: string
    extractedValues: object
    verified: boolean
  }
}
```

### GET `/zkproof/exchange-rate`
Obtiene la tasa de cambio USD/MXN verificada.

**Response:** (mismo formato que stellar-price)

---

## 🎨 Componentes Frontend

### VerifiedXLMPrice Component

**Ubicación:** `src/components/VerifiedXLMPrice.jsx`

**Uso:**
```jsx
import { VerifiedXLMPrice } from '../components/VerifiedXLMPrice'

function Dashboard() {
  return (
    <div>
      <VerifiedXLMPrice />
    </div>
  )
}
```

**Features:**
- ⏱️ Auto-refresh cada 5 minutos
- 🔄 Estados: Loading, Error, Success
- 🌗 Soporte para Dark Mode
- 📱 Diseño responsive
- 🛡️ Badge de verificación criptográfica

---

## ⚙️ Configuración

### Variables de Entorno (Backend)

Crea o actualiza tu archivo `.env` en `BACKEND/.env`:

```env
# Reclaim Protocol Credentials
RECLAIM_APP_ID=0x381994d6B9B08C3e7CfE3A4Cd544C85101b8f201
RECLAIM_APP_SECRET=0xfdc676e00ac9c648dfbcc271263c2dd95233a8abd391458c91ea88526a299223

# Stellar Configuration
SOROBAN_CONTRACT_ID=CCDFS3UOSJOM2RWKVFLT76SIKI3WCSVSFUGX24EL4NXVISFOFQB37KKO
STELLAR_RPC_URL=https://soroban-testnet.stellar.org
```

**Nota:** Las credenciales actuales son del ejemplo de zkfetch-stellar-example y son para testing. Para producción, deberías obtener tus propias credenciales de Reclaim Protocol.

### Variables de Entorno (Frontend)

El frontend usa la variable `VITE_API_URL` que ya está configurada:

```env
VITE_API_URL=https://stellar.api.levsek.com.mx
```

Para desarrollo local, puedes sobrescribirla:

```env
VITE_API_URL=http://localhost:3000
```

---

## 🐛 Troubleshooting

### Error: "ReclaimClient failed to initialize"

**Solución:**
1. Verifica que las dependencias estén instaladas:
   ```bash
   cd BACKEND
   npm list @reclaimprotocol/zk-fetch
   ```
2. Reinstala si es necesario:
   ```bash
   npm install @reclaimprotocol/zk-fetch @reclaimprotocol/js-sdk
   ```

### Error: "Failed to generate proof"

**Posibles causas:**
1. **Sin conexión a internet** - zkFetch necesita acceso a APIs externas
2. **API de CoinGecko caída** - Espera unos minutos y reintenta
3. **Credenciales incorrectas** - Verifica las variables de entorno

**Solución:**
```bash
# Verifica la conexión
curl https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=usd

# Reinicia el backend
cd BACKEND
npm run start:dev
```

### Error: "Component not showing on Dashboard"

**Solución:**
1. Verifica que el import esté correcto en `Dashboard.jsx`:
   ```jsx
   import { VerifiedXLMPrice } from '../components/VerifiedXLMPrice'
   ```
2. Verifica que el componente esté renderizado:
   ```jsx
   <VerifiedXLMPrice />
   ```
3. Abre DevTools (F12) y revisa la consola por errores

### Build Error: TypeScript Errors

Si obtienes errores de TypeScript al hacer build:

```bash
cd BACKEND
npm run build
```

Los errores deberían estar resueltos, pero si aparecen nuevos:
1. Verifica la sintaxis en `zkproof.service.ts`
2. Asegúrate de tener las validaciones de `!proof`

---

## 🎯 Casos de Uso

### 1. Dashboard - Precio Verificado
**Ubicación:** Dashboard principal
**Uso:** Muestra el precio actual de XLM verificado criptográficamente

### 2. Pagos Públicos (Futuro)
**Ubicación:** PublicPayment page
**Uso:** Mostrar tasa de cambio verificada al hacer pagos

### 3. Registro de Deudas (Futuro)
**Ubicación:** Debt creation
**Uso:** Guardar pruebas criptográficas de valores al momento de registro

---

## 📊 Testing Completo

### Test 1: Backend Compilation
```bash
cd BACKEND
npm run build
```
✅ **Expected:** Build exitoso sin errores TypeScript

### Test 2: Health Check
```bash
curl http://localhost:3000/zkproof/health
```
✅ **Expected:** `{ "success": true, "status": "healthy" }`

### Test 3: Stellar Price
```bash
curl http://localhost:3000/zkproof/stellar-price
```
✅ **Expected:** Objeto con `price`, `proof`, y `metadata`

### Test 4: Frontend Component
1. Inicia sesión
2. Ve al Dashboard
3. Busca el card "Verified XLM Price"
4. Verifica el ícono de escudo azul
5. Verifica el badge "Cryptographically Verified"

✅ **Expected:** Componente visible con precio y badge de verificación

---

## 📈 Próximos Pasos

### Fase 2 - Exchange Rate Component
```jsx
// Crear componente similar para tasa de cambio
<VerifiedExchangeRate />
```

### Fase 3 - Blockchain Verification
```typescript
// Almacenar pruebas en Stellar blockchain
async verifyProofOnChain(proof: any): Promise<string>
```

### Fase 4 - Public Payment Integration
```jsx
// Integrar en PublicPayment.jsx
<VerifiedXLMPrice />
<VerifiedExchangeRate />
```

---

## 🔐 Seguridad

- ✅ Zero-Knowledge Proofs vía Reclaim Protocol
- ✅ Verificación criptográfica de datos externos
- ✅ No se exponen secretos en el frontend
- ✅ TypeScript para type-safety
- ✅ Validación de respuestas API

---

## 📚 Referencias

- [Reclaim Protocol Docs](https://docs.reclaimprotocol.org/)
- [zkFetch GitHub](https://github.com/reclaimprotocol/zk-fetch)
- [Stellar SDK](https://stellar.github.io/js-stellar-sdk/)
- [Zero-Knowledge Proofs Explained](https://en.wikipedia.org/wiki/Zero-knowledge_proof)

---

## 🤝 Soporte

Si encuentras problemas:

1. **Revisa los logs del backend:**
   ```bash
   # Los logs mostrarán información detallada
   [Nest] LOG [ZkProofService] Generating Stellar price proof...
   [Nest] LOG [ZkProofService] ✅ Stellar price proof generated: $0.125
   ```

2. **Revisa la consola del navegador:**
   ```javascript
   // Deberías ver logs del servicio
   📊 zkProofService - Stellar price response: { success: true, ... }
   ```

3. **Verifica que todas las dependencias estén instaladas:**
   ```bash
   cd BACKEND
   npm install
   cd ..
   npm install
   ```

---

## ✅ Checklist de Implementación

- [x] Dependencias instaladas
- [x] Módulo zkproof creado
- [x] Service con generateStellarPriceProof()
- [x] Controller con endpoints REST
- [x] Módulo registrado en app.module.ts
- [x] Frontend service creado
- [x] Componente VerifiedXLMPrice creado
- [x] Integrado en Dashboard
- [x] Build exitoso sin errores
- [x] README de pruebas creado

---

¡Implementación completada! 🎉

Para cualquier pregunta o problema, revisa la sección de Troubleshooting o contacta al equipo de desarrollo.
