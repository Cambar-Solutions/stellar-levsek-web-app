import { apiPost, apiGet } from './api'
import { API_ENDPOINTS } from '../constants/api'

/**
 * Login user with JWT
 */
export async function loginUser(email, password) {
  const response = await apiPost(API_ENDPOINTS.LOGIN, { email, password })
  console.log('🔑 authService - Full login response:', response)
  console.log('🔑 authService - response.access_token:', response.access_token)
  console.log('🔑 authService - response.data?.access_token:', response.data?.access_token)

  // Save JWT token to localStorage
  const token = response.access_token || response.data?.access_token
  console.log('🔑 authService - Token to save:', token)

  if (token) {
    localStorage.setItem('access_token', token)
    console.log('✅ Token saved to localStorage')
  } else {
    console.error('❌ No token found in response!')
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
