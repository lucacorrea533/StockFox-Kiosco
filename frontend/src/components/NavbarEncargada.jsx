/*
 * NavbarEncargada.jsx
 * Barra de navegación lateral para los roles Encargada/Ayudante (panel admin).
 * Versión 2: sidebar colapsable en desktop (64px solo íconos / 210px
 * expandido, con tooltip flotante al pasar el mouse sobre cada ítem cuando
 * está colapsada). En mobile se convierte en un drawer angosto de 120px que
 * se abre con un botón de hamburguesa desde una barra superior fija.
 * Sigue dando acceso a todas las secciones (Inicio, Productos, Ventas,
 * Informes, Proveedores, Pedidos, Usuarios), muestra notificaciones de stock
 * bajo (traídas del backend) y el cierre de sesión con confirmación directa
 * (sin dropdown intermedio, igual que en NavbarAlumno).
 */

// Importaciones de React, React Router y otros componentes/recursos
import { useState, useEffect, useRef } from 'react'
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

// Clave de localStorage donde se guarda si el sidebar está colapsado, para que la preferencia persista entre sesiones
const STORAGE_KEY_COLAPSADO = 'navbar_encargada_colapsado'

// Props: onCerrarSesion, ejecutada al confirmar el cierre de sesión
function NavbarEncargada({ onCerrarSesion }) {
  // Colapsado: true = angosto (64px, solo íconos + tooltip), false = expandido (210px, íconos + texto)
  const [colapsado, setColapsado] = useState(() => localStorage.getItem(STORAGE_KEY_COLAPSADO) === 'true')
  const [menuMobileAbierto, setMenuMobileAbierto] = useState(false) // Drawer mobile abierto/cerrado
  const [alertasStock, setAlertasStock] = useState([]) // Notificaciones de stock bajo, vienen del backend
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  // Tooltip del modo colapsado: se calcula por JS (getBoundingClientRect) y se
  // renderiza en position: fixed, FUERA de .navbar-encargada-links. Esto evita
  // que quede cortado por el overflow-y: auto del contenedor con scroll, que
  // en CSS obliga automáticamente a que overflow-x también se recorte
  // (aunque no se lo escriba explícito), cortando cualquier elemento
  // absolute que sobresalga hacia la derecha del ítem.
  const [tooltip, setTooltip] = useState(null) // { texto, top } | null
  const navigate = useNavigate()

  // Trae las alertas de stock al montar el componente
  useEffect(() => {
    authFetch(`${API_BASE_URL}/notificaciones/`) // Llama al endpoint de notificaciones del backend, que devuelve un JSON con las alertas de stock bajo
      .then(response => response.json())
      .then(data => setAlertasStock(data.alertas || []))
      .catch(error => console.error(error))
  }, [])

  // Cada vez que cambia el estado colapsado, se guarda la preferencia y se
  // actualiza la variable CSS global --sidebar-ancho-actual. Las páginas que
  // usan margin-left: var(--sidebar-ancho-actual) en su <main> reaccionan
  // solas, sin que este componente tenga que saber nada de ellas.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_COLAPSADO, colapsado)
    document.documentElement.style.setProperty(
      '--sidebar-ancho-actual',
      colapsado ? 'var(--sidebar-ancho-colapsado)' : 'var(--sidebar-ancho-expandido)'
    )
  }, [colapsado])

  // Colapsa/expande el sidebar en desktop (el botón "☰" junto al logo)
  const toggleColapsado = () => setColapsado(prev => !prev)

  // Abre/cierra el drawer en mobile (el botón "☰" de la barra superior mobile)
  const toggleMenuMobile = () => setMenuMobileAbierto(prev => !prev)

  // Muestra el tooltip con el nombre de la sección, solo tiene sentido si el sidebar está colapsado
  // (en mobile no hay hover real, así que ahí simplemente nunca se llama)
  const mostrarTooltip = (event, texto) => {
    if (!colapsado) return
    const rect = event.currentTarget.getBoundingClientRect()
    setTooltip({ texto, top: rect.top + rect.height / 2 })
  }
  const ocultarTooltip = () => setTooltip(null)

  // Abre/cierra el dropdown de notificaciones
  const toggleNotificaciones = () => setMostrarNotificaciones(prev => !prev)

  // Clickear el ícono de cerrar sesión abre directo el modal de confirmación (sin dropdown intermedio)
  const pedirConfirmacion = () => setConfirmando(true)

  // Se ejecuta solo si se confirma el cierre de sesión en el modal
  const confirmarCierre = () => {
    setConfirmando(false)
    onCerrarSesion?.()
    navigate('/login')
  }

  return ( // Renderiza la barra superior mobile, el sidebar (desktop o drawer según el ancho de pantalla), el tooltip flotante, el dropdown de notificaciones y el modal de confirmación
    <>
      {/* Barra superior, solo visible en mobile (se oculta en desktop vía CSS) */}
      <div className="navbar-encargada-topbar-mobile">
        <span className="navbar-encargada-hamburguesa" onClick={toggleMenuMobile}>☰</span>
        <img src={logoKiosco} alt="RecoKiosco" className="navbar-encargada-logo-mobile" />
      </div>

      {/* Fondo oscuro detrás del drawer mobile; tocarlo afuera del menú lo cierra */}
      {menuMobileAbierto && (
        <div className="navbar-encargada-backdrop" onClick={() => setMenuMobileAbierto(false)} />
      )}

      <nav className={`navbar-encargada ${colapsado ? 'colapsado' : ''} ${menuMobileAbierto ? 'mobile-abierto' : ''}`}>

        {/* Logo + botón de colapsar (el botón solo tiene efecto real en desktop, en mobile se oculta vía CSS) */}
        <div className="navbar-encargada-logo">
          <img src={logoKiosco} alt="RecoKiosco" />
          <span className="navbar-encargada-toggle" onClick={toggleColapsado}>☰</span>
        </div>

        {/* Links a cada sección del panel admin */}
        <div className="navbar-encargada-links">
          {LINKS.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `navbar-encargada-item ${isActive ? 'activo' : ''}`}
              onClick={() => setMenuMobileAbierto(false)} // En mobile, elegir una sección cierra el drawer
              onMouseEnter={(event) => mostrarTooltip(event, link.label)}
              onMouseLeave={ocultarTooltip}
            >
              <img src={link.icon} alt={link.label} />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </div>

        {/* Footer: usuario logueado + accesos rápidos */}
        <div className="navbar-encargada-footer">
          <div
            className="navbar-encargada-usuario"
            onMouseEnter={(event) => mostrarTooltip(event, localStorage.getItem('nombre'))}
            onMouseLeave={ocultarTooltip}
          >
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

            {/* Cerrar sesión: mismo patrón que en NavbarAlumno, sin dropdown intermedio */}
            <div className="navbar-icon-btn navbar-icon-btn-peligro" onClick={pedirConfirmacion} title="Cerrar Sesión">
              <img src={iconCerrarSesion} alt="Cerrar Sesión" />
            </div>

          </div>
        </div>

      </nav>

      {/* Tooltip flotante del modo colapsado, en position: fixed para no depender de ningún contenedor con overflow */}
      {tooltip && (
        <div className="navbar-encargada-tooltip" style={{ top: tooltip.top }}>
          {tooltip.texto}
        </div>
      )}

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