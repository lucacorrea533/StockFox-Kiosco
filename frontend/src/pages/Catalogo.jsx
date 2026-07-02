/* Este archivo es el corazón del catálogo, donde se muestra la lista de productos disponibles para comprar. Acá se implementa la lógica para filtrar por categorías, buscar por nombre y agregar productos al carrito. */

import { useState, useEffect, useRef } from 'react'
import NavbarAlumno from '../components/NavbarAlumno'
import CardProducto from '../components/CardProducto'
import iconBuscador from '../assets/icons/BuscadorBoton.png'
import iconCarrito from '../assets/icons/VentasBoton.png'
import btnTodos from '../assets/icons/Todos.png'
import btnSnacks from '../assets/icons/Snacks.png'
import btnBebidas from '../assets/icons/Bebidas.png'
import btnAlfajores from '../assets/icons/Alfajores.png'
import btnDulces from '../assets/icons/Dulces.png'
import btnBocados from '../assets/icons/Bocados.png'
import btnBebCalientes from '../assets/icons/Beb.Calientes.png'
import btnServicios from '../assets/icons/Servicios.png'
import btnGalletitas from '../assets/icons/Galletitas.png'
import btnProductosExtra from '../assets/icons/ProductosExtra.png'
import hor1 from '../assets/icons/Horario1.png'
import hor2 from '../assets/icons/Horario2.png'
import hor3 from '../assets/icons/Horario3.png'
import hor4 from '../assets/icons/Horario4.png'
import hor5 from '../assets/icons/Horario5.png'
import hor6 from '../assets/icons/Horario6.png'
import hor7 from '../assets/icons/Horario7.png'
import hor8 from '../assets/icons/Horario8.png'
import hor9 from '../assets/icons/Horario9.png'
import hor10 from '../assets/icons/Horario10.png'
import hor11 from '../assets/icons/Horario11.png'
import hor12 from '../assets/icons/Horario12.png'
import iconCheck from '../assets/icons/SimboloCheck.png'
import iconReloj from '../assets/icons/Reloj.png'
import iconAdvertencia from '../assets/icons/Advertencia.png'
import iconEliminar from '../assets/icons/EliminarBoton.png'
import '../styles/Catalogo.css'

const iconosCategorias = {
  "Todos": btnTodos,
  "Snacks": btnSnacks,
  "Bebidas": btnBebidas,
  "Alfajores y Chocolates": btnAlfajores,
  "Dulces": btnDulces,
  "Galletitas": btnGalletitas,
  "Productos Extra": btnProductosExtra,
  "Bocados y Aperitivos": btnBocados,
  "Bebidas Calientes": btnBebCalientes,
  "Servicios": btnServicios
}

// Determina si el producto es un Servicio sin foto
function esServicioSinFoto(p) {
  return p.categoria === 'Servicios' && !p.imagen
}

// ── CATEGORÍAS ────────────────────────────────────────────────────────────────
const categorias = [
  { nombre: 'Todos',          imagen: btnTodos },
  { nombre: 'Snacks',         imagen: btnSnacks },
  { nombre: 'Bebidas',        imagen: btnBebidas },
  { nombre: 'Alfajores',      imagen: btnAlfajores },
  { nombre: 'Dulces',         imagen: btnDulces },
  { nombre: 'Bocados',        imagen: btnBocados },
  { nombre: 'Beb. Calientes', imagen: btnBebCalientes },
  { nombre: 'Servicios',      imagen: btnServicios },
]

// ── MENÚ DEL DÍA Y PROMOCIONES ────────────────────────────────────────────────
const menuYpromociones = [
  { id: 'menu1',  tipo: 'MENÚ DEL DÍA', nombre: 'Hamburguesa Completa + Cono de Papas + Jugo Placer', desc: 'Precio especial · Separado sale $12.300', precio: 9000 },
  { id: 'promo1', tipo: 'PROMOCIÓN',    nombre: 'Café con Leche + 5 Chipá',                            desc: 'Café mediano + 5 chipas',                 precio: 3800 },
  { id: 'promo2', tipo: 'PROMOCIÓN',    nombre: 'Café + Medialuna c/ J y Q',                           desc: 'Desayuno completo',                        precio: 3800 },
  { id: 'promo3', tipo: 'PROMOCIÓN',    nombre: 'Café + 2 Medialunas',                                 desc: 'Café mediano + 2 medialunas',              precio: 4500 },
  { id: 'promo4', tipo: 'PROMOCIÓN',    nombre: 'Desayuno: Café + Tostado J y Q',                      desc: 'Café mediano + tostado',                   precio: 3500 },
  { id: 'promo5', tipo: 'PROMOCIÓN',    nombre: '2 Empanadas + Jugo Baggio',                           desc: '2 empanadas + jugo 200ml',                 precio: 5000 },
  { id: 'promo6', tipo: 'PROMOCIÓN',    nombre: 'Chocolatada + Bizcochuelo',                           desc: 'Chocolatada caliente + porción',           precio: 3500 },
]

