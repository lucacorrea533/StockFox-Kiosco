/* Este componente representa la barra de navegación para el alumno, con enlaces a catálogo y mis pedidos, además de opciones para ver el carrito y cerrar sesión. */

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

function NavbarAlumno({ cantidadCarrito = 0, onAbrirCarrito, onCerrarSesion }) {
  const [confirmando, setConfirmando] = useState(false)
  const navigate = useNavigate()

  const confirmarCierre = () => {
    setConfirmando(false)
    onCerrarSesion?.()
    navigate('/login') 
  }

  return (
    <>
      <nav className="navbar-alumno">

        {/* Logo */}
        <div className="navbar-alumno-logo">
          <img src={logoKiosco} alt="RecoKiosco2" />
        </div>

        {/* Links */}
        <div className="navbar-alumno-links">
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

        {/* Footer — usuario y acciones */}
        <div className="navbar-alumno-footer">
          <div className="navbar-alumno-usuario">
            <img src={iconUsuario} alt="Usuario" />
            <span>Alumno</span>
          </div>

          <div className="navbar-alumno-acciones">
            <div className="navbar-icon-btn" onClick={onAbrirCarrito} title="Carrito">
              <img src={iconCarrito} alt="Carrito" />
              {cantidadCarrito > 0 && (
                <span className="navbar-carrito-badge">{cantidadCarrito}</span>
              )}
            </div>

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