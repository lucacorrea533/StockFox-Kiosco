/*
 * NavbarAlumno.jsx
 * Barra de navegación lateral para el rol Alumno.
 * Da acceso a Catálogo y Mis Pedidos, muestra el usuario logueado, el ícono
 * del carrito (con cantidad) y el cierre de sesión con confirmación.
 */
// Un navbar significa que es una barra de navegación lateral, que permite al usuario moverse entre distintas secciones de la aplicación. En este caso, el navbar es específico para el rol Alumno, y por eso solo tiene links a Catálogo y Mis Pedidos. Además, muestra el nombre del usuario logueado (traído del localStorage), un ícono de carrito con la cantidad de productos que hay en él (si hay alguno), y un ícono de cierre de sesión que abre un modal de confirmación antes de cerrar la sesión.

// Importaciones de React, React Router y otros componentes/recursos
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import logoKiosco from '../assets/logos/RecoKiosco2.png'
import iconCatalogo from '../assets/icons/Catalogos.png'
import iconMisPedidos from '../assets/icons/MisPedidos2.png'
import iconCerrarSesion from '../assets/icons/SimboloCerrarSesion.png'
import iconUsuario from '../assets/icons/SimboloUsuario.png'
import iconCarrito from '../assets/icons/VentasBoton.png'
import ConfirmModal from './ConfirmModal'
import '../styles/NavbarAlumno.css'

// Links de navegación del alumno: ruta, ícono y etiqueta
const LINKS = [
  { to: '/catalogo', icon: iconCatalogo, label: 'Catálogo' },
  { to: '/mis-pedidos', icon: iconMisPedidos, label: 'Mis Pedidos' },
]

// Props:
// - cantidadCarrito: cantidad de productos en el carrito, para el badge (default 0)
// - onAbrirCarrito: acción al clickear el ícono del carrito (la define la vista padre)
// - onCerrarSesion: acción al confirmar el cierre de sesión (la define quien use el navbar)
// Los props son opcionales, para que el navbar pueda usarse en vistas donde no haya carrito ni cierre de sesión (ej. login)
// Signfiica que si la vista padre no pasa estas funciones, el navbar no rompe, solo no hace nada al clickear esos íconos.
function NavbarAlumno({ cantidadCarrito = 0, onAbrirCarrito, onCerrarSesion }) {
  const [confirmando, setConfirmando] = useState(false) // Modal de "¿Seguro que querés cerrar sesión?"
  const navigate = useNavigate()

  // Se ejecuta solo si se confirma el cierre de sesión en el modal
  const confirmarCierre = () => {
    setConfirmando(false)
    onCerrarSesion?.() // Optional chaining: no rompe si la vista padre no pasó esta función
    navigate('/login')
  }

  return ( // Renderiza la barra de navegación lateral, el ícono del carrito con badge, y el modal de confirmación de cierre de sesión
    <>
      <nav className="navbar-alumno">

        {/* Logo */}
        <div className="navbar-alumno-logo">
          <img src={logoKiosco} alt="RecoKiosco2" />
        </div>

        {/* Links: NavLink marca automáticamente la ruta activa con la clase "activo" */}
        <div className="navbar-alumno-links">
          {LINKS.map(link => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => `navbar-alumno-item ${isActive ? 'activo' : ''}`}>
              <img src={link.icon} alt={link.label} />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </div>

        {/* Footer: usuario logueado + accesos rápidos */}
        <div className="navbar-alumno-footer">
          <div className="navbar-alumno-usuario">
            <img src={iconUsuario} alt="Usuario" />
            <span>{localStorage.getItem('nombre')}</span>
          </div>

          <div className="navbar-alumno-acciones">
            {/* Carrito: ejecuta la función que pasó la vista padre; badge solo si hay productos */}
            <div className="navbar-icon-btn" onClick={onAbrirCarrito} title="Carrito">
              <img src={iconCarrito} alt="Carrito" />
              {cantidadCarrito > 0 && <span className="navbar-carrito-badge">{cantidadCarrito}</span>}
            </div>

            {/* Cerrar sesión: primero abre el modal de confirmación */}
            <div className="navbar-icon-btn navbar-icon-btn-peligro" onClick={() => setConfirmando(true)} title="Cerrar Sesión">
              <img src={iconCerrarSesion} alt="Cerrar Sesión" />
            </div>
          </div>
        </div>

      </nav>

      {/* Modal de confirmación, solo si "confirmando" es true */}
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

export default NavbarAlumno