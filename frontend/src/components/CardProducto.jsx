/* Este componente muestra la información de un producto en forma de tarjeta, con su imagen, nombre, categoría, precio y un botón para agregarlo al carrito. Si el producto no tiene stock, el botón se deshabilita y se muestra "Sin stock". Los productos de la categoría Servicios sin imagen usan un fondo sólido en lugar del placeholder con X. */

import '../styles/CardProducto.css'

function CardProducto({ producto, onAgregar }) {
  const { nombre, precio, imagen, stock, categoria } = producto
  const sinStock = stock === 0

  // Un servicio sin foto usa fondo naranja sólido, no el placeholder con X
  const esServicioSinFoto = categoria === 'Servicios' && !imagen

  return (
    <div className={`card-producto ${sinStock ? 'sin-stock' : ''}`}>

      {/* Zona de imagen */}
      <div className="card-producto-imagen">
        {imagen ? (
          <img src={imagen} alt={nombre} />
        ) : esServicioSinFoto ? (
          <div className="card-producto-servicio-fondo" />
        ) : (
          <div className="card-producto-placeholder" />
        )}
      </div>

      {/* Franja naranja separadora */}
      <div className="card-producto-franja" />

      {/* Info */}
      <div className="card-producto-info">
        <span className="card-producto-nombre">{nombre}</span>
        <span className="card-producto-categoria">{categoria}</span>
        <span className="card-producto-precio">${precio.toLocaleString('es-AR')}</span>
      </div>

      {/* Botón */}
      <button
        className="card-producto-btn"
        onClick={(e) => {
          e.stopPropagation()
          onAgregar(producto)
        }}
        disabled={sinStock}
      >
        {sinStock ? 'Sin stock' : 'Agregar'}
      </button>

    </div>
  )
}

export default CardProducto