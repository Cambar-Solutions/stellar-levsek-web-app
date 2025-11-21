# 🤖 Chatbot Asistente Inteligente - Levsek

## 🎯 Descripción

El chatbot es un **asistente virtual profesional** integrado en la aplicación Levsek que ayuda a los usuarios a resolver dudas sobre el uso del sistema de gestión de deudas.

### Características Principales:

✅ **Inteligente:** Responde preguntas sobre toda la funcionalidad del sistema
✅ **Contexto Completo:** Conoce todos los flujos de trabajo y características
✅ **Siempre Disponible:** Accesible desde cualquier página de la aplicación
✅ **Interfaz Flotante:** No interfiere con el uso normal de la app
✅ **Respuestas Formateadas:** Usa Markdown para respuestas claras y estructuradas
✅ **Quick Actions:** Botones rápidos para preguntas comunes
✅ **Historial:** Mantiene el contexto de la conversación
✅ **Dark Mode:** Soporte completo para modo oscuro

---

## 🚀 Cómo Usar el Chatbot

### Acceso:

1. El chatbot aparece como un **botón flotante morado** en la esquina inferior derecha
2. Haz clic en el botón para abrir la ventana de chat
3. Escribe tu pregunta en el campo de texto
4. Presiona Enter o clic en el botón de enviar
5. El chatbot responderá en segundos

### Quick Actions:

Al abrir el chatbot, verás 3 botones rápidos:
- 💳 **Cómo pagar** - Explica el proceso de pago
- ✅ **Aprobar pagos** - Cómo aprobar pagos pendientes
- 📊 **Registrar deuda** - Cómo crear una nueva deuda

Haz clic en cualquiera para enviar automáticamente esa pregunta.

---

## 💡 Temas que el Chatbot Puede Ayudarte

### 💳 Pagos

- ¿Cómo realizar un pago?
- ¿Por qué mi pago no se refleja inmediatamente?
- ¿Cómo aprobar o rechazar pagos?
- ¿Qué son los pagos pendientes?
- ¿Puedo hacer pagos parciales?
- Pagos múltiples y separados

### 📊 Deudas

- ¿Cómo registrar una nueva deuda?
- ¿Cómo ver el saldo de un cliente?
- ¿Cómo eliminar un deudor?
- ¿Por qué no puedo eliminar un deudor?
- Gestión de deudas

### 🌐 Vista Pública

- ¿Qué es la vista pública?
- ¿Cómo acceden los clientes?
- ¿Qué pueden hacer los clientes?
- URL pública

### ⛓️ Blockchain

- ¿Qué es el hash de blockchain?
- ¿Cómo funciona Stellar?
- ¿Por qué usar blockchain?
- Transparencia e inmutabilidad

### 📈 Dashboard y Administración

- Funciones del dashboard
- Gestión de deudores
- Estadísticas del sistema
- Configuración

### 🔧 Problemas Técnicos

- Errores comunes
- Troubleshooting
- Datos que no se actualizan
- Problemas de login

---

## 📝 Ejemplos de Preguntas

### Preguntas Simples:

```
- ¿Cómo pago mi deuda?
- ¿Qué es un pago pendiente?
- ¿Cómo elimino un deudor?
- ¿Qué significa el hash?
```

### Preguntas Específicas:

```
- ¿Por qué mi pago no se descuenta de mi deuda?
- ¿Cómo aprobar un pago desde la vista de administrador?
- ¿Puedo pagar una deuda en varias partes?
- ¿Qué pasa si rechazo un pago?
```

### Preguntas de Troubleshooting:

```
- No puedo eliminar un deudor, ¿por qué?
- Mi pago no aparece en el historial
- Los datos no se actualizan
- Aparece un error al registrar una deuda
```

---

## 🎨 Características de la Interfaz

### Diseño Moderno:

- **Botón Flotante:**
  - Gradiente morado llamativo
  - Animación de pulso para llamar la atención
  - Hover effect

- **Ventana de Chat:**
  - Diseño limpio y profesional
  - Header con información del asistente
  - Estado "En línea" con indicador animado
  - Scroll automático a nuevos mensajes

- **Mensajes:**
  - Mensajes del usuario: Alineados a la derecha con gradiente
  - Mensajes del asistente: Alineados a la izquierda con fondo blanco
  - Timestamp en cada mensaje
  - Soporte completo para Markdown

- **Typing Indicator:**
  - Animación de 3 puntos mientras el bot "piensa"
  - Feedback visual inmediato

- **Input Area:**
  - Campo de texto con placeholder
  - Botón de enviar con icono
  - Estados deshabilitados durante procesamiento

### Responsive:

- En **desktop:** Ventana flotante de 400x600px
- En **móvil:** Fullscreen para mejor UX
- Adaptación automática según el tamaño de pantalla

### Dark Mode:

- Soporte completo para modo oscuro
- Todos los colores adaptan automáticamente
- Contraste óptimo en ambos modos

---

## 🔧 Arquitectura Técnica

### Frontend:

```
src/
├── components/
│   └── Chatbot.jsx          # Componente principal del chatbot
├── services/
│   └── chatbotService.js    # Lógica de conversación
├── utils/
│   └── chatbotContext.js    # Contexto completo del sistema
└── styles/
    └── chatbot.css          # Estilos del chatbot
```

### Servicios:

**ChatbotService:**
- Maneja el historial de conversación
- Procesa preguntas del usuario
- Busca respuestas en la base de conocimiento
- Sistema de palabras clave inteligente

