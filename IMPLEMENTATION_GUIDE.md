# 🔧 Guía de Implementación - Sistema de Pagos Pendientes

## 📋 Resumen de Cambios

Se ha implementado un sistema completo de **pagos pendientes** que resuelve los siguientes problemas:

1. ✅ **Pagos NO se descuentan inmediatamente** - Se crean como "pending" esperando aprobación del admin
2. ✅ **Cada pago es individual y separado** - No se agrupan, cada transacción tiene su propio registro
3. ✅ **Rechazar un pago NO elimina la deuda** - Solo marca el pago como rechazado
4. ✅ **Refresco automático de datos** - Después de cada transacción se actualizan los datos

---

## 🗄️ PASO 1: Aplicar Migración de Base de Datos

### Opción A: Desde MySQL Command Line

```bash
cd BACK
mysql -u root -p frutaHouse_db < migrations/001_create_pending_payment_table.sql
```

### Opción B: Desde MySQL Workbench

1. Abrir MySQL Workbench
2. Conectar a tu base de datos `frutaHouse_db`
3. Abrir el archivo `BACK/migrations/001_create_pending_payment_table.sql`
4. Ejecutar el script completo

### Opción C: Desde phpMyAdmin

1. Acceder a phpMyAdmin
2. Seleccionar la base de datos `frutaHouse_db`
3. Ir a la pestaña "SQL"
4. Copiar y pegar el contenido de `BACK/migrations/001_create_pending_payment_table.sql`
5. Ejecutar

### Verificar que la tabla se creó correctamente:

```sql
SHOW TABLES LIKE 'pending_payment';
DESC pending_payment;
```

Deberías ver la tabla `pending_payment` con las siguientes columnas:
- id
- debt_id
- customer_id
- amount
- payment_type
- reference
- notes
- status (pending, approved, rejected)
- stellar_tx_hash
- created_at
- updated_at

---

## 🚀 PASO 2: Reiniciar el Backend

```bash
cd BACK
npm install  # Por si acaso hay dependencias nuevas
npm run start:dev
```

Verifica que el servidor inicie sin errores y que veas en los logs:
```
[Nest] INFO [PendingPaymentModule] PendingPaymentModule initialized
```

### Endpoints Nuevos Disponibles:

- `POST /pending-payments` - Crear pago pendiente (público)
- `GET /pending-payments` - Listar todos los pagos pendientes
- `GET /pending-payments?status=pending` - Filtrar por status
- `GET /pending-payments/customer/:id` - Pagos de un cliente
- `GET /pending-payments/:id` - Obtener un pago específico
- `PATCH /pending-payments/:id/approve` - ✅ Aprobar pago
- `PATCH /pending-payments/:id/reject` - ❌ Rechazar pago
- `DELETE /pending-payments/:id` - Eliminar pago

---

## 🎨 PASO 3: Reiniciar el Frontend

```bash
cd ..  # Volver al directorio raíz
npm install  # Por si acaso
npm run dev
```

El frontend ahora:
- Usa `createPendingPayment()` en la vista pública
- Carga y muestra pending payments en la lista de pagos
- Aprueba/rechaza usando los nuevos endpoints

---

## 🧪 PASO 4: Probar el Flujo Completo

### Test 1: Crear Pago desde Vista Pública

1. Acceder a la vista pública: `http://localhost:5173/public/:siteId`
2. Encontrar un deudor con deuda pendiente
3. Hacer clic en "Pagar"
4. Ingresar monto (ej: 200) y referencia
5. Hacer clic en "Pagar con Stellar"
6. ✅ **VERIFICAR:** El pago se crea pero la deuda NO disminuye todavía

### Test 2: Ver Pagos Pendientes

1. Login como admin
2. Ir a "Pagos Pendientes" (o Dashboard)
3. ✅ **VERIFICAR:** El pago aparece con status "En Revisión"
4. ✅ **VERIFICAR:** Muestra el monto individual (200), no agrupado

### Test 3: Aprobar Pago

1. Hacer clic en "Aprobar" en el pago pendiente
2. ✅ **VERIFICAR:**
   - El pago desaparece de "pendientes"
   - La deuda del cliente SE DESCUENTA (74 → 64)
   - Se registra en blockchain
   - Aparece en historial como "Verificado"

### Test 4: Rechazar Pago

1. Crear otro pago de prueba (ej: 100)
2. Hacer clic en "Rechazar" en pendientes
3. ✅ **VERIFICAR:**
   - El pago desaparece de "pendientes"
   - La deuda del cliente NO cambia (sigue en 64)
   - NO se registra en blockchain

### Test 5: Pagos Múltiples Separados

1. Cliente con deuda de 1000
2. Paga 200 (pending)
3. Paga otros 200 (pending)
4. En "Pagos Pendientes" deberían aparecer **2 pagos separados de 200**
5. No un solo pago de 400

---

## 📊 Estructura de Datos

### Tabla `pending_payment`

