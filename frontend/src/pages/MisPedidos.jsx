/* Este archivo es la página principal donde los alumnos pueden ver el estado de sus pedidos. Se muestra una lista de pedidos con su fecha, hora, estado actual y detalles de los productos incluidos. Los pedidos se pueden filtrar por estado (pendiente, listo para retirar, entregado) y también se muestra un contador de cada tipo de pedido en las pestañas correspondientes. Además, se incluye un botón para abrir el carrito y revisar los productos antes de finalizar un nuevo pedido. */

/* Importaciones de React y otras librerías necesarias para la funcionalidad de la página */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import NavbarAlumno from '../components/NavbarAlumno'
import { ModalCarrito } from './Catalogo' // Reutiliza el modal del carrito que vive en la vista Catalogo, para no duplicarlo acá
import iconReloj from '../assets/icons/Reloj.png'
import iconPedido from '../assets/icons/MisPedidos2.png'
import iconAdvertencia from '../assets/icons/Advertencia.png'
import iconCarrito from '../assets/icons/VentasBoton.png'
import '../styles/MisPedidos.css'

/* Constante que define la clave utilizada para almacenar el carrito en localStorage. Esto permite que el carrito persista entre recargas de página y sesiones del navegador. */
const CARRITO_KEY = 'recokiosco_carrito' // Nombre de la "casilla" que se usa en localStorage para guardar el carrito

// Lee el carrito guardado en el localStorage del navegador (persiste aunque se recargue la página).
// Devuelve un array vacío si no hay nada guardado o si el dato guardado está corrupto/mal formado
function cargarCarritoLocal() {
  try {
    const raw = localStorage.getItem(CARRITO_KEY) // Trae el string tal cual está guardado
    return raw ? JSON.parse(raw) : [] // JSON.parse lo convierte de vuelta en un array de objetos JS
  } catch {
    return [] // Si JSON.parse falla (dato corrupto), no rompe la página: devuelve carrito vacío
  }
}

// Guarda el carrito actual en localStorage, convirtiéndolo a texto con JSON.stringify
// (localStorage solo puede guardar strings, no objetos ni arrays directamente)
function guardarCarritoLocal(carrito) {
  localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito))
}

// Pestañas de filtro que se muestran arriba de la lista de pedidos
const TABS = [
  { key: 'todos',     label: 'Todos' },
  { key: 'pendiente', label: 'Pendiente' },
  { key: 'listo',     label: 'Listo para retirar' },
  { key: 'entregado', label: 'Entregado' },
]

// Mapea cada estado posible de un pedido con el texto y la clase CSS que le corresponde al badge de color
const ESTADO_CONFIG = {
  pendiente: { label: 'Pendiente',          clase: 'estado-pendiente' },
  listo:     { label: 'Listo para retirar', clase: 'estado-listo'     },
  entregado: { label: 'Entregado',          clase: 'estado-entregado' },
}

// Diccionario que traduce un horario exacto (hora de entrada/recreo/salida) a un nombre más entendible.
// Sirve para mostrarle al alumno "Retiro: 10:35 hs — 2do recreo" en vez de solo el número de hora
const MOMENTOS_RETIRO = {

  "07:45": "Entrada",
  "09:05": "1er recreo",
  "10:35": "2do recreo",
  "12:05": "Salida Normal",
  "12:45": "Salida 7ma",

  "13:30": "Entrada",
  "14:50": "1er recreo",
  "16:20": "2do recreo",
  "17:50": "Salida Normal",
  "18:30": "Salida 7ma",

  "19:50": "1er recreo"

}

// Recibe la fecha en formato "AAAA-MM-DD" y la hora por separado, y arma el string final
// que se muestra en pantalla: "DD/MM/AAAA — HH:MM hs"
function formatFecha(fechaStr, horaStr) {
  const [y, m, d] = fechaStr.split('-') // Separa el string "2026-05-07" en año, mes y día usando el guion como separador
  return `${d}/${m}/${y} — ${horaStr} hs`
}

