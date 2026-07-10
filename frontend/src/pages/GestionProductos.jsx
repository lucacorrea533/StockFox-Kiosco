/* Este archivo es la página principal para la gestión de productos. Acá se muestra una tabla con todos los productos disponibles, junto con opciones para agregar, editar y eliminar productos. También incluye un buscador y un filtro por categorías para facilitar la navegación. Además, se implementa un sistema de historial de precios para cada producto, permitiendo a la encargada ver cómo han cambiado los precios a lo largo del tiempo. */

import { useState, useEffect, useRef } from 'react'
import NavbarEncargada from '../components/NavbarEncargada'
import TablaProductos from '../components/TablaProductos'
import MenuDelDia from '../components/MenuDelDia'
import iconBuscador from '../assets/icons/BuscadorBoton.png'
import '../styles/GestionProductos.css'
import axios from "axios"

// Las fotos de producto ya NO se importan desde assets: viven en /public/images
// y se referencian como string (foto_url), igual que va a llegar desde la API
// de Backend (mismo campo que en la tabla PRODUCTOS de la base de datos).


function GestionProductos() {
  const [productos, setProductos]               = useState([])
  const [categorias, setCategorias]             = useState([])
  const [busqueda, setBusqueda]                 = useState('')
  const [categoriaFiltro, setCategoriaFiltro]   = useState('')
  const [mostrarFormAgregar, setMostrarFormAgregar] = useState(false)

  // ── Toasts ───────────────────────────────────────────────────────────────
  const [productoEliminado, setProductoEliminado] = useState(null)
  const [toastEdicion, setToastEdicion]           = useState(null) // { nombre, cambioPrecio }
  const toastElimTimeout = useRef(null)
  const toastEditTimeout = useRef(null)

useEffect(() => {

  fetch("http://127.0.0.1:8000/api/productos/")
    .then(response => response.json())
    .then(data => {

      console.log(data)

      data.forEach(producto => {
        console.log(producto.nombre, "=>", producto.categoria)
      })

      const productosFormateados = data.map(producto => ({

        id: producto.id_producto,

        nombre: producto.nombre,

        categoria: producto.categoria,

        precio: Number(producto.precio_actual),

        stock: producto.stock,

        stock_minimo: producto.stock_minimo,

        foto_url: producto.foto_url,

        historial: []

      }))

      setProductos(productosFormateados)

    })
    .catch(error => {
      console.error(error)
    })

}, [])

useEffect(() => {

  fetch("http://127.0.0.1:8000/api/categorias/")
    .then(response => response.json())
    .then(data => {

      console.log(data)

      setCategorias(data)

    })
    .catch(error => {
      console.error(error)
    })

}, [])

  const productosFiltrados = productos.filter((p) => {
    const coincideNombre    = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria = categoriaFiltro ? p.categoria === categoriaFiltro : true
    return coincideNombre && coincideCategoria
  })

async function handleAgregar(nuevoProducto) {

  // Buscar la categoría seleccionada para obtener su ID
  const categoriaSeleccionada = categorias.find(
    categoria => categoria.nombre === nuevoProducto.categoria
  )

  // Armar el objeto que espera Django
  const productoBackend = {

    nombre: nuevoProducto.nombre,

    precio_actual: nuevoProducto.precio,

    stock: nuevoProducto.stock,

    stock_minimo: nuevoProducto.stock_minimo,

    foto_url: nuevoProducto.foto_url,

    id_categoria: categoriaSeleccionada.id_categoria,

    disponible: 1

  }

  try {

    console.log("Producto que se envía:")
    console.log(productoBackend)

    const response = await axios.post(
      "http://127.0.0.1:8000/api/productos/crear/",
      productoBackend
    )

    console.log("Respuesta del servidor:")
    console.log(response.data)

    setProductos(prev => [

      ...prev,

      {

        id: response.data.id_producto,

        nombre: response.data.nombre,

        categoria: nuevoProducto.categoria,

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

  async function handleEditar(productoActualizado) {
    let cambioPrecio = false

    // Buscar la categoría seleccionada
const categoriaSeleccionada = categorias.find(
  categoria => categoria.nombre === productoActualizado.categoria
)

// Objeto que espera Django
const productoBackend = {

  nombre: productoActualizado.nombre,

  precio_actual: productoActualizado.precio,

  stock: productoActualizado.stock,

  stock_minimo: productoActualizado.stock_minimo,

  foto_url: productoActualizado.foto_url,

  id_categoria: categoriaSeleccionada.id_categoria,

  disponible: productoActualizado.stock > 0 ? 1 : 0

}

try {

  await axios.put(

    `http://127.0.0.1:8000/api/productos/editar/${productoActualizado.id}/`,

    productoBackend

  )

}

catch (error) {

  console.error(error)

  return

}
    setProductos((prev) =>
      prev.map((p) => {
        if (p.id !== productoActualizado.id) return p

        // Construimos el historial a partir del producto existente en el estado
        const historialActualizado = [...(p.historial || [])]

        const precioAnterior = Number(p.precio)
        const precioNuevo    = Number(productoActualizado.precio)

        if (precioAnterior !== precioNuevo) {
          cambioPrecio = true
          historialActualizado.push({
            fecha:          new Date().toLocaleDateString('es-AR'),
            hora:           new Date().toLocaleTimeString('es-AR', {
                              hour:   '2-digit',
                              minute: '2-digit',
                            }),
            precioAnterior: precioAnterior,
            precioNuevo:    precioNuevo,
          })
        }

        // Spread: primero el producto original (para preservar campos que el form
        // no edita, ej: cualquier campo extra futuro), luego los campos actualizados,
        // y finalmente el historial reconstruido — nunca se pierde.
        return {
          ...p,                    // preserva todos los campos originales
          ...productoActualizado,  // sobreescribe con los valores editados
          historial: historialActualizado, // siempre viene del estado, nunca del form
        }
      })
    )

    // Toast de confirmación de edición
    setToastEdicion({ nombre: productoActualizado.nombre, cambioPrecio })
    if (toastEditTimeout.current) clearTimeout(toastEditTimeout.current)
    toastEditTimeout.current = setTimeout(() => setToastEdicion(null), 3500)
  }

  async function handleEliminar(id) {

  try {

    await axios.delete(
      `http://127.0.0.1:8000/api/productos/eliminar/${id}/`
    )

    const producto = productos.find((p) => p.id === id)

    setProductos((prev) =>
      prev.filter((p) => p.id !== id)
    )

    setProductoEliminado(producto)

    if (toastElimTimeout.current) {
      clearTimeout(toastElimTimeout.current)
    }

    toastElimTimeout.current = setTimeout(
      () => setProductoEliminado(null),
      5000
    )

  } catch (error) {

    console.error("ERROR AL ELIMINAR:", error)

  }

}

  async function handleDeshacer() {

  if (!productoEliminado) return

  const categoriaSeleccionada = categorias.find(
    categoria => categoria.nombre === productoEliminado.categoria
  )

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

    const response = await axios.post(

      "http://127.0.0.1:8000/api/productos/crear/",

      productoBackend

    )

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

        historial: productoEliminado.historial || []

      }

    ])

    setProductoEliminado(null)

    clearTimeout(toastElimTimeout.current)

  }

  catch (error) {

  console.error("ERROR AL DESHACER:", error)
  console.log(error.response.data)

}

}


  return (
    <div style={{ display: 'flex' }}>
      <NavbarEncargada />

      <main className="gestion-productos">
        
        <h1 className="gp-titulo">Gestión de Productos</h1>

        <div className="gp-barra">
          <div className="gp-buscador">
            <img src={iconBuscador} alt="Buscar" className="gp-buscador-icono" />
            <input
              type="text"
              placeholder="Buscar producto"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <select
            className="gp-select-categoria"
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
          >
            <option value="">Todos</option>
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

        <TablaProductos
          productos={productosFiltrados}
          categorias={categorias}
          onGuardarEdicion={handleEditar}
          onAgregar={handleAgregar}
          onEliminar={handleEliminar}
        />

        <MenuDelDia />

      </main>

      {/* Toast edición — aparece 3.5 segundos después de guardar cambios */}
      {toastEdicion && (
        <div className="gp-toast gp-toast--edicion">
          <span>
            "{toastEdicion.nombre}" actualizado
            {toastEdicion.cambioPrecio && (
              <span className="gp-toast-precio"> · precio registrado en historial</span>
            )}
          </span>
        </div>
      )}

      {/* Toast eliminar — aparece 5 segundos después de eliminar */}
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