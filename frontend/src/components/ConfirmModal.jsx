/* Este componente es un modal de confirmación que se muestra cuando el usuario intenta cerrar sesión. 
Permite al usuario confirmar o cancelar la acción de cerrar sesión. Si el usuario confirma, 
se ejecuta la función onConfirmar; si cancela, se ejecuta la función onCancelar. 
El modal se cierra automáticamente al hacer clic fuera de él o al seleccionar una opción. */
/* Este componente es genérico y reutilizable: no sabe nada de "cerrar sesión" en particular, 
solo recibe un título, un mensaje, y dos funciones (qué hacer si confirman o si cancelan). 
Por eso lo pueden usar tanto NavbarAlumno como NavbarEncargada sin duplicar código. */

import '../styles/ConfirmModal.css' // Importa los estilos específicos para el modal de confirmación

// Componente genérico y reutilizable: no sabe nada de "cerrar sesión" en particular, solo recibe un título, un mensaje, y dos funciones (qué hacer si confirman o si cancelan).
// Por eso lo pueden usar tanto NavbarAlumno como NavbarEncargada sin duplicar código.
function ConfirmModal({ titulo, mensaje, onConfirmar, onCancelar }) {
  return (
    // El "overlay" es el fondo oscuro semitransparente que cubre toda la pantalla.
    // Si el usuario clickea afuera de la tarjeta blanca (en cualquier parte del fondo oscuro), se ejecuta onCancelar, como si hubiera tocado "Cancelar"
    <div className="confirm-modal-overlay" onClick={onCancelar}>
      {/* stopPropagation() evita que el click "se propague" hacia el overlay de arriba.
          Sin esto, cualquier click dentro de la tarjeta blanca terminaría cerrando el modal igual,
          porque React interpretaría que el click también le llegó al overlay */}
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{titulo}</h3>
        <p>{mensaje}</p>
        <div className="confirm-modal-botones"> {/* Contenedor de los botones de acción: Cancelar y Confirmar */ }
          <button className="confirm-modal-cancelar" onClick={onCancelar}> {/* Botón de cancelar, que ejecuta la función onCancelar cuando se hace clic */ }
            Cancelar
          </button>
          <button className="confirm-modal-confirmar" onClick={onConfirmar}> {/* Botón de confirmar, que ejecuta la función onConfirmar cuando se hace clic */ }
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal