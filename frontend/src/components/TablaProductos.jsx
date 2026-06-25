/* Este componente muestra una tabla con los productos disponibles, permitiendo editarlos, eliminarlos y ver su historial de precios. */

import { useState, useEffect } from 'react'
import iconHistorial from '../assets/icons/HistorialBoton.png'
import iconEditar    from '../assets/icons/EditarBoton.png'
import iconEliminar  from '../assets/icons/EliminarBoton.png'
import '../styles/GestionProductos.css'

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
        <div className="modal-botones">
          <button className="modal-btn modal-btn--no" onClick={onCancelar}>No</button>
          <button className="modal-btn modal-btn--si" onClick={onConfirmar}>Sí</button>
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
            {/* Más reciente primero */}
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
function TablaProductos({ productos, onEditar, onEliminar }) {
  const [productoAEliminar, setProductoAEliminar] = useState(null)

  // Guardamos el ID para que siempre lea el producto actualizado desde la prop
  const [historialId, setHistorialId] = useState(null)
  const productoHistorial = historialId !== null
    ? productos.find((p) => p.id === historialId) ?? null
    : null

  function handleConfirmarEliminar() {
    onEliminar(productoAEliminar.id)
    setProductoAEliminar(null)
  }

  if (productos.length === 0) {
    return <p className="tp-vacia">No se encontraron productos con ese criterio.</p>
  }

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

        {productos.map((producto) => (
          <div key={producto.id} className="tp-fila">
            <FotoProducto foto={producto.foto_url} nombre={producto.nombre} />
            <span className="tp-nombre">{producto.nombre}</span>
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
                onClick={() => onEditar(producto)}
                title="Editar"
              >
                <img src={iconEditar} alt="Editar" className="tp-btn-icono" />
              </button>
              <button
                className="tp-btn tp-btn--eliminar"
                onClick={() => setProductoAEliminar(producto)}
                title="Eliminar"
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
        ))}
      </div>

      {productoAEliminar && (
        <ModalEliminar
          nombre={productoAEliminar.nombre}
          onConfirmar={handleConfirmarEliminar}
          onCancelar={() => setProductoAEliminar(null)}
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