/* Este archivo contiene la página de Ventas Presenciales.
   Permite a la encargada seleccionar productos de forma interactiva (sumar/restar cantidades),
   filtrar por categorías dinámicas mediante botones visuales, buscar por nombre, ver un desglose 
   detallado de la venta actual y confirmarla o cancelarla. Además, cuenta con un historial de transacciones 
   diarias en tiempo real y un Toast con cuenta regresiva para deshacer cancelaciones accidentales. */

import { useState, useRef, useEffect } from 'react'
import api from '../api/axiosClient'
import NavbarEncargada from '../components/NavbarEncargada'
import TarjetaProducto from '../components/TarjetaProducto'
import ResumenVenta from '../components/ResumenVenta'
import iconBuscador from '../assets/icons/BuscadorBoton.png'
import iconHistorial from '../assets/icons/HistorialBoton.png'
import iconTodos     from '../assets/icons/Todos.png'
import iconSnacks    from '../assets/icons/Snacks.png'
import iconBebidas   from '../assets/icons/Bebidas.png'
import iconAlfajores from '../assets/icons/Alfajores.png'
import iconDulces    from '../assets/icons/Dulces.png'
import iconBocados   from '../assets/icons/Bocados.png'
import iconBebCal    from '../assets/icons/Beb.Calientes.png'
import iconServicios from '../assets/icons/Servicios.png'
import iconGalletitas from '../assets/icons/Galletitas.png'
import iconProductosExtra from '../assets/icons/ProductosExtra.png'
import '../styles/VentasPresenciales.css'

/* Diccionario de mapeo para asociar los nombres de categoría provenientes de Django con sus assets locales */
const ICONOS_CATEGORIAS = {
  "Snacks": iconSnacks,
  "Bebidas": iconBebidas,
  "Alfajores y Chocolates": iconAlfajores,
  "Dulces": iconDulces,
  "Bocados y Aperitivos": iconBocados,
  "Bebidas Calientes": iconBebCal,
  "Servicios": iconServicios,
  "Galletitas": iconGalletitas,
  "Productos Extra": iconProductosExtra
}

const USUARIO_ACTUAL = 'Encargada'

