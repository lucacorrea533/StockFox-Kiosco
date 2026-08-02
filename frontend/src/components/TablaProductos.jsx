/* Este componente muestra una tabla con los productos disponibles, permitiendo editarlos,
   eliminarlos, activar/desactivar (sin perder historial) y ver su historial de precios.
   Incluye paginación (10 productos por página) para que la tabla no ocupe tanto lugar. */

import { useState, useEffect } from 'react'
import iconHistorial from '../assets/icons/HistorialBoton.png'
import iconEditar    from '../assets/icons/EditarBoton.png'
import iconEliminar  from '../assets/icons/EliminarBoton.png'
import '../styles/GestionProductos.css'
import FormAgregarProducto from '../components/FormAgregarProducto'

const PRODUCTOS_POR_PAGINA = 10

// Componente auxiliar que muestra la foto del producto, o un placeholder con una "✕" si no tiene foto cargada
function FotoProducto({ foto, nombre }) {
  if (foto) return <img className="tp-foto" src={foto} alt={nombre} />
  return <div className="tp-foto tp-foto--placeholder">✕</div>
}

// ── Modal confirmar eliminación ───────────────────────────────────────────────
function ModalEliminar({ nombre, onConfirmar, onCancelar }) {
  useEffect(() => {
    function handleEsc(e) { if (e.key === 'Escape') onCancelar() }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onCancelar])

  return (
    <div className="modal-overlay">
      <div className="modal-caja">
        <p className="modal-texto">
          ¿Estás seguro que querés eliminar <strong>{nombre}</strong>?
        </p>
        <p className="modal-subtexto">
          Esto borra el producto para siempre, junto con su historial. Si preferís conservarlo, usá "Desactivar" en su lugar.
        </p>
        <div className="modal-botones">
          <button className="modal-btn modal-btn--no" onClick={onCancelar}>No</button>
          <button className="modal-btn modal-btn--si" onClick={onConfirmar}>Sí, eliminar</button>
        </div>
      </div>
    </div>
  )
}