// ── HORARIOS ─────────────────────────────────────────────────────────────────
const turnosHorarios = {
  "Mañana": [
    { id: "h1", imagen: hor1, hora: "07:45", momento: "Entrada" },
    { id: "h2", imagen: hor2, hora: "09:05", momento: "1er recreo" },
    { id: "h3", imagen: hor3, hora: "10:35", momento: "2do recreo" },
    { id: "h4", imagen: hor4, hora: "12:05", momento: "Salida Normal" },
    { id: "h5", imagen: hor5, hora: "12:45", momento: "Salida 7ma" },
  ],

  "Tarde": [
    { id: "h6", imagen: hor6, hora: "13:30", momento: "Entrada" },
    { id: "h7", imagen: hor7, hora: "14:50", momento: "1er recreo" },
    { id: "h8", imagen: hor8, hora: "16:20", momento: "2do recreo" },
    { id: "h9", imagen: hor9, hora: "17:50", momento: "Salida Normal" },
    { id: "h10", imagen: hor10, hora: "18:30", momento: "Salida 7ma" },
  ],

  "Noche": [
    { id: "h11", imagen: hor11, hora: "18:30", momento: "Entrada" },
    { id: "h12", imagen: hor12, hora: "19:50", momento: "1er recreo" },
  ]
}

// ── HELPERS LOCALSTORAGE ──────────────────────────────────────────────────────
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

// ── CARRUSEL MENÚ DEL DÍA ─────────────────────────────────────────────────────
const CARDS_POR_PAGINA = 4

