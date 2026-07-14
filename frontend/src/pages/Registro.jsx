/*
 * Registro.jsx
 * Pantalla de alta de cuenta para alumnos.
 * Valida el formulario (nombre, apellido, año, división, usuario y contraseñas),
 * lo envía al backend para crear el alumno, guarda la sesión y redirige al Catálogo.
 */

// Importaciones de React, React Router y recursos estáticos (diseños nuestros)
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logoKiosco from '../assets/logos/RecoKiosco.png'
import fondoKiosco from '../assets/images/fondos/Kiosco-Fondo.png'
import ojoMostrar from '../assets/icons/OjoMostrar.png'
import ojoNoMostrar from '../assets/icons/OjoNoMostrar.png'
import '../styles/Registro.css'

// Componente principal de la página de registro
function Registro() { 
  const navigate = useNavigate()

  // Campos del formulario
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [anio, setAnio] = useState('')
  const [division, setDivision] = useState('')
  const [usuario, setUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [confirmacion, setConfirmacion] = useState('')

  // Visibilidad de contraseñas, errores por campo y flag de éxito
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)
  const [errores, setErrores] = useState({})
  const [exito, setExito] = useState(false)

  // Valida todos los campos, registra al alumno en el backend y arranca la sesión
  async function handleSubmit() { //async function para poder usar await, o sea, esperar la respuesta del fetch
    const nuevosErrores = {}

    if (!nombre.trim()) nuevosErrores.nombre = 'Ingresá tu nombre.'
    else if (nombre.trim().length < 2) nuevosErrores.nombre = 'Mínimo 2 caracteres.'

    if (!apellido.trim()) nuevosErrores.apellido = 'Ingresá tu apellido.'
    else if (apellido.trim().length < 2) nuevosErrores.apellido = 'Mínimo 2 caracteres.'

    if (!anio) nuevosErrores.anio = 'Seleccioná el año.'
    if (!division) nuevosErrores.division = 'Seleccioná la división.'
    if (!usuario.trim()) nuevosErrores.usuario = 'Elegí un nombre de usuario.'
    if (!contrasena.trim()) nuevosErrores.contrasena = 'Ingresá una contraseña.'

    if (!confirmacion.trim()) nuevosErrores.confirmacion = 'Confirmá tu contraseña.'
    else if (contrasena !== confirmacion) nuevosErrores.confirmacion = 'Las contraseñas no coinciden.'

    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    try { // Intenta hacer el fetch al backend, si falla (no hay conexión) cae en el catch
      const respuesta = await fetch("http://127.0.0.1:8000/api/auth/registro/", { // Endpoint de registro del backend
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          anio: Number(anio.replace('°', '')),
          division: Number(division),
          usuario: usuario.trim(),
          password: contrasena
        })
      })
      const datos = await respuesta.json()

      if (!respuesta.ok) { // Si el backend devuelve un error (por ejemplo, usuario ya existe), lo mostramos en el formulario
        setErrores({ usuario: datos.usuario?.[0] || datos.error || 'No se pudo completar el registro.' })
        return
      }

      // Sesión: tokens y datos básicos del alumno recién creado
      localStorage.setItem('access', datos.access)
      localStorage.setItem('refresh', datos.refresh)
      localStorage.setItem('tipo', datos.tipo)
      localStorage.setItem('nombre', datos.nombre)
      localStorage.setItem('id', datos.id)

      setExito(true) // Mostramos mensaje de éxito antes de redirigir al catálogo
      setTimeout(() => navigate('/catalogo'), 1500) // Redirigimos al catálogo después de 1.5 segundos para que el usuario vea el mensaje de éxito

    } catch (error) { // Si no hay conexión con el backend, mostramos un error genérico
      setErrores({ usuario: 'No se pudo conectar con el servidor.' })
    }
  }

  return ( // Renderizado de la página de registro: dos columnas, izquierda con fondo y logo, derecha con formulario y enlaces
    <div className="registro-wrapper">

      {/* Columna izquierda: fondo + logo */}
      <div className="registro-imagen" style={{ backgroundImage: `url(${fondoKiosco})` }}>
        <img src={logoKiosco} alt="RecoKiosco" className="registro-logo" />
      </div>

      {/* Columna derecha: formulario */}
      <div className="registro-panel">
        <h1 className="registro-titulo">Registrarse</h1>
        <p className="registro-subtitulo">Completá tus datos para crear tu cuenta</p>

        <div className="registro-form">

          {/* Nombre y apellido */}
          <div className="registro-fila-curso">
            <div className="registro-campo">
              <label htmlFor="nombre">Nombre *</label>
              <div className={`registro-input-wrapper ${errores.nombre ? 'input-error' : ''}`}>
                <input type="text" id="nombre" placeholder="Ej: Juan" value={nombre} onChange={e => setNombre(e.target.value)} />
              </div>
              {errores.nombre && <p className="registro-error">⚠ {errores.nombre}</p>}
            </div>

            <div className="registro-campo">
              <label htmlFor="apellido">Apellido *</label>
              <div className={`registro-input-wrapper ${errores.apellido ? 'input-error' : ''}`}>
                <input type="text" id="apellido" placeholder="Ej: Pérez" value={apellido} onChange={e => setApellido(e.target.value)} />
              </div>
              {errores.apellido && <p className="registro-error">⚠ {errores.apellido}</p>}
            </div>
          </div>

          {/* Año y división: arman el curso del alumno */}
          <div className="registro-fila-curso">
            <div className="registro-campo">
              <label htmlFor="anio">Año *</label>
              <select id="anio" value={anio} onChange={e => setAnio(e.target.value)} className={`registro-select ${errores.anio ? 'input-error' : ''}`}>
                <option value="">Año...</option>
                <option>1°</option><option>2°</option><option>3°</option>
                <option>4°</option><option>5°</option><option>6°</option>
              </select>
              {errores.anio && <p className="registro-error">⚠ {errores.anio}</p>}
            </div>

            <div className="registro-campo">
              <label htmlFor="division">División *</label>
              <select id="division" value={division} onChange={e => setDivision(e.target.value)} className={`registro-select ${errores.division ? 'input-error' : ''}`}>
                <option value="">División...</option>
                {Array.from({ length: 10 }, (_, i) => i + 1).map(n => <option key={n}>{n}</option>)}
              </select>
              {errores.division && <p className="registro-error">⚠ {errores.division}</p>}
            </div>
          </div>

          {/* Usuario */}
          <div className="registro-campo">
            <label htmlFor="usuario">Usuario *</label>
            <div className={`registro-input-wrapper ${errores.usuario ? 'input-error' : ''}`}>
              <input type="text" id="usuario" placeholder="Elegí un nombre de usuario..." value={usuario} onChange={e => setUsuario(e.target.value)} />
            </div>
            {errores.usuario && <p className="registro-error">⚠ {errores.usuario}</p>}
          </div>

          {/* Contraseña y confirmación */}
          <div className="registro-fila-passwords">
            <div className="registro-campo">
              <label htmlFor="contrasena">Contraseña *</label>
              <div className={`registro-input-wrapper con-icono ${errores.contrasena ? 'input-error' : ''}`}>
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  id="contrasena"
                  placeholder="••••••••"
                  value={contrasena}
                  onChange={e => setContrasena(e.target.value)}
                />
                <button type="button" className="registro-toggle-password" onClick={() => setMostrarPassword(!mostrarPassword)} aria-label={mostrarPassword ? 'Ocultar' : 'Mostrar'}>
                  <img src={mostrarPassword ? ojoNoMostrar : ojoMostrar} alt="" />
                </button>
              </div>
              {errores.contrasena && <p className="registro-error">⚠ {errores.contrasena}</p>}
            </div>

            <div className="registro-campo">
              <label htmlFor="confirmar">Confirmar Contraseña *</label>
              <div className={`registro-input-wrapper con-icono ${errores.confirmacion ? 'input-error' : ''}`}>
                <input
                  type={mostrarConfirmacion ? 'text' : 'password'}
                  id="confirmar"
                  placeholder="••••••••"
                  value={confirmacion}
                  onChange={e => setConfirmacion(e.target.value)}
                />
                <button type="button" className="registro-toggle-password" onClick={() => setMostrarConfirmacion(!mostrarConfirmacion)} aria-label={mostrarConfirmacion ? 'Ocultar' : 'Mostrar'}>
                  <img src={mostrarConfirmacion ? ojoNoMostrar : ojoMostrar} alt="" />
                </button>
              </div>
              {errores.confirmacion && <p className="registro-error">⚠ {errores.confirmacion}</p>}
            </div>
          </div>

          <button className="registro-boton" onClick={handleSubmit}>Registrarse</button>

          {/* Mensaje de éxito, antes de redirigir */}
          {exito && <p className="registro-exito">✓ ¡Cuenta creada! Redirigiendo...</p>}
        </div>

        <div className="registro-extra">
          <Link to="/login" className="registro-login-link">¿Ya tenés cuenta? Iniciá Sesión</Link>
          <Link to="/" className="registro-volver">← Volver al Inicio</Link>
        </div>
      </div>
    </div>
  )
}

export default Registro