/* Este componente representa la barra de navegación para la encargada, con enlaces a todas las secciones del panel administrativo (productos, ventas, informes, proveedores, pedidos, usuarios), además de notificaciones y opciones para cerrar sesión. */

/* Importa React y hooks necesarios, así como componentes y assets (imágenes e íconos) */ /*Los hooks son funciones especiales de React que permiten usar estado y otras características de React en componentes funcionales. */
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

// Datos de ejemplo "hardcodeados" (fijos en el código) para simular notificaciones mientras no hay backend conectado.
// Cuando se integre con la API real, esto se va a reemplazar por datos que vengan del servidor (ej. alertas de stock bajo)
const notificacionesEjemplo = [ // Array de objetos, cada uno representando una notificación
  {
    id: 1,
    tipo: 'stock', // Define qué ícono mostrar en la notificación (acá siempre es el de advertencia)
    mensaje: 'Yerba Amanda: quedan solo 3 unidades en stock.',
  },
]

// Recibe una sola prop: onCerrarSesion, la función que ejecuta la vista padre cuando se confirma el cierre de sesión
function NavbarEncargada({ onCerrarSesion }) {
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false) // Controla si el dropdown de notificaciones está abierto
  const [mostrarOpciones, setMostrarOpciones] = useState(false) // Controla si el dropdown de opciones (cerrar sesión, etc) está abierto
  const [confirmando, setConfirmando] = useState(false) // Controla si el modal de confirmación de cierre de sesión está visible
  const navigate = useNavigate() // Permite redirigir por código, sin que el usuario clickee un link

  // Abre/cierra el dropdown de notificaciones. Si estaba abierto el de opciones, lo cierra
  // (para que no queden los dos dropdowns abiertos al mismo tiempo, tapándose entre sí) // los dropdowns son los menús que se abren al clickear la campana de notificaciones o el ícono de opciones
  const toggleNotificaciones = () => {
    setMostrarNotificaciones((prev) => !prev) // (prev) => !prev invierte el valor actual: si estaba abierto lo cierra y viceversa
    setMostrarOpciones(false)
  }

  // Igual que arriba, pero para el dropdown de opciones. Cierra notificaciones si estaban abiertas
  const toggleOpciones = () => {
    setMostrarOpciones((prev) => !prev)
    setMostrarNotificaciones(false)
  }

  // Se ejecuta al clickear "Cerrar Sesión" dentro del dropdown de opciones:
  // cierra el dropdown y abre el modal de confirmación (todavía no cierra la sesión)
  const pedirConfirmacion = () => {
    setMostrarOpciones(false)
    setConfirmando(true)
  }

  // Se ejecuta solo si la encargada confirma en el modal que sí quiere cerrar sesión
  const confirmarCierre = () => {
    setConfirmando(false) // Cierra el modal
    onCerrarSesion?.() // Ejecuta la función que le haya pasado la vista padre (si existe)
    navigate('/login') // Redirige al login
  }

  return ( // Renderiza la barra de navegación y los dropdowns/modales según el estado actual
    <>
      <nav className="navbar-encargada">

        {/* Logo arriba */}
        <div className="navbar-encargada-logo">
          <img src={logoKiosco} alt="RecoKiosco" />
        </div>

        {/* Links a cada sección del panel administrativo.
            "end" en el primer NavLink hace que solo se marque como activo en la ruta EXACTA "/admin",
            y no también cuando la URL es, por ejemplo, "/admin/productos" */}
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

        {/* Footer — usuario logueado y accesos rápidos (notificaciones, opciones) */}
        <div className="navbar-encargada-footer">
          <div className="navbar-encargada-usuario">
            <img src={iconUsuario} alt="Usuario" />
            <span>Encargada</span>
          </div>

          <div className="navbar-encargada-acciones">

            {/* Campana de notificaciones */}
            <div className="navbar-icon-wrapper">
              <img
                src={iconNotificaciones}
                alt="Notificaciones"
                onClick={toggleNotificaciones}
              />
              {/* El globito con el número solo aparece si hay al menos una notificación */}
              {notificacionesEjemplo.length > 0 && (
                <span className="navbar-notif-badge">
                  {notificacionesEjemplo.length}
                </span>
              )}

              {/* Dropdown que lista las notificaciones, solo visible si mostrarNotificaciones es true */}
              {mostrarNotificaciones && (
                <div className="navbar-dropdown">
                  <p className="navbar-dropdown-titulo">Notificaciones</p>
                  {/* .map() recorre el array de notificaciones y genera un bloque HTML por cada una.
                      "key={n.id}" es obligatorio en React para que sepa identificar cada elemento de la lista */}
                  {notificacionesEjemplo.map((n) => (
                    <div className="navbar-notif-item" key={n.id}>
                      {/* Por ahora solo existe el tipo "stock", pero esta estructura permite
                          agregar más tipos de notificación en el futuro con distintos íconos */}
                      {n.tipo === 'stock' && (
                        <img src={iconAdvertencia} alt="Advertencia" />
                      )}
                      <span>{n.mensaje}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ícono de opciones (las 3 líneas), abre un menú con "Cerrar Sesión" */}
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

      {/* Modal de confirmación de cierre de sesión, solo se muestra si "confirmando" es true */}
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