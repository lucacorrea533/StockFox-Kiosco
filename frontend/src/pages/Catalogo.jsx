/*
 * Catalogo.jsx
 * Vista principal del Alumno: catálogo de productos del kiosco.
 * Muestra el carrusel de menú del día/promociones, filtros por categoría,
 * buscador, grilla de productos y el carrito de compras (ModalCarrito, exportado
 * para ser reutilizado también en MisPedidos.jsx).
 * Consume la API del backend para traer productos, categorías y el menú del día,
 * y persiste el carrito en localStorage para que sobreviva a recargas de página.
 */

// ── IMPORTS: React y componentes que sirven para el uso de la página ──────────────────────────────────────────────
import { useState, useEffect, useRef } from 'react'
import NavbarAlumno from '../components/NavbarAlumno'
import CardProducto from '../components/CardProducto'
import { authFetch } from '../api/authFetch'
import '../styles/Catalogo.css'

// ── IMPORTS: íconos de UI y simbolos diseñados (buscador, carrito, check, reloj, advertencia, eliminar) ─
import iconBuscador from '../assets/icons/BuscadorBoton.png'
import iconCarrito from '../assets/icons/VentasBoton.png'
import iconCheck from '../assets/icons/SimboloCheck.png'
import iconReloj from '../assets/icons/Reloj.png'
import iconAdvertencia from '../assets/icons/Advertencia.png'
import iconEliminar from '../assets/icons/EliminarBoton.png'

// ── IMPORTS: íconos de categorías (simbolos diseñados) ──────────────────────────────────────────────
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

// ── IMPORTS: íconos de horarios de retiro (Mañana/Tarde/Noche) ────────────────
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

// ── CONSTANTES: categorías e ícono ─────────────────────────────────────────────
// Relaciona el nombre de categoría tal cual viene de la BBDD con su ícono de filtro.
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

// Determina si un producto es un Servicio sin foto (ej. "Calentar Comida"),
// para mostrarle un fondo especial en vez de una imagen rota
function esServicioSinFoto(p) {
  return p.categoria === 'Servicios' && !p.imagen
}

// Esta constante queda pisada por el estado "categorias" del componente Catalogo(),
// que es el que realmente se usa (se llena desde la API). Se deja documentada, no se modifica.
const categorias = [
  { nombre: 'Todos', imagen: btnTodos },
  { nombre: 'Snacks', imagen: btnSnacks },
  { nombre: 'Bebidas', imagen: btnBebidas },
  { nombre: 'Alfajores', imagen: btnAlfajores },
  { nombre: 'Dulces', imagen: btnDulces },
  { nombre: 'Bocados', imagen: btnBocados },
  { nombre: 'Beb. Calientes', imagen: btnBebCalientes },
  { nombre: 'Servicios', imagen: btnServicios },
]

// ── CONSTANTES: carrusel de menú del día y promociones (datos de ejemplo) ─────
// A futuro se reemplaza por datos reales de las tablas MENU_DIA y PROMOCIONES.
const menuYpromociones = [
  { id: 'menu1', tipo: 'MENÚ DEL DÍA', nombre: 'Hamburguesa Completa + Cono de Papas + Jugo Placer', desc: 'Precio especial · Separado sale $12.300', precio: 9000, comprable: false },
  { id: 'promo1', tipo: 'PROMOCIÓN', nombre: 'Café con Leche + 5 Chipá', desc: 'Café mediano + 5 chipas', precio: 3800, comprable: false },
  { id: 'promo2', tipo: 'PROMOCIÓN', nombre: 'Café + Medialuna c/ J y Q', desc: 'Desayuno completo', precio: 3800, comprable: false },
  { id: 'promo3', tipo: 'PROMOCIÓN', nombre: 'Café + 2 Medialunas', desc: 'Café mediano + 2 medialunas', precio: 4500, comprable: false },
  { id: 'promo4', tipo: 'PROMOCIÓN', nombre: 'Desayuno: Café + Tostado J y Q', desc: 'Café mediano + tostado', precio: 3500, comprable: false },
  { id: 'promo5', tipo: 'PROMOCIÓN', nombre: '2 Empanadas + Jugo Baggio', desc: '2 empanadas + jugo 200ml', precio: 5000, comprable: false },
  { id: 'promo6', tipo: 'PROMOCIÓN', nombre: 'Chocolatada + Bizcochuelo', desc: 'Chocolatada caliente + porción', precio: 3500, comprable: false },
]

