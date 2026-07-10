/* Este componente representa la barra de navegación para el alumno, con enlaces a catálogo y mis pedidos, además de opciones para ver el carrito y cerrar sesión. */

/* Importa React y hooks necesarios, así como componentes y assets (imágenes e íconos) */ /*Los hooks son funciones especiales de React que permiten usar estado y otras características de React en componentes funcionales. */
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

// Recibe 3 props desde la vista que lo use:
// - cantidadCarrito: número de productos en el carrito (para mostrar el globito rojo). Por defecto 0.
// - onAbrirCarrito: función que se ejecuta al clickear el ícono del carrito (la define la vista padre, ej. Catálogo)
// - onCerrarSesion: función que se ejecuta al confirmar el cierre de sesión (la define quien use este navbar)
// Esta función basicamente renderiza la barra de navegación y maneja la lógica de abrir el carrito y cerrar sesión, incluyendo un modal de confirmación para el cierre de sesión.
function NavbarAlumno({ cantidadCarrito = 0, onAbrirCarrito, onCerrarSesion }) {
  const [confirmando, setConfirmando] = useState(false) // Controla si el modal de "¿Seguro que querés cerrar sesión?" está visible
  const navigate = useNavigate() // Hook de React Router que permite cambiar de página por código (sin que el usuario clickee un link)

  // Se ejecuta solo cuando el usuario confirma el cierre de sesión en el modal
  const confirmarCierre = () => {
    setConfirmando(false) // Cierra el modal de confirmación
    onCerrarSesion?.() // El "?." (optional chaining) evita un error si la vista padre no pasó esta función; si existe, la ejecuta
    navigate('/login') // Redirige a la pantalla de login
  }

  return (
    <>
      <nav className="navbar-alumno">

        {/* Logo, siempre fijo arriba de todo */}
        <div className="navbar-alumno-logo">
          <img src={logoKiosco} alt="RecoKiosco2" />
        </div>

        {/* Links de navegación: Catálogo y Mis Pedidos */}
        <div className="navbar-alumno-links">
          {/* NavLink es como un <Link> normal, pero sabe automáticamente en qué página estás parado.
              La función que recibe className evalúa "isActive": si la URL actual coincide con "to",
              le agrega la clase "activo" para resaltarlo visualmente (ver NavbarAlumno.css) */}
          <NavLink
            to="/catalogo"
            className={({ isActive }) =>
              isActive ? 'navbar-alumno-item activo' : 'navbar-alumno-item'
            }
          >
            <img src={iconCatalogo} alt="Catálogo" />
            <span>Catálogo</span>
          </NavLink>

          <NavLink
            to="/mis-pedidos"
            className={({ isActive }) =>
              isActive ? 'navbar-alumno-item activo' : 'navbar-alumno-item'
            }
          >
            <img src={iconMisPedidos} alt="Mis Pedidos" />
            <span>Mis Pedidos</span>
          </NavLink>
        </div>

        {/* Footer — usuario logueado y accesos rápidos (carrito, cerrar sesión) */}
        <div className="navbar-alumno-footer">
          <div className="navbar-alumno-usuario">
            <img src={iconUsuario} alt="Usuario" />
            <span>Alumno</span>
          </div>

          <div className="navbar-alumno-acciones">
            {/* Ícono del carrito: al clickear ejecuta la función que pasó la vista padre (onAbrirCarrito).
                Si hay productos en el carrito, muestra un globito con la cantidad */}
            <div className="navbar-icon-btn" onClick={onAbrirCarrito} title="Carrito">
              <img src={iconCarrito} alt="Carrito" />
              {cantidadCarrito > 0 && (
                <span className="navbar-carrito-badge">{cantidadCarrito}</span>
              )}
            </div>

            {/* Ícono de cerrar sesión: no cierra sesión directo, primero abre el modal de confirmación */}
            <div
              className="navbar-icon-btn navbar-icon-btn-peligro"
              onClick={() => setConfirmando(true)}
              title="Cerrar Sesión"
            >
              <img src={iconCerrarSesion} alt="Cerrar Sesión" />
            </div>
          </div>
        </div>

      </nav>

      {/* El modal de confirmación solo se renderiza si "confirmando" es true.
          Si el usuario cancela, simplemente se vuelve a ocultar sin hacer nada más */}
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