/* Este archivo es la página principal para la gestión de productos de la Encargada. 
   Acá se muestra una tabla con todos los productos disponibles, junto con opciones para agregar, 
   editar y eliminar productos. También incluye un buscador en tiempo real y un filtro por categorías 
   para facilitar la navegación. Además, se implementa un sistema de historial de precios para cada producto, 
   permitiendo a la encargada ver cómo han cambiado los precios a lo largo del tiempo. */

import { useState, useEffect, useRef } from 'react'
import NavbarEncargada from '../components/NavbarEncargada'
import TablaProductos from '../components/TablaProductos'
import MenuDelDia from '../components/MenuDelDia'
import iconBuscador from '../assets/icons/BuscadorBoton.png'
import '../styles/GestionProductos.css'
import api from "../api/axiosClient"
import { authFetch } from "../api/authFetch"

// Las fotos de producto ya NO se importan desde assets: viven en /public/images
// y se referencian como string (foto_url), igual que va a llegar desde la API
// de Backend (mismo campo que en la tabla PRODUCTOS de la base de datos).

function GestionProductos() {
  /* ── Estados de la aplicación ─────────────────────────────────────────────────────────────── */
  
  /* productos: Almacena la lista de productos que se traen del backend y se renderizan en la tabla */
  const [productos, setProductos] = useState([])
  
  /* categorias: Guarda el listado de categorías disponibles (ej: Bebidas, Sándwiches) desde la base de datos */
  const [categorias, setCategorias] = useState([])
  
  /* busqueda: Texto que el usuario ingresa en el input para filtrar productos por su nombre */
  const [busqueda, setBusqueda] = useState('')
  
  /* categoriaFiltro: Categoría seleccionada en el menú desplegable (select) para filtrar la tabla */
  const [categoriaFiltro, setCategoriaFiltro] = useState('')
  
  /* mostrarFormAgregar: Booleano que controla si se visualiza o no el formulario para cargar un nuevo producto */
  const [mostrarFormAgregar, setMostrarFormAgregar] = useState(false)

  /* ── Toasts (Notificaciones flotantes) ─────────────────────────────────────────────────── */
  
  /* productoEliminado: Guarda temporalmente el producto recién borrado para poder recuperarlo si se toca "Deshacer" */
  const [productoEliminado, setProductoEliminado] = useState(null)
  
  /* toastEdicion: Estado para manejar el cartel que confirma que un producto fue editado con éxito */
  const [toastEdicion, setToastEdicion] = useState(null) // Estructura esperada: { nombre, cambioPrecio }
  
  /* Referencias para almacenar los identificadores de los timeouts y poder limpiarlos si se realizan acciones rápidas */
  const toastElimTimeout = useRef(null)
  const toastEditTimeout = useRef(null)

  /* ── Efectos (useEffect) ────────────────────────────────────────────────────────────────── */

  /* Primer useEffect: Se ejecuta una sola vez al montar el componente. 
     Trae los productos de la API usando authFetch (petición autenticada con token) */
  useEffect(() => {
    authFetch("http://127.0.0.1:8000/api/productos/")
      .then(response => response.json())
      .then(data => {
        console.log(data)
        
        data.forEach(producto => {
          console.log(producto.nombre, "=>", producto.categoria)
        })

        /* Mapeamos y formateamos los campos que vienen de Django para adaptarlos a la estructura del frontend */
        const productosFormateados = data.map(producto => ({
          id: producto.id_producto,
          nombre: producto.nombre,
          categoria: producto.categoria,
          precio: Number(producto.precio_actual), // Nos aseguramos de que sea un número flotante/entero
          stock: producto.stock,
          stock_minimo: producto.stock_minimo,
          foto_url: producto.foto_url,
          historial: [] // Inicialmente el historial se define vacío en esta carga local
        }))

        setProductos(productosFormateados)
      })
      .catch(error => {
        console.error(error)
      })
  }, [])

  /* Segundo useEffect: Se ejecuta una sola vez al montar el componente.
     Trae las categorías de productos disponibles desde la base de datos de Django */
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/categorias/")
      .then(response => response.json())
      .then(data => {
        console.log(data)
        setCategorias(data) // Actualiza el estado de categorías con la respuesta del servidor
      })
      .catch(error => {
        console.error(error)
      })
  }, [])

  /* ── Filtrado en tiempo real ───────────────────────────────────────────────────────────── */
  
  /* Filtra la lista original de productos combinando el buscador por nombre y el filtro de categoría select */
  const productosFiltrados = productos.filter((p) => {
    const coincideNombre = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria = categoriaFiltro ? p.categoria === categoriaFiltro : true
    return coincideNombre && coincideCategoria
  })

  /* ── Handlers (Manejadores de eventos y lógica con la API) ──────────────────────────────── */

  /* handleAgregar: Envía un nuevo producto cargado en el frontend hacia la base de datos */
  async function handleAgregar(nuevoProducto) {
    // Buscar la categoría seleccionada en la lista para obtener su id_categoria correspondiente
    const categoriaSeleccionada = categorias.find(
      categoria => categoria.nombre === nuevoProducto.categoria
    )

    // Armar el objeto plano que la API de Django espera recibir
    const productoBackend = {
      nombre: nuevoProducto.nombre,
      precio_actual: nuevoProducto.precio,
      stock: nuevoProducto.stock,
      stock_minimo: nuevoProducto.stock_minimo,
      foto_url: nuevoProducto.foto_url,
      id_categoria: categoriaSeleccionada.id_categoria,
      disponible: 1 // Por defecto al crearse se define como disponible (1)
    }

    try {
      console.log("Producto que se envía:")
      console.log(productoBackend)

      // Se realiza la petición POST a la API utilizando la instancia configurada de axios
      const response = await api.post("productos/crear/", productoBackend)

      console.log("Respuesta del servidor:")
      console.log(response.data)

      // Agregamos el producto recién creado al estado local para que se muestre en la tabla inmediatamente
      setProductos(prev => [
        ...prev,
        {
          id: response.data.id_producto,
          nombre: response.data.nombre,
          categoria: nuevoProducto.categoria, // Guardamos el nombre legible de la categoría para el frontend
          precio: Number(response.data.precio_actual),
          stock: response.data.stock,
          stock_minimo: response.data.stock_minimo,
          foto_url: response.data.foto_url,
          historial: []
        }
      ])
    }
    catch (error) {
      console.error("ERROR COMPLETO:", error)
      console.error("RESPUESTA:", error.response)
      console.error("DATOS:", error.response.data)
    }
  }

  /* handleEditar: Recibe los campos modificados de un producto, actualiza la API y recalcula el historial si cambió el precio */
  async function handleEditar(productoActualizado) {
    let cambioPrecio = false

    // Buscar la categoría seleccionada en la lista para obtener su ID numérico
    const categoriaSeleccionada = categorias.find(
      categoria => categoria.nombre === productoActualizado.categoria
    )

    // Armar el JSON de actualización con la estructura del modelo de la base de datos
    const productoBackend = {
      nombre: productoActualizado.nombre,
      precio_actual: productoActualizado.precio,
      stock: productoActualizado.stock,
      stock_minimo: productoActualizado.stock_minimo,
      foto_url: productoActualizado.foto_url,
      id_categoria: categoriaSeleccionada.id_categoria,
      // Si el stock actual es mayor a 0, queda disponible (1); si es 0, no disponible (0)
      disponible: productoActualizado.stock > 0 ? 1 : 0
    }

    try {
      // Envía la petición PUT a la API con el ID del producto correspondiente
      await api.put(`productos/editar/${productoActualizado.id}/`, productoBackend)
    }
    catch (error) {
      console.error(error)
      return // Si hay un error de red o servidor, frena la ejecución para no alterar el estado local de forma inconsistente
    }

    // Si la API respondió de manera exitosa, actualizamos el estado local
    setProductos((prev) =>
      prev.map((p) => {
        if (p.id !== productoActualizado.id) return p // Si no es el producto editado, lo deja intacto

        // Construimos el historial a partir del producto existente en el estado local
        const historialActualizado = [...(p.historial || [])]

        const precioAnterior = Number(p.precio)
        const precioNuevo = Number(productoActualizado.precio)

        // Verificamos si hubo un cambio real en el precio para agregarlo al historial de variaciones
        if (precioAnterior !== precioNuevo) {
          cambioPrecio = true
          historialActualizado.push({
            fecha: new Date().toLocaleDateString('es-AR'),
            hora: new Date().toLocaleTimeString('es-AR', {
              hour: '2-digit',
              minute: '2-digit',
            }),
            precioAnterior: precioAnterior,
            precioNuevo: precioNuevo,
          })
        }

        // Retornamos el nuevo objeto utilizando el operador Spread para preservar campos futuros
        return {
          ...p,                     // Preserva todos los campos originales del producto
          ...productoActualizado,   // Sobreescribe con los nuevos valores validados del formulario
          historial: historialActualizado, // Asigna el historial con el nuevo registro de cambio de precio
        }
      })
    )

    // Disparar el Toast (cartelera informativa) de confirmación de edición exitosa
    setToastEdicion({ nombre: productoActualizado.nombre, cambioPrecio })
    
    // Limpiamos timeouts anteriores para evitar que se pisen si el usuario edita muy rápido
    if (toastEditTimeout.current) clearTimeout(toastEditTimeout.current)
    
    // Hacemos desaparecer el cartel de edición a los 3.5 segundos
    toastEditTimeout.current = setTimeout(() => setToastEdicion(null), 3500)
  }

  /* handleEliminar: Hace el borrado lógico/físico en la base de datos y quita el producto del frontend */
  async function handleEliminar(id) {
    try {
      // Petición DELETE a la API de Django
      await api.delete(`productos/eliminar/${id}/`)

      // Encontramos el producto antes de borrarlo del frontend para guardarlo en la papelera temporal (deshacer)
      const producto = productos.find((p) => p.id === id)

      // Removemos el producto del estado local filtrando por ID
      setProductos((prev) =>
        prev.filter((p) => p.id !== id)
      )

      // Guardamos el elemento eliminado en el estado para darle la posibilidad de recuperarlo en el Toast
      setProductoEliminado(producto)

      // Reiniciamos los temporizadores del cartel de borrado
      if (toastElimTimeout.current) {
        clearTimeout(toastElimTimeout.current)
      }

      // El cartel desaparecerá y limpiará la papelera temporal pasados los 5 segundos
      toastElimTimeout.current = setTimeout(
        () => setProductoEliminado(null),
        5000
      )

    } catch (error) {
      console.error("ERROR AL ELIMINAR:", error)
    }
  }

  /* handleDeshacer: Permite recuperar el último producto eliminado volviéndolo a crear en la base de datos */
  async function handleDeshacer() {
    if (!productoEliminado) return

    // Obtenemos el ID de la categoría del producto que queremos restaurar
    const categoriaSeleccionada = categorias.find(
      categoria => categoria.nombre === productoEliminado.categoria
    )

    // Reconstruimos el objeto que necesita Django para darlo de alta nuevamente
    const productoBackend = {
      nombre: productoEliminado.nombre,
      precio_actual: productoEliminado.precio,
      stock: productoEliminado.stock,
      stock_minimo: productoEliminado.stock_minimo,
      foto_url: productoEliminado.foto_url,
      id_categoria: categoriaSeleccionada.id_categoria,
      disponible: 1
    }

    try {
      // Re-creamos el producto mediante un POST a la API
      const response = await api.post("productos/crear/", productoBackend)

      // Lo insertamos nuevamente en nuestro array de productos local para que vuelva a figurar en la lista
      setProductos(prev => [
        ...prev,
        {
          id: response.data.id_producto,
          nombre: response.data.nombre,
          categoria: productoEliminado.categoria,
          precio: Number(response.data.precio_actual),
          stock: response.data.stock,
          stock_minimo: response.data.stock_minimo,
          foto_url: response.data.foto_url,
          historial: productoEliminado.historial || [] // Preservamos su historial de precios anterior si tenía
        }
      ])

      // Limpiamos el estado de eliminación para ocultar el cartel flotante
      setProductoEliminado(null)
      clearTimeout(toastElimTimeout.current)
    }
    catch (error) {
      console.error("ERROR AL DESHACER:", error)
      console.log(error.response.data)
    }
  }

  /* ── Renderizado del Componente ────────────────────────────────────────────────────────── */
  return (
    <div style={{ display: 'flex' }}>
      {/* Barra de navegación lateral exclusiva de la Encargada */}
      <NavbarEncargada />

      {/* Contenedor principal de la sección */}
      <main className="gestion-productos">
        
        <h1 className="gp-titulo">Gestión de Productos</h1>

        {/* Barra superior que agrupa la caja de búsqueda y el selector de filtros de categoría */}
        <div className="gp-barra">
          <div className="gp-buscador">
            <img src={iconBuscador} alt="Buscar" className="gp-buscador-icono" />
            <input
              type="text"
              placeholder="Buscar producto"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)} // Actualiza el estado al escribir
            />
          </div>
          
          <select
            className="gp-select-categoria"
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)} // Actualiza la categoría para filtrar la tabla
          >
            <option value="">Todos</option>
            {/* Iteramos sobre el listado de categorías traídas del backend para popular las opciones */}
            {categorias.map((cat) => (
              <option
                key={cat.id_categoria}
                value={cat.nombre}
              >
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Componente secundario: Renderiza la tabla con los datos filtrados y le pasa las funciones controladoras */}
        <TablaProductos
          productos={productosFiltrados}
          categorias={categorias}
          onGuardarEdicion={handleEditar}
          onAgregar={handleAgregar}
          onEliminar={handleEliminar}
        />

        {/* Componente secundario: Muestra o permite setear los menús destacados del día */}
        <MenuDelDia />

      </main>

      {/* Toast de edición: Notificación temporal que confirma la modificación exitosa de un producto */}
      {toastEdicion && (
        <div className="gp-toast gp-toast--edicion">
          <span>
            "{toastEdicion.nombre}" actualizado
            {/* Si además se detectó variación de precio, mostramos una aclaración del registro histórico */}
            {toastEdicion.cambioPrecio && (
              <span className="gp-toast-precio"> · precio registrado en historial</span>
            )}
          </span>
        </div>
      )}

      {/* Toast de eliminación: Muestra confirmación de borrado y ofrece la opción interactiva de "Deshacer" */}
      {productoEliminado && (
        <div className="gp-toast">
          <span>"{productoEliminado.nombre}" eliminado</span>
          <button className="gp-toast-btn" onClick={handleDeshacer}>Deshacer</button>
        </div>
      )}

    </div>
  )
}

export default GestionProductos