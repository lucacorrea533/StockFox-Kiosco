// Importamos hooks de React: useState para manejar estado local, useEffect para efectos secundarios (como llamadas a la API)
import { useState, useEffect } from 'react'
// Hook de react-router-dom para poder redirigir al usuario a otra ruta mediante código
import { useNavigate } from 'react-router-dom'
// Ícono de advertencia que se muestra al lado de cada producto con stock bajo
import iconAdvertencia from '../assets/icons/Advertencia.png'
// Estilos correspondientes a este panel (comparte hoja de estilos con el Panel de Administración)
import '../styles/PanelAdministracion.css'
// Función personalizada que envuelve al fetch normal, agregando el token de autenticación en la request
import { authFetch } from '../api/authFetch'
import { API_BASE_URL } from '../api/config'

// Componente que muestra un listado de productos con stock bajo (alerta para la Encargada)
function AlertasStock() {
  // Hook para poder navegar programáticamente a otra vista (por ejemplo, al hacer click en "Ver todos")
  const navigate = useNavigate()
  // Estado que guarda el array de productos con stock bajo traídos desde el backend
  const [alertas, setAlertas] = useState([])

  // Efecto que se ejecuta una sola vez al montar el componente (array de dependencias vacío [])
  useEffect(() => {
    // Hacemos la petición al endpoint que devuelve los productos con stock bajo
    authFetch(`${API_BASE_URL}/productos/stock-bajo/`)
      .then(response => response.json()) // Convertimos la respuesta a JSON
      .then(data => setAlertas(data))    // Guardamos los datos recibidos en el estado "alertas"
      .catch(error => console.error(error)) // Si hay un error, lo mostramos en consola
  }, [])

  return (
    // Tarjeta contenedora de toda la sección de alertas de stock
    <div className="alertas-card">
      {/* Encabezado de la tarjeta: título y cantidad de productos en alerta */}
      <div className="alertas-header">
        <span className="alertas-titulo">Stock bajo</span>
        {/* Badge que muestra la cantidad total de productos con stock bajo */}
        <span className="alertas-badge">{alertas.length} productos</span>
      </div>

      {/* Contenedor de la lista de productos en alerta */}
      <div className="alertas-lista">
        {/* Si no hay productos con stock bajo, mostramos un mensaje indicando que todo está bien */}
        {alertas.length === 0 && (
          <p className="alertas-vacio">Todo el stock está en orden.</p>
        )}

        {/* Recorremos el array de alertas y renderizamos una fila por cada producto */}
        {alertas.map((a) => (
          <div key={a.id} className="alertas-fila">
            {/* Contenedor del ícono + nombre del producto */}
            <div className="alertas-nombre-wrap">
              <img src={iconAdvertencia} alt="Advertencia" className="alertas-icono" />
              <span className="alertas-nombre">{a.nombre}</span>
            </div>
            {/* Cantidad de stock actual; si el stock es 0, se le agrega una clase extra para resaltarlo en rojo */}
            <span className={`alertas-stock ${a.stock === 0 ? 'alertas-stock--cero' : ''}`}>
              Stock: {a.stock}
            </span>
          </div>
        ))}
      </div>

      {/* Botón que redirige a la vista completa de gestión de productos */}
      <button className="alertas-ver-todos" onClick={() => navigate('/admin/productos')}>
        Ver todos →
      </button>
    </div>
  )
}

export default AlertasStock