function CarruselMenu({ items, onAgregar }) {
  const [pagina, setPagina] = useState(0)
  const totalPaginas = Math.ceil(items.length / CARDS_POR_PAGINA)
  const intervalRef = useRef(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setPagina(p => (p + 1) % totalPaginas)
    }, 4000)
    return () => clearInterval(intervalRef.current)
  }, [totalPaginas])

  function irAPagina(i) {
    clearInterval(intervalRef.current)
    setPagina(i)
    intervalRef.current = setInterval(() => {
      setPagina(p => (p + 1) % totalPaginas)
    }, 4000)
  }

  const inicio = pagina * CARDS_POR_PAGINA
  const visibles = items.slice(inicio, inicio + CARDS_POR_PAGINA)

  return (
    <div className="carrusel-menu-wrapper">
      <div className="carrusel-menu-track">
        {visibles.map(item => (
          <div key={item.id} className="catalogo-menu-card">
            <p className="menu-card-tipo">{item.tipo}</p>
            <p className="menu-card-nombre">{item.nombre}</p>
            <p className="menu-card-desc">{item.desc}</p>
            <div className="menu-card-footer">
              <span className="menu-card-precio">${item.precio.toLocaleString('es-AR')}</span>
              <button
                className="menu-card-btn"
                onClick={() => onAgregar({
                  id: item.id,
                  nombre: item.nombre,
                  precio: item.precio,
                  categoria: item.tipo,
                  stock: 99,
                  imagen: null,
                })}
              >
                Agregar
              </button>
            </div>
          </div>
        ))}
        {visibles.length < CARDS_POR_PAGINA &&
          Array.from({ length: CARDS_POR_PAGINA - visibles.length }).map((_, i) => (
            <div key={`ph-${i}`} className="catalogo-menu-card-placeholder" />
          ))
        }
      </div>
      {totalPaginas > 1 && (
        <div className="carrusel-dots">
          {Array.from({ length: totalPaginas }).map((_, i) => (
            <button
              key={i}
              className={`carrusel-dot ${i === pagina ? 'activo' : ''}`}
              onClick={() => irAPagina(i)}
              aria-label={`Página ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── MODAL VARIANTES ───────────────────────────────────────────────────────────
function ModalVariantes({ producto, varianteInicial, onAgregar, onConfirmarEdicion, onCerrar }) {
  const esEdicion = !!onConfirmarEdicion
  const inicial = varianteInicial
    ? producto.variantes.find(v => v.label === varianteInicial) ?? producto.variantes[0]
    : null
  const [varianteSeleccionada, setVarianteSeleccionada] = useState(inicial)
  const variante = varianteSeleccionada ?? producto.variantes[0]

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-producto modal-variantes" onClick={e => e.stopPropagation()}>
        <button className="modal-cerrar" onClick={onCerrar}>✕</button>
        <div className="modal-producto-imagen">
          {variante.imagen
            ? <img src={variante.imagen} alt={variante.label} />
            : <div className="card-producto-placeholder" />
          }
        </div>
        <div className="modal-producto-info">
          <p className="modal-producto-categoria">{producto.categoria}</p>
          <h2 className="modal-producto-nombre">{producto.nombre}</h2>
          <p className="modal-producto-desc">{producto.descripcion}</p>
          <p className="modal-variantes-label">Elegí una opción:</p>
          <div className="modal-variantes-opciones">
            {producto.variantes.map((v, i) => (
              <button
                key={i}
                className={`modal-variante-btn ${variante === v ? 'activo' : ''}`}
                onClick={() => setVarianteSeleccionada(v)}
              >
                <span className="modal-variante-label">{v.label}</span>
                <span className="modal-variante-precio">${v.precio.toLocaleString('es-AR')}</span>
              </button>
            ))}
          </div>
          {variante.extraInfo && (
            <p className="modal-variante-extra">{variante.extraInfo}</p>
          )}
          <p className="modal-producto-precio">${variante.precio.toLocaleString('es-AR')}</p>
          {esEdicion ? (
            <button
              className="modal-producto-btn"
              onClick={() => { onConfirmarEdicion(variante.label); onCerrar() }}
            >
              Guardar cambios
            </button>
          ) : (
            <button
              className="modal-producto-btn"
              disabled={producto.stock === 0}
              onClick={() => {
                onAgregar({
                  ...producto,
                  baseId: producto.id,
                  id: `${producto.id}_${variante.label}`,
                  nombre: producto.nombre,
                  variedadSeleccionada: variante.label,
                  precio: variante.precio,
                  imagen: variante.imagen,
                })
              }}
            >
              {producto.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── MODAL CARRITO ─────────────────────────────────────────────────────────────
// Ya no maneja el undo internamente. Al eliminar un ítem llama a onEliminar(item)
// para que el padre (Catalogo) lo gestione como toast flotante.
export function ModalCarrito({
  carrito, setCarrito, mostrarCarrito, setMostrarCarrito, onEliminarItem, onPedidoCreado
}) {
  const [horario, setHorario] = useState(null)
  const [pedidoConfirmado, setPedidoConfirmado] = useState(false)
  const [turnoActivo, setTurnoActivo] = useState('Mañana')

  function handleCambiarCantidad(id, delta) {
    setCarrito(prev =>
      prev
        .map(item => item.id === id ? { ...item, cantidad: item.cantidad + delta } : item)
        .filter(item => item.cantidad > 0)
    )
  }

  // Delega al padre para que gestione el toast de undo fuera del modal
  function handleEliminar(item) {
    setCarrito(prev => prev.filter(i => i.id !== item.id))
    onEliminarItem(item)
  }
 
async function enviarPedido() {

  const pedido = {

    id_alumno: 1,

    horario_retiro: horario,

    productos: carrito.map(item => ({

      id_producto: item.id,

      cantidad: item.cantidad

    }))

  }

  const respuesta = await fetch(

    "http://127.0.0.1:8000/api/pedidos/crear/",

    {

      method: "POST",

      headers: {

        "Content-Type": "application/json"

      },

      body: JSON.stringify(pedido)

    }

  )

  const datos = await respuesta.json()

  if (!respuesta.ok) {

    throw new Error(
      datos.error || "No se pudo crear el pedido."
    )

  }

  return datos

}

  const totalCarrito = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0)
 
  async function handleConfirmar() {

  if (!horario) return

  try {

    const datos = await enviarPedido()

    console.log(datos)

    onPedidoCreado()

    setPedidoConfirmado(true)

    localStorage.removeItem(CARRITO_KEY)

    setCarrito([])

  }

  catch (error) {

    alert(error.message)

  }

}

  if (!mostrarCarrito) return null

  return (
    <div className="modal-overlay" onClick={() => setMostrarCarrito(false)}>
      <div className="modal-carrito" onClick={e => e.stopPropagation()}>

        {!pedidoConfirmado ? (
          <>
            <div className="modal-carrito-izq">
              <h2 className="modal-carrito-titulo">Tu Pedido</h2>
              <p className="modal-carrito-subtitulo">Productos seleccionados</p>

              {carrito.length === 0 && (
                <p className="modal-carrito-vacio">
                  <img src={iconAdvertencia} alt="!" className="modal-aviso-icono" />
                  No agregaste productos todavía.
                </p>
              )}

              {carrito.map(item => (
                <div key={item.id} className="modal-carrito-item">
                  <div className="modal-carrito-item-imagen">
                    {item.imagen
                      ? <img src={item.imagen} alt={item.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : esServicioSinFoto(item)
                        ? <div className="card-producto-servicio-fondo" />
                        : <div className="card-producto-placeholder" />
                    }
                  </div>
                  <div className="modal-carrito-item-info">
                    <span className="modal-carrito-item-nombre">{item.nombre}</span>
                    <span className="modal-carrito-item-precio">${item.precio.toLocaleString('es-AR')} c/u</span>
                  </div>
                  <div className="carrito-item-centro">
                    {item.variedadSeleccionada && (
                      <span className="carrito-variedad-tag">{item.variedadSeleccionada}</span>
                    )}
                    <div className="carrito-item-acciones">
                      <button
                        className="carrito-btn-eliminar"
                        onClick={() => handleEliminar(item)}
                        title="Eliminar producto"
                      >
                        <img src={iconEliminar} alt="Eliminar" />
                      </button>
                    </div>
                  </div>
                  <div className="modal-carrito-item-controles">
                    <button onClick={() => handleCambiarCantidad(item.id, -1)}>−</button>
                    <span>{item.cantidad}</span>
                    <button onClick={() => handleCambiarCantidad(item.id, +1)}>+</button>
                  </div>
                  <span className="modal-carrito-item-subtotal">
                    ${(item.precio * item.cantidad).toLocaleString('es-AR')}
                  </span>
                </div>
              ))}

              <button className="modal-seguir-btn" onClick={() => setMostrarCarrito(false)}>
                + Seguir comprando
              </button>
            </div>

            <div className="modal-carrito-der">
              <div className="modal-resumen">
                <h3>Resumen</h3>
                {carrito.map(item => (
                  <div key={item.id} className="modal-resumen-fila">
                    <span>
                      {item.nombre} {item.variedadSeleccionada && `(${item.variedadSeleccionada})`} x{item.cantidad}
                    </span>
                    <span>${(item.precio * item.cantidad).toLocaleString('es-AR')}</span>
                  </div>
                ))}
                <div className="modal-resumen-total">
                  <span>Total</span>
                  <span>${totalCarrito.toLocaleString('es-AR')}</span>
                </div>
              </div>

              <div className="modal-horarios">
                <h3>Elegir horario de retiro</h3>
                <div className="modal-turno-selector">
                  {['Mañana', 'Tarde', 'Noche'].map(turno => (
                    <button
                      key={turno}
                      className={`modal-turno-btn ${turnoActivo === turno ? 'activo' : ''}`}
                      onClick={() => { setTurnoActivo(turno); setHorario(null) }}
                    >
                      {turno}
                    </button>
                  ))}
                </div>
                {turnosHorarios[turnoActivo].map(h => (
                  <button
                    key={h.id}
                    className={`modal-horario-btn ${horario === h.hora ? 'activo' : ''}`}
                    onClick={() => setHorario(h.hora)}
                  >
                    <span className="modal-horario-hora">{h.hora}</span>
                    <span className="modal-horario-momento">{h.momento}</span>
                  </button>
                ))}
                {!horario && (
                  <p className="modal-horario-aviso">
                    <img src={iconAdvertencia} alt="!" className="modal-aviso-icono" />
                    <span>Seleccioná un horario para confirmar</span>
                  </p>
                )}
              </div>

              <button
                className="modal-confirmar-btn"
                onClick={handleConfirmar}
                disabled={!horario || carrito.length === 0}
              >
                Confirmar Pedido
              </button>
              <button
                className="modal-cancelar-btn"
                onClick={() => { setMostrarCarrito(false); setCarrito([]); setHorario(null); setPedidoConfirmado(false) }}
              >
                Cancelar
              </button>
            </div>
          </>
        ) : (
          <div className="modal-confirmado">
            <div className="modal-confirmado-icono">
              <img src={iconCheck} alt="Confirmado" />
            </div>
            <h2>¡Pedido confirmado!</h2>
            <p className="modal-confirmado-sub">Pedido enviado al kiosco</p>
            <p className="modal-confirmado-horario">
              <img src={iconReloj} alt="Horario" className="modal-aviso-icono" />
              Retirá tu pedido a partir de las {horario}
            </p>
            <button
              className="modal-confirmar-btn"
              onClick={() => { setMostrarCarrito(false); setPedidoConfirmado(false); setHorario(null) }}
            >
              Seguir comprando
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────
function Catalogo() {
  const [categoriaActiva, setCategoriaActiva] = useState('Todos')
  const [busqueda, setBusqueda] = useState('')
  const [carrito, setCarrito]   = useState(() => cargarCarritoLocal())
  const [productoModal, setProductoModal]       = useState(null)
  const [productoVariantes, setProductoVariantes] = useState(null)
  const [mostrarCarrito, setMostrarCarrito]     = useState(false)
  const [productos, setProductos] = useState([]) // --------------------------
  const [categorias, setCategorias] = useState([])
  
  // ── Toast de undo (fuera del modal, nivel página) ─────────────────────────
  // undoItem: { item, timerId } | null — solo un undo activo a la vez.
  const [undoItem, setUndoItem]   = useState(null)
  const undoTimerRef              = useRef(null)
  const UNDO_DURACION             = 3500 // ms

  useEffect(() => {
    guardarCarritoLocal(carrito)
  }, [carrito])

  useEffect(() => {
    function handleEsc(e) {
      if (e.key === 'Escape') {
        setMostrarCarrito(false)
        setProductoModal(null)
        setProductoVariantes(null)
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  // Limpia el timer de undo al desmontar
  useEffect(() => {
    return () => { if (undoTimerRef.current) clearTimeout(undoTimerRef.current) }
  }, [])

  function cargarProductos() {

  fetch("http://127.0.0.1:8000/api/productos/")
    .then(response => response.json())
    .then(data => {

      const productosFormateados = data.map(p => ({
        id: p.id_producto,
        nombre: p.nombre,
        precio: Number(p.precio_actual),
        imagen: p.foto_url,
        stock: p.stock,
        disponible: p.disponible,
        categoria: p.categoria,
        descripcion: "",
        variantes: null
    }))

      setProductos(productosFormateados)

    })
    .catch(error => {
      console.error(error)
    })
}

useEffect(() => {
  cargarProductos()
}, [])

  const productosFiltrados = productos.filter(p => {
    const coincideCategoria = categoriaActiva === 'Todos' || p.categoria === categoriaActiva
    const coincideBusqueda  = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    return coincideCategoria && coincideBusqueda
  })

  useEffect(() => {
  fetch('http://127.0.0.1:8000/api/categorias/') // FEETCHHHHHH CATEGORIASASSSA
    .then(response => response.json())
    .then(data => {

  console.log(data)

  data.forEach(cat => {
    console.log(
      "Categoria:",
      `"${cat.nombre}"`,
      "Icono:",
      iconosCategorias[cat.nombre]
    )
  })

  setCategorias(data)

})
    .catch(error => {
      console.error(error)
    })
}, [])

  function handleClickProducto(producto) {

  if (!producto.disponible) return

  if (producto.variantes) {
    setProductoVariantes(producto)
  } else {
    setProductoModal(producto)
  }
}

  function handleAgregar(producto) {

  if (!producto.disponible) return

  setCarrito(prev => {
    const existe = prev.find(item => item.id === producto.id)
    return existe
      ? prev.map(item =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      : [...prev, { ...producto, cantidad: 1 }]
  })

  setProductoModal(null)
  setProductoVariantes(null)
}

  // Recibe el item eliminado desde ModalCarrito y lanza el toast
  function handleEliminarItem(item) {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    const timerId = setTimeout(() => setUndoItem(null), UNDO_DURACION)
    undoTimerRef.current = timerId
    setUndoItem({ item, timerId })
  }

  function handleDeshacer() {
    if (!undoItem) return
    clearTimeout(undoItem.timerId)
    setCarrito(prev => [...prev, undoItem.item])
    setUndoItem(null)
  }

  const totalCarrito   = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0)
  const cantidadTotal  = carrito.reduce((acc, item) => acc + item.cantidad, 0)

  return (
    <div className="catalogo-layout">
      <NavbarAlumno cantidadCarrito={cantidadTotal} onAbrirCarrito={() => setMostrarCarrito(true)} />
      <main className="catalogo-contenido">

        <div className="catalogo-banner-menu">
          <h2 className="catalogo-banner-titulo">Promociones y Menú del Día</h2>
          <CarruselMenu items={menuYpromociones} onAgregar={handleAgregar} />
        </div>

        <div className="catalogo-categorias">

  <button
    className={`catalogo-cat-btn ${categoriaActiva === "Todos" ? "activo" : ""}`}
    onClick={() => setCategoriaActiva("Todos")}
  >
    <img src={btnTodos} alt="Todos" />
  </button>

  {categorias.map(cat => (
    <button
      key={cat.id_categoria}
      className={`catalogo-cat-btn ${categoriaActiva === cat.nombre ? "activo" : ""}`}
      onClick={() => setCategoriaActiva(cat.nombre)}
    >
      <img
  src={iconosCategorias[cat.nombre]}
  alt={cat.nombre}
   />

    </button>
  ))}

</div>

        <div className="catalogo-buscador">
          <img src={iconBuscador} alt="Buscar" className="catalogo-buscador-icono" />
          <input
            type="text"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>

        <div className="catalogo-grilla">
          {productosFiltrados.map(producto => (
            <div
              key={producto.id}
              onClick={() => handleClickProducto(producto)}
              className="catalogo-card-wrapper"
            >
              <CardProducto
                producto={producto}
                onAgregar={(p) => {
                  if (p.variantes) {
                    setProductoVariantes(p)
                  } else {
                    handleAgregar(p)
                  }
                }}
              />
            </div>
          ))}
        </div>
      </main>

      {cantidadTotal > 0 && (
        <button className="catalogo-carrito-flotante" onClick={() => setMostrarCarrito(true)}>
          <img src={iconCarrito} alt="Carrito" />
          <span className="catalogo-carrito-badge">{cantidadTotal}</span>
          <span className="catalogo-carrito-total">Ver pedido · ${totalCarrito.toLocaleString('es-AR')}</span>
        </button>
      )}

      {productoVariantes && (
        <ModalVariantes
          producto={productoVariantes}
          onAgregar={handleAgregar}
          onCerrar={() => setProductoVariantes(null)}
        />
      )}

      {productoModal && (
        <div className="modal-overlay" onClick={() => setProductoModal(null)}>
          <div className="modal-producto" onClick={e => e.stopPropagation()}>
            <button className="modal-cerrar" onClick={() => setProductoModal(null)}>✕</button>
            <div className="modal-producto-imagen">
              {productoModal.imagen
                ? <img src={productoModal.imagen} alt={productoModal.nombre} />
                : esServicioSinFoto(productoModal)
                  ? <div className="card-producto-servicio-fondo" />
                  : <div className="card-producto-placeholder" />
              }
            </div>
            <div className="modal-producto-info">
              <p className="modal-producto-categoria">{productoModal.categoria}</p>
              <h2 className="modal-producto-nombre">{productoModal.nombre}</h2>
              <p className="modal-producto-desc">{productoModal.descripcion}</p>
              <p className="modal-producto-precio">${productoModal.precio.toLocaleString('es-AR')}</p>
              <button
                className="modal-producto-btn"
                onClick={() => handleAgregar(productoModal)}
                disabled={productoModal.stock === 0}
              >
                {productoModal.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ModalCarrito
        carrito={carrito}
        setCarrito={setCarrito}
        mostrarCarrito={mostrarCarrito}
        setMostrarCarrito={setMostrarCarrito}
        onEliminarItem={handleEliminarItem}
        onPedidoCreado={cargarProductos}
      />

      {/* ── Toast flotante de undo — igual que GestionProductos ── */}
      {undoItem && (
        <div className="catalogo-toast">
          <span>"{undoItem.item.nombre}" eliminado</span>
          <button className="catalogo-toast-btn" onClick={handleDeshacer}>
            Deshacer
          </button>
        </div>
      )}
    </div>
  )
}

export default Catalogo