// ── Modal confirmar desactivación/reactivación ────────────────────────────────
// A diferencia de eliminar, esto no es destructivo (se puede revertir en cualquier
// momento tocando el mismo botón), así que la confirmación es más liviana.
function ModalToggleActivo({ nombre, activando, onConfirmar, onCancelar }) {
  useEffect(() => {
    function handleEsc(e) { if (e.key === 'Escape') onCancelar() }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onCancelar])

  return (
    <div className="modal-overlay">
      <div className="modal-caja">
        <p className="modal-texto">
          {activando
            ? <>¿Reactivar <strong>{nombre}</strong>? Va a volver a aparecer en el catálogo.</>
            : <>¿Desactivar <strong>{nombre}</strong>? Se oculta del catálogo, pero su historial de precios y ventas se conserva.</>
          }
        </p>
        <div className="modal-botones">
          <button className="modal-btn modal-btn--no" onClick={onCancelar}>No</button>
          <button className="modal-btn modal-btn--si" onClick={onConfirmar}>
            {activando ? 'Sí, reactivar' : 'Sí, desactivar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Modal historial de precios ────────────────────────────────────────────────
function ModalHistorial({ producto, onCerrar }) {
  const historial = producto?.historial || []

  useEffect(() => {
    function handleEsc(e) { if (e.key === 'Escape') onCerrar() }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onCerrar])

  if (!producto) return null

  return (
    <div className="modal-overlay">
      <div className="modal-caja modal-historial-caja">
        <h3 className="modal-historial-titulo">Historial de precios</h3>
        <p className="modal-historial-producto">{producto.nombre}</p>

        <p className="modal-historial-precio-actual">
          Precio actual:{' '}
          <strong>${Number(producto.precio).toLocaleString('es-AR')}</strong>
        </p>

        {historial.length === 0 ? (
          <p className="modal-historial-vacio">
            No hay cambios de precio registrados todavía.<br />
            Editá el precio del producto para que quede registrado acá.
          </p>
        ) : (
          <div className="modal-historial-tabla">
            <div className="modal-historial-encabezado">
              <span>Fecha</span>
              <span>Hora</span>
              <span>Anterior</span>
              <span>Nuevo</span>
              <span>Diferencia</span>
            </div>
            {[...historial].reverse().map((entry, i) => {
              const diff = Number(entry.precioNuevo) - Number(entry.precioAnterior)
              const esSuba = diff > 0
              return (
                <div key={i} className="modal-historial-fila">
                  <span>{entry.fecha}</span>
                  <span>{entry.hora}</span>
                  <span className="mh-precio-viejo">
                    ${Number(entry.precioAnterior).toLocaleString('es-AR')}
                  </span>
                  <span className="mh-precio-nuevo">
                    ${Number(entry.precioNuevo).toLocaleString('es-AR')}
                  </span>
                  <span className={esSuba ? 'mh-diff mh-diff--suba' : 'mh-diff mh-diff--baja'}>
                    {esSuba ? '+' : ''}${Math.abs(diff).toLocaleString('es-AR')}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        <div className="modal-botones" style={{ marginTop: '1.5rem' }}>
          <button className="modal-btn modal-btn--no" onClick={onCerrar}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Tabla principal ───────────────────────────────────────────────────────────
function TablaProductos({
  productos,
  categorias,
  onEliminar,
  onGuardarEdicion,
  onAgregar,
  onToggleActivo
}) {
  const [productoAEliminar, setProductoAEliminar] = useState(null)
  const [productoAToggle, setProductoAToggle] = useState(null) // Producto pendiente de activar/desactivar
  const [productoEditando, setProductoEditando] = useState(null)
  const [mostrarAgregar, setMostrarAgregar] = useState(false)
  const [paginaActual, setPaginaActual] = useState(1) // Página actual de la tabla (paginación)

  const [historialId, setHistorialId] = useState(null)
  const productoHistorial = historialId !== null
    ? productos.find((p) => p.id === historialId) ?? null
    : null

  // Si cambia el filtro/búsqueda desde afuera y la página actual queda "fuera de rango"
  // (ej: estabas en la página 3 y ahora el resultado filtrado solo tiene 1 página),
  // volvemos a la página 1 automáticamente para no mostrar una tabla vacía por error.
  const totalPaginas = Math.max(1, Math.ceil(productos.length / PRODUCTOS_POR_PAGINA))
  useEffect(() => {
    if (paginaActual > totalPaginas) setPaginaActual(1)
  }, [productos.length, totalPaginas, paginaActual])

  function handleConfirmarEliminar() {
    onEliminar(productoAEliminar.id)
    setProductoAEliminar(null)
  }

  function handleConfirmarToggle() {
    onToggleActivo(productoAToggle.id, productoAToggle.activo)
    setProductoAToggle(null)
  }

  if (productos.length === 0) {
    return <p className="tp-vacia">No se encontraron productos con ese criterio.</p>
  }

  // Recorte de la página actual: solo se renderizan los 10 productos que corresponden
  const inicio = (paginaActual - 1) * PRODUCTOS_POR_PAGINA
  const productosPagina = productos.slice(inicio, inicio + PRODUCTOS_POR_PAGINA)

  return (
    <>
      <div className="tp-wrapper">
        <div className="tp-encabezado">
          <span>Foto</span>
          <span>Nombre</span>
          <span>Categoría</span>
          <span>Precio</span>
          <span>Stock</span>
          <span>Acciones</span>
        </div>

        {productosPagina.map((producto) => (
          <div key={producto.id}>

            {/* Fila grisada si el producto está desactivado, para diferenciarla sin ocultarla */}
            <div className={`tp-fila ${producto.activo === false ? 'tp-fila--inactivo' : ''}`}>
              <FotoProducto foto={producto.foto_url} nombre={producto.nombre} />
              <span className="tp-nombre">
                {producto.nombre}
                {producto.activo === false && <span className="tp-badge-inactivo">Desactivado</span>}
              </span>
              <span>{producto.categoria}</span>
              <span>${Number(producto.precio).toLocaleString('es-AR')}</span>
              <span className={
                producto.stock !== null && producto.stock <= 5
                  ? 'tp-stock tp-stock--bajo'
                  : 'tp-stock'
              }>
                {producto.stock === null ? '-' : producto.stock}
              </span>
              <div className="tp-acciones">
                <button
                  className="tp-btn tp-btn--editar"
                  onClick={() => setProductoEditando(producto)}
                  title="Editar"
                >
                  <img src={iconEditar} alt="Editar" className="tp-btn-icono" />
                </button>
                <button
                  className={`tp-btn ${producto.activo === false ? 'tp-btn--reactivar' : 'tp-btn--desactivar'}`}
                  onClick={() => setProductoAToggle(producto)}
                  title={producto.activo === false ? 'Reactivar' : 'Desactivar'}
                >
                  {producto.activo === false ? '↺' : '⏻'}
                </button>
                <button
                  className="tp-btn tp-btn--eliminar"
                  onClick={() => setProductoAEliminar(producto)}
                  title="Eliminar definitivamente"
                >
                  <img src={iconEliminar} alt="Eliminar" className="tp-btn-icono" />
                </button>
                <button
                  className="tp-btn tp-btn--historial"
                  onClick={() => setHistorialId(producto.id)}
                  title="Ver historial de precios"
                >
                  <img src={iconHistorial} alt="Historial" className="tp-btn-icono" />
                </button>
              </div>
            </div>

            {productoEditando?.id === producto.id && (
              <FormAgregarProducto
                categorias={categorias}
                productoEditar={productoEditando}
                onGuardar={(productoActualizado) => {
                  onGuardarEdicion(productoActualizado)
                  setProductoEditando(null)
                }}
                onCancelar={() => setProductoEditando(null)}
              />
            )}

          </div>
        ))}

      </div>

      {/* Paginación: solo se muestra si hay más de una página */}
      {totalPaginas > 1 && (
        <div className="tp-paginacion">
          <button
            className="tp-pagina-btn"
            onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
            disabled={paginaActual === 1}
          >
            ‹
          </button>

          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              className={`tp-pagina-btn ${num === paginaActual ? 'tp-pagina-btn--activa' : ''}`}
              onClick={() => setPaginaActual(num)}
            >
              {num}
            </button>
          ))}

          <button
            className="tp-pagina-btn"
            onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
            disabled={paginaActual === totalPaginas}
          >
            ›
          </button>
        </div>
      )}

      <button
        className="gp-btn-agregar"
        onClick={() => setMostrarAgregar(true)}
      >
        + Agregar Producto
      </button>

      {mostrarAgregar && (
        <FormAgregarProducto
          categorias={categorias}
          onGuardar={(nuevoProducto) => {
            onAgregar(nuevoProducto)
            setMostrarAgregar(false)
          }}
          onCancelar={() => setMostrarAgregar(false)}
        />
      )}

      {productoAEliminar && (
        <ModalEliminar
          nombre={productoAEliminar.nombre}
          onConfirmar={handleConfirmarEliminar}
          onCancelar={() => setProductoAEliminar(null)}
        />
      )}

      {productoAToggle && (
        <ModalToggleActivo
          nombre={productoAToggle.nombre}
          activando={productoAToggle.activo === false}
          onConfirmar={handleConfirmarToggle}
          onCancelar={() => setProductoAToggle(null)}
        />
      )}

      {productoHistorial && (
        <ModalHistorial
          producto={productoHistorial}
          onCerrar={() => setHistorialId(null)}
        />
      )}
    </>
  )
}

export default TablaProductos