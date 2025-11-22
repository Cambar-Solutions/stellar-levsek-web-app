/**
 * Service Worker Registration
 * Maneja el registro, actualización y desinstalación del service worker
 */

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
)

/**
 * Registrar el service worker
 * @param {Object} config - Configuración opcional con callbacks
 */
export function register(config) {
  if ('serviceWorker' in navigator) {
    // El service worker solo funciona en producción o localhost con HTTPS
    const publicUrl = new URL(import.meta.env.BASE_URL, window.location.href)
    if (publicUrl.origin !== window.location.origin) {
      return
    }

    window.addEventListener('load', () => {
      const swUrl = `${import.meta.env.BASE_URL}service-worker.js`

      if (isLocalhost) {
        // En localhost, verificar si hay un service worker
        checkValidServiceWorker(swUrl, config)

        // Log adicional para desarrollo
        navigator.serviceWorker.ready.then(() => {
          console.log(
            '[PWA] Esta app está siendo servida por un service worker en modo desarrollo.'
          )
        })
      } else {
        // En producción, registrar directamente
        registerValidSW(swUrl, config)
      }
    })
  }
}

/**
 * Registrar un service worker válido
 */
function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      console.log('[PWA] Service Worker registrado correctamente:', registration.scope)

      // Verificar actualizaciones cada hora
      setInterval(() => {
        registration.update()
      }, 60 * 60 * 1000) // 1 hora

      registration.onupdatefound = () => {
        const installingWorker = registration.installing
        if (installingWorker == null) {
          return
        }

        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // Nueva versión disponible
              console.log('[PWA] Nueva versión disponible. Refrescando...')

              if (config && config.onUpdate) {
                config.onUpdate(registration)
              }

              // Mostrar notificación al usuario
              showUpdateNotification()
            } else {
              // Contenido pre-cacheado para uso offline
              console.log('[PWA] Contenido cacheado para uso offline.')

              if (config && config.onSuccess) {
                config.onSuccess(registration)
              }
            }
          }
        }
      }
    })
    .catch((error) => {
      console.error('[PWA] Error al registrar service worker:', error)
    })
}

/**
 * Verificar si el service worker es válido
 */
function checkValidServiceWorker(swUrl, config) {
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      const contentType = response.headers.get('content-type')
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // Service worker no encontrado
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload()
          })
        })
      } else {
        // Service worker encontrado, proceder normalmente
        registerValidSW(swUrl, config)
      }
    })
    .catch(() => {
      console.log('[PWA] No hay conexión a internet. La app está corriendo en modo offline.')
    })
}

/**
 * Mostrar notificación de actualización disponible
 */
function showUpdateNotification() {
  // Crear un elemento para notificar al usuario
  const notification = document.createElement('div')
  notification.id = 'pwa-update-notification'
  notification.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 16px;
      font-family: 'Inter', sans-serif;
      max-width: 90vw;
      animation: slideUp 0.3s ease-out;
    ">
      <div style="flex: 1;">
        <p style="margin: 0; font-weight: 600; font-size: 14px;">
          ✨ Nueva versión disponible
        </p>
        <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">
          Actualiza para obtener las últimas mejoras
        </p>
      </div>
      <button
        onclick="window.location.reload()"
        style="
          background: white;
          color: #667eea;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        "
        onmouseover="this.style.transform='scale(1.05)'"
        onmouseout="this.style.transform='scale(1)'"
      >
        Actualizar
      </button>
      <button
        onclick="document.getElementById('pwa-update-notification').remove()"
        style="
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 20px;
          cursor: pointer;
          line-height: 1;
        "
      >
        ×
      </button>
    </div>

    <style>
      @keyframes slideUp {
        from {
          transform: translateX(-50%) translateY(100px);
          opacity: 0;
        }
        to {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
      }
    </style>
  `

  document.body.appendChild(notification)

  // Auto-remover después de 30 segundos si no interactúa
  setTimeout(() => {
    const notif = document.getElementById('pwa-update-notification')
    if (notif) {
      notif.style.animation = 'slideUp 0.3s ease-out reverse'
      setTimeout(() => notif.remove(), 300)
    }
  }, 30000)
}

/**
 * Desregistrar el service worker
 */
export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister()
        console.log('[PWA] Service Worker desregistrado')
      })
      .catch((error) => {
        console.error('[PWA] Error al desregistrar:', error.message)
      })
  }
}

/**
 * Verificar si hay actualizaciones manualmente
 */
export function checkForUpdates() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.update()
      console.log('[PWA] Verificando actualizaciones...')
    })
  }
}

/**
 * Obtener información del service worker
 */
export function getServiceWorkerInfo() {
  if ('serviceWorker' in navigator) {
    return navigator.serviceWorker.ready.then((registration) => {
      return {
        active: registration.active !== null,
        waiting: registration.waiting !== null,
        installing: registration.installing !== null,
        scope: registration.scope,
      }
    })
  }
  return Promise.resolve({ active: false })
}
