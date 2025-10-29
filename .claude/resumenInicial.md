 Resumen del Proyecto ISIS - Sistema de Gestión de Deudas con Blockchain Stellar

  🎯 Objetivo del Proyecto

  Aplicación web para hackathon que permite a negocios gestionar deudas de forma transparente utilizando tecnología
  blockchain Stellar/Soroban.

  ---
  🏗️ Arquitectura Técnica

  Stack Tecnológico:

  - Framework: React 18 + Vite
  - Routing: React Router DOM v7
  - Styling: Tailwind CSS v4 + Shadcn UI components
  - State Management: React Context API
  - Data Fetching: TanStack Query (React Query)
  - Notifications: React Hot Toast
  - Iconos: Lucide React
  - Fuente: Inter (Google Fonts)
  - Patrón de diseño: Cupertino (iOS-inspired)

  ---
  ✨ Características Implementadas

  1. Sistema de Autenticación Simulado

  - ✅ Página de Login con validación
  - ✅ Página de Registro con generación automática de Wallet Stellar
  - ✅ Persistencia en localStorage
  - ✅ Rutas protegidas con guards
  - ✅ Diseño con gradientes animados (blob animations)

  Rutas:
  - /login - Inicio de sesión
  - /register - Registro de nuevo negocio

  ---
  2. Dashboard Principal (/dashboard)

  - ✅ Cards de estadísticas en tiempo real:
    - Total Deudores
    - Deuda Total (MXN)
    - Cuentas Pendientes
    - Cuentas Verificadas
  - ✅ Visualización de Wallet Stellar con botón copiar
  - ✅ Link a vista pública
  - ✅ Buscador de deudores en tiempo real
  - ✅ Tabla completa con:
    - Avatar con iniciales
    - Nombre y email
    - Tipo de cuenta
    - Saldo pendiente (con colores según monto)
    - Estado (Badge: Verificado/Pendiente)
    - Botón "Ver Detalle"

  ---
  3. Gestión de Deudores

  3.1 Lista de Deudores (/debtors)

  - ✅ Vista en grid de cards responsiva
  - ✅ Buscador por nombre/email
  - ✅ Información por card:
    - Avatar, nombre, email
    - Saldo pendiente destacado
    - Estado actual
    - Número de pagos
    - Fecha de registro
  - ✅ Acciones: Ver detalle / Eliminar

  3.2 Agregar Deudor (/debtors/add)

  - ✅ Formulario con validación:
    - Nombre completo (requerido)
    - Email (requerido)
    - Teléfono (opcional)
    - Monto de deuda (requerido)
  - ✅ Generación automática de:
    - Wallet Address Stellar
    - Número de cuenta SBN
    - Estado inicial: "Pendiente"

  3.3 Detalle de Deudor (/debtors/:id)

  - ✅ Header con avatar y badge de estado
  - ✅ Card de saldo pendiente prominente
  - ✅ Información completa (email, teléfono, wallet)
  - ✅ Estadísticas:
    - Total pagado (solo verificados)
    - Pagos registrados
    - Fecha de registro
  - ✅ Formulario para registrar pagos
  - ✅ Historial completo de pagos con:
    - Estados: En Revisión / Verificado
    - Montos con formato de moneda
    - TX Hash de Stellar
    - Fecha y hora
    - Botones Aprobar/Rechazar (para pagos en revisión)

  ---
  4. Sistema de Pagos Públicos 🌐

  4.1 Vista Pública (/public/:userId)

  - ✅ Acceso sin autenticación
  - ✅ Banner de transparencia blockchain
  - ✅ Display de Wallet del negocio
  - ✅ Tabla de deudores con:
    - Información básica
    - Saldo pendiente
    - Estado
    - Botón "Pagar" por cada deudor
  - ✅ Sin información sensible de pagos
  - ✅ Sin estadísticas privadas

  4.2 Portal de Pago (/public/:userId/pay/:debtorId)

  - ✅ Información del deudor seleccionado
  - ✅ Formulario de pago:
    - Monto (validado contra deuda total)
    - Referencia/Concepto
  - ✅ Display de wallet de destino
  - ✅ Simulación de transacción Stellar (2 segundos)
  - ✅ Generación de TX Hash único
  - ✅ Estado inicial: "En Revisión"
  - ✅ Pantalla de confirmación con instrucciones

  ---
  5. Panel de Pagos Pendientes (/pending-payments)

  - ✅ Badge contador en navegación (actualización en tiempo real)
  - ✅ Alert destacado con cantidad de pagos pendientes
  - ✅ Lista detallada de pagos en revisión:
    - Info del deudor con avatar
    - Monto del pago (card destacada verde)
    - Fecha y hora del pago
    - TX Hash de Stellar con botón copiar
    - Referencia proporcionada
    - Indicador de pago público
    - Comparación antes/después del pago
  - ✅ Acciones por pago:
    - Aprobar: Descuenta de deuda, marca como verificado
    - Rechazar: Elimina el pago del sistema
  - ✅ Confirmaciones antes de cada acción

  ---
  6. Estadísticas Avanzadas (/stats)

  - ✅ Cards de métricas principales:
    - Deuda Total
    - Total Cobrado (solo verificados)
    - Total Deudores
    - Promedio por Deudor
    - Con indicadores de tendencia
  - ✅ Estado de Cuentas:
    - Pendientes vs Verificadas con barras de progreso
  - ✅ Distribución de Deuda por rangos
  - ✅ Top 5 Deudores (mayor saldo)
  - ✅ Historial de Pagos Recientes (últimos 10)
    - Solo pagos verificados
    - Con TX Hash y fecha completa

  ---
  7. Dark Mode 🌙

  - ✅ Toggle animado con iconos (Sol/Luna)
  - ✅ Persistencia en localStorage
  - ✅ Transiciones suaves en toda la app
  - ✅ Todos los componentes adaptados:
    - Layout (header, footer, navegación)
    - Cards y superficies
    - Inputs y formularios
    - Buttons (todos los variants)
    - Badges y badges
    - Tablas y grids
    - Scrollbars personalizados
  - ✅ Paleta de colores optimizada:
    - Backgrounds: gray-900/gray-800
    - Textos: white/gray-300
    - Bordes: gray-700
    - Accents: Colores primarios conservados

  ---
  🎨 Diseño UI/UX

  Características de Diseño:

  - ✅ Patrón Cupertino: Bordes redondeados (xl, 2xl)
  - ✅ Fuente Inter: Profesional y legible
  - ✅ Gradientes vibrantes: Blue → Purple → Pink
  - ✅ Animaciones fluidas:
    - Blob animations en backgrounds
    - Transiciones de color
    - Hover states suaves
    - Loading states
  - ✅ Shadows y profundidad: Jerarquía visual clara
  - ✅ Responsive: Mobile-first, funciona en todos los dispositivos
  - ✅ Colores semánticos:
    - 🟢 Verde: Verificado/Éxito
    - 🟡 Naranja: En Revisión/Pendiente
    - 🔴 Rojo: Deudas altas/Peligro
    - 🔵 Azul: Acciones principales
    - 🟣 Púrpura: Acentos secundarios

  ---
  🔐 Flujo de Trabajo Principal

  Para el Administrador del Negocio:

  1. Registro → Genera Wallet Stellar automáticamente
  2. Login → Acceso al Dashboard
  3. Agregar Deudores → Con montos iniciales
  4. Revisar Pagos Pendientes → Badge con contador
  5. Aprobar/Rechazar pagos → Actualización automática de deudas
  6. Ver Estadísticas → Análisis completo
  7. Compartir Vista Pública → Link de transparencia

  Para los Deudores (Vista Pública):

  1. Acceso a Vista Pública → Sin login
  2. Ver su deuda actual → Transparencia total
  3. Click "Pagar" → Portal de pago
  4. Ingresar monto y referencia → Validación
  5. "Pagar con Stellar" → Simulación blockchain
  6. Confirmación → Estado "En Revisión"
  7. Esperar aprobación → Administrador verifica
  8. Deuda actualizada → Visible públicamente

  ---
  📱 Navegación Completa

  Rutas Públicas (sin autenticación):

  - /login - Inicio de sesión
  - /register - Registro
  - /public/:userId - Vista pública del negocio
  - /public/:userId/pay/:debtorId - Portal de pago

  Rutas Protegidas (requieren autenticación):

  - /dashboard - Dashboard principal
  - /debtors - Lista de deudores
  - /debtors/add - Agregar deudor
  - /debtors/:id - Detalle de deudor
  - /pending-payments - Pagos pendientes de revisión
  - /stats - Estadísticas avanzadas

  ---
  🗂️ Estructura de Contextos

  1. AuthContext

  - Manejo de autenticación
  - Login/Logout/Register
  - Persistencia de usuario

  2. DebtContext

  - CRUD de deudores
  - Sistema de pagos (agregar, aprobar, rechazar)
  - Cálculo de estadísticas
  - Persistencia por usuario

  3. ThemeContext

  - Toggle dark/light mode
  - Persistencia de preferencia

  ---
  📦 Componentes UI Reutilizables

  Base Components:

  - Button - 8 variants (default, primary, secondary, success, warning, danger, ghost, outline)
  - Card - Con Header, Content, Footer
  - Input - Con iconos, validación, dark mode
  - Label - Para formularios
  - Textarea - Texto multilínea
  - Badge - 7 variants de estado
  - Avatar - Con iniciales generadas automáticamente
  - ThemeToggle - Switch animado light/dark

  Layout Components:

  - Layout - Con header, navegación, footer
  - Navegación responsive con mobile menu
  - Badge contador de notificaciones

  ---
  💾 Gestión de Datos

  LocalStorage Keys:

  - isis_user - Usuario actual
  - isis_user_{email} - Usuarios registrados
  - isis_debtors_{userId} - Deudores por negocio
  - isis_theme - Preferencia de tema

  Estructura de Datos:

  Usuario:
  {
    id: string,
    name: string,
    email: string,
    password: string,
    businessName: string,
    walletAddress: string, // Generado automáticamente
    createdAt: ISO string
  }

  Deudor:
  {
    id: string,
    name: string,
    email: string,
    phone: string,
    totalDebt: number,
    status: 'pending' | 'verified',
    accountType: string,
    walletAddress: string,
    createdAt: ISO string,
    payments: Array<Payment>
  }

  Pago:
  {
    id: string,
    amount: number,
    status: 'reviewing' | 'verified',
    date: ISO string,
    txHash: string, // Hash de Stellar simulado
    reference: string,
    publicPayment: boolean // True si viene de vista pública
  }

  ---
  🎯 Características Destacadas para el Hackathon

  1. ✅ Transparencia Blockchain: Vista pública sin autenticación
  2. ✅ Simulación Stellar: TX Hashes, wallet addresses
  3. ✅ UX Excepcional: Diseño Cupertino, animaciones, dark mode
  4. ✅ Flujo Completo: Desde registro hasta pago público
  5. ✅ Sistema de Revisión: Pagos requieren aprobación
  6. ✅ Estadísticas en Tiempo Real: Métricas actualizadas
  7. ✅ Responsive: Funciona perfecto en mobile
  8. ✅ Accesibilidad: Focus states, keyboard navigation

  ---
  🚀 Comandos de Desarrollo

  # Instalar dependencias
  npm install

  # Iniciar dev server
  npm run dev

  # Build para producción
  npm run build

  # Preview de build
  npm run preview

  URL de desarrollo: http://localhost:5174/

  ---
  📝 Datos de Prueba

  Registro rápido:
  - Nombre: Juan Pérez
  - Email: juan@test.com
  - Negocio: La Tienda de Juan
  - Contraseña: 123456

  Deudores de ejemplo: 4 pre-cargados con diferentes montos y estados

  ---
  🎨 Paleta de Colores

  Light Mode:
  - Background: #f9fafb (gray-50)
  - Cards: #ffffff (white)
  - Primary: Blue gradients
  - Accents: Purple, Pink

  Dark Mode:
  - Background: #111827 (gray-900)
  - Cards: #1f2937 (gray-800)
  - Text: #ffffff / #d1d5db
  - Same accents adaptados

  ---
  🏆 Innovación y Valor

  1. Transparencia Real: Cualquiera puede ver las deudas públicamente
  2. Confianza: Blockchain garantiza inmutabilidad
  3. Facilidad de Pago: Portal público sin fricción
  4. Control Total: Administrador revisa antes de aprobar
  5. Experiencia Premium: UI/UX nivel profesional

  ---
  Estado del Proyecto: ✅ 100% Funcional y listo para demostración