function VentasPresenciales() {
  /* ── Estados de Control y Filtros ─────────────────────────────────────────────────── */
  const [busqueda, setBusqueda]               = useState('')
  const [categoriaActiva, setCategoriaActiva] = useState('Todos')
  
  /* cantidades: Estructura de diccionario { [id_producto]: cantidad_seleccionada } */
  const [cantidades, setCantidades]           = useState({})
  
  const [ventaConfirmada, setVentaConfirmada] = useState(null)
  const [historial, setHistorial]             = useState([])
  const [error, setError]                     = useState('')
  
  /* undoToast: Estado para controlar el Toast de cancelación ({ cantidadesGuardadas, segundos }) */
  const [undoToast, setUndoToast]             = useState(null)
  const undoTimerRef                          = useRef(null)
  const undoCountRef                          = useRef(null)

  const [productosDisponibles, setProductosDisponibles] = useState([])
  const [categorias, setCategorias]                     = useState([])
  const [idUsuario, setIdUsuario]                       = useState(1)
  const [registrandoVenta, setRegistrandoVenta]         = useState(false)
  const [alertasStock, setAlertasStock]                 = useState([])

  /* ── Efectos (useEffect) para Sincronización Inicial ──────────────────────────────── */

  /* Recupera el ID del usuario actual de la sesión local */
  useEffect(() => {
    const id = localStorage.getItem('id')
    if (id) setIdUsuario(Number(id))
  }, [])

  /* Carga inicial del catálogo de productos activos desde el backend de Django */
  useEffect(() => {
    api.get("productos/")
      .then(response => {
        const productos = response.data.map(producto => ({
          id: producto.id_producto,
          nombre: producto.nombre,
          categoria: producto.categoria,
          precio: Number(producto.precio_actual),
          stock: producto.stock,
          stock_minimo: producto.stock_minimo,
          foto_url: producto.foto_url
        }))
        setProductosDisponibles(productos)
      })
      .catch(error => {
        console.error("Error al cargar productos:", error)
      })
  }, [])

  /* Carga inicial de categorías de productos para estructurar el panel de filtrado */
  useEffect(() => {
    api.get("categorias/")
      .then(response => {
        setCategorias(response.data)
      })
      .catch(error => {
        console.error("Error al cargar categorías:", error)
      })
  }, [])

  /* ── Cálculos Derivados y Listas de UI ────────────────────────────────────────────── */

  /* Une la opción global de 'Todos' con el listado dinámico de la API asignándole su ícono correspondiente */
  const categoriasConIcono = [
    {
      nombre: "Todos",
      icono: iconTodos
    },
    ...categorias.map(cat => ({
      nombre: cat.nombre,
      icono: ICONOS_CATEGORIAS[cat.nombre]
    }))
  ]

  /* Filtra reactivamente la grilla de productos según el buscador y la categoría activa */
  const productosFiltrados = productosDisponibles.filter((p) => {
    const coincideNombre    = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria = categoriaActiva === 'Todos' || p.categoria === categoriaActiva
    return coincideNombre && coincideCategoria
  })

  /* ── Controladores de Cantidades de Compra (Carrito Local) ────────────────────────── */

  /* sumar: Incrementa en 1 la cantidad seleccionada para el carrito, respetando el límite de stock real */
  function sumar(producto) {
    if (producto.stock === 0) return
    setCantidades((prev) => {
      const actual = prev[producto.id] ?? 0
      if (actual >= producto.stock) return prev
      return { ...prev, [producto.id]: actual + 1 }
    })
    setError('')
  }

  /* restar: Decrementa en 1 la cantidad. Si la cantidad llega a cero, remueve la clave del estado */
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

  /* itemsSeleccionados: Mapea la selección actual con los detalles completos del producto cargado */
  const itemsSeleccionados = productosDisponibles
    .filter((p) => cantidades[p.id] > 0)
    .map((p) => ({
      ...p,
      cantidad: cantidades[p.id],
      subtotal: p.precio * cantidades[p.id],
    }))

  const total = itemsSeleccionados.reduce((acc, i) => acc + i.subtotal, 0)

  /* ── Confirmación, Cancelación y Reversión de la Venta ────────────────────────────── */

  /* handleConfirmar: Envía la venta al backend de Django, descuenta stock localmente y procesa alertas */
  async function handleConfirmar() {
    if (itemsSeleccionados.length === 0) {
      setError("Seleccioná al menos un producto antes de confirmar.")
      return
    }

    if (registrandoVenta) return
    setRegistrandoVenta(true)

    const ventaBackend = {
      id_usuario: idUsuario,
      productos: itemsSeleccionados.map(item => ({
        id_producto: item.id,
        cantidad: item.cantidad
      }))
    }

    try {
      const response = await api.post("ventas/registrar", ventaBackend)
      console.log("Venta confirmada exitosamente:", response.data)

      /* Si la venta disparó alertas de stock crítico en Django, las anexamos al estado global */
      if (response.data.alertas_stock?.length > 0) {
        setAlertasStock(prev => {
          const nuevas = response.data.alertas_stock.filter(
            alerta => !prev.includes(alerta)
          )
          return [...prev, ...nuevas]
        })
      }

      /* Restamos el stock localmente para mantener la UI sincronizada sin requerir otro fetch completo */
      setProductosDisponibles(prev =>
        prev.map(producto => {
          const vendido = itemsSeleccionados.find(item => item.id === producto.id)
          if (!vendido) return producto
          return {
            ...producto,
            stock: Math.max(0, producto.stock - vendido.cantidad)
          }
        })
      )

      const hora = new Date().toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit"
      })

      const nuevaVenta = {
        items: itemsSeleccionados,
        total,
        usuario: USUARIO_ACTUAL,
        hora
      }

      setVentaConfirmada(nuevaVenta)
      setHistorial(prev => [nuevaVenta, ...prev]) // Agregamos al tope del historial diario
      setCantidades({})
      setError("")

    } catch (error) {
      console.error(error)
      if (error.response?.data?.error) {
        setError(error.response.data.error)
      } else {
        setError("Error al registrar la venta.")
      }
    } finally {
      setRegistrandoVenta(false)
    }
  }

  /* handleCancelar: Vacía el carrito actual e inicia un temporizador de 5s para deshacer el descarte */
  function handleCancelar() {
    if (Object.keys(cantidades).length === 0) {
      setVentaConfirmada(null)
      return
    }

    // Respaldamos la selección actual por si la encargada presiona deshacer
    const cantidadesGuardadas = { ...cantidades }
    setCantidades({})
    setVentaConfirmada(null)
    setError('')

    // Reseteamos referencias a intervalos y temporizadores activos
    clearInterval(undoCountRef.current)
    clearTimeout(undoTimerRef.current)

    // Inicializamos el Toast flotante con cuenta regresiva activa
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

  /* handleUndo: Restaura de forma inmediata el carrito de compras respaldado */
  function handleUndo() {
    clearInterval(undoCountRef.current)
    clearTimeout(undoTimerRef.current)
    if (undoToast) {
      setCantidades(undoToast.cantidadesGuardadas)
    }
    setUndoToast(null)
  }

  /* handleDismissToast: Descarta definitivamente el respaldo sin esperar a que culmine el temporizador */
  function handleDismissToast() {
    clearInterval(undoCountRef.current)
    clearTimeout(undoTimerRef.current)
    setUndoToast(null)
  }

  /* handleNuevaVenta: Restablece el modal o el resumen del panel para iniciar una transacción limpia */
  function handleNuevaVenta() {
    setVentaConfirmada(null)
    setCantidades({})
    setError("")
  }

  /* ── Renderizado Principal del Módulo ──────────────────────────────────────────────── */
  return (
    <div className="vp-layout">
      {/* Menú de navegación lateral con soporte para alertas de stock dinámicas */}
      <NavbarEncargada alertasStock={alertasStock} />

      <main className="vp-main">
        <div className="vp-contenido">

          {/* Panel Lateral Izquierdo: Catálogo interactivo e Historial */}
          <section className="vp-productos">
            <h1 className="vp-titulo">Ventas Presenciales</h1>

            {/* Caja de Búsqueda */}
            <div className="vp-buscador">
              <img src={iconBuscador} alt="Buscar" className="vp-buscador-icono-img" />
              <input
                type="text"
                placeholder="Buscar producto por nombre..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            {/* Barra de Selección Rápida por Categorías */}
            <div className="vp-categorias">
              {categoriasConIcono.map((cat) => (
                <img
                  key={cat.nombre}
                  src={cat.icono}
                  alt={cat.nombre}
                  className={`vp-cat-img ${
                    categoriaActiva === cat.nombre ? 'vp-cat-img--activo' : ''
                  }`}
                  onClick={() => setCategoriaActiva(cat.nombre)}
                />
              ))}
            </div>

            {/* Grilla de Selección de Productos */}
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

            {/* Listado Histórico de Ventas Procesadas en el Turno Actual */}
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

          {/* Panel Lateral Derecho: Resumen financiero detallado del carrito activo */}
          <ResumenVenta
            items={itemsSeleccionados}
            total={total}
            error={error}
            ventaConfirmada={ventaConfirmada}
            registrandoVenta={registrandoVenta}
            onConfirmar={handleConfirmar}
            onCancelar={handleCancelar}
            onNuevaVenta={handleNuevaVenta}
          />

        </div>
      </main>

      {/* Toast Informativo de Descarte con Soporte para Recuperar la Selección */}
      {undoToast && (
        <div className="vp-undo-toast">
          <span>Venta cancelada ({undoToast.segundos}s)</span>
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