/*
 * NavbarEncargada.jsx
 * Barra de navegación lateral para los roles Encargada/Ayudante (panel admin).
 * Da acceso a todas las secciones (Inicio, Productos, Ventas, Informes,
 * Proveedores, Pedidos, Usuarios), muestra notificaciones de stock bajo
 * (traídas del backend) y el cierre de sesión con confirmación.
 */

// Importaciones de React, React Router y otros componentes/recursos
import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { authFetch } from '../api/authFetch'
import logoKiosco from '../assets/logos/RecoKiosco2.png'
import iconInicio from '../assets/icons/InicioBoton.png'
import iconProductos from '../assets/icons/ProductosSimbolo.png'
import iconVentas from '../assets/icons/VentasBoton.png'
import iconInformes from '../assets/icons/InformesBoton.png'
import iconProveedores from '../assets/icons/ProveedoresBoton.png'
import iconPedidos from '../assets/icons/PedidosBoton.png'
import iconUsuarios from '../assets/icons/UsuariosBoton.png'
import iconNotificaciones from '../assets/icons/NotificacionesBoton.png'
import iconOpciones from '../assets/icons/OpcionesBoton.png'
import iconUsuario from '../assets/icons/SimboloUsuario.png'
import iconCerrarSesion from '../assets/icons/SimboloCerrarSesion.png'
import iconAdvertencia from '../assets/icons/Advertencia.png'
import ConfirmModal from './ConfirmModal'
import '../styles/NavbarEncargada.css'
import { API_BASE_URL } from '../api/config'

// Secciones del panel admin: ruta, ícono y etiqueta.
// "end: true" en Inicio evita que se marque activo también en subrutas (ej. /admin/productos)
const LINKS = [
  { to: '/admin', end: true, icon: iconInicio, label: 'Inicio' },
  { to: '/admin/productos', icon: iconProductos, label: 'Productos' },
  { to: '/admin/ventas', icon: iconVentas, label: 'Ventas' },
  { to: '/admin/informes', icon: iconInformes, label: 'Informes' },
  { to: '/admin/proveedores', icon: iconProveedores, label: 'Proveedores' },
  { to: '/admin/pedidos', icon: iconPedidos, label: 'Pedidos' },
  { to: '/admin/usuarios', icon: iconUsuarios, label: 'Usuarios' },
]

// Props: onCerrarSesion, ejecutada al confirmar el cierre de sesión
function NavbarEncargada({ onCerrarSesion }) {
  const [alertasStock, setAlertasStock] = useState([]) // Notificaciones de stock bajo, vienen del backend
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false)
  const [mostrarOpciones, setMostrarOpciones] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const navigate = useNavigate()

  // Trae las alertas de stock al montar el componente
  useEffect(() => {
    authFetch(`${API_BASE_URL}/notificaciones/`) // Llama al endpoint de notificaciones del backend, que devuelve un JSON con las alertas de stock bajo
      .then(response => response.json())
      .then(data => setAlertasStock(data.alertas || []))
      .catch(error => console.error(error))
  }, [])

  // Abre/cierra el dropdown de notificaciones; cierra el de opciones para que no se tapen entre sí
  const toggleNotificaciones = () => {
    setMostrarNotificaciones(prev => !prev)
    setMostrarOpciones(false)
  }

  // Igual que arriba, pero para el dropdown de opciones
  const toggleOpciones = () => {
    setMostrarOpciones(prev => !prev)
    setMostrarNotificaciones(false)
  }

  // Clickear "Cerrar Sesión" en el dropdown: cierra el dropdown y abre el modal de confirmación
  const pedirConfirmacion = () => {
    setMostrarOpciones(false)
    setConfirmando(true)
  }

  // Se ejecuta solo si se confirma el cierre de sesión en el modal
  const confirmarCierre = () => {
    setConfirmando(false)
    onCerrarSesion?.()
    navigate('/login')
  }

  return ( // Renderiza la barra de navegación lateral, los dropdowns de notificaciones y opciones, y el modal de confirmación de cierre de sesión
    <>
      <nav className="navbar-encargada">

        {/* Logo */}
        <div className="navbar-encargada-logo">
          <img src={logoKiosco} alt="RecoKiosco" />
        </div>

        {/* Links a cada sección del panel admin */}
        <div className="navbar-encargada-links">
          {LINKS.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `navbar-encargada-item ${isActive ? 'activo' : ''}`}
            >
              <img src={link.icon} alt={link.label} />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </div>

        {/* Footer: usuario logueado + accesos rápidos */}
        <div className="navbar-encargada-footer">
          <div className="navbar-encargada-usuario">
            <img src={iconUsuario} alt="Usuario" />
            <span>{localStorage.getItem('nombre')}</span>
          </div>

          <div className="navbar-encargada-acciones">

            {/* Notificaciones de stock bajo */}
            <div className="navbar-icon-wrapper">
              <img src={iconNotificaciones} alt="Notificaciones" onClick={toggleNotificaciones} />
              {alertasStock.length > 0 && <span className="navbar-notif-badge">{alertasStock.length}</span>}

              {mostrarNotificaciones && (
                <div className="navbar-dropdown">
                  <p className="navbar-dropdown-titulo">Notificaciones</p>
                  {alertasStock.map((mensaje, index) => (
                    <div className="navbar-notif-item" key={index}>
                      <img src={iconAdvertencia} alt="Advertencia" />
                      <span>{mensaje}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Opciones: cerrar sesión */}
            <div className="navbar-icon-wrapper">
              <img src={iconOpciones} alt="Opciones" onClick={toggleOpciones} />
              {mostrarOpciones && (
                <div className="navbar-dropdown">
                  <div className="navbar-dropdown-item" onClick={pedirConfirmacion}>
                    <img src={iconCerrarSesion} alt="Cerrar Sesión" />
                    <span>Cerrar Sesión</span>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

      </nav>

      {/* Modal de confirmación de cierre de sesión */}
      {confirmando && (
        <ConfirmModal
          titulo="Cerrar sesión"
          mensaje="¿Seguro que querés cerrar sesión?"
          onConfirmar={confirmarCierre}
          onCancelar={() => setConfirmando(false)}
        />
      )}
    </>
  )
}

export default NavbarEncargada