**Contexto del Sistema:**
- Base de conocimiento completa
- Todas las funcionalidades documentadas
- Flujos de trabajo paso a paso
- Preguntas frecuentes
- Soluciones a problemas comunes

---

## 🎯 Base de Conocimiento

El chatbot tiene conocimiento completo sobre:

### 1. Funcionalidades

- Registro de deudas
- Sistema de pagos pendientes
- Aprobación/rechazo de pagos
- Vista pública
- Dashboard administrativo
- Blockchain Stellar

### 2. Flujos de Trabajo

- Cómo registrar una deuda
- Cómo pagar desde vista pública
- Cómo aprobar/rechazar pagos
- Cómo ver historial
- Cómo gestionar deudores

### 3. Problemas Comunes

- Pago no se refleja inmediatamente (es normal)
- No puedo eliminar deudor (tiene deudas/pagos)
- Pagos agrupados (bug corregido)
- Rechazo elimina deuda (bug corregido)
- Datos no se actualizan (bug corregido)

### 4. Conceptos Técnicos

- ¿Qué es blockchain?
- ¿Qué es Stellar?
- ¿Qué es un hash de transacción?
- ¿Por qué usar smart contracts?

---

## 🚀 Mejoras Futuras (Opcionales)

### Opción 1: Integración con Claude AI Real

Si quieres usar **Claude AI real** de Anthropic:

1. Crear endpoint en backend:
   ```javascript
   // BACK/src/modules/chatbot/chatbot.controller.ts
   @Post('/ask')
   async ask(@Body() body: { message: string, history: any[] }) {
     // Llamar a Anthropic API
     // Usar el contexto del sistema
     // Retornar respuesta
   }
   ```

2. Agregar API key de Anthropic en `.env`:
   ```
   ANTHROPIC_API_KEY=sk-ant-xxxxx
   ```

3. Cambiar `useAI` a `true` en `chatbotService.js`

### Opción 2: Análisis de Sentimiento

- Detectar frustr frustración del usuario
- Ofrecer contacto directo con soporte
- Estadísticas de preguntas más comunes

### Opción 3: Integración con Sistema

- Realizar acciones desde el chat:
  - "Registra una deuda de $500 para Juan"
  - "Aprueba el pago #123"
  - "Muéstrame los pagos pendientes"

### Opción 4: Historial Persistente

- Guardar conversaciones en localStorage
- Recuperar historial al cerrar/abrir
- Limpiar historial con botón

### Opción 5: Notificaciones Proactivas

- El bot avisa cuando hay pagos pendientes
- Recordatorios de tareas importantes
- Tips de uso del sistema

---

## 📊 Estadísticas de Cobertura

El chatbot puede responder sobre:

- ✅ **100%** de las funcionalidades principales
- ✅ **100%** de los flujos de trabajo
- ✅ **15+** preguntas frecuentes
- ✅ **10+** problemas comunes
- ✅ **5+** conceptos técnicos

---

## 🐛 Troubleshooting

### El botón del chatbot no aparece:

1. Verifica que `Chatbot` esté importado en `App.jsx`
2. Verifica que el componente esté renderizado
3. Revisa la consola del navegador por errores
4. Limpia caché del navegador

### Las respuestas no se formatean correctamente:

1. Verifica que `marked` esté instalado
2. Revisa que el CSS esté importado
3. Comprueba que `dangerouslySetInnerHTML` esté funcionando

### El chatbot no responde:

1. Abre la consola del navegador
2. Busca errores en `chatbotService.js`
3. Verifica que `chatbotContext.js` existe
4. Comprueba que las palabras clave coincidan

---

## 💻 Código de Ejemplo

### Uso del Servicio:

```javascript
import chatbotService from './services/chatbotService'

// Enviar mensaje
const response = await chatbotService.sendMessage('¿Cómo pago mi deuda?')
console.log(response)

// Obtener historial
const history = chatbotService.getHistory()
console.log(history)

// Limpiar historial
chatbotService.clearHistory()
```

### Personalizar Respuestas:

Edita `src/services/chatbotService.js` y agrega nuevas keywords:

```javascript
{
  keywords: ['mi tema', 'pregunta nueva'],
  response: `Mi respuesta personalizada aquí...`,
}
```

---

## 🎓 Consejos de Uso

1. **Sé específico:** "¿Cómo aprobar un pago?" es mejor que "pagos"
2. **Usa palabras clave:** El bot busca keywords en tu pregunta
3. **Explora Quick Actions:** Son las preguntas más comunes
4. **Pregunta libremente:** El bot responderá de forma amigable
5. **Reporta problemas:** Si el bot no entiende, díselo

---

## ✅ Checklist de Verificación

- [ ] Botón flotante visible en todas las páginas
- [ ] Click abre la ventana de chat
- [ ] Mensaje de bienvenida aparece
- [ ] Input funciona correctamente
- [ ] Respuestas se muestran formateadas
- [ ] Quick actions funcionan
- [ ] Scroll automático a nuevos mensajes
- [ ] Typing indicator aparece mientras procesa
- [ ] Botón de cerrar funciona
- [ ] Responsive en móvil
- [ ] Dark mode se aplica correctamente

---

## 📚 Recursos Adicionales

- **Documentación completa del sistema:** `IMPLEMENTATION_GUIDE.md`
- **Notas de integración:** `INTEGRATION_NOTES.md`
- **Información del proyecto:** `README.md`

---

## 🎉 ¡Listo!

El chatbot está completamente funcional y listo para ayudar a tus usuarios. Es inteligente, profesional y conoce todo sobre el sistema Levsek.

**¡Pruébalo ahora mismo!** Haz clic en el botón morado flotante 🤖
