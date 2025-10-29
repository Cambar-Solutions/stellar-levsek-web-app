import { API_BASE_URL } from '../constants/api'

/**
 * Base API request handler with authentication
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`

  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }

  // El backend ahora usa cookies de sesión en lugar de JWT tokens
  // No necesitamos enviar Authorization header

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', // Important for cookies
  }

  try {
    const response = await fetch(url, config)

    // Handle 401 Unauthorized
    if (response.status === 401) {
      localStorage.removeItem('isis_user')
      // Solo redirigir si no estamos ya en login o register
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login'
      }
      throw new Error('Session expired. Please login again.')
    }

    // Parse JSON response
    const data = await response.json()

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
