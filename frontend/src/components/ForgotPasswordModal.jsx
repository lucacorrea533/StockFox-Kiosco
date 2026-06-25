/* Este componente es un modal que se muestra cuando el usuario hace click en "Olvidé mi contraseña" en la pantalla de login. Permite ingresar el nombre de usuario y simula el envío de una solicitud para restablecer la contraseña, mostrando un mensaje de confirmación. */

import { useEffect, useState } from 'react'
import iconAdvertencia from '../assets/icons/Advertencia.png'
import '../styles/ForgotPasswordModal.css'

function ForgotPasswordModal({ onClose }) {
  const [usuario, setUsuario] = useState('')
  const [enviado, setEnviado] = useState(false)

  // Cerrar con la tecla ESC
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function handleEnviar() {
    if (!usuario.trim()) return
    // Acá en el futuro va la llamada real al backend
    // (ej: crear una notificación en la tabla de USUARIOS para la Encargada Principal)
    setEnviado(true)
  }

  return (
    <div className="olvido-overlay" onClick={onClose}>
      <div className="olvido-modal" onClick={(e) => e.stopPropagation()}>
        <button className="olvido-cerrar" onClick={onClose} aria-label="Cerrar">
          ✕
        </button>

        <img src={iconAdvertencia} alt="Advertencia" className="olvido-icono" />

        <h2>Recuperar contraseña</h2>

        {!enviado ? (
          <>
            <p className="olvido-texto">
              Por seguridad, el sistema no guarda tu contraseña en texto plano y todavía no
              envía mails de recuperación automáticos. Si la olvidaste, ingresá tu usuario y le
              vamos a avisar a la Encargada Principal para que te la restablezca manualmente.
            </p>

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

            <button className="olvido-boton" onClick={handleEnviar}>
              Enviar solicitud
            </button>
          </>
        ) : (
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