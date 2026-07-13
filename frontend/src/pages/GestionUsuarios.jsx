/* Este archivo contiene el código de la página GestionUsuarios, que permite gestionar usuarios, roles y permisos. */

import { useState, useRef, useEffect } from 'react'
import NavbarEncargada from '../components/NavbarEncargada'
import iconEditar   from '../assets/icons/EditarBoton.png'
import iconEliminar from '../assets/icons/EliminarBoton.png'
import iconBuscador from '../assets/icons/BuscadorBoton.png'
import '../styles/GestionUsuarios.css'
import { authFetch } from "../api/authFetch"
import api from "../api/axiosClient"

const FORM_VACIO = { nombre: '', apellido: '', usuario: '', contrasena: '', confirmar: '' }

function badgeRol(rol) {
  const clases = { Encargada: 'gu-badge gu-badge--encargada', Ayudante: 'gu-badge gu-badge--ayudante' }
  return <span className={clases[rol] ?? 'gu-badge'}>{rol}</span>
}

function badgeEstado(estado) {
  return (
    <span className={`gu-badge ${estado === 'Activo' ? 'gu-badge--activo' : 'gu-badge--inactivo'}`}>
      {estado}
    </span>
  )
}

// Modal reutilizable con ESC
function ModalWrapper({ onClose, children }) {
  useEffect(() => {
    function handleEsc(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  return (
    <div className="gu-modal-overlay" onClick={onClose}>
      <div className="gu-modal" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

function GestionUsuarios() {
  const [pestana, setPestana] = useState('personal')

  const [personal, setPersonal] = useState([])
  const [alumnos,  setAlumnos]  = useState([])

  const [busqueda,     setBusqueda]     = useState('')
  const [filtroRol,    setFiltroRol]    = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroCurso,  setFiltroCurso]  = useState('')

  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando,     setEditando]     = useState(null)
  const [eliminando,   setEliminando]   = useState(null)

  const [form,    setForm]    = useState(FORM_VACIO)
  const [errores, setErrores] = useState({})

  const [eliminado,  setEliminado]  = useState(null)
  const toastTimeout = useRef(null)

  // Cursos únicos para el selector de filtro
  const cursosUnicos = [...new Set(alumnos.map((a) => a.curso))].sort()

  useEffect(() => {
  authFetch("http://127.0.0.1:8000/api/usuarios/")
    .then(response => response.json())
    .then(data => {
      const formateados = data.map(u => ({
        id: u.id_usuario,
        nombre: u.nombre,
        apellido: u.apellido,
        usuario: u.usuario,
        rol: u.rol,
        estado: 'Activo' // Todavía no existe columna "estado" en la BBDD, se muestra fijo por ahora
      }))
      setPersonal(formateados)
    })
    .catch(error => console.error(error))
}, [])

  useEffect(() => {
    authFetch("http://127.0.0.1:8000/api/alumnos/")
      .then(response => response.json())
      .then(data => {
        const formateados = data.map(a => ({
          id: a.id_alumno,
          nombre: a.nombre,
          apellido: a.apellido,
          usuario: a.usuario,
          curso: a.curso, // ya viene armado como "5°8°" desde el AlumnoSerializer
          estado: 'Activo'
        }))
        setAlumnos(formateados)
      })
      .catch(error => console.error(error))
  }, [])

  function filtrarPersonal(lista) {
    return lista.filter((u) => {
      const texto = `${u.nombre} ${u.apellido} ${u.usuario}`.toLowerCase()
      return (
        texto.includes(busqueda.toLowerCase()) &&
        (filtroRol    ? u.rol    === filtroRol    : true) &&
        (filtroEstado ? u.estado === filtroEstado : true)
      )
    })
  }

  function filtrarAlumnos(lista) {
    return lista.filter((a) => {
      const texto = `${a.nombre} ${a.apellido} ${a.usuario}`.toLowerCase()
      return (
        texto.includes(busqueda.toLowerCase()) &&
        (filtroEstado ? a.estado === filtroEstado : true) &&
        (filtroCurso  ? a.curso  === filtroCurso  : true)
      )
    })
  }

  function abrirAgregar() {
    setEditando(null); setForm(FORM_VACIO); setErrores({}); setModalAbierto(true)
  }

  function abrirEditar(u) {
    setEditando(u)
    setForm({ nombre: u.nombre, apellido: u.apellido, usuario: u.usuario, contrasena: '', confirmar: '' })
    setErrores({})
    setModalAbierto(true)
  }

  function cerrarModal() {
    setModalAbierto(false); setEditando(null); setForm(FORM_VACIO); setErrores({})
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrores((prev) => ({ ...prev, [name]: '' }))
  }

  function validar() {
    const err = {}
    if (!form.nombre.trim())   err.nombre   = 'El nombre es obligatorio.'
    if (!form.apellido.trim()) err.apellido  = 'El apellido es obligatorio.'
    if (!form.usuario.trim())  err.usuario   = 'El usuario es obligatorio.'
    if (!editando) {
      if (!form.contrasena)           err.contrasena = 'La contraseña es obligatoria.'
      else if (form.contrasena.length < 6) err.contrasena = 'Mínimo 6 caracteres.'
    }
    if (form.contrasena && form.contrasena !== form.confirmar)
      err.confirmar = 'Las contraseñas no coinciden.'
    return err
  }

async function handleGuardar() {
  const err = validar()
  if (Object.keys(err).length > 0) { setErrores(err); return }

  const payload = {
    nombre: form.nombre.trim(),
    apellido: form.apellido.trim(),
    usuario: form.usuario.trim(),
  }
  if (form.contrasena) payload.password = form.contrasena

  try {
    if (editando) {
      const response = await api.put(`usuarios/editar/${editando.id}/`, payload)
      setPersonal(prev => prev.map(u =>
        u.id === editando.id
          ? { ...u, nombre: response.data.nombre, apellido: response.data.apellido, usuario: response.data.usuario }
          : u
      ))
    } else {
      const response = await api.post("usuarios/crear/", payload)
      setPersonal(prev => [...prev, {
        id: response.data.id_usuario,
        nombre: response.data.nombre,
        apellido: response.data.apellido,
        usuario: response.data.usuario,
        rol: response.data.rol,
        estado: 'Activo',
      }])
    }
    cerrarModal()
  } catch (error) {
    console.error(error)
    setErrores({ usuario: 'No se pudo guardar el usuario. Revisá los datos.' })
  }
}

async function handleEliminar(u) {
  try {
    await api.delete(`usuarios/eliminar/${u.id}/`)
    setPersonal(prev => prev.filter(p => p.id !== u.id))
    setEliminando(null)
  } catch (error) {
    console.error(error)
  }
}

  function handleDeshacer() {
    if (!eliminado) return
    setPersonal((prev) => [...prev, eliminado])
    setEliminado(null)
    clearTimeout(toastTimeout.current)
  }

  function toggleEstadoAlumno(id) {
    setAlumnos((prev) =>
      prev.map((a) => a.id === id ? { ...a, estado: a.estado === 'Activo' ? 'Inactivo' : 'Activo' } : a)
    )
  }

  function cambiarPestana(p) {
    setPestana(p); setBusqueda(''); setFiltroRol(''); setFiltroEstado(''); setFiltroCurso('')
  }

  const personalFiltrado = filtrarPersonal(personal)
  const alumnosFiltrados = filtrarAlumnos(alumnos)

  return (
    <div style={{ display: 'flex' }}>
      <NavbarEncargada />

      <main className="gestion-usuarios">

        <div className="gu-header">
          <h1 className="gu-titulo">Gestión de Usuarios</h1>
          <button className="gu-btn-agregar" onClick={abrirAgregar}>+ Agregar Ayudante</button>
        </div>

        {/* Pestañas */}
        <div className="gu-pestanas">
          <button
            className={`gu-pestana ${pestana === 'personal' ? 'gu-pestana--activa' : ''}`}
            onClick={() => cambiarPestana('personal')}
          >
            Personal <span className="gu-pestana-count">{personal.length}</span>
          </button>
          <button
            className={`gu-pestana ${pestana === 'alumnos' ? 'gu-pestana--activa' : ''}`}
            onClick={() => cambiarPestana('alumnos')}
          >
            Alumnos <span className="gu-pestana-count">{alumnos.length}</span>
          </button>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="gu-barra">
          <div className="gu-buscador">
            <img src={iconBuscador} alt="Buscar" className="gu-buscador-icono" />
            <input
              type="text"
              placeholder="Buscar por nombre o usuario..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {pestana === 'personal' && (
            <select className="gu-select" value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)}>
              <option value="">▼ Rol</option>
              <option value="Encargada">Encargada</option>
              <option value="Ayudante">Ayudante</option>
            </select>
          )}

          {pestana === 'alumnos' && (
            <select className="gu-select" value={filtroCurso} onChange={(e) => setFiltroCurso(e.target.value)}>
              <option value="">▼ Curso</option>
              {cursosUnicos.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          )}

          <select className="gu-select" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="">▼ Estado</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>

        {/* ── Tabla Personal ── */}
        {pestana === 'personal' && (
          <div className="gu-tabla-wrapper">
            <div className="gu-tabla-encabezado gu-tabla-encabezado--personal">
              <span>Nombre Completo</span>
              <span>Usuario</span>
              <span>Rol</span>
              <span>Estado</span>
              <span>Acciones</span>
            </div>
            {personalFiltrado.length === 0 ? (
              <p className="gu-vacia">No se encontraron usuarios con ese criterio.</p>
            ) : (
              personalFiltrado.map((u) => (
                <div key={u.id} className="gu-tabla-fila gu-tabla-fila--personal">
                  <span className="gu-nombre-completo">{u.nombre} {u.apellido}</span>
                  <span className="gu-usuario-text">@{u.usuario}</span>
                  <span>{badgeRol(u.rol)}</span>
                  <span>{badgeEstado(u.estado)}</span>
                  <div className="gu-acciones">
                    <button className="gu-btn gu-btn--editar" onClick={() => abrirEditar(u)} title="Editar">
                      <img src={iconEditar} alt="Editar" />
                    </button>
                    <button
                      className={`gu-btn gu-btn--eliminar ${u.rol === 'Encargada' ? 'gu-btn--disabled' : ''}`}
                      onClick={() => u.rol !== 'Encargada' && setEliminando(u)}
                      title={u.rol === 'Encargada' ? 'Las Encargadas no se pueden eliminar' : 'Eliminar'}
                      disabled={u.rol === 'Encargada'}
                    >
                      <img src={iconEliminar} alt="Eliminar" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Tabla Alumnos ── */}
        {pestana === 'alumnos' && (
          <div className="gu-tabla-wrapper">
            <div className="gu-tabla-encabezado gu-tabla-encabezado--alumnos">
              <span>Nombre Completo</span>
              <span>Usuario</span>
              <span>Curso</span>
              <span>Estado</span>
              <span>Acciones</span>
            </div>
            {alumnosFiltrados.length === 0 ? (
              <p className="gu-vacia">No se encontraron alumnos con ese criterio.</p>
            ) : (
              alumnosFiltrados.map((a) => (
                <div key={a.id} className="gu-tabla-fila gu-tabla-fila--alumnos">
                  <span className="gu-nombre-completo">{a.nombre} {a.apellido}</span>
                  <span className="gu-usuario-text">@{a.usuario}</span>
                  <span className="gu-curso">{a.curso}</span>
                  <span>{badgeEstado(a.estado)}</span>
                  <div className="gu-acciones">
                    <button
                      className={`gu-btn-toggle ${a.estado === 'Activo' ? 'gu-btn-toggle--activo' : 'gu-btn-toggle--inactivo'}`}
                      onClick={() => toggleEstadoAlumno(a.id)}
                    >
                      {a.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </main>

      {/* ── Modal Agregar / Editar Ayudante ── */}
      {modalAbierto && (
        <ModalWrapper onClose={cerrarModal}>
          <button className="gu-modal-cerrar" onClick={cerrarModal}>✕</button>
          <h2 className="gu-modal-titulo">{editando ? 'Editar Usuario' : 'Agregar Ayudante'}</h2>

          <div className="gu-modal-grid">
            <div className="gu-modal-campo">
              <label>Nombre *</label>
              <input name="nombre" type="text" placeholder="Nombre" value={form.nombre} onChange={handleChange} />
              {errores.nombre && <span className="gu-error">{errores.nombre}</span>}
            </div>

            <div className="gu-modal-campo">
              <label>Apellido *</label>
              <input name="apellido" type="text" placeholder="Apellido" value={form.apellido} onChange={handleChange} />
              {errores.apellido && <span className="gu-error">{errores.apellido}</span>}
            </div>

            <div className="gu-modal-campo">
              <label>Usuario *</label>
              <input name="usuario" type="text" placeholder="Nombre de usuario" value={form.usuario} onChange={handleChange} />
              {errores.usuario && <span className="gu-error">{errores.usuario}</span>}
            </div>

            <div className="gu-modal-campo">
              <label>Rol</label>
              <input type="text" value="Ayudante (automático)" readOnly className="gu-input-readonly" />
            </div>

            <div className="gu-modal-campo">
              <label>{editando ? 'Nueva Contraseña' : 'Contraseña *'}</label>
              <input
                name="contrasena" type="password"
                placeholder={editando ? 'Dejar vacío para no cambiar' : '••••••••'}
                value={form.contrasena} onChange={handleChange}
              />
              {errores.contrasena && <span className="gu-error">{errores.contrasena}</span>}
            </div>

            <div className="gu-modal-campo">
              <label>{editando ? 'Confirmar Nueva Contraseña' : 'Confirmar Contraseña *'}</label>
              <input name="confirmar" type="password" placeholder="••••••••" value={form.confirmar} onChange={handleChange} />
              {errores.confirmar && <span className="gu-error">{errores.confirmar}</span>}
            </div>
          </div>

          <div className="gu-modal-botones">
            <button className="gu-modal-btn gu-modal-btn--cancelar" onClick={cerrarModal}>Cancelar</button>
            <button className="gu-modal-btn gu-modal-btn--guardar"  onClick={handleGuardar}>Guardar</button>
          </div>
        </ModalWrapper>
      )}

      {/* ── Modal Confirmar Eliminación ── */}
      {eliminando && (
        <ModalWrapper onClose={() => setEliminando(null)}>
          <div className="gu-modal--confirm">
            <p className="gu-confirm-texto">
              ¿Estás segura de que querés eliminar a{' '}
              <strong>{eliminando.nombre} {eliminando.apellido}</strong>?
            </p>
            <div className="gu-modal-botones">
              <button className="gu-modal-btn gu-modal-btn--cancelar" onClick={() => setEliminando(null)}>
                Cancelar
              </button>
              <button className="gu-modal-btn gu-modal-btn--eliminar" onClick={() => handleEliminar(eliminando)}>
                Confirmar
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* ── Toast deshacer ── */}
      {eliminado && (
        <div className="gu-toast">
          <span>"{eliminado.nombre} {eliminado.apellido}" eliminado</span>
          <button className="gu-toast-btn" onClick={handleDeshacer}>Deshacer</button>
        </div>
      )}

    </div>
  )
}

export default GestionUsuarios