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
   */
  async sendMessage(userMessage) {
    // Agregar mensaje del usuario al historial
    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
    })

    try {
      let response

      if (this.useAI) {
        // Opción A: Usar Anthropic AI (requiere endpoint en backend)
        response = await this.getAIResponse(userMessage)
      } else {
        // Opción B: Respuestas inteligentes basadas en palabras clave
        response = this.getSmartResponse(userMessage)
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
  async getAIResponse(userMessage) {
    try {
      const response = await fetch('http://localhost:4008/chatbot/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          history: this.conversationHistory.slice(-10), // Últimos 10 mensajes
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
      return this.getSmartResponse(userMessage)
    }
  }

  /**
   * Respuestas inteligentes basadas en contexto y palabras clave
   */
  getSmartResponse(userMessage) {
    const message = userMessage.toLowerCase()

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
        response: `📚 **Ayuda General:**

**¿Eres cliente?**
1. Accede a la vista pública
2. Busca tu nombre
3. Paga tu deuda con Stellar

**¿Eres administrador?**
1. Inicia sesión
2. Gestiona deudores desde "Deudores"
3. Aprueba pagos desde "Pagos Pendientes"
4. Ve estadísticas en "Dashboard"

💡 **Funciones principales:**
- 📊 Registrar deudas
- 💳 Aprobar/rechazar pagos
- 👥 Gestionar deudores
- 📈 Ver estadísticas

¿En qué puedo ayudarte específicamente?`,
      },
    ]

    // Buscar respuesta que coincida con las palabras clave
    for (const item of responses) {
      if (item.keywords.some((keyword) => message.includes(keyword))) {
        return item.response
      }
    }

    // Respuesta por defecto si no hay coincidencia
    return `🤖 **Asistente Levsek**

Puedo ayudarte con:

💳 **Pagos**
- Cómo realizar pagos
- Aprobar/rechazar pagos
- Estado de pagos pendientes

📊 **Deudas**
- Registrar nuevas deudas
- Ver saldo actual
- Eliminar deudores

🌐 **Vista Pública**
- Acceso para clientes
- URL pública

⛓️ **Blockchain**
- Qué es el hash
- Cómo funciona Stellar

🔧 **Problemas técnicos**
- Errores comunes
- Troubleshooting

¿Sobre qué tema necesitas ayuda?`
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
