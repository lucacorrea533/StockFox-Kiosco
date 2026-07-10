/* Este componente muestra la información de un producto en forma de tarjeta, con su imagen, nombre, categoría, precio y un botón para agregarlo al carrito. Si el producto no tiene stock, el botón se deshabilita y se muestra "Sin stock". Los productos de la categoría Servicios sin imagen usan un fondo sólido en lugar del placeholder con X. */

import '../styles/CardProducto.css' // Importa los estilos específicos de la card de producto

// Esta funcion recibe como props un objeto producto y una función onAgregar, que se llama cuando el usuario hace click en el botón de agregar al carrito. La función desestructura los datos del producto que necesitamos mostrar, o sea, nombre, precio, imagen, stock y categoría. Luego renderiza la card con la información del producto y el botón de agregar al carrito.
function CardProducto({ producto, onAgregar }) {
  // Desestructura los datos del producto que necesitamos mostrar, o sea, nombre, precio, imagen, stock y categoría
  const { nombre, precio, imagen, stock, categoria } = producto
  const sinStock = stock === 0 // Si no hay unidades disponibles, la card se deshabilita

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

      {/* Info: nombre, categoría y precio del producto */}
      <div className="card-producto-info">
        <span className="card-producto-nombre">{nombre}</span>
        <span className="card-producto-categoria">{categoria}</span>
        <span className="card-producto-precio">${precio.toLocaleString('es-AR')}</span>
      </div>

      {/* Botón para agregar el producto al carrito */}
      <button
        className="card-producto-btn"
        onClick={(e) => {
          e.stopPropagation() // Evita que el click abra también el modal de la card
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