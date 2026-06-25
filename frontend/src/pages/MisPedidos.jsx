/* Este archivo es la página principal donde los alumnos pueden ver el estado de sus pedidos. Se muestra una lista de pedidos con su fecha, hora, estado actual y detalles de los productos incluidos. Los pedidos se pueden filtrar por estado (pendiente, listo para retirar, entregado) y también se muestra un contador de cada tipo de pedido en las pestañas correspondientes. Además, se incluye un botón para abrir el carrito y revisar los productos antes de finalizar un nuevo pedido. */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import NavbarAlumno from '../components/NavbarAlumno'
import { ModalCarrito } from './Catalogo'
import iconReloj from '../assets/icons/Reloj.png'
import iconPedido from '../assets/icons/MisPedidos2.png'
import iconAdvertencia from '../assets/icons/Advertencia.png'
import iconCarrito from '../assets/icons/VentasBoton.png'
import '../styles/MisPedidos.css'

// ── Datos hardcodeados de pedidos ──────────────────────────────────────────────
const pedidosPrueba = [
  {
    id: 42,
    fecha: '2026-05-27',
    hora: '09:45',
    estado: 'listo',
    horario_retiro: '10:30 hs',
    momento_retiro: '2do recreo',
    total: 5200,
    items: [
      { nombre: 'Alfajor Guaymallén Negro', cantidad: 2, precio: 600 },
      { nombre: 'Medialuna c/ J y Q',       cantidad: 1, precio: 2000 },
      { nombre: 'Café Mediano',              cantidad: 1, precio: 2000 },
    ],
  },
  {
    id: 41,
    fecha: '2026-05-27',
    hora: '08:55',
    estado: 'pendiente',
    horario_retiro: '10:00 hs',
    momento_retiro: '1er recreo',
    total: 7500,
    items: [
      { nombre: 'Patitas de Pollo con Papas Fritas', cantidad: 1, precio: 6000 },
      { nombre: 'Jugo Baggio Naranja 200ml',         cantidad: 1, precio: 1500 },
    ],
  },
  {
    id: 38,
    fecha: '2026-05-26',
    hora: '19:15',
    estado: 'entregado',
    horario_retiro: '11:00 hs',
    momento_retiro: 'Salida Normal',
    total: 5000,
    items: [
      { nombre: 'Torta Frita',   cantidad: 3, precio: 1000 },
      { nombre: 'Café Mediano',  cantidad: 1, precio: 2000 },
    ],
  },
  {
    id: 35,
    fecha: '2026-05-25',
    hora: '09:30',
    estado: 'entregado',
    horario_retiro: '10:30 hs',
    momento_retiro: '2do recreo',
    total: 9800,
    items: [
      { nombre: 'Hamburguesa Completa', cantidad: 1, precio: 7000 },
      { nombre: 'Coca Cola 600ml',      cantidad: 1, precio: 2800 },
    ],
  },
]

const CARRITO_KEY = 'recokiosco_carrito'

