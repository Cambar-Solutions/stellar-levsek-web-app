import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'
import { marked } from 'marked'
import chatbotService from '../services/chatbotService'
import '../styles/chatbot.css'

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 ¡Hola! Soy el asistente de Levsek. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')

    // Add user message
    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newUserMessage])

    // Show loading
    setIsLoading(true)

    try {
      // Get bot response
      const response = await chatbotService.sendMessage(userMessage)

      // Add bot response
      const botMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = {
        role: 'assistant',
        content: '❌ Lo siento, ocurrió un error. Por favor intenta de nuevo.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const renderMessage = (content) => {
    const html = marked.parse(content, {
      breaks: true,
      gfm: true,
    })
    return { __html: html }
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="chatbot-fab"
          aria-label="Abrir chat de ayuda"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-container">
          {/* Header */}
          <div className="chatbot-header">
            <div className="flex items-center gap-3">
              <div className="chatbot-avatar">
                <MessageCircle size={20} />
              </div>
              <div>
                <h3 className="chatbot-title">ISIS BOT IA</h3>
                <p className="chatbot-subtitle">
                  <span className="chatbot-status-dot"></span>
                  En línea
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="chatbot-close-btn"
              aria-label="Cerrar chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`chatbot-message ${
                  message.role === 'user'
                    ? 'chatbot-message-user'
                    : 'chatbot-message-assistant'
                }`}
              >
                <div className="chatbot-message-content">
                  {message.role === 'assistant' ? (
                    <div
                      className="chatbot-markdown"
                      dangerouslySetInnerHTML={renderMessage(message.content)}
                    />
                  ) : (
                    <p>{message.content}</p>
                  )}
                </div>
                <span className="chatbot-message-time">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="chatbot-message chatbot-message-assistant">
                <div className="chatbot-message-content">
                  <div className="chatbot-typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="chatbot-input-container">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu pregunta..."
              className="chatbot-input"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="chatbot-send-btn"
              aria-label="Enviar mensaje"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </form>

          {/* Quick Actions */}
          <div className="chatbot-quick-actions">
            <button
              onClick={() =>
                setInput('¿Cómo realizar un pago?')
              }
              className="chatbot-quick-btn"
            >
              💳 Cómo pagar
            </button>
            <button
              onClick={() =>
                setInput('¿Cómo aprobar pagos pendientes?')
              }
              className="chatbot-quick-btn"
            >
              ✅ Aprobar pagos
            </button>
            <button
              onClick={() =>
                setInput('¿Cómo registrar una deuda?')
              }
              className="chatbot-quick-btn"
            >
              📊 Registrar deuda
            </button>
          </div>
        </div>
      )}
    </>
  )
}