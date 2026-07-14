/* Este componente muestra el resumen de una venta en curso */

// Hook de React para manejar estado local
import { useState } from 'react'
// Ícono del carrito, usado en el título del panel
import iconCarrito from '../assets/icons/VentasBoton.png'
// Ícono de check, mostrado cuando la venta se confirma con éxito
import iconCheck   from '../assets/icons/SimboloCheck.png'
// Ícono de reloj, mostrado junto a la hora de la venta confirmada
import iconReloj   from '../assets/icons/Reloj.png'
// Ícono de aviso, mostrado cuando hay un error
import iconAviso   from '../assets/icons/Aviso.png'
// Estilos propios de la vista de Ventas Presenciales
import '../styles/VentasPresenciales.css'

// Componente que muestra el resumen de la venta actual (carrito), y maneja los distintos estados:
// resumen normal, modal de confirmación, registrando venta, y venta ya confirmada
function ResumenVenta({ items, total, error, ventaConfirmada, registrandoVenta, onConfirmar, onCancelar, onNuevaVenta }) {
  // Estado que controla si se está mostrando el modal de "¿Confirmás la venta?"
  const [confirmando, setConfirmando] = useState(false)

  // Se ejecuta al hacer click en "Confirmar Venta"
  function handleClickConfirmar() {
    // Si no hay productos seleccionados, delegamos directo al padre para que muestre el error correspondiente
    if (items.length === 0) {
      onConfirmar() // dispara el error de "sin productos" en el padre
      return
    }
    // Si hay productos, mostramos el modal de confirmación antes de registrar la venta
    setConfirmando(true)
  }

  // Se ejecuta al aceptar la confirmación dentro del modal
  function handleAceptarConfirm() {
    setConfirmando(false)
    onConfirmar()
  }

  // Se ejecuta al cancelar la confirmación dentro del modal (vuelve al resumen normal)
  function handleCancelarConfirm() {
    setConfirmando(false)
  }
  

  // ── Estado: registrando la venta (mientras se espera la respuesta del backend) ──────────
  if (registrandoVenta) {

  return (

    <aside className="rv-panel">

      <div className="rv-confirmada">

        <div className="rv-check-wrap">

          ⏳

        </div>

        <p className="rv-confirmada-titulo">

          Registrando venta...

        </p>

        <p>

          Por favor espere unos segundos.

        </p>

      </div>

    </aside>

  )

}

  // ── Estado: venta confirmada ─────────────────────────────────────────────
  if (ventaConfirmada) {
    return (
      <aside className="rv-panel">
        <div className="rv-confirmada">
          {/* Ícono de check indicando que la venta se registró correctamente */}
          <div className="rv-check-wrap">
            <img src={iconCheck} alt="Venta registrada" className="rv-check-img" />
          </div>
          <p className="rv-confirmada-titulo">¡Venta Registrada!</p>
          {/* Hora en que se registró la venta y usuario que la realizó */}
          <div className="rv-confirmada-hora">
            <div className="rv-confirmada-hora">
              <img src={iconReloj} alt="" className="rv-reloj-icono" />
              <span>{ventaConfirmada.hora} hs · por <strong>{ventaConfirmada.usuario}</strong></span>
            </div>
          </div>
          {/* Detalle de los productos vendidos */}
          <div className="rv-detalle">
            <p className="rv-detalle-titulo">Detalle</p>
            {ventaConfirmada.items.map((item) => (
              <div key={item.id} className="rv-detalle-fila">
                <span>{item.nombre} ×{item.cantidad}</span>
                <span>${item.subtotal.toLocaleString('es-AR')}</span>
              </div>
            ))}
            <div className="rv-detalle-total">
              <span>Total cobrado</span>
              <span>${ventaConfirmada.total.toLocaleString('es-AR')}</span>
            </div>
          </div>
          {/* Botón para iniciar una nueva venta desde cero */}
          <button className="rv-btn rv-btn--cancelar" onClick={onNuevaVenta}>Nueva venta</button>
        </div>
      </aside>
    )
  }

  // ── Estado: modal de confirmación ────────────────────────────────────────
  if (confirmando) {
    return (
      <aside className="rv-panel">
        <div className="rv-confirm-modal">
          <p className="rv-confirm-pregunta">¿Confirmás la venta?</p>
          {/* Resumen breve de cuántos productos y el total antes de confirmar */}
          <p className="rv-confirm-sub">Esta acción registrará {items.length} producto{items.length !== 1 ? 's' : ''} por un total de <strong>${total.toLocaleString('es-AR')}</strong>.</p>
          {/* Detalle completo de los productos a confirmar */}
          <div className="rv-detalle">
            {items.map((item) => (
              <div key={item.id} className="rv-detalle-fila">
                <span>{item.nombre} ×{item.cantidad}</span>
                <span>${item.subtotal.toLocaleString('es-AR')}</span>
              </div>
            ))}
            <div className="rv-detalle-total">
              <span>Total</span>
              <span>${total.toLocaleString('es-AR')}</span>
            </div>
          </div>
          {/* Botón de confirmación; se deshabilita y cambia el texto mientras se está registrando la venta */}
          <button
            className="rv-btn rv-btn--confirmar"
            onClick={handleAceptarConfirm}
            disabled={registrandoVenta}
            >
            {registrandoVenta
                ? "Registrando venta..."
                : "✓ Sí, confirmar"}
          </button>
          {/* Botón para volver atrás sin confirmar */}
          <button className="rv-btn rv-btn--cancelar" onClick={handleCancelarConfirm}>
            Volver
          </button>
        </div>
      </aside>
    )
  }

  // ── Estado: resumen normal ───────────────────────────────────────────────
  return (
    <aside className="rv-panel">
      {/* Título del panel con ícono de carrito */}
      <h2 className="rv-titulo">
        <img src={iconCarrito} alt="" className="rv-titulo-icono-img" />
        Resumen de Venta
      </h2>

      {/* Encabezado de la tabla de productos */}
      <div className="rv-tabla-header">
        <span>Producto</span>
        <span>Precio</span>
      </div>

      {/* Listado de productos agregados a la venta actual */}
      <div className="rv-items">
        {items.length === 0 ? (
          // Si no hay productos seleccionados, mostramos un mensaje indicándolo
          <p className="rv-vacio">Ningún producto seleccionado.</p>
        ) : (
          // Recorremos cada producto agregado y mostramos su información y subtotal
          items.map((item) => (
            <div key={item.id} className="rv-item">
              <div className="rv-item-info">
                <span className="rv-item-nombre">{item.nombre}</span>
                <span className="rv-item-detalle">
                  {item.cantidad} × ${item.precio.toLocaleString('es-AR')} c/u
                </span>
              </div>
              <span className="rv-item-subtotal">
                ${item.subtotal.toLocaleString('es-AR')}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Total general de la venta */}
      <div className="rv-total">
        <span>Total</span>
        <span>${total.toLocaleString('es-AR')}</span>
      </div>

      {/* Mensaje de error, solo se muestra si existe */}
      {error && (
        <div className="rv-error">
          <img src={iconAviso} alt="" className="rv-error-icono" />
          <span>{error}</span>
        </div>
      )}

      {/* Botones de acción: confirmar la venta o cancelarla */}
      <button className="rv-btn rv-btn--confirmar" onClick={handleClickConfirmar}>
        ✓ Confirmar Venta
      </button>
      <button className="rv-btn rv-btn--cancelar" onClick={onCancelar}>
        Cancelar
      </button>
    </aside>
  )
}

export default ResumenVenta