/* Este componente representa la barra de navegación para el alumno, con enlaces a catálogo y mis pedidos, además de opciones para ver el carrito y cerrar sesión. */

import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
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

const notificacionesEjemplo = [
  {
    id: 1,
    tipo: 'stock',
    mensaje: 'Yerba Amanda: quedan solo 3 unidades en stock.',
  },
]

function NavbarEncargada({ onCerrarSesion }) {
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false)
  const [mostrarOpciones, setMostrarOpciones] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const navigate = useNavigate()

  const toggleNotificaciones = () => {
    setMostrarNotificaciones((prev) => !prev)
    setMostrarOpciones(false)
  }

  const toggleOpciones = () => {
    setMostrarOpciones((prev) => !prev)
    setMostrarNotificaciones(false)
  }

  const pedirConfirmacion = () => {
    setMostrarOpciones(false)
    setConfirmando(true)
  }

  const confirmarCierre = () => {
    setConfirmando(false)
    onCerrarSesion?.()
    navigate('/login')
  }

  return (
    <>
      <nav className="navbar-encargada">

        {/* Logo arriba */}
        <div className="navbar-encargada-logo">
          <img src={logoKiosco} alt="RecoKiosco" />
        </div>

        {/* Links */}
        <div className="navbar-encargada-links">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              isActive ? 'navbar-encargada-item activo' : 'navbar-encargada-item'
            }
          >
            <img src={iconInicio} alt="Inicio" />
            <span>Inicio</span>
          </NavLink>

          <NavLink
            to="/admin/productos"
            className={({ isActive }) =>
              isActive ? 'navbar-encargada-item activo' : 'navbar-encargada-item'
            }
          >
            <img src={iconProductos} alt="Productos" />
            <span>Productos</span>
          </NavLink>

          <NavLink
            to="/admin/ventas"
            className={({ isActive }) =>
              isActive ? 'navbar-encargada-item activo' : 'navbar-encargada-item'
            }
          >
            <img src={iconVentas} alt="Ventas" />
            <span>Ventas</span>
          </NavLink>

          <NavLink
            to="/admin/informes"
            className={({ isActive }) =>
              isActive ? 'navbar-encargada-item activo' : 'navbar-encargada-item'
            }
          >
            <img src={iconInformes} alt="Informes" />
            <span>Informes</span>
          </NavLink>

          <NavLink
            to="/admin/proveedores"
            className={({ isActive }) =>
              isActive ? 'navbar-encargada-item activo' : 'navbar-encargada-item'
            }
          >
            <img src={iconProveedores} alt="Proveedores" />
            <span>Proveedores</span>
          </NavLink>

          <NavLink
            to="/admin/pedidos"
            className={({ isActive }) =>
              isActive ? 'navbar-encargada-item activo' : 'navbar-encargada-item'
            }
          >
            <img src={iconPedidos} alt="Pedidos" />
            <span>Pedidos</span>
          </NavLink>

          <NavLink
            to="/admin/usuarios"
            className={({ isActive }) =>
              isActive ? 'navbar-encargada-item activo' : 'navbar-encargada-item'
            }
          >
            <img src={iconUsuarios} alt="Usuarios" />
            <span>Usuarios</span>
          </NavLink>
        </div>

        {/* Footer — usuario y acciones */}
        <div className="navbar-encargada-footer">
          <div className="navbar-encargada-usuario">
            <img src={iconUsuario} alt="Usuario" />
            <span>Encargada</span>
          </div>

          <div className="navbar-encargada-acciones">

            {/* Notificaciones */}
            <div className="navbar-icon-wrapper">
              <img
                src={iconNotificaciones}
                alt="Notificaciones"
                onClick={toggleNotificaciones}
              />
              {notificacionesEjemplo.length > 0 && (
                <span className="navbar-notif-badge">
                  {notificacionesEjemplo.length}
                </span>
              )}

              {mostrarNotificaciones && (
                <div className="navbar-dropdown">
                  <p className="navbar-dropdown-titulo">Notificaciones</p>
                  {notificacionesEjemplo.map((n) => (
                    <div className="navbar-notif-item" key={n.id}>
                      {n.tipo === 'stock' && (
                        <img src={iconAdvertencia} alt="Advertencia" />
                      )}
                      <span>{n.mensaje}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Opciones (3 líneas) */}
            <div className="navbar-icon-wrapper">
              <img
                src={iconOpciones}
                alt="Opciones"
                onClick={toggleOpciones}
              />

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