```
+------------------+------------------------------------------+
| Campo            | Descripción                              |
+------------------+------------------------------------------+
| id               | ID único del pending payment             |
| debt_id          | ID de la deuda asociada                  |
| customer_id      | ID del cliente que paga                  |
| amount           | Monto del pago                           |
| payment_type     | stellar, cash, transfer, stripe          |
| reference        | Referencia/concepto del usuario          |
| notes            | Notas adicionales (ej: TxHash)           |
| status           | pending, approved, rejected              |
| stellar_tx_hash  | Hash de blockchain (si aplica)           |
| created_at       | Fecha de creación                        |
| updated_at       | Fecha de última actualización            |
+------------------+------------------------------------------+
```

---

## 🔄 Flujo del Sistema

### Vista Pública (Cliente)

```
1. Cliente ve su deuda: $1000
2. Cliente paga $200 via Stellar
3. Sistema crea pending_payment(status='pending')
4. Cliente SIGUE viendo $1000 de deuda
5. Mensaje: "Pago en revisión"
```

### Vista Admin

```
1. Admin ve lista de pending_payments con status='pending'
2. Admin revisa el pago de $200
3a. Si APRUEBA:
    - Llama a /debts/:id/pay (actualiza deuda + blockchain)
    - Marca pending_payment.status='approved'
    - Cliente ahora debe $800
3b. Si RECHAZA:
    - Solo marca pending_payment.status='rejected'
    - Cliente SIGUE debiendo $1000
```

---

## 🐛 Troubleshooting

### Error: "pending_payment table doesn't exist"

```bash
# Verificar que la migración se aplicó
mysql -u root -p -e "USE frutaHouse_db; SHOW TABLES LIKE 'pending_payment';"

# Si no existe, aplicar la migración manualmente
mysql -u root -p frutaHouse_db < BACK/migrations/001_create_pending_payment_table.sql
```

### Error: "Module not found: PendingPaymentModule"

```bash
# Asegurarte de que el archivo existe
ls -la BACK/src/modules/pending-payment/

# Reinstalar dependencias
cd BACK
rm -rf node_modules package-lock.json
npm install
npm run start:dev
```

### Los pagos NO aparecen en "Pendientes"

1. Verificar que el backend esté corriendo en puerto 4008
2. Abrir DevTools → Network → Ver si la request a `/pending-payments` retorna 200
3. Verificar en MySQL:
```sql
SELECT * FROM pending_payment WHERE status = 'pending';
```

### El pago se descuenta inmediatamente (bug antiguo)

- Verificar que estás usando el frontend actualizado
- Verificar que `PublicPayment.jsx` usa `createPendingPayment()` y NO `registerPayment()`
- Limpiar cache del navegador

---

## 📚 Archivos Modificados/Creados

### Backend (NestJS)

✨ **NUEVOS:**
- `BACK/src/modules/pending-payment/entities/pending-payment.entity.ts`
- `BACK/src/modules/pending-payment/pending-payment.module.ts`
- `BACK/src/modules/pending-payment/pending-payment.service.ts`
- `BACK/src/modules/pending-payment/pending-payment.controller.ts`
- `BACK/src/modules/pending-payment/dto/create-pending-payment.dto.ts`
- `BACK/migrations/001_create_pending_payment_table.sql`

📝 **MODIFICADOS:**
- `BACK/src/app.module.ts` - Registró PendingPaymentModule

### Frontend (React)

📝 **MODIFICADOS:**
- `src/constants/api.js` - Agregó endpoints de pending payments
- `src/services/debtService.js` - Agregó funciones para pending payments
- `src/contexts/DebtContext.jsx` - Carga y maneja pending payments
- `src/pages/PublicPayment.jsx` - Usa createPendingPayment en lugar de registerPayment

---

## ✅ Checklist de Verificación

- [ ] Migración SQL aplicada correctamente
- [ ] Backend reiniciado sin errores
- [ ] Frontend reiniciado sin errores
- [ ] Vista pública crea pending payments
- [ ] Deuda NO se descuenta inmediatamente
- [ ] Pagos pendientes aparecen en admin
- [ ] Aprobar pago descuenta la deuda
- [ ] Rechazar pago NO modifica la deuda
- [ ] Múltiples pagos aparecen separados
- [ ] Refresco automático funciona

---

## 🎯 Próximos Pasos (Opcional)

1. Agregar notificaciones por email cuando hay pagos pendientes
2. Agregar filtros por fecha en la vista de pendientes
3. Agregar paginación si hay muchos pagos pendientes
4. Exportar reporte de pagos pendientes a CSV/Excel
5. Dashboard con métricas de pagos pendientes/aprobados/rechazados

---

## 💬 Soporte

Si tienes problemas con la implementación:

1. Revisar los logs del backend: `BACK/logs/`
2. Revisar la consola del navegador (F12)
3. Verificar que la base de datos tiene la tabla `pending_payment`
4. Verificar que los endpoints respondan correctamente en Postman/Swagger

**Swagger Docs:** `http://localhost:4008/api`
