/* Este componente muestra el resumen de una venta en curso */

import { useState } from 'react'
import iconCarrito from '../assets/icons/VentasBoton.png'
import iconCheck   from '../assets/icons/SimboloCheck.png'
import iconReloj   from '../assets/icons/Reloj.png'
import iconAviso   from '../assets/icons/Aviso.png'
import '../styles/VentasPresenciales.css'

function ResumenVenta({ items, total, error, ventaConfirmada, registrandoVenta, onConfirmar, onCancelar, onNuevaVenta }) {
  const [confirmando, setConfirmando] = useState(false)

  function handleClickConfirmar() {
    if (items.length === 0) {
      onConfirmar() // dispara el error de "sin productos" en el padre
      return
    }
    setConfirmando(true)
  }

  function handleAceptarConfirm() {
    setConfirmando(false)
    onConfirmar()
  }

  function handleCancelarConfirm() {
    setConfirmando(false)
  }
  

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
          <div className="rv-check-wrap">
            <img src={iconCheck} alt="Venta registrada" className="rv-check-img" />
          </div>
          <p className="rv-confirmada-titulo">¡Venta Registrada!</p>
          <div className="rv-confirmada-hora">
            <div className="rv-confirmada-hora">
              <img src={iconReloj} alt="" className="rv-reloj-icono" />
              <span>{ventaConfirmada.hora} hs · por <strong>{ventaConfirmada.usuario}</strong></span>
            </div>
          </div>
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
          <p className="rv-confirm-sub">Esta acción registrará {items.length} producto{items.length !== 1 ? 's' : ''} por un total de <strong>${total.toLocaleString('es-AR')}</strong>.</p>
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
          <button
            className="rv-btn rv-btn--confirmar"
            onClick={handleAceptarConfirm}
            disabled={registrandoVenta}
            >
            {registrandoVenta
                ? "Registrando venta..."
                : "✓ Sí, confirmar"}
          </button>
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
      <h2 className="rv-titulo">
        <img src={iconCarrito} alt="" className="rv-titulo-icono-img" />
        Resumen de Venta
      </h2>

      <div className="rv-tabla-header">
        <span>Producto</span>
        <span>Precio</span>
      </div>

      <div className="rv-items">
        {items.length === 0 ? (
          <p className="rv-vacio">Ningún producto seleccionado.</p>
        ) : (
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

      <div className="rv-total">
        <span>Total</span>
        <span>${total.toLocaleString('es-AR')}</span>
      </div>

      {error && (
        <div className="rv-error">
          <img src={iconAviso} alt="" className="rv-error-icono" />
          <span>{error}</span>
        </div>
      )}

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