function cargarCarritoLocal() {
  try {
    const raw = localStorage.getItem(CARRITO_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function guardarCarritoLocal(carrito) {
  localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito))
}

const TABS = [
  { key: 'todos',     label: 'Todos' },
  { key: 'pendiente', label: 'Pendiente' },
  { key: 'listo',     label: 'Listo para retirar' },
  { key: 'entregado', label: 'Entregado' },
]

const ESTADO_CONFIG = {
  pendiente: { label: 'Pendiente',          clase: 'estado-pendiente' },
  listo:     { label: 'Listo para retirar', clase: 'estado-listo'     },
  entregado: { label: 'Entregado',          clase: 'estado-entregado' },
}

function formatFecha(fechaStr, horaStr) {
  const [y, m, d] = fechaStr.split('-')
  return `${d}/${m}/${y} — ${horaStr} hs`
}

function TarjetaPedido({ pedido }) {
  const config = ESTADO_CONFIG[pedido.estado]
  const esListo = pedido.estado === 'listo'
  const esEntregado = pedido.estado === 'entregado'

  return (
    <div className={`mispedidos-card ${esEntregado ? 'card-entregado' : ''}`}>
      <div className="mispedidos-card-header">
        <div className="mispedidos-card-header-izq">
          <img src={iconPedido} alt="Pedido" className="mispedidos-card-icono" />
          <div>
            <span className="mispedidos-card-numero">Pedido #{String(pedido.id).padStart(4, '0')}</span>
            <span className="mispedidos-card-fecha">{formatFecha(pedido.fecha, pedido.hora)}</span>
          </div>
        </div>
        <span className={`mispedidos-estado-badge ${config.clase}`}>
          {config.label}
        </span>
      </div>

      {esListo && (
        <div className="mispedidos-banner-listo">
          <img src={iconReloj} alt="Listo" className="mispedidos-banner-icono" />
          <span>¡Tu pedido está listo! Pasá a retirarlo a las {pedido.horario_retiro}.</span>
        </div>
      )}

      <ul className="mispedidos-items">
        {pedido.items.map((item, i) => (
          <li key={i}>
            <span className="mispedidos-item-nombre">
              {item.nombre} x{item.cantidad}
            </span>
            <span className="mispedidos-item-precio">
              ${(item.precio * item.cantidad).toLocaleString('es-AR')}
            </span>
          </li>
        ))}
      </ul>

      <div className="mispedidos-card-footer">
        <span className="mispedidos-retiro">
          <img src={iconReloj} alt="Retiro" className="mispedidos-retiro-icono" />
          {esEntregado ? 'Retirado' : 'Retiro'}: {pedido.horario_retiro} — {pedido.momento_retiro}
        </span>
        <span className="mispedidos-total">
          ${pedido.total.toLocaleString('es-AR')}
        </span>
      </div>
    </div>
  )
}

function MisPedidos() {
  const [tabActiva, setTabActiva] = useState('todos')
  const navigate = useNavigate()

  // Carrito compartido — se sincroniza con localStorage igual que en Catalogo
  const [carrito, setCarrito] = useState(() => cargarCarritoLocal())
  const [mostrarCarrito, setMostrarCarrito] = useState(false)

  useEffect(() => {
    guardarCarritoLocal(carrito)
  }, [carrito])

  const cantidadTotal = carrito.reduce((acc, item) => acc + item.cantidad, 0)
  const totalCarrito  = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0)

  const activos   = pedidosPrueba.filter(p => p.estado !== 'entregado')
  const historial = pedidosPrueba.filter(p => p.estado === 'entregado')

  const pedidosFiltrados = tabActiva === 'todos'
    ? pedidosPrueba
    : pedidosPrueba.filter(p => p.estado === tabActiva)

  const contadores = {
    todos:     pedidosPrueba.length,
    pendiente: pedidosPrueba.filter(p => p.estado === 'pendiente').length,
    listo:     pedidosPrueba.filter(p => p.estado === 'listo').length,
    entregado: pedidosPrueba.filter(p => p.estado === 'entregado').length,
  }

  const sinPedidos = pedidosFiltrados.length === 0

  return (
    <div className="mispedidos-layout">
      <NavbarAlumno cantidadCarrito={cantidadTotal} onAbrirCarrito={() => setMostrarCarrito(true)} />

      <main className="mispedidos-contenido">
        <div className="mispedidos-header">
          <img src={iconPedido} alt="Mis Pedidos" className="mispedidos-titulo-icono" />
          <h1 className="mispedidos-titulo">Mis Pedidos</h1>
        </div>

        <div className="mispedidos-tabs">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`mispedidos-tab-btn ${tabActiva === tab.key ? 'activo' : ''}`}
              onClick={() => setTabActiva(tab.key)}
            >
              {tab.label}
              {contadores[tab.key] > 0 && (
                <span className="mispedidos-tab-contador">{contadores[tab.key]}</span>
              )}
            </button>
          ))}
        </div>

        {sinPedidos ? (
          <div className="mispedidos-vacio">
            <img src={iconAdvertencia} alt="Sin pedidos" className="mispedidos-vacio-icono" />
            <h2 className="mispedidos-vacio-titulo">Todavía no realizaste ningún pedido</h2>
            <p className="mispedidos-vacio-sub">Explorá el catálogo y hacé tu primer pedido</p>
            <button
              className="mispedidos-vacio-btn"
              onClick={() => navigate('/catalogo')}
            >
              Ir al catálogo
            </button>
          </div>
        ) : (
          <>
            {tabActiva === 'todos' && activos.length > 0 && (
              <section className="mispedidos-seccion">
                {activos.map(p => <TarjetaPedido key={p.id} pedido={p} />)}
              </section>
            )}

            {tabActiva !== 'todos' && (
              <section className="mispedidos-seccion">
                {pedidosFiltrados.map(p => <TarjetaPedido key={p.id} pedido={p} />)}
              </section>
            )}

            {tabActiva === 'todos' && historial.length > 0 && (
              <>
                <div className="mispedidos-separador">
                  <span className="mispedidos-separador-label">Historial</span>
                </div>
                <section className="mispedidos-seccion">
                  {historial.map(p => <TarjetaPedido key={p.id} pedido={p} />)}
                </section>
              </>
            )}
          </>
        )}
      </main>

      {/* BOTÓN FLOTANTE CARRITO — siempre visible si hay items */}
      {cantidadTotal > 0 && (
        <button className="catalogo-carrito-flotante" onClick={() => setMostrarCarrito(true)}>
          <img src={iconCarrito} alt="Carrito" />
          <span className="catalogo-carrito-badge">{cantidadTotal}</span>
          <span className="catalogo-carrito-total">Ver pedido · ${totalCarrito.toLocaleString('es-AR')}</span>
        </button>
      )}

      {/* Modal del carrito — reutiliza el mismo componente de Catalogo */}
      <ModalCarrito
        carrito={carrito}
        setCarrito={setCarrito}
        mostrarCarrito={mostrarCarrito}
        setMostrarCarrito={setMostrarCarrito}
      />
    </div>
  )
}

export default MisPedidos