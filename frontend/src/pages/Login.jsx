/*
 * Login.jsx
 * Pantalla de inicio de sesión de RecoKiosco.
 * Autentica contra el backend (JWT) y redirige según el tipo de usuario:
 * alumno → /catalogo | Encargada/Ayudante → /admin.
 * Incluye el modal de "olvidé mi contraseña" (ForgotPasswordModal).
 */

// Importaciones de React, React Router y recursos estáticos (diseños nuestros)
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logoKiosco from '../assets/logos/RecoKiosco.png'
import fondoKiosco from '../assets/images/fondos/Kiosco-Fondo.png'
import ojoMostrar from '../assets/icons/OjoMostrar.png'
import ojoNoMostrar from '../assets/icons/OjoNoMostrar.png'
import ForgotPasswordModal from '../components/ForgotPasswordModal'
import '../styles/Login.css'
import { API_BASE_URL } from '../api/config'

// Componente principal de la página de login
function Login() {
  const navigate = useNavigate()

  // Estado del formulario: valores, visibilidad de contraseña, errores y modal de recuperación
  const [usuario, setUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [errores, setErrores] = useState({})
  const [mostrarOlvido, setMostrarOlvido] = useState(false)

  // Valida campos vacíos, pega al login del backend y guarda la sesión si todo sale bien
  async function handleSubmit() { //async function para poder usar await, o sea, esperar la respuesta del fetch
    const nuevosErrores = {}
    if (!usuario.trim()) nuevosErrores.usuario = 'Ingresá tu usuario.'
    if (!contrasena.trim()) nuevosErrores.contrasena = 'Ingresá tu contraseña.'
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    try { // Intenta hacer el fetch al backend, si falla (no hay conexión) cae en el catch
      const respuesta = await fetch(`${API_BASE_URL}/auth/login/`, { // Endpoint de login del backend
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, password: contrasena })
      })
      const datos = await respuesta.json()

      if (!respuesta.ok) {
        setErrores({ contrasena: 'Usuario o contraseña incorrectos.' })
        return
      }

      // Sesión: tokens JWT + datos básicos del usuario, usados en el resto de la app
      // o sea, si el usuario es alumno, encargada o ayudante, su nombre y rol.
      // Los tokens JWT son necesarios para hacer fetch a endpoints protegidos del backend. Significan que el usuario está logueado.
      localStorage.setItem('access', datos.access)
      localStorage.setItem('refresh', datos.refresh)
      localStorage.setItem('tipo', datos.tipo)
      localStorage.setItem('nombre', datos.nombre)
      localStorage.setItem('rol', datos.rol || '')
      localStorage.setItem('id', datos.id)

      navigate(datos.tipo === 'alumno' ? '/catalogo' : '/admin')

    } catch (error) {
      setErrores({ contrasena: 'No se pudo conectar con el servidor.' })
    }
  }

  return ( // Renderizado de la página de login: dos columnas, izquierda con fondo y logo, derecha con formulario y enlaces
    <div className="login-wrapper">

      {/* Columna izquierda: fondo + logo */}
      <div className="login-imagen" style={{ backgroundImage: `url(${fondoKiosco})` }}>
        <img src={logoKiosco} alt="RecoKiosco" className="login-logo" />
      </div>

      {/* Columna derecha: formulario */}
      <div className="login-panel">
        <h1 className="login-titulo">Inicio de Sesión</h1>

        <div className="login-form">

          {/* Usuario */}
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

          {/* Contraseña, con botón de ojito para mostrar/ocultar */}
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

          <button className="login-boton" onClick={handleSubmit}>Iniciar Sesión</button>
        </div>

        {/* Enlaces secundarios */}
        <div className="login-extra">
          <p className="login-olvido" onClick={() => setMostrarOlvido(true)}>¿Olvidaste tu Contraseña?</p>
          <p className="login-registro">¿No tenés cuenta? <Link to="/registro">Registrate acá</Link></p>
          <Link to="/" className="login-volver">← Volver al Inicio</Link>
        </div>
      </div>

      {/* Modal de recuperación, solo si fue activado */}
      {mostrarOlvido && <ForgotPasswordModal onClose={() => setMostrarOlvido(false)} />}
    </div>
  )
}

export default Login