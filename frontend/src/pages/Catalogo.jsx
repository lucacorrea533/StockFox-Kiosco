/* Este archivo es el corazón del catálogo, donde se muestra la lista de productos disponibles para comprar. Acá se implementa la lógica para filtrar por categorías, buscar por nombre y agregar productos al carrito. */

// ── IMPORTS ───────────────────────────────────────────────────────────────────
// Importa React y sus hooks, así como los componentes y assets necesarios para el catálogo
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
import { authFetch } from '../api/authFetch'

// Diccionario que relaciona el NOMBRE de cada categoría (tal cual viene de la base de datos)
// con el ícono PNG que le corresponde. Se usa para pintar el botón de filtro de cada categoría
// sin tener que hardcodear el ícono en cada lugar donde se necesite
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

// Determina si el producto es un Servicio sin foto (ej. "Calentar Comida"), para mostrar
// un fondo especial en vez de una imagen rota o un placeholder genérico
function esServicioSinFoto(p) {
  return p.categoria === 'Servicios' && !p.imagen
}

// ── CATEGORÍAS ────────────────────────────────────────────────────────────────
// NOTA: esta constante "categorias" queda pisada/no usada como filtro real, porque más abajo
// el componente Catalogo() define su PROPIO estado también llamado "categorias" (con setCategorias),
// que es el que efectivamente se llena desde la API y se muestra en pantalla.
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
// Datos de ejemplo "hardcodeados" (fijos en el código) para el carrusel de arriba del catálogo.
// A futuro esto se reemplazaría por datos reales que vengan de las tablas MENU_DIA y PROMOCIONES del backend
const menuYpromociones = [
  { id: 'menu1',  tipo: 'MENÚ DEL DÍA', nombre: 'Hamburguesa Completa + Cono de Papas + Jugo Placer', desc: 'Precio especial · Separado sale $12.300', precio: 9000, comprable: false },
  { id: 'promo1', tipo: 'PROMOCIÓN',    nombre: 'Café con Leche + 5 Chipá',                            desc: 'Café mediano + 5 chipas',                 precio: 3800, comprable: false },
  { id: 'promo2', tipo: 'PROMOCIÓN',    nombre: 'Café + Medialuna c/ J y Q',                           desc: 'Desayuno completo',                        precio: 3800, comprable: false },
  { id: 'promo3', tipo: 'PROMOCIÓN',    nombre: 'Café + 2 Medialunas',                                 desc: 'Café mediano + 2 medialunas',              precio: 4500, comprable: false },
  { id: 'promo4', tipo: 'PROMOCIÓN',    nombre: 'Desayuno: Café + Tostado J y Q',                      desc: 'Café mediano + tostado',                   precio: 3500, comprable: false },
  { id: 'promo5', tipo: 'PROMOCIÓN',    nombre: '2 Empanadas + Jugo Baggio',                           desc: '2 empanadas + jugo 200ml',                 precio: 5000, comprable: false },
  { id: 'promo6', tipo: 'PROMOCIÓN',    nombre: 'Chocolatada + Bizcochuelo',                           desc: 'Chocolatada caliente + porción',           precio: 3500, comprable: false },
]

// ── HORARIOS ─────────────────────────────────────────────────────────────────
// Horarios de retiro disponibles, agrupados por turno (Mañana/Tarde/Noche).
// Cada objeto trae un ícono ilustrativo, la hora exacta y una etiqueta con el "momento" (recreo, entrada, salida)
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
const CARRITO_KEY = 'recokiosco_carrito' // Nombre de la "casilla" del localStorage donde se guarda el carrito