// Tarjeta individual que representa UN pedido completo, con su cabecera, productos y pie
function TarjetaPedido({ pedido }) {
  const config = ESTADO_CONFIG[pedido.estado] // Busca el label y la clase CSS que le corresponden al estado de este pedido puntual
  const esListo = pedido.estado === 'listo' // Booleano auxiliar: ¿este pedido está listo para retirar?
  const esEntregado = pedido.estado === 'entregado' // Booleano auxiliar: ¿este pedido ya fue entregado?
  
  console.log("TarjetaPedido:", pedido) // Log de depuración, útil mientras se prueba la conexión con el backend

  return (
    // Si el pedido ya fue entregado, se le agrega la clase "card-entregado" que lo muestra más apagado/translúcido
    <div className={`mispedidos-card ${esEntregado ? 'card-entregado' : ''}`}>
      <div className="mispedidos-card-header">
        <div className="mispedidos-card-header-izq">
          <img src={iconPedido} alt="Pedido" className="mispedidos-card-icono" />
          <div>
            {/* padStart(4, '0') rellena el número de pedido con ceros a la izquierda hasta tener 4 dígitos,
                para que se vea como "Pedido #0001" en vez de "Pedido #1" */}
            <span className="mispedidos-card-numero">Pedido #{String(pedido.id).padStart(4, '0')}</span>
            <span className="mispedidos-card-fecha">{formatFecha(pedido.fecha, pedido.hora)}</span>
          </div>
        </div>
        <span className={`mispedidos-estado-badge ${config.clase}`}>
          {config.label}
        </span>
      </div>

      {/* Este cartel destacado solo aparece si el pedido está en estado "listo" */}
      {esListo && (
        <div className="mispedidos-banner-listo">
          <img src={iconReloj} alt="Listo" className="mispedidos-banner-icono" />
          <span>¡Tu pedido está listo! Pasá a retirarlo a las {pedido.horario_retiro}.</span>
        </div>
      )}

      {/* Lista de productos del pedido: recorre el array "items" y muestra nombre, cantidad y subtotal de cada uno */}
      <ul className="mispedidos-items">
        {pedido.items.map((item, i) => (
          <li key={i}>
            <span className="mispedidos-item-nombre">
              {item.nombre} x{item.cantidad}
            </span>
            <span className="mispedidos-item-precio">
              {/* toLocaleString('es-AR') formatea el número con puntos de miles al estilo argentino (ej: $2.800) */}
              ${(item.precio * item.cantidad).toLocaleString('es-AR')}
            </span>
          </li>
        ))}
      </ul>

      <div className="mispedidos-card-footer">
        <span className="mispedidos-retiro">
          <img src={iconReloj} alt="Retiro" className="mispedidos-retiro-icono" />
          {/* Si ya fue entregado dice "Retirado", si no, dice "Retiro" (mismo texto, distinto tiempo verbal) */}
          {esEntregado ? 'Retirado' : 'Retiro'}: {pedido.horario_retiro} — {pedido.momento_retiro}
        </span>
        <span className="mispedidos-total">
          ${pedido.total.toLocaleString('es-AR')}
        </span>
      </div>
    </div>
  )
}

