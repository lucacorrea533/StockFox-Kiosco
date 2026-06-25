/* Este archivo es la página principal para la gestión de productos. Acá se muestra una tabla con todos los productos disponibles, junto con opciones para agregar, editar y eliminar productos. También incluye un buscador y un filtro por categorías para facilitar la navegación. Además, se implementa un sistema de historial de precios para cada producto, permitiendo a la encargada ver cómo han cambiado los precios a lo largo del tiempo. */

import { useState, useRef } from 'react'
import NavbarEncargada from '../components/NavbarEncargada'
import TablaProductos from '../components/TablaProductos'
import MenuDelDia from '../components/MenuDelDia'
import FormAgregarProducto from '../components/FormAgregarProducto'
import iconBuscador from '../assets/icons/BuscadorBoton.png'
import '../styles/GestionProductos.css'

// Las fotos de producto ya NO se importan desde assets: viven en /public/images
// y se referencian como string (foto_url), igual que va a llegar desde la API
// de Backend (mismo campo que en la tabla PRODUCTOS de la base de datos).
const PRODUCTOS_INICIALES = [
  { id: 1, nombre: 'Pitusas Chocolate',  categoria: 'Snack',          precio: 2000, stock: 15,   foto_url: '/images/PitusasChocolate.png',     historial: [] },
  { id: 2, nombre: 'Coca Cola',          categoria: 'Bebidas',        precio: 2800, stock: 8,    foto_url: '/images/CocaCola.webp',            historial: [] },
  { id: 3, nombre: 'Alfajor Jorgito',    categoria: 'Alfajores',      precio: 1800, stock: 10,   foto_url: '/images/AlfajorJorgitoNegro.jpeg', historial: [] },
  { id: 4, nombre: 'Chupetin Evolution', categoria: 'Dulces',         precio: 500,  stock: 25,   foto_url: '/images/ChupetinEvolutionExtreme.png', historial: [] },
  { id: 5, nombre: 'Medialunas',         categoria: 'Bocados',        precio: 1500, stock: 6,    foto_url: '/images/Medialunas.jpg',           historial: [] },
  { id: 6, nombre: 'Chocolatada',        categoria: 'Beb. Calientes', precio: 2500, stock: null, foto_url: '/images/ChocolatadaCaliente.webp', historial: [] },
]

const CATEGORIAS = ['Snack', 'Bebidas', 'Alfajores', 'Dulces', 'Bocados', 'Beb. Calientes', 'Servicios']

function GestionProductos() {
  const [productos, setProductos]               = useState(PRODUCTOS_INICIALES)
  const [busqueda, setBusqueda]                 = useState('')
  const [categoriaFiltro, setCategoriaFiltro]   = useState('')
  const [mostrarForm, setMostrarForm]           = useState(false)
  const [productoEditando, setProductoEditando] = useState(null)

  // ── Toasts ───────────────────────────────────────────────────────────────
  const [productoEliminado, setProductoEliminado] = useState(null)
  const [toastEdicion, setToastEdicion]           = useState(null) // { nombre, cambioPrecio }
  const toastElimTimeout = useRef(null)
  const toastEditTimeout = useRef(null)

  const productosFiltrados = productos.filter((p) => {
    const coincideNombre    = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria = categoriaFiltro ? p.categoria === categoriaFiltro : true
    return coincideNombre && coincideCategoria
  })

  function handleAgregar(nuevoProducto) {
    setProductos((prev) => [
      ...prev,
      { ...nuevoProducto, id: Date.now(), historial: [] },
    ])
    setMostrarForm(false)
  }

  function handleEditar(productoActualizado) {
    let cambioPrecio = false

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

    setProductoEditando(null)
    setMostrarForm(false)

    // Toast de confirmación de edición
    setToastEdicion({ nombre: productoActualizado.nombre, cambioPrecio })
    if (toastEditTimeout.current) clearTimeout(toastEditTimeout.current)
    toastEditTimeout.current = setTimeout(() => setToastEdicion(null), 3500)
  }

  function handleEliminar(id) {
    const producto = productos.find((p) => p.id === id)
    setProductos((prev) => prev.filter((p) => p.id !== id))

    setProductoEliminado(producto)
    if (toastElimTimeout.current) clearTimeout(toastElimTimeout.current)
    toastElimTimeout.current = setTimeout(() => setProductoEliminado(null), 5000)
  }

  function handleDeshacer() {
    if (!productoEliminado) return
    setProductos((prev) => [...prev, productoEliminado])
    setProductoEliminado(null)
    clearTimeout(toastElimTimeout.current)
  }

  function abrirEdicion(producto) {
    setProductoEditando(producto)
    setMostrarForm(true)
  }

  function cerrarForm() {
    setProductoEditando(null)
    setMostrarForm(false)
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
            {CATEGORIAS.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <TablaProductos
          productos={productosFiltrados}
          onEditar={abrirEdicion}
          onEliminar={handleEliminar}
        />

        {!mostrarForm ? (
          <button className="gp-btn-agregar" onClick={() => setMostrarForm(true)}>
            + Agregar Producto
          </button>
        ) : (
          <FormAgregarProducto
            categorias={CATEGORIAS}
            productoEditar={productoEditando}
            onGuardar={productoEditando ? handleEditar : handleAgregar}
            onCancelar={cerrarForm}
          />
        )}

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