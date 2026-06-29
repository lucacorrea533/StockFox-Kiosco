/* Este archivo contiene la página de Ventas Presenciales, donde se pueden seleccionar productos, ver el resumen de la venta y confirmar o cancelar la misma. */
import { useState, useRef } from 'react'
import NavbarEncargada from '../components/NavbarEncargada'
import TarjetaProducto from '../components/TarjetaProducto'
import ResumenVenta from '../components/ResumenVenta'
import iconBuscador  from '../assets/icons/BuscadorBoton.png'
import iconHistorial from '../assets/icons/HistorialBoton.png'
import iconTodos     from '../assets/icons/Todos.png'
import iconSnacks    from '../assets/icons/Snacks.png'
import iconBebidas   from '../assets/icons/Bebidas.png'
import iconAlfajores from '../assets/icons/Alfajores.png'
import iconDulces    from '../assets/icons/Dulces.png'
import iconBocados   from '../assets/icons/Bocados.png'
import iconBebCal    from '../assets/icons/Beb.Calientes.png'
import iconServicios from '../assets/icons/Servicios.png'
import '../styles/VentasPresenciales.css'

const PRODUCTOS_DISPONIBLES = [
  { id: 1, nombre: 'Alfajor Guaymallen Negro', categoria: 'Alfajores',     precio:  600, stock: 30 },
  { id: 2, nombre: 'Medialuna',                categoria: 'Bocados',        precio: 1500, stock: 40 },
  { id: 3, nombre: 'Coca Cola 600ml',          categoria: 'Bebidas',        precio: 2800, stock: 15 },
  { id: 4, nombre: 'Saladix Jamón',            categoria: 'Snacks',         precio: 3000, stock: 20 },
  { id: 5, nombre: 'Café Mediano',             categoria: 'Beb. Calientes', precio: 2000, stock: 30 },
  { id: 6, nombre: 'Agua Villavicencio',       categoria: 'Bebidas',        precio: 1800, stock:  0 },
  { id: 7, nombre: 'Chicle Bazooka Menta',     categoria: 'Dulces',         precio:  200, stock: 40 },
  { id: 8, nombre: 'Calentar Comida',          categoria: 'Servicios',      precio:  200, stock: 999 },
]

const CATEGORIAS = [
  { label: 'Todos',          icon: iconTodos     },
  { label: 'Snacks',         icon: iconSnacks    },
  { label: 'Bebidas',        icon: iconBebidas   },
  { label: 'Alfajores',      icon: iconAlfajores },
  { label: 'Dulces',         icon: iconDulces    },
  { label: 'Bocados',        icon: iconBocados   },
  { label: 'Beb. Calientes', icon: iconBebCal    },
  { label: 'Servicios',      icon: iconServicios },
]

const USUARIO_ACTUAL = 'Encargada'

