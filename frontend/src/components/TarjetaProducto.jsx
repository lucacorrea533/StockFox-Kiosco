// Este componente representa una tarjeta de producto en la sección de Ventas Presenciales. Muestra el nombre, categoría, precio y controles para sumar o restar la cantidad deseada del producto.

import iconSinStock from '../assets/icons/Advertencia.png'

function TarjetaProducto({ producto, cantidad, onSumar, onRestar }) {
  const sinStock = producto.stock === 0

  return (
    <div className={`tp-tarjeta ${sinStock ? 'tp-tarjeta--disabled' : ''}`}>
      <div className="tp-tarjeta-info">
        <span className="tp-tarjeta-nombre">{producto.nombre}</span>
        <span className="tp-tarjeta-detalle">
          {producto.categoria} · Stock: {producto.stock}
        </span>
        <span className="tp-tarjeta-precio">
          ${producto.precio.toLocaleString('es-AR')}
        </span>
      </div>

      {sinStock ? (
        <div className="tp-tarjeta-sinstok">
          <img src={iconSinStock} alt="" />
          <span>Sin stock</span>
        </div>
      ) : (
        <div className="tp-tarjeta-controles">
          <button
            className="tp-ctrl-btn tp-ctrl-btn--restar"
            onClick={onRestar}
            disabled={cantidad === 0}
          >
            −
          </button>
          <span className="tp-ctrl-cantidad">{cantidad}</span>
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