import { apiPost, apiGet } from './api'
import { API_ENDPOINTS } from '../constants/api'

/**
 * Login user with JWT
 */
export async function loginUser(email, password) {
  const response = await apiPost(API_ENDPOINTS.LOGIN, { email, password })

  // Save JWT token to localStorage
  if (response.access_token) {
    localStorage.setItem('access_token', response.access_token)
  }

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
  // Remove token from localStorage
  localStorage.removeItem('isis_user')
  localStorage.removeItem('access_token')
  return response
}

/**
 * Register new user
 */
export async function registerUser(userData) {
  const response = await apiPost(API_ENDPOINTS.REGISTER, userData)
  return response
}
