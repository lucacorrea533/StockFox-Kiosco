// Este componente representa una tarjeta de producto en la sección de Ventas Presenciales. Muestra el nombre, categoría, precio y controles para sumar o restar la cantidad deseada del producto.

// Ícono de advertencia, mostrado cuando el producto no tiene stock disponible
import iconSinStock from '../assets/icons/Advertencia.png'

// Componente que representa un producto individual dentro del listado de venta presencial,
// con controles para sumar/restar la cantidad a vender
function TarjetaProducto({ producto, cantidad, onSumar, onRestar }) {
  // Determinamos si el producto no tiene stock disponible
  const sinStock = producto.stock === 0

  return (
    // Si el producto no tiene stock, se le agrega una clase extra para mostrarlo visualmente deshabilitado
    <div className={`tp-tarjeta ${sinStock ? 'tp-tarjeta--disabled' : ''}`}>
      {/* Información básica del producto: nombre, categoría, stock disponible y precio */}
      <div className="tp-tarjeta-info">
        <span className="tp-tarjeta-nombre">{producto.nombre}</span>
        <span className="tp-tarjeta-detalle">
          {producto.categoria} · Stock: {producto.stock}
        </span>
        <span className="tp-tarjeta-precio">
          ${producto.precio.toLocaleString('es-AR')}
        </span>
      </div>

      {/* Si no hay stock, mostramos un aviso en vez de los controles de cantidad */}
      {sinStock ? (
        <div className="tp-tarjeta-sinstok">
          <img src={iconSinStock} alt="" />
          <span>Sin stock</span>
        </div>
      ) : (
        // Si hay stock, mostramos los botones para sumar/restar la cantidad seleccionada
        <div className="tp-tarjeta-controles">
          {/* Botón de restar; se deshabilita si la cantidad ya está en 0 */}
          <button
            className="tp-ctrl-btn tp-ctrl-btn--restar"
            onClick={onRestar}
            disabled={cantidad === 0}
          >
            −
          </button>
          <span className="tp-ctrl-cantidad">{cantidad}</span>
          {/* Botón de sumar; se deshabilita si la cantidad ya alcanzó el stock disponible */}
          <button
            className="tp-ctrl-btn tp-ctrl-btn--sumar"
            onClick={onSumar}
            disabled={cantidad >= producto.stock}
          >
            +
          </button>
        </div>
      )}
    </div>
  )
}

export default TarjetaProducto