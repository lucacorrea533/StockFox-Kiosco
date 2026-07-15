// config.js define la URL base del backend en un solo lugar.
// La toma de la variable de entorno VITE_API_URL (definida en .env);
// si no existe, usa localhost como valor por defecto para desarrollo local.

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'