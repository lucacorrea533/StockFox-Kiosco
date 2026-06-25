/* Este archivo es la pantalla de login del sistema. Contiene un formulario para ingresar el usuario y la contraseña, con validación básica y un botón para mostrar/ocultar la contraseña. También incluye un enlace para recuperar la contraseña, que abre un modal (componente ForgotPasswordModal) para solicitar el restablecimiento. */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logoKiosco from '../assets/logos/RecoKiosco.png'
import fondoKiosco from '../assets/images/fondos/Kiosco-Fondo.png'
import ojoMostrar from '../assets/icons/OjoMostrar.png'
import ojoNoMostrar from '../assets/icons/OjoNoMostrar.png'
import ForgotPasswordModal from '../components/ForgotPasswordModal'
import '../styles/Login.css'

function Login() {
  const navigate = useNavigate()
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [usuario, setUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [errores, setErrores] = useState({})
  const [mostrarOlvido, setMostrarOlvido] = useState(false)

  function handleSubmit() {
    const nuevosErrores = {}
    if (!usuario.trim()) nuevosErrores.usuario = 'Ingresá tu usuario.'
    if (!contrasena.trim()) nuevosErrores.contrasena = 'Ingresá tu contraseña.'
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length === 0) {
      navigate('/admin/productos')
    }
  }

  return (
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

      {mostrarOlvido && (
        <ForgotPasswordModal onClose={() => setMostrarOlvido(false)} />
      )}

    </div>
  )
}

export default Login