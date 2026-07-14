/* Este componente muestra una tabla con los productos disponibles, permitiendo editarlos, eliminarlos y ver su historial de precios. */

// Hooks de React: useState para manejar estado local, useEffect para efectos secundarios (como escuchar teclas)
import { useState, useEffect } from 'react'
// Ícono del botón de ver historial de precios
import iconHistorial from '../assets/icons/HistorialBoton.png'
// Ícono del botón de editar
import iconEditar    from '../assets/icons/EditarBoton.png'
// Ícono del botón de eliminar
import iconEliminar  from '../assets/icons/EliminarBoton.png'
// Estilos compartidos con la vista de Gestión de Productos
import '../styles/GestionProductos.css'
// Formulario reutilizado tanto para agregar un producto nuevo como para editar uno existente
import FormAgregarProducto from '../components/FormAgregarProducto'

// Componente auxiliar que muestra la foto del producto, o un placeholder con una "✕" si no tiene foto cargada
function FotoProducto({ foto, nombre }) {
  if (foto) return <img className="tp-foto" src={foto} alt={nombre} />
  return <div className="tp-foto tp-foto--placeholder">✕</div>
}

// ── Modal confirmar eliminación ───────────────────────────────────────────────
// Modal que pide confirmación antes de eliminar un producto
function ModalEliminar({ nombre, onConfirmar, onCancelar }) {
  // Efecto que permite cerrar el modal presionando la tecla ESC
  useEffect(() => {
    function handleEsc(e) { if (e.key === 'Escape') onCancelar() }
    window.addEventListener('keydown', handleEsc)
    // Limpiamos el listener al desmontar el componente, para evitar fugas de memoria
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
// Modal que muestra el historial de cambios de precio de un producto en particular
function ModalHistorial({ producto, onCerrar }) {
  // Si el producto no tiene historial cargado, usamos un array vacío por defecto
  const historial = producto?.historial || []

  // Efecto que permite cerrar el modal presionando la tecla ESC
  useEffect(() => {
    function handleEsc(e) { if (e.key === 'Escape') onCerrar() }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onCerrar])

  // Si no hay producto seleccionado, no renderizamos nada
  if (!producto) return null

  return (
    <div className="modal-overlay">
      <div className="modal-caja modal-historial-caja">
        <h3 className="modal-historial-titulo">Historial de precios</h3>
        <p className="modal-historial-producto">{producto.nombre}</p>

        {/* Precio actual del producto, formateado con separador de miles */}
        <p className="modal-historial-precio-actual">
          Precio actual:{' '}
          <strong>${Number(producto.precio).toLocaleString('es-AR')}</strong>
        </p>

        {/* Si no hay cambios de precio registrados, mostramos un mensaje explicativo */}
        {historial.length === 0 ? (
          <p className="modal-historial-vacio">
            No hay cambios de precio registrados todavía.<br />
            Editá el precio del producto para que quede registrado acá.
          </p>
        ) : (
          // Si hay historial, mostramos una tabla con cada cambio registrado
          <div className="modal-historial-tabla">
            {/* Encabezado de la tabla de historial */}
            <div className="modal-historial-encabezado">
              <span>Fecha</span>
              <span>Hora</span>
              <span>Anterior</span>
              <span>Nuevo</span>
              <span>Diferencia</span>
            </div>
            {/* Más reciente primero */}
            {[...historial].reverse().map((entry, i) => {
              // Calculamos la diferencia entre el precio nuevo y el anterior
              const diff = Number(entry.precioNuevo) - Number(entry.precioAnterior)
              // Determinamos si fue una suba o una baja de precio, para aplicar el color correspondiente
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
                  {/* Mostramos la diferencia con signo "+" si fue una suba, y en rojo/verde según corresponda */}
                  <span className={esSuba ? 'mh-diff mh-diff--suba' : 'mh-diff mh-diff--baja'}>
                    {esSuba ? '+' : ''}${Math.abs(diff).toLocaleString('es-AR')}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Botón para cerrar el modal */}
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
// Componente principal que muestra la tabla de productos y coordina los distintos modales/formularios
// (editar, eliminar, ver historial, agregar nuevo producto)
function TablaProductos({
  productos,
  categorias,
  onEliminar,
  onGuardarEdicion,
  onAgregar
}) {
  // Estado que guarda el producto que se está por eliminar (para mostrar el modal de confirmación)
  const [productoAEliminar, setProductoAEliminar] = useState(null)
  // Estado que guarda el producto que se está editando actualmente (para mostrar el formulario inline)
  const [productoEditando, setProductoEditando] = useState(null)
  // Estado que controla si se muestra el formulario de agregar un producto nuevo
  const [mostrarAgregar, setMostrarAgregar] = useState(false)

  // Guardamos el ID para que siempre lea el producto actualizado desde la prop
  // (en vez de guardar el objeto completo, guardamos solo el id y lo buscamos en "productos" cada vez,
  // así siempre se muestra la versión más reciente del producto, aunque haya cambiado)
  const [historialId, setHistorialId] = useState(null)
  const productoHistorial = historialId !== null
    ? productos.find((p) => p.id === historialId) ?? null
    : null

  // Se ejecuta al confirmar la eliminación en el modal: elimina el producto y cierra el modal
  function handleConfirmarEliminar() {
    onEliminar(productoAEliminar.id)
    setProductoAEliminar(null)
  }

  // Si no hay productos que coincidan con el filtro/búsqueda actual, mostramos un mensaje en su lugar
  if (productos.length === 0) {
    return <p className="tp-vacia">No se encontraron productos con ese criterio.</p>
  }

  return (
    <>
      <div className="tp-wrapper">
        {/* Encabezado de la tabla con los nombres de cada columna */}
        <div className="tp-encabezado">
          <span>Foto</span>
          <span>Nombre</span>
          <span>Categoría</span>
          <span>Precio</span>
          <span>Stock</span>
          <span>Acciones</span>
        </div>

        {/* Recorremos cada producto para mostrar su fila correspondiente */}
        {productos.map((producto) => (
          <div key={producto.id}>

            <div className="tp-fila">
            <FotoProducto foto={producto.foto_url} nombre={producto.nombre} />
            <span className="tp-nombre">{producto.nombre}</span>
            <span>{producto.categoria}</span>
            <span>${Number(producto.precio).toLocaleString('es-AR')}</span>
            {/* Mostramos el stock; si es null mostramos un guión, y si es bajo (≤5) lo resaltamos */}
            <span className={
              producto.stock !== null && producto.stock <= 5
                ? 'tp-stock tp-stock--bajo'
                : 'tp-stock'
            }>
              {producto.stock === null ? '-' : producto.stock}
            </span>
            {/* Botones de acción: editar, eliminar y ver historial de precios */}
            <div className="tp-acciones">
              <button
                className="tp-btn tp-btn--editar"
                onClick={() => setProductoEditando(producto)}
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

          {/* Si este producto es el que se está editando, mostramos el formulario justo debajo de su fila */}
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

      {/* Botón para abrir el formulario de agregar un producto nuevo */}
      <button
        className="gp-btn-agregar"
        onClick={() => setMostrarAgregar(true)}
      >
        + Agregar Producto
      </button>

      {/* Formulario de agregar producto, solo visible cuando mostrarAgregar es true */}
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

      {/* Modal de confirmación de eliminación, solo visible si hay un producto marcado para eliminar */}
      {productoAEliminar && (
        <ModalEliminar
          nombre={productoAEliminar.nombre}
          onConfirmar={handleConfirmarEliminar}
          onCancelar={() => setProductoAEliminar(null)}
        />
      )}

      {/* Modal de historial de precios, solo visible si hay un producto seleccionado para ver su historial */}
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