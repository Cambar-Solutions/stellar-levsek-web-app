import { apiPost, apiGet } from './api'
import { API_ENDPOINTS } from '../constants/api'

/**
 * Login user
 */
export async function loginUser(email, password) {
  const response = await apiPost(API_ENDPOINTS.LOGIN, { email, password })

  // El backend ahora usa cookies para la sesión, no devuelve access_token
  // La cookie se guarda automáticamente por el navegador

  return response
}

/**
 * Validate current session
 */
export async function validateSession() {
  return await apiGet(API_ENDPOINTS.VALIDATE)
}

/**
 * Logout user
 */
export async function logoutUser() {
  const response = await apiPost(API_ENDPOINTS.LOGOUT)
  // La cookie de sesión se elimina en el backend
  localStorage.removeItem('isis_user')
  return response
}

/**
 * Register new user
 */
export async function registerUser(userData) {
  const response = await apiPost(API_ENDPOINTS.REGISTER, userData)
  return response
}