/* Componente principal de la página "Mis Pedidos". Muestra la lista de pedidos del alumno, permite filtrarlos por estado y abrir el carrito. */
function MisPedidos() { /* Esta función basicaente define la página completa, con su estado, efectos y renderizado de la UI */
  const [tabActiva, setTabActiva] = useState('todos') // Qué pestaña de filtro está seleccionada actualmente
  const navigate = useNavigate()

  // Carrito compartido — se sincroniza con localStorage igual que en Catalogo.
  // El "() =>" hace que cargarCarritoLocal() se ejecute UNA sola vez al montar el componente,
  // en vez de ejecutarse en cada re-render (optimización recomendada por React para estados iniciales "pesados")
  const [carrito, setCarrito] = useState(() => cargarCarritoLocal())
  const [mostrarCarrito, setMostrarCarrito] = useState(false) // Controla si el modal del carrito está abierto
  const [pedidos, setPedidos] = useState([]) // Acá se guardan los pedidos ya traídos y formateados desde el backend

  // Cada vez que el carrito cambia (se agrega/saca un producto), se vuelve a guardar en localStorage automáticamente
  useEffect(() => {
    guardarCarritoLocal(carrito)
  }, [carrito])

  // Este efecto se ejecuta UNA sola vez al cargar la página (el array vacío [] al final así lo indica).
  // Se conecta con la API del backend para traer los pedidos reales del alumno (por ahora el alumno 1 está fijo/hardcodeado)
  useEffect(() => {

  const idAlumno = localStorage.getItem('id')
  fetch(`http://127.0.0.1:8000/api/alumnos/${idAlumno}/pedidos/detalle/`) // Llama a la API del backend para traer los pedidos del alumno
    .then(response => response.json()) // Convierte la respuesta cruda del servidor a un objeto/array JS
    .then(data => {

      console.log(data) // Log de depuración para ver qué trae la API mientras se prueba la integración

      // Transforma cada pedido tal cual viene del backend a la forma que espera TarjetaPedido,
      // ya que los nombres de campos y formatos no coinciden 1 a 1 entre la base de datos y la vista
      const pedidosFormateados = data.map(pedido => {

  const fecha = new Date(pedido.fecha_creacion) // Convierte el string de fecha en un objeto Date de JS, más fácil de manipular

const horario = pedido.horario_retiro.slice(0, 5) // Se queda solo con "HH:MM", recortando los segundos que trae la BBDD

const momentoRetiro =
  MOMENTOS_RETIRO[horario] || "" // Busca a qué momento del día corresponde ese horario (ej. "2do recreo"); si no lo encuentra, deja vacío

return { // Devuelve un objeto con la forma que espera TarjetaPedido, listo para renderizarse en pantalla

  id: pedido.id_pedido,

  fecha: fecha.toISOString().split("T")[0], // Se queda solo con la parte de la fecha (AAAA-MM-DD), descartando la hora

  hora: fecha.toTimeString().slice(0,5), // Se queda solo con la hora en formato HH:MM

  estado: pedido.estado,

  horario_retiro: horario + " hs",

  momento_retiro: momentoRetiro,

  total: Number(pedido.total), // Se asegura de que el total sea un número, no un string, para poder hacer cuentas con él

  items: pedido.productos.map(producto => ({
    nombre: producto.producto,
    cantidad: producto.cantidad,
    precio: Number(producto.precio_unitario)
  }))

}

})

setPedidos(pedidosFormateados) // Guarda en el estado la lista ya formateada, lista para mostrarse en pantalla

    })
    .catch(error => {
      console.error(error) // Si falla la conexión con el backend, lo muestra en consola en vez de romper la página
    })

}, [])

  // Suma la cantidad total de productos en el carrito (sin importar cuántos productos distintos haya)
  const cantidadTotal = carrito.reduce((acc, item) => acc + item.cantidad, 0)
  // Suma el precio total del carrito, multiplicando precio x cantidad de cada producto
  const totalCarrito  = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0)

  const activos = pedidos.filter(p => p.estado !== "entregado") // Todo lo que todavía no fue entregado (pendiente o listo)
  const historial = pedidos.filter(p => p.estado === "entregado") // Solo los pedidos ya entregados, para la sección "Historial"

  // Si la pestaña activa es "todos" no filtra nada; si no, deja solo los pedidos que coincidan con ese estado
  const pedidosFiltrados =
  tabActiva === "todos"
    ? pedidos
    : pedidos.filter(p => p.estado === tabActiva)

  // Cuenta cuántos pedidos hay de cada estado, para mostrar el numerito en cada pestaña
  const contadores = {
  todos: pedidos.length,
  pendiente: pedidos.filter(p => p.estado === "pendiente").length,
  listo: pedidos.filter(p => p.estado === "listo").length,
  entregado: pedidos.filter(p => p.estado === "entregado").length,
 }

  const sinPedidos = pedidosFiltrados.length === 0 // true si, con el filtro actual, no hay nada para mostrar

  return (
    <div className="mispedidos-layout">
      <NavbarAlumno cantidadCarrito={cantidadTotal} onAbrirCarrito={() => setMostrarCarrito(true)} />

      <main className="mispedidos-contenido">
        <div className="mispedidos-header">
          <img src={iconPedido} alt="Mis Pedidos" className="mispedidos-titulo-icono" />
          <h1 className="mispedidos-titulo">Mis Pedidos</h1>
        </div>

        {/* Pestañas de filtro: recorre el array TABS y arma un botón por cada una */}
        <div className="mispedidos-tabs">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`mispedidos-tab-btn ${tabActiva === tab.key ? 'activo' : ''}`}
              onClick={() => setTabActiva(tab.key)}
            >
              {tab.label}
              {/* El numerito solo se muestra si hay al menos 1 pedido de ese tipo */}
              {contadores[tab.key] > 0 && (
                <span className="mispedidos-tab-contador">{contadores[tab.key]}</span>
              )}
            </button>
          ))}
        </div>

        {/* Si no hay pedidos para mostrar (con el filtro actual), se muestra un mensaje invitando a ir al catálogo.
            Si hay pedidos, se muestra la lista según la pestaña activa */}
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
            {/* En la pestaña "Todos" se muestran primero los pedidos activos (pendiente/listo) */}
            {tabActiva === "todos" && activos.length > 0 && (
              <section className="mispedidos-seccion">
                {activos.map(p => (
                  <TarjetaPedido
                    key={p.id}
                    pedido={p}
                  />
                ))}
              </section>
            )}

            {/* En cualquier otra pestaña (Pendiente/Listo/Entregado), se muestran solo los pedidos ya filtrados */}
            {tabActiva !== 'todos' && (
              <section className="mispedidos-seccion">
                {pedidosFiltrados.map(p => <TarjetaPedido key={p.id} pedido={p} />)}
              </section>
            )}

            {/* El historial de entregados solo aparece en la pestaña "Todos", y solo si hay al menos uno */}
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

      {/* BOTÓN FLOTANTE CARRITO — siempre visible si hay items, incluso estando en esta página (no solo en Catálogo) */}
      {cantidadTotal > 0 && (
        <button className="catalogo-carrito-flotante" onClick={() => setMostrarCarrito(true)}>
          <img src={iconCarrito} alt="Carrito" />
          <span className="catalogo-carrito-badge">{cantidadTotal}</span>
          <span className="catalogo-carrito-total">Ver pedido · ${totalCarrito.toLocaleString('es-AR')}</span>
        </button>
      )}

      {/* Modal del carrito — reutiliza el mismo componente de Catalogo, para no tener dos carritos distintos en la app */}
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