// ── CONSTANTES: horarios de retiro, agrupados por turno ───────────────────────
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

// ── HELPERS: carrito en localStorage ──────────────────────────────────────────
// Los helpers son funciones puras que no dependen de React ni del estado del componente, y sirven para leer/escribir el carrito en localStorage.
const CARRITO_KEY = 'recokiosco_carrito'

// Lee el carrito guardado; si no hay nada o está corrupto, devuelve un array vacío
function cargarCarritoLocal() {
  try {
    const raw = localStorage.getItem(CARRITO_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

// Guarda el carrito actual como JSON en localStorage
function guardarCarritoLocal(carrito) {
  localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito))
}

// ── COMPONENTE: Carrusel de menú del día / promociones ────────────────────────
// Un carrusel es una lista de tarjetas que se muestran de a 4 a la vez, y que se pueden recorrer con "dots" o que avanzan automáticamente cada 4 segundos.
const CARDS_POR_PAGINA = 4 // Tarjetas visibles a la vez

// Esta función recibe un array de items y un callback onAgregar, y muestra un carrusel que avanza automáticamente cada 4s.
function CarruselMenu({ items, onAgregar }) {
  const [pagina, setPagina] = useState(0)
  const totalPaginas = Math.ceil(items.length / CARDS_POR_PAGINA)
  const intervalRef = useRef(null) // Referencia al temporizador de auto-avance

  // Auto-avanza de página cada 4s; el módulo (%) hace que vuelva a la primera al llegar al final
  useEffect(() => {
    intervalRef.current = setInterval(() => setPagina(p => (p + 1) % totalPaginas), 4000)
    return () => clearInterval(intervalRef.current)
  }, [totalPaginas])

  // Click manual en un "dot": cambia de página y reinicia el auto-avance
  function irAPagina(i) {
    clearInterval(intervalRef.current)
    setPagina(i)
    intervalRef.current = setInterval(() => setPagina(p => (p + 1) % totalPaginas), 4000)
  }

  // Calcula qué items son visibles según la página actual, las constantes son para que se vea bien en el carrusel (4 por página)
  const inicio = pagina * CARDS_POR_PAGINA
  const visibles = items.slice(inicio, inicio + CARDS_POR_PAGINA)

  // Renderiza las tarjetas visibles y los "dots" de navegación; si la última página tiene menos de 4 tarjetas, rellena con placeholders invisibles para mantener el layout
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
              {item.comprable === false ? (
                <span className="menu-card-info">Disponible en el kiosco</span>
              ) : (
                <button
                  className="menu-card-btn"
                  onClick={() => onAgregar({
                    id: item.id, nombre: item.nombre, precio: item.precio, categoria: item.tipo,
                    stock: 99, imagen: null, disponible: true,
                  })}
                >
                  Agregar
                </button>
              )}
            </div>
          </div>
        ))}
        {/* Rellena con placeholders invisibles si la última página tiene menos de 4 tarjetas */}
        {visibles.length < CARDS_POR_PAGINA &&
          Array.from({ length: CARDS_POR_PAGINA - visibles.length }).map((_, i) => (
            <div key={`ph-${i}`} className="catalogo-menu-card-placeholder" />
          ))
        }
      </div>
      {totalPaginas > 1 && (
        <div className="carrusel-dots">
          {Array.from({ length: totalPaginas }).map((_, i) => (
            <button key={i} className={`carrusel-dot ${i === pagina ? 'activo' : ''}`} onClick={() => irAPagina(i)} aria-label={`Página ${i + 1}`} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── COMPONENTE: Modal de variantes (ej. alfajor blanco/negro) ─────────────────
// Sirve para AGREGAR un producto nuevo con variante, o para EDITAR la variante
// de uno que ya está en el carrito (según si viene onConfirmarEdicion).
function ModalVariantes({ producto, varianteInicial, onAgregar, onConfirmarEdicion, onCerrar }) {
  const esEdicion = !!onConfirmarEdicion

  // Si viene una variante inicial (edición), la busca en la lista; si no, usa la primera
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
          {variante.imagen ? <img src={variante.imagen} alt={variante.label} /> : <div className="card-producto-placeholder" />}
        </div>
        <div className="modal-producto-info">
          <p className="modal-producto-categoria">{producto.categoria}</p>
          <h2 className="modal-producto-nombre">{producto.nombre}</h2>
          <p className="modal-producto-desc">{producto.descripcion}</p>
          <p className="modal-variantes-label">Elegí una opción:</p>
          <div className="modal-variantes-opciones">
            {producto.variantes.map((v, i) => (
              <button key={i} className={`modal-variante-btn ${variante === v ? 'activo' : ''}`} onClick={() => setVarianteSeleccionada(v)}>
                <span className="modal-variante-label">{v.label}</span>
                <span className="modal-variante-precio">${v.precio.toLocaleString('es-AR')}</span>
              </button>
            ))}
          </div>
          {variante.extraInfo && <p className="modal-variante-extra">{variante.extraInfo}</p>}
          <p className="modal-producto-precio">${variante.precio.toLocaleString('es-AR')}</p>

          {esEdicion ? (
            <button className="modal-producto-btn" onClick={() => { onConfirmarEdicion(variante.label); onCerrar() }}>
              Guardar cambios
            </button>
          ) : (
            <button
              className="modal-producto-btn"
              disabled={producto.stock === 0}
              onClick={() => onAgregar({
                ...producto,
                baseId: producto.id, // ID del producto "padre"
                id: `${producto.id}_${variante.label}`, // ID único producto+variante para el carrito
                nombre: producto.nombre,
                variedadSeleccionada: variante.label,
                precio: variante.precio, // Precio final = precio de la variante elegida
                imagen: variante.imagen,
              })}
            >
              {producto.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── COMPONENTE: Modal Carrito ──────────────────────────────────────────────────
// Exportado porque MisPedidos.jsx también lo reutiliza (mismo carrito, misma lógica).
// El undo de "eliminar" no se maneja acá: se avisa al padre vía onEliminarItem.
export function ModalCarrito({ carrito, setCarrito, mostrarCarrito, setMostrarCarrito, onEliminarItem, onPedidoCreado }) {
  const [horario, setHorario] = useState(null)
  const [pedidoConfirmado, setPedidoConfirmado] = useState(false)
  const [turnoActivo, setTurnoActivo] = useState('Mañana')

  // Suma/resta 1 a la cantidad; si llega a 0, el producto sale del carrito
  function handleCambiarCantidad(id, delta) {
    setCarrito(prev =>
      prev.map(item => item.id === id ? { ...item, cantidad: item.cantidad + delta } : item)
        .filter(item => item.cantidad > 0)
    )
  }

  // Saca el ítem del carrito y avisa al padre para mostrar el toast de "deshacer"
  function handleEliminar(item) {
    setCarrito(prev => prev.filter(i => i.id !== item.id))
    onEliminarItem(item)
  }

  // Envía el pedido armado (alumno + horario + productos) al backend
  async function enviarPedido() {
    const pedido = {
      id_alumno: Number(localStorage.getItem('id')),
      horario_retiro: horario,
      productos: carrito.map(item => ({ id_producto: item.id, cantidad: item.cantidad }))
    }

    const respuesta = await authFetch("http://127.0.0.1:8000/api/pedidos/crear/", { // POST al endpoint de creación de pedidos
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pedido)
    })
    const datos = await respuesta.json()

    if (!respuesta.ok) throw new Error(datos.error || "No se pudo crear el pedido.")
    return datos
  }

  const totalCarrito = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0)

  // Confirma el pedido: valida horario, lo manda al backend y limpia el carrito
  async function handleConfirmar() {
    if (!horario) return

    try {
      const datos = await enviarPedido()
      console.log(datos) // Debug: ver qué devuelve la API

      onPedidoCreado() // Recarga stock actualizado en el padre
      setPedidoConfirmado(true)
      localStorage.removeItem(CARRITO_KEY)
      setCarrito([])

    } catch (error) {
      alert(error.message)
    }
  }

  if (!mostrarCarrito) return null

  return ( // Modal overlay: clic afuera cierra el modal, clic adentro no
    <div className="modal-overlay" onClick={() => setMostrarCarrito(false)}>
      <div className="modal-carrito" onClick={e => e.stopPropagation()}>

        {!pedidoConfirmado ? (
          <>
            {/* Columna izquierda: lista de productos del pedido */}
            <div className="modal-carrito-izq">
              <h2 className="modal-carrito-titulo">Tu Pedido</h2>
              <p className="modal-carrito-subtitulo">Productos seleccionados</p>

              {carrito.length === 0 && (
                <p className="modal-carrito-vacio">
                  <img src={iconAdvertencia} alt="!" className="modal-aviso-icono" />
                  No agregaste productos todavía.
                </p>
              )}

              {carrito.map(item => ( // Renderiza cada producto del carrito con imagen, nombre, precio, controles de cantidad y botón de eliminar
                <div key={item.id} className="modal-carrito-item">
                  <div className="modal-carrito-item-imagen">
                    {item.imagen
                      ? <img src={item.imagen} alt={item.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : esServicioSinFoto(item) ? <div className="card-producto-servicio-fondo" /> : <div className="card-producto-placeholder" />}
                  </div>
                  <div className="modal-carrito-item-info">
                    <span className="modal-carrito-item-nombre">{item.nombre}</span>
                    <span className="modal-carrito-item-precio">${item.precio.toLocaleString('es-AR')} c/u</span>
                  </div>
                  <div className="carrito-item-centro">
                    {item.variedadSeleccionada && <span className="carrito-variedad-tag">{item.variedadSeleccionada}</span>}
                    <div className="carrito-item-acciones">
                      <button className="carrito-btn-eliminar" onClick={() => handleEliminar(item)} title="Eliminar producto">
                        <img src={iconEliminar} alt="Eliminar" />
                      </button>
                    </div>
                  </div>
                  <div className="modal-carrito-item-controles">
                    <button onClick={() => handleCambiarCantidad(item.id, -1)}>−</button>
                    <span>{item.cantidad}</span>
                    <button onClick={() => handleCambiarCantidad(item.id, +1)}>+</button>
                  </div>
                  <span className="modal-carrito-item-subtotal">${(item.precio * item.cantidad).toLocaleString('es-AR')}</span>
                </div>
              ))}

              <button className="modal-seguir-btn" onClick={() => setMostrarCarrito(false)}>+ Seguir comprando</button>
            </div>

            {/* Columna derecha: resumen, horario de retiro y confirmación */}
            <div className="modal-carrito-der">
              <div className="modal-resumen">
                <h3>Resumen</h3>
                {carrito.map(item => (
                  <div key={item.id} className="modal-resumen-fila">
                    <span>{item.nombre} {item.variedadSeleccionada && `(${item.variedadSeleccionada})`} x{item.cantidad}</span>
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
                  {/* Cambiar de turno resetea el horario, porque los horarios no son los mismos entre turnos */}
                  {['Mañana', 'Tarde', 'Noche'].map(turno => (
                    <button key={turno} className={`modal-turno-btn ${turnoActivo === turno ? 'activo' : ''}`} onClick={() => { setTurnoActivo(turno); setHorario(null) }}>
                      {turno}
                    </button>
                  ))}
                </div>
                {turnosHorarios[turnoActivo].map(h => (
                  <button key={h.id} className={`modal-horario-btn ${horario === h.hora ? 'activo' : ''}`} onClick={() => setHorario(h.hora)}>
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

              <button className="modal-confirmar-btn" onClick={handleConfirmar} disabled={!horario || carrito.length === 0}>
                Confirmar Pedido
              </button>
              <button className="modal-cancelar-btn" onClick={() => { setMostrarCarrito(false); setCarrito([]); setHorario(null); setPedidoConfirmado(false) }}>
                Cancelar
              </button>
            </div>
          </>
        ) : (
          // Pantalla post-confirmación
          <div className="modal-confirmado">
            <div className="modal-confirmado-icono"><img src={iconCheck} alt="Confirmado" /></div>
            <h2>¡Pedido confirmado!</h2>
            <p className="modal-confirmado-sub">Pedido enviado al kiosco</p>
            <p className="modal-confirmado-horario">
              <img src={iconReloj} alt="Horario" className="modal-aviso-icono" />
              Retirá tu pedido a partir de las {horario}
            </p>
            <button className="modal-confirmar-btn" onClick={() => { setMostrarCarrito(false); setPedidoConfirmado(false); setHorario(null) }}>
              Seguir comprando
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── COMPONENTE PRINCIPAL: Catalogo ────────────────────────────────────────────
// Con esto se exporta la función Catalogo() para que pueda ser usada en otras partes de la aplicación.
function Catalogo() {
  // Filtros de la grilla
  const [categoriaActiva, setCategoriaActiva] = useState('Todos')
  const [busqueda, setBusqueda] = useState('')

  // Datos traídos del backend
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([]) // Pisa a la constante "categorias" de arriba
  const [menuDelDiaBackend, setMenuDelDiaBackend] = useState(null)

  // Carrito y modales
  const [carrito, setCarrito] = useState(() => cargarCarritoLocal())
  const [productoModal, setProductoModal] = useState(null) // Producto SIN variantes
  const [productoVariantes, setProductoVariantes] = useState(null) // Producto CON variantes
  const [mostrarCarrito, setMostrarCarrito] = useState(false)

  // Toast de "deshacer" al eliminar del carrito (solo uno activo a la vez)
  const [undoItem, setUndoItem] = useState(null)
  const undoTimerRef = useRef(null)
  const UNDO_DURACION = 3500 // ms

  // Trae el menú del día vigente
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/menu-dia/actual/') // Endpoint que devuelve el menú del día vigente, o null si no hay
      .then(response => response.json())
      .then(data => setMenuDelDiaBackend(data))
      .catch(error => console.error(error))
  }, [])

  // Persiste el carrito en localStorage cada vez que cambia
  useEffect(() => {
    guardarCarritoLocal(carrito)
  }, [carrito])

  // ESC cierra cualquier modal abierto (carrito, producto simple o con variantes)
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

  // Limpia el timer de undo al desmontar, para evitar setState sobre un componente ya destruido
  useEffect(() => {
    return () => { if (undoTimerRef.current) clearTimeout(undoTimerRef.current) }
  }, [])

  // Trae los productos disponibles y los adapta a la forma que usa el resto del componente.
  // Función aparte (no inline en el useEffect) porque también se re-llama tras confirmar un pedido.
  function cargarProductos() {
    fetch("http://127.0.0.1:8000/api/productos/disponibles/") // Endpoint que devuelve todos los productos disponibles para el kiosco
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
          descripcion: "", // Todavía no viene del backend
          variantes: null // Sistema de variantes aún no conectado a datos reales
        }))
        setProductos(productosFormateados)
      })
      .catch(error => console.error(error))
  }

  // Carga inicial de productos
  useEffect(() => {
    cargarProductos()
  }, [])

  // Trae las categorías reales para pintar los botones de filtro
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/categorias/')
      .then(response => response.json())
      .then(data => {
        console.log(data) // Debug: qué trae la API
        // Debug: nombre de categoría vs. ícono asignado (detecta typos entre BBDD e iconosCategorias)
        data.forEach(cat => console.log("Categoria:", `"${cat.nombre}"`, "Icono:", iconosCategorias[cat.nombre]))
        setCategorias(data)
      })
      .catch(error => console.error(error))
  }, [])

  // Filtra la grilla por categoría activa + texto buscado (sin distinguir mayúsculas/minúsculas)
  const productosFiltrados = productos.filter(p => {
    const coincideCategoria = categoriaActiva === 'Todos' || p.categoria === categoriaActiva
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    return coincideCategoria && coincideBusqueda
  })

  // Decide qué modal abrir al clickear una card
  function handleClickProducto(producto) {
    if (!producto.disponible) return
    producto.variantes ? setProductoVariantes(producto) : setProductoModal(producto)
  }

  // Agrega un producto al carrito (suma cantidad si ya existía) y cierra los modales
  function handleAgregar(producto) {
    if (!producto.disponible) return

    setCarrito(prev => {
      const existe = prev.find(item => item.id === producto.id)
      return existe
        ? prev.map(item => item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item)
        : [...prev, { ...producto, cantidad: 1 }]
    })

    setProductoModal(null)
    setProductoVariantes(null)
  }

  // Recibe el item eliminado desde ModalCarrito y dispara el toast de "eliminado, ¿deshacer?"
  function handleEliminarItem(item) {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current) // Solo un toast a la vez
    undoTimerRef.current = setTimeout(() => setUndoItem(null), UNDO_DURACION)
    setUndoItem({ item, timerId: undoTimerRef.current })
  }

  // Cancela el timer y vuelve a agregar el producto eliminado, tal cual estaba
  function handleDeshacer() {
    if (!undoItem) return
    clearTimeout(undoItem.timerId)
    setCarrito(prev => [...prev, undoItem.item])
    setUndoItem(null)
  }

  const totalCarrito = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0)
  const cantidadTotal = carrito.reduce((acc, item) => acc + item.cantidad, 0)

  // Arma los ítems del carrusel: menú del día real (si hay) + promociones fijas
  const itemsCarrusel = [
    ...(menuDelDiaBackend ? [{
      id: `menu-${menuDelDiaBackend.id_menu}`,
      tipo: 'MENÚ DEL DÍA',
      nombre: menuDelDiaBackend.descripcion,
      desc: 'Precio especial del día',
      precio: Number(menuDelDiaBackend.precio),
      comprable: false,
    }] : []),
    ...menuYpromociones.filter(item => item.tipo === 'PROMOCIÓN'),
  ]

  return (
    <div className="catalogo-layout">
      <NavbarAlumno cantidadCarrito={cantidadTotal} onAbrirCarrito={() => setMostrarCarrito(true)} />
      <main className="catalogo-contenido">

        {/* Carrusel de menú del día y promociones */}
        <div className="catalogo-banner-menu">
          <h2 className="catalogo-banner-titulo">Promociones y Menú del Día</h2>
          <CarruselMenu items={itemsCarrusel} onAgregar={handleAgregar} />
        </div>

        {/* Filtros por categoría: "Todos" fijo primero, el resto viene del backend */}
        <div className="catalogo-categorias">
          <button className={`catalogo-cat-btn ${categoriaActiva === "Todos" ? "activo" : ""}`} onClick={() => setCategoriaActiva("Todos")}>
            <img src={btnTodos} alt="Todos" />
          </button>
          {categorias.map(cat => (
            <button key={cat.id_categoria} className={`catalogo-cat-btn ${categoriaActiva === cat.nombre ? "activo" : ""}`} onClick={() => setCategoriaActiva(cat.nombre)}>
              <img src={iconosCategorias[cat.nombre]} alt={cat.nombre} />
            </button>
          ))}
        </div>

        {/* Buscador por nombre */}
        <div className="catalogo-buscador">
          <img src={iconBuscador} alt="Buscar" className="catalogo-buscador-icono" />
          <input type="text" placeholder="Buscar producto..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        </div>

        {/* Grilla de productos filtrados */}
        <div className="catalogo-grilla">
          {productosFiltrados.map(producto => (
            <div key={producto.id} onClick={() => handleClickProducto(producto)} className="catalogo-card-wrapper">
              <CardProducto
                producto={producto}
                onAgregar={(p) => p.variantes ? setProductoVariantes(p) : handleAgregar(p)}
              />
            </div>
          ))}
        </div>
      </main>

      {/* Botón flotante del carrito, visible solo con productos agregados */}
      {cantidadTotal > 0 && (
        <button className="catalogo-carrito-flotante" onClick={() => setMostrarCarrito(true)}>
          <img src={iconCarrito} alt="Carrito" />
          <span className="catalogo-carrito-badge">{cantidadTotal}</span>
          <span className="catalogo-carrito-total">Ver pedido · ${totalCarrito.toLocaleString('es-AR')}</span>
        </button>
      )}

      {/* Modal de variantes */}
      {productoVariantes && (
        <ModalVariantes producto={productoVariantes} onAgregar={handleAgregar} onCerrar={() => setProductoVariantes(null)} />
      )}

      {/* Modal simple de producto (sin variantes) */}
      {productoModal && (
        <div className="modal-overlay" onClick={() => setProductoModal(null)}>
          <div className="modal-producto" onClick={e => e.stopPropagation()}>
            <button className="modal-cerrar" onClick={() => setProductoModal(null)}>✕</button>
            <div className="modal-producto-imagen">
              {productoModal.imagen
                ? <img src={productoModal.imagen} alt={productoModal.nombre} />
                : esServicioSinFoto(productoModal) ? <div className="card-producto-servicio-fondo" /> : <div className="card-producto-placeholder" />}
            </div>
            <div className="modal-producto-info">
              <p className="modal-producto-categoria">{productoModal.categoria}</p>
              <h2 className="modal-producto-nombre">{productoModal.nombre}</h2>
              <p className="modal-producto-desc">{productoModal.descripcion}</p>
              <p className="modal-producto-precio">${productoModal.precio.toLocaleString('es-AR')}</p>
              <button className="modal-producto-btn" onClick={() => handleAgregar(productoModal)} disabled={productoModal.stock === 0}>
                {productoModal.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal del carrito */}
      <ModalCarrito
        carrito={carrito}
        setCarrito={setCarrito}
        mostrarCarrito={mostrarCarrito}
        setMostrarCarrito={setMostrarCarrito}
        onEliminarItem={handleEliminarItem}
        onPedidoCreado={cargarProductos}
      />

      {/* Toast flotante de "deshacer" (igual patrón que GestionProductos) */}
      {undoItem && (
        <div className="catalogo-toast">
          <span>"{undoItem.item.nombre}" eliminado</span>
          <button className="catalogo-toast-btn" onClick={handleDeshacer}>Deshacer</button>
        </div>
      )}
    </div>
  )
}

export default Catalogo