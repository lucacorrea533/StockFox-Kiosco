import { API_BASE_URL } from '../api/config'

export async function fetchConAuth(endpoint, options = {}) {

  const token = localStorage.getItem("access")

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  })
}