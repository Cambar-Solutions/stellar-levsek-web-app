/* eslint-disable no-restricted-globals */
/**
 * Levsek PWA Service Worker
 * Estrategias de cache para mejor rendimiento y soporte offline
 */

const CACHE_VERSION = 'levsek-v1.0.0'
const STATIC_CACHE = `${CACHE_VERSION}-static`
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`
const IMAGE_CACHE = `${CACHE_VERSION}-images`

// Archivos estáticos para pre-cachear
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html', // Página de fallback offline
]

// URLs de API que NO deben cachearse (siempre fresh data)
const NEVER_CACHE_URLS = [
  '/api/auth/',
  '/api/logout',
  '/api/pending-payments',
  '/api/debts',
  '/api/customers',
]

// ==========================================
// INSTALL EVENT - Pre-cache static assets
// ==========================================
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...')

  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[Service Worker] Pre-caching static assets')
      return cache.addAll(STATIC_ASSETS)
    }).then(() => {
      console.log('[Service Worker] Installed successfully')
      return self.skipWaiting() // Activa inmediatamente
    })
  )
})

// ==========================================
// ACTIVATE EVENT - Clean old caches
// ==========================================
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...')

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Eliminar caches viejos que no coincidan con la versión actual
          if (cacheName.startsWith('levsek-') && cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE && cacheName !== IMAGE_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      console.log('[Service Worker] Activated successfully')
      return self.clients.claim() // Toma control inmediatamente
    })
  )
})

// ==========================================
// FETCH EVENT - Smart caching strategies
// ==========================================
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Ignorar requests que no sean GET
  if (request.method !== 'GET') {
    return
  }

  // Ignorar requests a otros dominios (CDN, etc.)
  if (url.origin !== location.origin) {
    return
  }

  // Determinar estrategia de cache según el tipo de recurso
  if (shouldNeverCache(request.url)) {
    // Network-only para APIs críticas
    event.respondWith(networkOnly(request))
  } else if (isImageRequest(request)) {
    // Stale-while-revalidate para imágenes
    event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE))
  } else if (isStaticAsset(request)) {
    // Cache-first para assets estáticos (JS, CSS)
    event.respondWith(cacheFirst(request, STATIC_CACHE))
  } else {
    // Network-first con cache fallback para todo lo demás
    event.respondWith(networkFirst(request, DYNAMIC_CACHE))
  }
})

// ==========================================
// CACHING STRATEGIES
// ==========================================

/**
 * Cache First - Sirve del cache, si no está, va a la red
 * Ideal para: Assets estáticos (JS, CSS, fonts)
 */
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.error('[Service Worker] Cache-first failed:', error)
    return offlineFallback(request)
  }
}

/**
 * Network First - Intenta red primero, fallback a cache
 * Ideal para: HTML, API calls que necesitan datos frescos
 */
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.log('[Service Worker] Network failed, trying cache:', request.url)
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    return offlineFallback(request)
  }
}

/**
 * Network Only - Siempre va a la red
 * Ideal para: Login, logout, operaciones críticas
 */
async function networkOnly(request) {
  try {
    return await fetch(request)
  } catch (error) {
    console.error('[Service Worker] Network-only failed:', error)
    return new Response(JSON.stringify({
      error: 'Network unavailable',
      offline: true
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

/**
 * Stale While Revalidate - Sirve cache pero actualiza en background
 * Ideal para: Imágenes, assets que pueden ser stale brevemente
 */
async function staleWhileRevalidate(request, cacheName) {
  const cachedResponse = await caches.match(request)

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const cache = caches.open(cacheName)
      cache.then((c) => c.put(request, networkResponse.clone()))
    }
    return networkResponse
  }).catch(() => cachedResponse)

  return cachedResponse || fetchPromise
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Verificar si una URL NO debe cachearse nunca
 */
function shouldNeverCache(url) {
  return NEVER_CACHE_URLS.some(pattern => url.includes(pattern))
}

/**
 * Verificar si es un request de imagen
 */
function isImageRequest(request) {
  const destination = request.destination
  return destination === 'image' ||
         request.url.match(/\.(jpg|jpeg|png|gif|svg|webp|ico)$/i)
}

/**
 * Verificar si es un asset estático
 */
function isStaticAsset(request) {
  return request.url.match(/\.(js|css|woff|woff2|ttf|eot)$/i)
}

/**
 * Página de fallback cuando estamos offline
 */
async function offlineFallback(request) {
  if (request.destination === 'document') {
    const cache = await caches.match('/offline.html')
    if (cache) return cache
  }

  return new Response('Offline - Levsek requiere conexión a internet', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: { 'Content-Type': 'text/plain' }
  })
}

// ==========================================
// BACKGROUND SYNC (opcional - para pagos offline)
// ==========================================
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-payments') {
    console.log('[Service Worker] Background sync: payments')
    event.waitUntil(syncPendingPayments())
  }
})

async function syncPendingPayments() {
  // Aquí puedes implementar lógica para sincronizar pagos pendientes
  // cuando la conexión se restaure
  console.log('[Service Worker] Syncing pending payments...')
  // TODO: Implementar sincronización con IndexedDB
}

// ==========================================
// PUSH NOTIFICATIONS (opcional)
// ==========================================
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received')

  const data = event.data ? event.data.json() : {}
  const title = data.title || 'Levsek'
  const options = {
    body: data.body || 'Nueva notificación',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: data.url || '/',
    actions: [
      { action: 'open', title: 'Abrir' },
      { action: 'close', title: 'Cerrar' }
    ]
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data)
    )
  }
})

console.log('[Service Worker] Service Worker loaded successfully')