function VentasPresenciales() {
  const [busqueda, setBusqueda]               = useState('')
  const [categoriaActiva, setCategoriaActiva] = useState('Todos')
  const [cantidades, setCantidades]           = useState({})
  const [ventaConfirmada, setVentaConfirmada] = useState(null)
  const [historial, setHistorial]             = useState([])
  const [error, setError]                     = useState('')
  const [undoToast, setUndoToast]             = useState(null) // { cantidadesGuardadas, segundos }
  const undoTimerRef                          = useRef(null)
  const undoCountRef                          = useRef(null)

  const productosFiltrados = PRODUCTOS_DISPONIBLES.filter((p) => {
    const coincideNombre    = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria = categoriaActiva === 'Todos' || p.categoria === categoriaActiva
    return coincideNombre && coincideCategoria
  })

  function sumar(producto) {
    if (producto.stock === 0) return
    setCantidades((prev) => {
      const actual = prev[producto.id] ?? 0
      if (actual >= producto.stock) return prev
      return { ...prev, [producto.id]: actual + 1 }
    })
    setError('')
  }

  function restar(producto) {
    setCantidades((prev) => {
      const actual = prev[producto.id] ?? 0
      if (actual <= 0) return prev
      const nueva = actual - 1
      if (nueva === 0) {
        const { [producto.id]: _, ...resto } = prev
        return resto
      }
      return { ...prev, [producto.id]: nueva }
    })
  }

  const itemsSeleccionados = PRODUCTOS_DISPONIBLES
    .filter((p) => cantidades[p.id] > 0)
    .map((p) => ({
      ...p,
      cantidad: cantidades[p.id],
      subtotal: p.precio * cantidades[p.id],
    }))

  const total = itemsSeleccionados.reduce((acc, i) => acc + i.subtotal, 0)

  function handleConfirmar() {
    if (itemsSeleccionados.length === 0) {
      setError('Seleccioná al menos un producto antes de confirmar.')
      return
    }
    const hora = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    const nuevaVenta = { items: itemsSeleccionados, total, usuario: USUARIO_ACTUAL, hora }
    setVentaConfirmada(nuevaVenta)
    setHistorial((prev) => [nuevaVenta, ...prev])
    setCantidades({})
    setError('')
  }

  function handleCancelar() {
    // Si no hay nada seleccionado, cancela directo sin toast
    if (Object.keys(cantidades).length === 0) {
      setVentaConfirmada(null)
      return
    }

    // Guarda las cantidades actuales para poder deshacer
    const cantidadesGuardadas = { ...cantidades }
    setCantidades({})
    setVentaConfirmada(null)
    setError('')

    // Limpia timers anteriores
    clearInterval(undoCountRef.current)
    clearTimeout(undoTimerRef.current)

    // Arranca el toast con cuenta regresiva
    setUndoToast({ cantidadesGuardadas, segundos: 5 })

    undoCountRef.current = setInterval(() => {
      setUndoToast((prev) => {
        if (!prev) return null
        if (prev.segundos <= 1) {
          clearInterval(undoCountRef.current)
          return null
        }
        return { ...prev, segundos: prev.segundos - 1 }
      })
    }, 1000)

    undoTimerRef.current = setTimeout(() => {
      setUndoToast(null)
    }, 5000)
  }

  function handleUndo() {
    clearInterval(undoCountRef.current)
    clearTimeout(undoTimerRef.current)
    if (undoToast) {
      setCantidades(undoToast.cantidadesGuardadas)
    }
    setUndoToast(null)
  }

  function handleDismissToast() {
    clearInterval(undoCountRef.current)
    clearTimeout(undoTimerRef.current)
    setUndoToast(null)
  }

  return (
    <div className="vp-layout">
      <NavbarEncargada />

      <main className="vp-main">
        <div className="vp-contenido">

          <section className="vp-productos">
            <h1 className="vp-titulo">Ventas Presenciales</h1>

            {/* Buscador */}
            <div className="vp-buscador">
              <img src={iconBuscador} alt="Buscar" className="vp-buscador-icono-img" />
              <input
                type="text"
                placeholder="Buscar producto por nombre..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            {/* Categorías: cada imagen ES el botón */}
            <div className="vp-categorias">
              {CATEGORIAS.map((cat) => (
                <img
                  key={cat.label}
                  src={cat.icon}
                  alt={cat.label}
                  className={`vp-cat-img ${categoriaActiva === cat.label ? 'vp-cat-img--activo' : ''}`}
                  onClick={() => setCategoriaActiva(cat.label)}
                />
              ))}
            </div>

            {/* Grilla */}
            <div className="vp-grilla">
              {productosFiltrados.map((producto) => (
                <TarjetaProducto
                  key={producto.id}
                  producto={producto}
                  cantidad={cantidades[producto.id] ?? 0}
                  onSumar={() => sumar(producto)}
                  onRestar={() => restar(producto)}
                />
              ))}
              {productosFiltrados.length === 0 && (
                <p className="vp-vacio">No se encontraron productos.</p>
              )}
            </div>

            {/* Historial del día */}
            {historial.length > 0 && (
              <div className="vp-historial">
                <h2 className="vp-historial-titulo">
                  <img src={iconHistorial} alt="" className="vp-historial-icono" />
                  Historial de ventas del día
                </h2>
                {historial.map((venta, idx) => (
                  <div key={idx} className="vp-historial-item">
                    <div className="vp-historial-header">
                      <span className="vp-historial-hora">{venta.hora} hs · {venta.usuario}</span>
                      <span className="vp-historial-total">${venta.total.toLocaleString('es-AR')}</span>
                    </div>
                    <div className="vp-historial-productos">
                      {venta.items.map((item) => (
                        <span key={item.id} className="vp-historial-prod">
                          {item.nombre} ×{item.cantidad}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <ResumenVenta
            items={itemsSeleccionados}
            total={total}
            error={error}
            ventaConfirmada={ventaConfirmada}
            onConfirmar={handleConfirmar}
            onCancelar={handleCancelar}
          />

        </div>
      </main>

      {/* Toast de deshacer cancelación */}
      {undoToast && (
        <div className="vp-undo-toast">
          <span>Venta cancelada</span>
          <button className="vp-undo-btn" onClick={handleUndo}>
            Deshacer
          </button>
          <button className="vp-undo-cerrar" onClick={handleDismissToast}>✕</button>
        </div>
      )}
    </div>
  )
}

export default VentasPresenciales