// Lee el carrito guardado en el navegador. Si no hay nada o el dato está corrupto, devuelve un array vacío
function cargarCarritoLocal() {
  try {
    const raw = localStorage.getItem(CARRITO_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

// Guarda el carrito actual en localStorage como texto (JSON.stringify), para que persista
// aunque el alumno recargue la página o cierre y abra el navegador
function guardarCarritoLocal(carrito) {
  localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito))
}

// ── CARRUSEL MENÚ DEL DÍA ─────────────────────────────────────────────────────
const CARDS_POR_PAGINA = 4 // Cuántas tarjetas de menú/promo se muestran a la vez en el carrusel

// Componente del carrusel que va rotando automáticamente entre "páginas" de 4 tarjetas cada una
function CarruselMenu({ items, onAgregar }) {
  const [pagina, setPagina] = useState(0) // Página actualmente visible del carrusel
  const totalPaginas = Math.ceil(items.length / CARDS_POR_PAGINA) // Cuántas páginas hacen falta en total, redondeando hacia arriba
  const intervalRef = useRef(null) // Guarda la referencia al temporizador de auto-avance, para poder cancelarlo después

  // Arranca un temporizador que avanza de página automáticamente cada 4 segundos.
  // El operador "%" (módulo) hace que, al llegar a la última página, vuelva a la primera (efecto ciclo)
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setPagina(p => (p + 1) % totalPaginas)
    }, 4000)
    return () => clearInterval(intervalRef.current) // Limpieza: cancela el temporizador si el componente se desmonta
  }, [totalPaginas])

  // Se ejecuta cuando el usuario clickea manualmente uno de los "dots" (puntitos) de navegación.
  // Reinicia el temporizador automático para que no "compita" con el cambio manual
  function irAPagina(i) {
    clearInterval(intervalRef.current)
    setPagina(i)
    intervalRef.current = setInterval(() => {
      setPagina(p => (p + 1) % totalPaginas)
    }, 4000)
  }

  const inicio = pagina * CARDS_POR_PAGINA
  const visibles = items.slice(inicio, inicio + CARDS_POR_PAGINA) // Recorta solo los ítems que corresponden a la página actual

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
                    id: item.id,
                    nombre: item.nombre,
                    precio: item.precio,
                    categoria: item.tipo,
                    stock: 99,
                    imagen: null,
                    disponible: true,
                  })}
                >
                  Agregar
                </button>
              )}
            </div>
          </div>
        ))}
        {/* Si la última página tiene menos de 4 tarjetas, se rellena con "espacios fantasma" invisibles
            para que el grid no se desarme visualmente (mantiene siempre 4 columnas parejas) */}
        {visibles.length < CARDS_POR_PAGINA &&
          Array.from({ length: CARDS_POR_PAGINA - visibles.length }).map((_, i) => (
            <div key={`ph-${i}`} className="catalogo-menu-card-placeholder" />
          ))
        }
      </div>
      {/* Los puntitos de navegación solo se muestran si hay más de una página */}
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
// Se usa para productos que tienen distintas variedades (ej. un alfajor blanco/negro).
// Sirve tanto para AGREGAR un producto nuevo al carrito como para EDITAR la variante
// de un producto que ya está en el carrito (dependiendo de qué props reciba)
function ModalVariantes({ producto, varianteInicial, onAgregar, onConfirmarEdicion, onCerrar }) {
  const esEdicion = !!onConfirmarEdicion // Si vino la función onConfirmarEdicion, este modal está en "modo edición" y no "modo agregar"
  // Si se pasó una variante inicial (porque se está editando un ítem que ya tenía una elegida),
  // la busca en la lista de variantes del producto; si no la encuentra, usa la primera por defecto
  const inicial = varianteInicial
    ? producto.variantes.find(v => v.label === varianteInicial) ?? producto.variantes[0]
    : null
  const [varianteSeleccionada, setVarianteSeleccionada] = useState(inicial)
  const variante = varianteSeleccionada ?? producto.variantes[0] // Si no hay ninguna seleccionada todavía, usa la primera de la lista

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
            {/* Recorre todas las variantes disponibles del producto (ej: "Negro", "Blanco") y arma un botón por cada una */}
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
          {/* Texto adicional opcional, solo si esa variante en particular lo tiene definido */}
          {variante.extraInfo && (
            <p className="modal-variante-extra">{variante.extraInfo}</p>
          )}
          <p className="modal-producto-precio">${variante.precio.toLocaleString('es-AR')}</p>
          {/* Según si es edición o no, el botón hace una cosa distinta */}
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
                  ...producto, // Copia todas las propiedades originales del producto
                  baseId: producto.id, // Guarda el ID original del producto "padre", por si hace falta más adelante
                  id: `${producto.id}_${variante.label}`, // ID único combinando producto + variante, para diferenciarlo en el carrito
                  nombre: producto.nombre,
                  variedadSeleccionada: variante.label,
                  precio: variante.precio, // El precio final es el de la VARIANTE elegida, no el del producto genérico
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
// Se exporta con "export" porque MisPedidos.jsx también lo reutiliza tal cual, sin duplicar código
export function ModalCarrito({
  carrito, setCarrito, mostrarCarrito, setMostrarCarrito, onEliminarItem, onPedidoCreado
}) {
  const [horario, setHorario] = useState(null) // Horario de retiro elegido por el alumno (ej. "10:35")
  const [pedidoConfirmado, setPedidoConfirmado] = useState(false) // Controla si se muestra la pantalla de "¡Pedido confirmado!"
  const [turnoActivo, setTurnoActivo] = useState('Mañana') // Qué pestaña de turno (Mañana/Tarde/Noche) está seleccionada

  // Suma o resta 1 a la cantidad de un producto del carrito. Si la cantidad llega a 0, el .filter()
  // se encarga de sacarlo directamente de la lista (no queda un ítem con cantidad 0 dando vueltas)
  function handleCambiarCantidad(id, delta) {
    setCarrito(prev =>
      prev
        .map(item => item.id === id ? { ...item, cantidad: item.cantidad + delta } : item)
        .filter(item => item.cantidad > 0)
    )
  }

  // Saca el ítem del carrito y avisa al componente padre (Catalogo) para que muestre
  // el toast de "eliminado, ¿deshacer?" fuera del modal
  function handleEliminar(item) {
    setCarrito(prev => prev.filter(i => i.id !== item.id))
    onEliminarItem(item)
  }
 
// Envía el pedido armado al backend. Es una función "async" porque tiene que esperar
// la respuesta del servidor antes de poder continuar
async function enviarPedido() {

  // Arma el objeto con la forma exacta que espera la API: alumno, horario, y lista de productos con sus cantidades
  const pedido = {

    id_alumno: Number(localStorage.getItem('id')), // Obtiene el ID del alumno logueado desde localStorage, que se guardó al iniciar sesión

    horario_retiro: horario,

    productos: carrito.map(item => ({

      id_producto: item.id,

      cantidad: item.cantidad

    }))

  }

  // "await" pausa la ejecución de la función hasta que el servidor responda, sin bloquear el resto de la app
const respuesta = await authFetch(
    "http://127.0.0.1:8000/api/pedidos/crear/",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pedido)
    }
  )

  const datos = await respuesta.json() // Convierte la respuesta del servidor de vuelta a un objeto JS

  // respuesta.ok es false si el servidor devolvió un código de error (400, 500, etc).
  // En ese caso, se corta la ejecución lanzando un error con el mensaje que mandó el backend (o uno genérico)
  if (!respuesta.ok) {

    throw new Error(
      datos.error || "No se pudo crear el pedido."
    )

  }

  return datos

}

  const totalCarrito = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0)
 
  // Se ejecuta al clickear "Confirmar Pedido"
  async function handleConfirmar() {

  if (!horario) return // Corta acá si todavía no se eligió un horario de retiro

  try {

    const datos = await enviarPedido() // Espera a que el pedido se guarde en el backend

    console.log(datos) // Log de depuración, para ver qué devolvió la API mientras se prueba

    onPedidoCreado() // Avisa al padre (Catalogo) que se creó un pedido, para que recargue el stock actualizado de productos

    setPedidoConfirmado(true) // Cambia a la pantalla de "¡Pedido confirmado!"

    localStorage.removeItem(CARRITO_KEY) // Borra el carrito guardado en el navegador

    setCarrito([]) // Vacía el carrito en el estado de React también

  }

  catch (error) {

    alert(error.message) // Si algo falló (ej. sin stock, error de conexión), se lo muestra al usuario con un alert nativo

  }

}

  if (!mostrarCarrito) return null // Si el modal no debe mostrarse, el componente no renderiza absolutamente nada

  return (
    <div className="modal-overlay" onClick={() => setMostrarCarrito(false)}>
      <div className="modal-carrito" onClick={e => e.stopPropagation()}>

        {/* Muestra una vista u otra según si el pedido ya fue confirmado o todavía se está armando */}
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

              {/* Recorre cada producto del carrito y arma su fila con imagen, nombre, precio, controles de cantidad y subtotal */}
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
                    {/* La etiqueta de variedad (ej. "Negro") solo aparece si el producto tiene una variante seleccionada */}
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
                {/* Lista resumida de cada producto con su subtotal, a modo de "recibo" antes de confirmar */}
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
                  {/* Botones para elegir el turno del día. Al cambiar de turno, resetea el horario elegido
                      (porque los horarios de un turno no tienen sentido en otro) */}
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
                {/* Muestra solo los horarios del turno actualmente seleccionado */}
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
                {/* Aviso que recuerda elegir un horario antes de poder confirmar */}
                {!horario && (
                  <p className="modal-horario-aviso">
                    <img src={iconAdvertencia} alt="!" className="modal-aviso-icono" />
                    <span>Seleccioná un horario para confirmar</span>
                  </p>
                )}
              </div>

              {/* El botón de confirmar se deshabilita si no hay horario elegido o si el carrito está vacío */}
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
          // Pantalla que se muestra DESPUÉS de confirmar el pedido exitosamente
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
  const [categoriaActiva, setCategoriaActiva] = useState('Todos') // Qué categoría de filtro está seleccionada
  const [busqueda, setBusqueda] = useState('') // Texto escrito en el buscador
  const [carrito, setCarrito]   = useState(() => cargarCarritoLocal()) // Carrito de compras, inicializado desde localStorage
  const [productoModal, setProductoModal]       = useState(null) // Producto SIN variantes que se está mostrando en el modal simple
  const [productoVariantes, setProductoVariantes] = useState(null) // Producto CON variantes que se está mostrando en ModalVariantes
  const [mostrarCarrito, setMostrarCarrito]     = useState(false) // Controla si el modal del carrito está visible
  const [productos, setProductos] = useState([]) // --------------------------
  const [categorias, setCategorias] = useState([]) // Lista de categorías reales, traída desde el backend (pisa a la constante "categorias" de más arriba)
  
  // ── Toast de undo (fuera del modal, nivel página) ─────────────────────────
  // undoItem: { item, timerId } | null — solo un undo activo a la vez.
  const [undoItem, setUndoItem]   = useState(null) // Guarda el último producto eliminado, por si el usuario quiere deshacerlo
  const undoTimerRef              = useRef(null) // Referencia al temporizador que hace desaparecer el toast de "deshacer"
  const UNDO_DURACION             = 3500 // ms — cuánto tiempo queda visible el toast antes de desaparecer solo
  const [menuDelDiaBackend, setMenuDelDiaBackend] = useState(null)

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/menu-dia/actual/')
      .then(response => response.json())
      .then(data => setMenuDelDiaBackend(data))
      .catch(error => console.error(error))
  }, [])
  // Cada vez que el carrito cambia, se vuelve a guardar automáticamente en localStorage
  useEffect(() => {
    guardarCarritoLocal(carrito)
  }, [carrito])

  // Escucha globalmente la tecla ESC: si está apretada, cierra cualquier modal que esté abierto
  // (carrito, producto simple o producto con variantes), todo de una sola vez
  useEffect(() => {
    function handleEsc(e) {
      if (e.key === 'Escape') {
        setMostrarCarrito(false)
        setProductoModal(null)
        setProductoVariantes(null)
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc) // Limpieza: saca el listener si el componente se desmonta
  }, [])

  // Limpia el timer de undo al desmontar el componente, para evitar que intente actualizar
  // un estado de un componente que ya no existe (lo que generaría un warning de React)
  useEffect(() => {
    return () => { if (undoTimerRef.current) clearTimeout(undoTimerRef.current) }
  }, [])

  // Trae la lista de productos actual desde el backend y la deja lista para mostrar en la grilla.
  // Se define como función aparte (no directo en un useEffect) porque también se necesita
  // volver a llamarla después de confirmar un pedido, para reflejar el stock actualizado
  function cargarProductos() {

  fetch("http://127.0.0.1:8000/api/productos/disponibles/")
    .then(response => response.json())
    .then(data => {

      // Traduce cada producto tal cual viene de la base de datos a la forma que usa el resto del componente
      const productosFormateados = data.map(p => ({
        id: p.id_producto,
        nombre: p.nombre,
        precio: Number(p.precio_actual), // Se asegura de que sea un número, no un string, para poder hacer cuentas
        imagen: p.foto_url,
        stock: p.stock,
        disponible: p.disponible,
        categoria: p.categoria,
        descripcion: "", // Todavía no viene descripción desde el backend, se deja vacía por ahora
        variantes: null // Ídem: el sistema de variantes (ver ModalVariantes) todavía no está conectado a datos reales
    }))

      setProductos(productosFormateados)

    })
    .catch(error => {
      console.error(error) // Si falla la conexión, lo avisa en consola en vez de romper la pantalla
    })
}

// Carga los productos una sola vez al montar la página
useEffect(() => {
  cargarProductos()
}, [])

  // Aplica los dos filtros activos (categoría elegida + texto buscado) sobre la lista completa de productos
  const productosFiltrados = productos.filter(p => {
    const coincideCategoria = categoriaActiva === 'Todos' || p.categoria === categoriaActiva
    const coincideBusqueda  = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) // toLowerCase() para que la búsqueda no distinga mayúsculas/minúsculas
    return coincideCategoria && coincideBusqueda
  })

  // Trae la lista de categorías reales desde el backend, para pintar los botones de filtro arriba de la grilla
  useEffect(() => {
  fetch('http://127.0.0.1:8000/api/categorias/') // FEETCHHHHHH CATEGORIASASSSA
    .then(response => response.json())
    .then(data => {

  console.log(data) // Log de depuración para revisar qué trae la API mientras se prueba

  // Otro log de depuración: por cada categoría, muestra su nombre y qué ícono le fue asignado
  // (útil para detectar errores de tipeo entre el nombre de la BBDD y las claves de "iconosCategorias")
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

  // Se ejecuta al clickear una card de producto en la grilla: decide qué modal abrir
  function handleClickProducto(producto) {

  if (!producto.disponible) return // Si el producto no está disponible, no hace nada al clickearlo

  if (producto.variantes) {
    setProductoVariantes(producto) // Si tiene variantes (ej. blanco/negro), abre el modal de selección de variantes
  } else {
    setProductoModal(producto) // Si no, abre el modal simple de "Agregar al carrito"
  }
}

  // Agrega un producto al carrito. Si ya existía, solo le suma 1 a la cantidad;
  // si es nuevo, lo agrega como un ítem más con cantidad inicial 1
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

  setProductoModal(null) // Cierra cualquier modal que haya quedado abierto después de agregar
  setProductoVariantes(null)
}

  // Recibe el item eliminado desde ModalCarrito y lanza el toast de "X eliminado, ¿deshacer?"
  function handleEliminarItem(item) {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current) // Si ya había un toast corriendo, lo cancela (solo puede haber uno a la vez)
    const timerId = setTimeout(() => setUndoItem(null), UNDO_DURACION) // Después de UNDO_DURACION ms, el toast desaparece solo
    undoTimerRef.current = timerId
    setUndoItem({ item, timerId })
  }

  // Se ejecuta si el usuario clickea "Deshacer" en el toast: cancela el temporizador
  // y vuelve a agregar el producto eliminado al carrito, tal cual estaba
  function handleDeshacer() {
    if (!undoItem) return
    clearTimeout(undoItem.timerId)
    setCarrito(prev => [...prev, undoItem.item])
    setUndoItem(null)
  }

  const totalCarrito   = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0)
  const cantidadTotal  = carrito.reduce((acc, item) => acc + item.cantidad, 0)

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

        {/* Carrusel de menú del día y promociones, arriba de todo */}
        <div className="catalogo-banner-menu">
          <h2 className="catalogo-banner-titulo">Promociones y Menú del Día</h2>
          <CarruselMenu items={itemsCarrusel} onAgregar={handleAgregar} />
        </div>

        {/* Fila de botones de filtro por categoría, con "Todos" fijo primero y el resto según venga del backend */}
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

        {/* Buscador de productos por nombre */}
        <div className="catalogo-buscador">
          <img src={iconBuscador} alt="Buscar" className="catalogo-buscador-icono" />
          <input
            type="text"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>

        {/* Grilla principal de productos, ya filtrada por categoría y búsqueda */}
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
                  // Si el botón "Agregar" de la card se clickea directo (sin pasar por el modal),
                  // igual respeta la regla de abrir el selector de variantes si el producto las tiene
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

      {/* Botón flotante del carrito, solo visible si hay al menos un producto agregado */}
      {cantidadTotal > 0 && (
        <button className="catalogo-carrito-flotante" onClick={() => setMostrarCarrito(true)}>
          <img src={iconCarrito} alt="Carrito" />
          <span className="catalogo-carrito-badge">{cantidadTotal}</span>
          <span className="catalogo-carrito-total">Ver pedido · ${totalCarrito.toLocaleString('es-AR')}</span>
        </button>
      )}

      {/* Modal de selección de variantes, solo aparece si hay un producto con variantes seleccionado */}
      {productoVariantes && (
        <ModalVariantes
          producto={productoVariantes}
          onAgregar={handleAgregar}
          onCerrar={() => setProductoVariantes(null)}
        />
      )}

      {/* Modal simple de producto (sin variantes), solo aparece si hay un producto seleccionado */}
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

      {/* Modal del carrito de compras, con toda la lógica de horarios y confirmación de pedido */}
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