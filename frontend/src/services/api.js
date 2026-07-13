const API_URL = "http://127.0.0.1:8000/api"

export async function fetchConAuth(endpoint, options = {}) {

  const token = localStorage.getItem("access")

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  })
}