export async function authFetch(url, options = {}) {
  const token = localStorage.getItem('access')
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "Authorization": token ? `Bearer ${token}` : ""
    }
  })
}