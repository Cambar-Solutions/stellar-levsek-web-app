import { API_BASE_URL } from '../constants/api'

/**
 * Base API request handler with JWT authentication
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`

  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }

  // Get JWT token from localStorage
  const token = localStorage.getItem('access_token')

  // Add Authorization header if token exists
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, config)

    // Parse JSON response
    const data = await response.json()

    // Handle 401 Unauthorized
    if (response.status === 401) {
      // Si estamos en login o register, es un error de credenciales, no de sesión
      const isAuthPage = window.location.pathname.includes('/login') || window.location.pathname.includes('/register')

      if (!isAuthPage) {
        // Solo es "sesión expirada" si NO estamos en páginas de autenticación
        localStorage.removeItem('isis_user')
        localStorage.removeItem('access_token')
        window.location.href = '/login'
        throw new Error('Session expired. Please login again.')
      } else {
        // En páginas de auth, es un error de credenciales
        throw new Error(data.message || 'Invalid credentials')
      }
    }

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`)
    }

    return data
  } catch (error) {
    console.error('API Request Error:', error)
    throw error
  }
}

/**
 * GET request
 */
export function apiGet(endpoint) {
  return apiRequest(endpoint, {
    method: 'GET',
  })
}

/**
 * POST request
 */
export function apiPost(endpoint, data) {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * PUT request
 */
export function apiPut(endpoint, data) {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * PATCH request
 */
export function apiPatch(endpoint, data) {
  return apiRequest(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

/**
 * DELETE request
 */
export function apiDelete(endpoint) {
  return apiRequest(endpoint, {
    method: 'DELETE',
  })
}

/**
 * Public GET request (no authentication required)
 */
export async function apiPublicGet(endpoint) {
  const url = `${API_BASE_URL}${endpoint}`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`)
    }

    return data
  } catch (error) {
    console.error('Public API Request Error:', error)
    throw error
  }
}
