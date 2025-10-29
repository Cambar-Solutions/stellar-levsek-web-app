// API Base URL Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://stellar.api.levsek.com.mx'

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  VALIDATE: '/auth/validate',
  LOGOUT: '/auth/logout',

  // Users
  USERS: '/users',
  USER_BY_ID: (id) => `/users/${id}`,

  // Sites
  SITES: '/sites',
  SITE_BY_ID: (id) => `/sites/${id}`,

  // Customers
  CUSTOMERS: '/customers',
  CUSTOMER_BY_ID: (id) => `/customers/${id}`,
  CUSTOMERS_BY_SITE: (siteId) => `/customers/site/${siteId}`,

  // Debts
  DEBTS: '/debts',
  DEBT_BY_ID: (id) => `/debts/${id}`,
  DEBTS_BY_SITE: (siteId) => `/debts/site/${siteId}`,
  DEBTS_BY_CUSTOMER: (customerId) => `/debts/customer/${customerId}`,
  REGISTER_PAYMENT: (id) => `/debts/${id}/pay`,
}
