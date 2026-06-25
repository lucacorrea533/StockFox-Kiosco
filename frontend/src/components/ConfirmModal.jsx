/* Este componente es un modal de confirmación que se muestra cuando el usuario intenta cerrar sesión. Permite al usuario confirmar o cancelar la acción de cerrar sesión. Si el usuario confirma, se ejecuta la función onConfirmar; si cancela, se ejecuta la función onCancelar. El modal se cierra automáticamente al hacer clic fuera de él o al seleccionar una opción. */

import '../styles/ConfirmModal.css'

function ConfirmModal({ titulo, mensaje, onConfirmar, onCancelar }) {
  return (
    <div className="confirm-modal-overlay" onClick={onCancelar}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{titulo}</h3>
        <p>{mensaje}</p>
        <div className="confirm-modal-botones">
          <button className="confirm-modal-cancelar" onClick={onCancelar}>
            Cancelar
          </button>
          <button className="confirm-modal-confirmar" onClick={onConfirmar}>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal