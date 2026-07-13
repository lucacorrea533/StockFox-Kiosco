/* Este archivo es la página de registro para nuevos usuarios. Acá los alumnos pueden crear su cuenta ingresando su nombre completo, año, división, nombre de usuario y contraseña. Se implementa una validación básica para asegurarse de que todos los campos estén completos y que las contraseñas coincidan. Además, se incluye la opción de mostrar u ocultar la contraseña para mejorar la experiencia del usuario. Al finalizar el registro, se muestra un mensaje de éxito y se redirige automáticamente al catálogo. También hay enlaces para iniciar sesión si ya tienen una cuenta o para volver a la página principal. */

/* Importaciones de React y React Router y assets */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logoKiosco from '../assets/logos/RecoKiosco.png'
import fondoKiosco from '../assets/images/fondos/Kiosco-Fondo.png'
import ojoMostrar from '../assets/icons/OjoMostrar.png'
import ojoNoMostrar from '../assets/icons/OjoNoMostrar.png'
import '../styles/Registro.css'

/* La función registro es el componente principal de la página de registro. Maneja el estado de los campos del formulario, la validación de los mismos y la navegación después del registro exitoso. */
function Registro() {
  const navigate = useNavigate() // Redirige al catálogo una vez completado el registro
  const [mostrarPassword, setMostrarPassword] = useState(false) // Mostrar/ocultar campo de contraseña
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false) // Mostrar/ocultar campo de confirmar contraseña
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [anio, setAnio] = useState('')
  const [division, setDivision] = useState('')
  const [usuario, setUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [errores, setErrores] = useState({}) // Mensajes de error por cada campo del formulario
  const [exito, setExito] = useState(false) // Muestra el mensaje de "cuenta creada" al terminar

  // Valida todos los campos del formulario (nombre, año, división, usuario, contraseñas) antes de registrar
async function handleSubmit() {
    const nuevosErrores = {}

    if (!nombre.trim())
      nuevosErrores.nombre = 'Ingresá tu nombre.'
    else if (nombre.trim().length < 2)
      nuevosErrores.nombre = 'Mínimo 2 caracteres.'

    if (!apellido.trim())
      nuevosErrores.apellido = 'Ingresá tu apellido.'
    else if (apellido.trim().length < 2)
      nuevosErrores.apellido = 'Mínimo 2 caracteres.'

    if (!anio)
      nuevosErrores.anio = 'Seleccioná el año.'
    if (!division)
      nuevosErrores.division = 'Seleccioná la división.'

    if (!usuario.trim())
      nuevosErrores.usuario = 'Elegí un nombre de usuario.'

    if (!contrasena.trim())
      nuevosErrores.contrasena = 'Ingresá una contraseña.'

    if (!confirmacion.trim())
      nuevosErrores.confirmacion = 'Confirmá tu contraseña.'
    else if (contrasena !== confirmacion)
      nuevosErrores.confirmacion = 'Las contraseñas no coinciden.'

    setErrores(nuevosErrores)

    if (Object.keys(nuevosErrores).length > 0) return

    try {
      const respuesta = await fetch("http://127.0.0.1:8000/api/auth/registro/", {
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

      if (!respuesta.ok) {
        setErrores({ usuario: datos.usuario?.[0] || datos.error || 'No se pudo completar el registro.' })
        return
      }

      localStorage.setItem('access', datos.access)
      localStorage.setItem('refresh', datos.refresh)
      localStorage.setItem('tipo', datos.tipo)
      localStorage.setItem('nombre', datos.nombre)
      localStorage.setItem('id', datos.id)

      setExito(true)
      setTimeout(() => navigate('/catalogo'), 1500)

    } catch (error) {
      setErrores({ usuario: 'No se pudo conectar con el servidor.' })
    }
  }

  return (
    <div className="registro-wrapper">

      {/* Mitad Izquierda — Foto del interior del kiosco */}
      <div
        className="registro-imagen"
        style={{ backgroundImage: `url(${fondoKiosco})` }}
      >
        <img src={logoKiosco} alt="RecoKiosco" className="registro-logo" />
      </div>

      {/* Mitad Derecha — Formulario */}
      <div className="registro-panel">
        <h1 className="registro-titulo">Registrarse</h1>
        <p className="registro-subtitulo">Completá tus datos para crear tu cuenta</p>

        <div className="registro-form">

          {/* Nombre completo */}
          <div className="registro-fila-curso">
            <div className="registro-campo">
              <label htmlFor="nombre">Nombre *</label>
              <div className={`registro-input-wrapper ${errores.nombre ? 'input-error' : ''}`}>
                <input
                  type="text"
                  id="nombre"
                  placeholder="Ej: Juan"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                />
              </div>
              {errores.nombre && <p className="registro-error">⚠ {errores.nombre}</p>}
            </div>

            <div className="registro-campo">
              <label htmlFor="apellido">Apellido *</label>
              <div className={`registro-input-wrapper ${errores.apellido ? 'input-error' : ''}`}>
                <input
                  type="text"
                  id="apellido"
                  placeholder="Ej: Pérez"
                  value={apellido}
                  onChange={e => setApellido(e.target.value)}
                />
              </div>
              {errores.apellido && <p className="registro-error">⚠ {errores.apellido}</p>}
            </div>
          </div>

          {/* Año y división en la misma fila, para armar el curso del alumno */}
          <div className="registro-fila-curso">
            <div className="registro-campo">
              <label htmlFor="anio">Año *</label>
              <select
                id="anio"
                value={anio}
                onChange={e => setAnio(e.target.value)}
                className={`registro-select ${errores.anio ? 'input-error' : ''}`}
              >
                <option value="">Año...</option>
                <option>1°</option>
                <option>2°</option>
                <option>3°</option>
                <option>4°</option>
                <option>5°</option>
                <option>6°</option>
              </select>
              {errores.anio && <p className="registro-error">⚠ {errores.anio}</p>}
            </div>

            <div className="registro-campo">
              <label htmlFor="division">División *</label>
              <select
                id="division"
                value={division}
                onChange={e => setDivision(e.target.value)}
                className={`registro-select ${errores.division ? 'input-error' : ''}`}
              >
                <option value="">División...</option>
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
                <option>5</option>
                <option>6</option>
                <option>7</option>
                <option>8</option>
                <option>9</option>
                <option>10</option>
              </select>
              {errores.division && <p className="registro-error">⚠ {errores.division}</p>}
            </div>
          </div>

          {/* Nombre de usuario elegido */}
          <div className="registro-campo">
            <label htmlFor="usuario">Usuario *</label>
            <div className={`registro-input-wrapper ${errores.usuario ? 'input-error' : ''}`}>
              <input
                type="text"
                id="usuario"
                placeholder="Elegí un nombre de usuario..."
                value={usuario}
                onChange={e => setUsuario(e.target.value)}
              />
            </div>
            {errores.usuario && <p className="registro-error">⚠ {errores.usuario}</p>}
          </div>

          {/* Contraseña y Confirmar en fila */}
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
                <button
                  type="button"
                  className="registro-toggle-password"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  aria-label={mostrarPassword ? 'Ocultar' : 'Mostrar'}
                >
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
                <button
                  type="button"
                  className="registro-toggle-password"
                  onClick={() => setMostrarConfirmacion(!mostrarConfirmacion)}
                  aria-label={mostrarConfirmacion ? 'Ocultar' : 'Mostrar'}
                >
                  <img src={mostrarConfirmacion ? ojoNoMostrar : ojoMostrar} alt="" />
                </button>
              </div>
              {errores.confirmacion && <p className="registro-error">⚠ {errores.confirmacion}</p>}
            </div>

          </div>

          <button className="registro-boton" onClick={handleSubmit}>
            Registrarse
          </button>

          {/* Mensaje de confirmación que aparece justo antes de redirigir */}
          {exito && (
            <p className="registro-exito">
              ✓ ¡Cuenta creada! Redirigiendo...
            </p>
          )}

        </div>

        <div className="registro-extra"> {/* Enlaces secundarios: ir a login o volver al inicio */ }
          <Link to="/login" className="registro-login-link">¿Ya tenés cuenta? Iniciá Sesión</Link>
          <Link to="/" className="registro-volver">← Volver al Inicio</Link>
        </div>
      </div>

    </div>
  )
}

export default Registro