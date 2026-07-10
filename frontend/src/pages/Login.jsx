/* Este archivo es la pantalla de login del sistema. Contiene un formulario para ingresar el usuario y la contraseña, con validación básica y un botón para mostrar/ocultar la contraseña. También incluye un enlace para recuperar la contraseña, que abre un modal (componente ForgotPasswordModal) para solicitar el restablecimiento. */

/* Importes de React y React Router, así como imágenes y estilos necesarios para la pantalla de login */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logoKiosco from '../assets/logos/RecoKiosco.png'
import fondoKiosco from '../assets/images/fondos/Kiosco-Fondo.png'
import ojoMostrar from '../assets/icons/OjoMostrar.png'
import ojoNoMostrar from '../assets/icons/OjoNoMostrar.png'
import ForgotPasswordModal from '../components/ForgotPasswordModal'
import '../styles/Login.css'

/* En assets y public, tenemos los recursos de imágenes y estilos que se usan en esta pantalla. El logo del kiosco, el fondo de la pantalla y los íconos para mostrar/ocultar la contraseña están en la carpeta assets. Los estilos específicos de la pantalla de login están en Login.css. */

/* Función principal del componente Login, que representa la pantalla de inicio de sesión. */
function Login() {
  const navigate = useNavigate() // Permite redirigir al usuario a otra ruta después del login
  const [mostrarPassword, setMostrarPassword] = useState(false) // Controla si la contraseña se ve en texto plano o tapada
  const [usuario, setUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [errores, setErrores] = useState({}) // Guarda los mensajes de error por campo
  const [mostrarOlvido, setMostrarOlvido] = useState(false) // Controla si el modal de "olvidé mi contraseña" está abierto

  // Valida que los campos no estén vacíos. Si todo está bien, redirige al catálogo
  function handleSubmit() {
    const nuevosErrores = {}
    if (!usuario.trim()) nuevosErrores.usuario = 'Ingresá tu usuario.'
    if (!contrasena.trim()) nuevosErrores.contrasena = 'Ingresá tu contraseña.'
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length === 0) {
      navigate('/catalogo')
    }
  }

  return ( /* Contenedor principal de la pantalla de login, dividido en dos mitades: imagen y formulario */
    <div className="login-wrapper">

      {/* Mitad Izquierda — Foto del interior del kiosco */}
      <div
        className="login-imagen"
        style={{ backgroundImage: `url(${fondoKiosco})` }}
      >
        <img src={logoKiosco} alt="RecoKiosco" className="login-logo" />
      </div>

      {/* Mitad Derecha — Formulario */}
      <div className="login-panel">
        <h1 className="login-titulo">Inicio de Sesión</h1>

        <div className="login-form">

          {/* Campo Usuario - Sirve para ingresar el nombre de usuario. Da error si está vacío */} 
          <div className="login-campo">
            <label htmlFor="usuario">Usuario</label>
            <div className={`login-input-wrapper ${errores.usuario ? 'input-error' : ''}`}>
              <input
                type="text"
                id="usuario"
                placeholder="Ingresá tu usuario..."
                value={usuario}
                onChange={e => setUsuario(e.target.value)}
              />
            </div>
            {errores.usuario && <p className="login-error">⚠ {errores.usuario}</p>} 
          </div>

          {/* Campo Contraseña, con botón de ojito para mostrar/ocultar la contraseña. Da error si está vacía */}
          <div className="login-campo">
            <label htmlFor="contrasena">Contraseña</label>
            <div className={`login-input-wrapper con-icono ${errores.contrasena ? 'input-error' : ''}`}>
              <input
                type={mostrarPassword ? 'text' : 'password'}
                id="contrasena"
                placeholder="••••••••"
                value={contrasena}
                onChange={e => setContrasena(e.target.value)}
              />
              <button
                type="button"
                className="login-toggle-password"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                <img src={mostrarPassword ? ojoNoMostrar : ojoMostrar} alt="" />
              </button>
            </div>
            {errores.contrasena && <p className="login-error">⚠ {errores.contrasena}</p>}
          </div>

          <button className="login-boton" onClick={handleSubmit}>
            Iniciar Sesión
          </button>
        </div>

        {/* Enlaces secundarios: recuperar contraseña, ir a registro, o volver al inicio */}
        <div className="login-extra">
          <p className="login-olvido" onClick={() => setMostrarOlvido(true)}>
            ¿Olvidaste tu Contraseña?
          </p>

          <p className="login-registro">
            ¿No tenés cuenta? <Link to="/registro">Registrate acá</Link>
          </p>

          <Link to="/" className="login-volver">← Volver al Inicio</Link>
        </div>
      </div>

      {/* Modal de recuperación de contraseña, solo se muestra si el estado lo activa */}
      {mostrarOlvido && (
        <ForgotPasswordModal onClose={() => setMostrarOlvido(false)} />
      )}

    </div>
  )
}

export default Login