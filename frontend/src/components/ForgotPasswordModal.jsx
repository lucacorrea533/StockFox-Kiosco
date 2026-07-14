/* Este componente es un modal que se muestra cuando el usuario hace click en "Olvidé mi contraseña" en la pantalla de login. Permite ingresar el nombre de usuario y simula el envío de una solicitud para restablecer la contraseña, mostrando un mensaje de confirmación. */

// Hooks de React: useEffect para efectos secundarios (como escuchar teclas), useState para manejar estado local
import { useEffect, useState } from 'react'
// Ícono de advertencia que se muestra en la parte superior del modal
import iconAdvertencia from '../assets/icons/Advertencia.png'
// Estilos propios de este modal
import '../styles/ForgotPasswordModal.css'

// Componente modal; recibe como prop la función onClose para cerrarse a sí mismo
function ForgotPasswordModal({ onClose }) {
  // Estado que guarda el nombre de usuario ingresado en el input
  const [usuario, setUsuario] = useState('')
  // Estado booleano que indica si la solicitud ya fue "enviada" (para mostrar el mensaje de confirmación)
  const [enviado, setEnviado] = useState(false)

  // Cerrar con la tecla ESC
  useEffect(() => {
    // Función que detecta si la tecla presionada es "Escape"
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    // Agregamos el listener de teclado al montar el componente
    document.addEventListener('keydown', handleKeyDown)
    // Limpiamos el listener al desmontar el componente, para evitar fugas de memoria
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Función que se ejecuta al hacer click en "Enviar solicitud"
  function handleEnviar() {
    // Si el campo usuario está vacío (o solo tiene espacios), no hacemos nada
    if (!usuario.trim()) return
    // Acá en el futuro va la llamada real al backend
    // (ej: crear una notificación en la tabla de USUARIOS para la Encargada Principal)
    // Por ahora, solo simulamos el envío cambiando el estado
    setEnviado(true)
  }

  return (
    // Fondo oscuro semitransparente que cubre toda la pantalla; al hacer click afuera del modal, se cierra
    <div className="olvido-overlay" onClick={onClose}>
      {/* Contenedor del modal; se detiene la propagación del click para que no se cierre al clickear adentro */}
      <div className="olvido-modal" onClick={(e) => e.stopPropagation()}>
        {/* Botón para cerrar el modal manualmente */}
        <button className="olvido-cerrar" onClick={onClose} aria-label="Cerrar">
          ✕
        </button>

        {/* Ícono de advertencia decorativo */}
        <img src={iconAdvertencia} alt="Advertencia" className="olvido-icono" />

        <h2>Recuperar contraseña</h2>

        {/* Renderizado condicional: si todavía no se envió la solicitud, mostramos el formulario */}
        {!enviado ? (
          <>
            <p className="olvido-texto">
              Por seguridad, el sistema no guarda tu contraseña en texto plano y todavía no
              envía mails de recuperación automáticos. Si la olvidaste, ingresá tu usuario y le
              vamos a avisar a la Encargada Principal para que te la restablezca manualmente.
            </p>

            {/* Campo de texto para ingresar el nombre de usuario */}
            <div className="olvido-campo">
              <label htmlFor="usuario-olvido">Usuario</label>
              <input
                id="usuario-olvido"
                type="text"
                placeholder="Ingresá tu usuario..."
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
              />
            </div>

            {/* Botón que dispara el envío de la solicitud */}
            <button className="olvido-boton" onClick={handleEnviar}>
              Enviar solicitud
            </button>
          </>
        ) : (
          // Si ya se envió la solicitud, mostramos un mensaje de confirmación en su lugar
          <p className="olvido-texto olvido-confirmacion">
            Listo. Le avisamos a la Encargada Principal que <strong>{usuario}</strong> necesita
            restablecer su contraseña. Te va a contactar en persona para coordinarlo.
          </p>
        )}
      </div>
    </div>
  )
}

export default ForgotPasswordModal