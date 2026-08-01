// Fila de accesos directos a las tareas más frecuentes de la Encargada: crear un
// producto, ver pedidos, registrar una venta o ver informes. Cada botón navega
// directo a la sección correspondiente, para no tener que pasar por el navbar.

import { useNavigate } from 'react-router-dom'
import iconProductos from '../assets/icons/ProductosSimbolo.png'
import iconPedidos from '../assets/icons/PedidosBoton.png'
import iconVentas from '../assets/icons/VentasBoton.png'
import iconInformes from '../assets/icons/InformesBoton.png'
import '../styles/PanelAdministracion.css'

// Ruta, ícono y etiqueta de cada acción rápida
const ACCIONES = [
  { to: '/admin/productos', icon: iconProductos, label: 'Nuevo Producto' },
  { to: '/admin/pedidos', icon: iconPedidos, label: 'Ver Pedidos' },
  { to: '/admin/ventas', icon: iconVentas, label: 'Nueva Venta' },
  { to: '/admin/informes', icon: iconInformes, label: 'Ver Informe' },
]

function AccionesRapidas() {
  const navigate = useNavigate()

  return (
    <div className="pa-acciones-rapidas">
      {ACCIONES.map(accion => (
        <button
          key={accion.to}
          className="pa-accion-btn"
          onClick={() => navigate(accion.to)}
        >
          <img src={accion.icon} alt="" />
          <span>{accion.label}</span>
        </button>
      ))}
    </div>
  )
}

export default AccionesRapidas