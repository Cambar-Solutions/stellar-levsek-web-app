import { SYSTEM_CONTEXT, SYSTEM_INSTRUCTIONS } from '../utils/chatbotContext'

/**
 * Servicio de chatbot inteligente
 * Puede funcionar con o sin backend
 */

class ChatbotService {
  constructor() {
    this.conversationHistory = []
    this.useAI = true // Usar backend con Anthropic AI (fallback a respuestas locales)
  }

  /**
   * Enviar mensaje al chatbot
   * @param {string} userMessage - El mensaje del usuario
   * @param {object|null} user - Objeto de usuario (null si no hay sesión activa)
   */
  async sendMessage(userMessage, user = null) {
    // Agregar mensaje del usuario al historial
    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
    })

    try {
      let response

      if (this.useAI) {
        // Opción A: Usar Anthropic AI (requiere endpoint en backend)
        response = await this.getAIResponse(userMessage, user)
      } else {
        // Opción B: Respuestas inteligentes basadas en palabras clave
        response = this.getSmartResponse(userMessage, user)
      }

      // Agregar respuesta al historial
      this.conversationHistory.push({
        role: 'assistant',
        content: response,
      })

      return response
    } catch (error) {
      console.error('Error en chatbot:', error)
      return '❌ Lo siento, ocurrió un error. Por favor intenta de nuevo.'
    }
  }

  /**
   * Obtener respuesta de AI (requiere backend)
   */
  async getAIResponse(userMessage, user = null) {
    try {
      const response = await fetch('http://localhost:4008/chatbot/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          history: this.conversationHistory.slice(-10), // Últimos 10 mensajes
          isAuthenticated: !!user, // Enviar si el usuario está autenticado
        }),
      })

      if (!response.ok) {
        throw new Error('Error al contactar el chatbot')
      }

      const data = await response.json()
      return data.response
    } catch (error) {
      console.warn('Backend no disponible, usando respuestas locales:', error.message)
      // Fallback a respuestas locales si el backend no está disponible
      return this.getSmartResponse(userMessage, user)
    }
  }

  /**
   * Respuestas inteligentes basadas en contexto y palabras clave
   * @param {string} userMessage - El mensaje del usuario
   * @param {object|null} user - Objeto de usuario (null si no hay sesión activa)
   */
  getSmartResponse(userMessage, user = null) {
    const message = userMessage.toLowerCase()
    const isAuthenticated = !!user

    // Palabras clave de funciones administrativas
    const adminKeywords = [
      'aprobar',
      'rechazar',
      'registrar deuda',
      'agregar deudor',
      'eliminar deudor',
      'dashboard',
      'admin',
      'administrador',
      'gestionar',
      'crear deuda',
      'borrar',
    ]

    // Verificar si un usuario NO autenticado está preguntando sobre funciones de admin
    if (!isAuthenticated) {
      const isAskingAboutAdmin = adminKeywords.some((keyword) =>
        message.includes(keyword)
      )

      if (isAskingAboutAdmin) {
        return `🔒 **Función de Administrador**

Lo que preguntas requiere una cuenta de administrador.

**¿Eres administrador?**
👉 [Inicia sesión aquí](/login) para acceder a todas las funciones administrativas como:
- Aprobar/rechazar pagos
- Registrar deudas
- Gestionar deudores
- Ver dashboard completo

**¿Eres cliente?**
Como cliente puedes:
💳 Ver tu deuda en la vista pública
💰 Realizar pagos con Stellar
📊 Consultar el estado de tus pagos

¿Necesitas ayuda con algo más?`
      }
    }

    // Base de conocimiento con patrones y respuestas
    const responses = [
      // PAGOS
      {
        keywords: ['pagar', 'pago', 'abonar', 'abono', 'como pago'],
        response: `💳 **Cómo realizar un pago:**

1. Accede a la vista pública: /public/:siteId
2. Busca tu nombre en la lista de deudores
3. Haz clic en "Pagar"
4. Ingresa el monto que deseas pagar
5. (Opcional) Agrega una referencia
6. Haz clic en "Pagar con Stellar"

⚠️ **Importante:** Tu pago irá a "Pendientes" y debe ser aprobado por el administrador antes de que se descuente de tu deuda.`,
      },
      {
        keywords: ['no se refleja', 'no descuenta', 'no se ve', 'no aparece el pago', 'no cambia'],
        response: `📋 **¿Tu pago no se refleja?**

✅ Es normal. Los pagos desde la vista pública van a "Pendientes" y deben ser aprobados por el administrador.

**Pasos del proceso:**
1. Cliente paga → Estado: "En Revisión"
2. Admin aprueba → Estado: "Verificado"
3. Se descuenta de la deuda

💡 Contacta al administrador para saber el estado de tu pago.`,
      },
      {
        keywords: ['aprobar', 'aprobación', 'verificar', 'autorizar'],
        response: `✅ **Aprobar un pago (Admin):**

1. Inicia sesión como administrador
2. Ve a "Pagos Pendientes" o "Dashboard"
3. Busca el pago en la lista con estado "En Revisión"
4. Revisa la información (monto, cliente, referencia)
5. Haz clic en "Aprobar"

**Qué pasa al aprobar:**
- ✅ El pago se registra en la deuda
- 📉 El saldo del cliente disminuye
- ⛓️ Se registra en blockchain Stellar
- ✔️ Aparece en historial como "Verificado"`,
      },
      {
        keywords: ['rechazar', 'rechazo', 'denegar', 'cancelar pago'],
        response: `❌ **Rechazar un pago (Admin):**

1. Ve a "Pagos Pendientes"
2. Encuentra el pago que deseas rechazar
3. Haz clic en "Rechazar"
4. Confirma la acción

**Qué pasa al rechazar:**
- ❌ El pago se marca como rechazado
- 💰 La deuda del cliente NO cambia
- 🚫 NO se registra en blockchain
- 📝 El pago desaparece de pendientes

⚠️ El pago rechazado NO afecta la deuda original.`,
      },
      {
        keywords: ['pendiente', 'pendientes', 'en revisión', 'revision'],
        response: `⏳ **Pagos Pendientes:**

Los pagos pendientes son aquellos que esperan la aprobación del administrador.

**¿Dónde verlos?**
- Admin: Sección "Pagos Pendientes" en el dashboard
- Cliente: En la vista pública aparecen como "En Revisión"

**Estados posibles:**
- 🟡 **Pendiente**: Esperando aprobación
- ✅ **Aprobado**: Verificado y descontado
- ❌ **Rechazado**: No procesado

💡 Cada pago se muestra individualmente, no se agrupan.`,
      },

      // DEUDAS
      {
        keywords: ['deuda', 'registrar deuda', 'agregar deuda', 'crear deuda', 'nueva deuda'],
        response: `📊 **Registrar una nueva deuda (Admin):**

1. Inicia sesión como administrador
2. Ve a "Agregar Deudor" o "Deudores"
3. Selecciona un cliente existente O crea uno nuevo:
   - Nombre completo
   - Email
   - Teléfono (opcional)
4. Ingresa el monto de la deuda
5. Agrega una descripción/concepto
6. Haz clic en "Registrar"

✅ La deuda se guarda en MySQL y se registra automáticamente en blockchain Stellar con un hash único.`,
      },
      {
        keywords: ['eliminar deudor', 'borrar deudor', 'eliminar cliente', 'no puedo eliminar'],
        response: `🗑️ **Eliminar un deudor:**

Solo puedes eliminar un deudor si cumple AMBAS condiciones:
✅ Saldo pendiente = $0 (sin deudas)
✅ No tiene pagos registrados

**¿Por qué estas restricciones?**
Para prevenir la pérdida de información importante del historial financiero.

**Si no puedes eliminar:**
1. Verifica que el saldo sea $0
2. Liquida todas las deudas primero
3. Espera a que todos los pagos sean procesados`,
      },
      {
        keywords: ['saldo', 'cuanto debo', 'mi deuda', 'ver deuda'],
        response: `💰 **Ver tu saldo/deuda:**

**Como cliente:**
1. Accede a la vista pública: /public/:siteId
2. Busca tu nombre en la lista
3. Verás tu saldo pendiente actual

**Como admin:**
1. Ve a "Deudores"
2. Encuentra al cliente
3. Haz clic para ver detalles completos:
   - Saldo total pendiente
   - Historial de deudas
   - Historial de pagos
   - Estado de pagos pendientes`,
      },

      // VISTA PÚBLICA
      {
        keywords: ['vista pública', 'vista publica', 'url pública', 'url publica', 'acceso público'],
        response: `🌐 **Vista Pública:**

Es una URL única para cada negocio donde los clientes pueden:
- Ver su deuda actual
- Realizar pagos
- Ver estado de sus pagos

**URL:** /public/:siteId

**Características:**
✅ No requiere login
✅ Solo muestra deudores con saldo > 0
✅ Transparencia total con blockchain
✅ Pagos seguros con Stellar

💡 Comparte esta URL con tus clientes para que puedan pagar fácilmente.`,
      },

      // BLOCKCHAIN
      {
        keywords: ['blockchain', 'stellar', 'hash', 'soroban', 'smart contract'],
        response: `⛓️ **Blockchain Stellar:**

El sistema usa Stellar blockchain para:
1. ✅ Registrar deudas de forma inmutable
2. ✅ Registrar pagos aprobados
3. ✅ Garantizar transparencia total

**¿Qué es el "hash"?**
Es un identificador único de la transacción en Stellar. Sirve como comprobante inmutable de que la operación se registró.

**Ventajas:**
- 🔒 Inmutabilidad (no se puede modificar)
- 👁️ Transparencia total
- ✅ Verificación pública

💡 Cada deuda y pago aprobado genera su propio hash de blockchain.`,
      },

      // DASHBOARD
      {
        keywords: ['dashboard', 'panel', 'estadísticas', 'inicio'],
        response: `📊 **Dashboard Administrativo:**

El dashboard muestra un resumen general:

📈 **Estadísticas:**
- Total de deudas pendientes
- Número de deudores
- Pagos verificados vs pendientes

🔍 **Secciones principales:**
- **Deudores:** Lista y gestión de clientes
- **Pagos Pendientes:** Aprobar/rechazar pagos
- **Historial:** Ver todos los pagos verificados
- **Configuración:** Ajustes del sitio

💡 Desde aquí puedes acceder a todas las funciones del sistema.`,
      },

      // PAGOS MÚLTIPLES
      {
        keywords: ['pago parcial', 'parciales', 'varios pagos', 'múltiples pagos', 'separados'],
        response: `💵 **Pagos Parciales y Múltiples:**

✅ Sí, puedes hacer pagos parciales de una deuda.

**Ejemplo:**
- Deuda total: $1,000
- Pago 1: $200 → Quedan $800
- Pago 2: $300 → Quedan $500
- Pago 3: $500 → Pagado ✅

**Importante:**
📝 Cada pago se registra individualmente
🔢 NO se agrupan ni se suman
⛓️ Cada pago aprobado tiene su hash de blockchain

💡 Puedes ver el historial completo de pagos en la sección "Deudores".`,
      },

      // PROBLEMAS TÉCNICOS
      {
        keywords: ['error', 'falla', 'no funciona', 'problema', 'bug'],
        response: `🔧 **Problemas técnicos:**

Por favor, proporciona más detalles sobre el error:
- ¿Qué estabas intentando hacer?
- ¿Qué mensaje de error aparece?
- ¿En qué sección del sistema?

**Problemas comunes:**
1. **Datos no se actualizan:** Recarga la página
2. **No puedo eliminar deudor:** Verifica que no tenga deudas/pagos
3. **Pago no se refleja:** Normal, debe ser aprobado por admin
4. **Error de login:** Verifica usuario y contraseña

💡 Si el problema persiste, contacta al soporte técnico.`,
      },

      // AYUDA GENERAL
      {
        keywords: ['ayuda', 'help', 'como uso', 'tutorial', 'guía', 'empezar'],
        response: isAuthenticated
          ? `📚 **Ayuda para Administradores:**

¡Hola ${user?.name || 'Admin'}! Puedo ayudarte con:

🎯 **Gestión de Deudas:**
- Registrar nuevas deudas
- Ver historial completo de deudores
- Consultar estadísticas en tiempo real

💳 **Gestión de Pagos:**
- Aprobar pagos pendientes
- Rechazar pagos sospechosos
- Ver historial de transacciones

👥 **Gestión de Deudores:**
- Agregar nuevos clientes
- Actualizar información
- Eliminar deudores sin deudas

📊 **Dashboard:**
- Ver resumen general
- Estadísticas de deudas
- Pagos verificados vs pendientes

¿Qué necesitas hacer hoy?`
          : `📚 **Ayuda para Clientes:**

¡Bienvenido! Como cliente puedes:

💳 **Ver tu Deuda:**
1. Accede a la vista pública
2. Busca tu nombre en la lista
3. Verás tu saldo pendiente actual

💰 **Realizar un Pago:**
1. Encuentra tu nombre
2. Click en "Pagar"
3. Ingresa el monto
4. Paga con Stellar blockchain

📊 **Estado de Pagos:**
- Los pagos van a "Revisión"
- El admin los aprueba
- Se descuenta de tu deuda

🔒 **¿Eres Administrador?**
👉 [Inicia sesión aquí](/login)

¿En qué puedo ayudarte?`,
      },

      // CLIENTES - CONSULTA DE DEUDA
      {
        keywords: ['cuánto debo', 'mi deuda', 'saldo', 'debe', 'debo'],
        response: isAuthenticated
          ? `💰 **Consultar Deuda (Admin):**

Como administrador puedes ver las deudas de cualquier cliente:

1. Ve a la sección "Deudores"
2. Busca al cliente en la lista
3. Click en su nombre para ver detalles:
   - Saldo total pendiente
   - Historial de deudas individuales
   - Historial de pagos
   - Pagos pendientes de aprobación

💡 También puedes ver el resumen en el Dashboard.`
          : `💰 **Consultar tu Deuda:**

Para ver cuánto debes:

1. Accede a la **vista pública** del negocio
2. Busca tu nombre en la lista de deudores
3. Verás:
   - Tu saldo total pendiente
   - Tu wallet de Stellar
   - Estado de tus pagos

💡 **Tip:** Guarda el link de la vista pública para consultar tu deuda cuando quieras.

🔍 **¿No encuentras tu nombre?**
Es posible que no tengas deudas pendientes o aún no estés registrado. Contacta al administrador.`,
      },

      // CLIENTES - WALLET Y BLOCKCHAIN
      {
        keywords: ['wallet', 'dirección', 'stellar', 'blockchain', 'qué es stellar'],
        response: `⛓️ **Stellar Blockchain:**

Stellar es una red blockchain que usamos para registrar todas las deudas y pagos de forma **segura e inmutable**.

🔑 **Tu Wallet:**
- Es tu dirección única en Stellar
- Empieza con "G" y tiene ~56 caracteres
- Se genera automáticamente cuando te registran

✅ **Beneficios:**
- ✨ **Transparencia total:** Todos pueden verificar
- 🔒 **Inmutabilidad:** Nadie puede modificar el historial
- ⚡ **Rapidez:** Transacciones en segundos
- 💰 **Bajo costo:** Comisiones mínimas

💡 Cada pago que realizas genera un "hash" único que sirve como comprobante inmutable.`,
      },

      // CLIENTES - MÉTODO DE PAGO
      {
        keywords: ['cómo pago', 'método de pago', 'formas de pago', 'puedo pagar con'],
        response: `💳 **Métodos de Pago:**

El sistema acepta varios métodos:

1. **Stellar (Recomendado)** ⭐
   - Pago directo con blockchain
   - Confirmación inmediata
   - Registro automático

2. **Efectivo**
   - Entrega al administrador
   - Debe aprobar el pago manualmente

3. **Transferencia Bancaria**
   - Envía y guarda comprobante
   - Agrega referencia al pagar

4. **Tarjeta (Stripe)**
   - Pago en línea
   - Procesamiento seguro

💡 **Importante:** Todos los pagos pasan por revisión del administrador antes de descontarse de tu deuda.`,
      },

      // SEGURIDAD Y PRIVACIDAD
      {
        keywords: ['seguro', 'seguridad', 'privacidad', 'datos', 'información segura'],
        response: `🔒 **Seguridad y Privacidad:**

Tu información está protegida en múltiples capas:

**🔐 Seguridad de Datos:**
- ✅ Encriptación de contraseñas (bcrypt)
- ✅ Autenticación con JWT tokens
- ✅ HTTPS para todas las comunicaciones
- ✅ Base de datos segura (MySQL)

**⛓️ Blockchain:**
- ✅ Registro inmutable en Stellar
- ✅ Transparencia verificable
- ✅ Sin posibilidad de alteración
- ✅ Hash único por transacción

**👁️ Privacidad:**
- Solo el admin y el cliente ven detalles completos
- La vista pública muestra info mínima necesaria
- No compartimos datos con terceros

💡 Tu información financiera está tan segura como en un banco, ¡pero con transparencia blockchain!`,
      },
    ]

    // Buscar respuesta que coincida con las palabras clave
    for (const item of responses) {
      if (item.keywords.some((keyword) => message.includes(keyword))) {
        return item.response
      }
    }

    // Respuesta por defecto si no hay coincidencia
    if (isAuthenticated) {
      return `🤖 **Asistente Levsek** - Modo Administrador

¡Hola ${user?.name || 'Admin'}! Puedo ayudarte con:

💳 **Gestión de Pagos**
- Aprobar/rechazar pagos pendientes
- Ver historial de transacciones
- Consultar estado de pagos

📊 **Gestión de Deudas**
- Registrar nuevas deudas
- Actualizar deudas existentes
- Ver saldo de clientes

👥 **Gestión de Deudores**
- Agregar nuevos clientes
- Actualizar información
- Eliminar deudores sin deudas

🌐 **Vista Pública**
- Compartir URL con clientes
- Configuración de acceso

⛓️ **Blockchain Stellar**
- Cómo funciona
- Verificar transacciones
- Ver hashes

🔧 **Soporte Técnico**
- Solución de problemas
- Errores comunes

¿En qué puedo ayudarte específicamente?`
    } else {
      return `🤖 **Asistente Levsek** - Modo Cliente

¡Bienvenido! Puedo ayudarte con:

💳 **Realizar Pagos**
- Cómo pagar mi deuda
- Métodos de pago disponibles
- Estado de mis pagos

💰 **Consultar Deuda**
- Ver cuánto debo
- Acceder a la vista pública
- Historial de pagos

⛓️ **Blockchain**
- Qué es Stellar
- Para qué sirve mi wallet
- Verificar transacciones

🔒 **Seguridad**
- Cómo protegemos tus datos
- Privacidad de información

📞 **Contacto**
- Comunicarme con el administrador

🔑 **¿Eres Administrador?**
👉 [Inicia sesión aquí](/login) para acceder a funciones avanzadas

¿Sobre qué tema necesitas ayuda?`
    }
  }

  /**
   * Limpiar historial de conversación
   */
  clearHistory() {
    this.conversationHistory = []
  }

  /**
   * Obtener historial
   */
  getHistory() {
    return this.conversationHistory
  }
}

export default new ChatbotService()
