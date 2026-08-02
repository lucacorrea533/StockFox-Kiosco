/* Este archivo contiene el código de la página GestionUsuarios.
   Permite administrar el personal del kiosco y los alumnos registrados,
   incluyendo la creación, edición, eliminación y filtrado de usuarios. */

/* Hook de React utilizados para manejar estados, referencias y efectos secundarios. */
import { useState, useRef, useEffect } from 'react'

/* Barra lateral de navegación correspondiente a la vista de la encargada. */
import NavbarEncargada from '../components/NavbarEncargada'

/* Íconos utilizados por los botones de edición, eliminación y búsqueda. */
import iconEditar   from '../assets/icons/EditarBoton.png'
import iconEliminar from '../assets/icons/EliminarBoton.png'
import iconBuscador from '../assets/icons/BuscadorBoton.png'

/* Hoja de estilos específica de la página GestionUsuarios. */
import '../styles/GestionUsuarios.css'

/* Función auxiliar para realizar peticiones autenticadas al backend. */
import { authFetch } from "../api/authFetch"

/* Cliente Axios configurado para consumir la API del sistema. */
import api from "../api/axiosClient"

import { API_BASE_URL } from '../api/config'

/* Objeto utilizado para inicializar o reiniciar los campos del formulario. */
const FORM_VACIO = {
  nombre: '',
  apellido: '',
  usuario: '',
  contrasena: '',
  confirmar: ''
}

/* Genera el badge visual correspondiente al rol del usuario. */
function badgeRol(rol) {

  /* Relaciona cada rol con la clase CSS correspondiente. */
  const clases = {
    Encargada: 'gu-badge gu-badge--encargada',
    Ayudante: 'gu-badge gu-badge--ayudante'
  }

  /* Devuelve la etiqueta con el estilo apropiado según el rol. */
  return <span className={clases[rol] ?? 'gu-badge'}>{rol}</span>
}

/* Genera el badge visual correspondiente al estado del usuario. */
function badgeEstado(estado) {

  /* Si el usuario está activo utiliza una clase distinta que cuando está inactivo. */
  return (
    <span className={`gu-badge ${estado === 'Activo' ? 'gu-badge--activo' : 'gu-badge--inactivo'}`}>
      {estado}
    </span>
  )
}

/* Componente reutilizable utilizado para mostrar cualquier ventana modal.
   Permite cerrar el modal haciendo clic fuera de él o presionando la tecla ESC. */
function ModalWrapper({ onClose, children }) {

  /* Agrega y elimina el evento que detecta la tecla Escape. */
  useEffect(() => {

    /* Si el usuario presiona Escape se ejecuta la función para cerrar el modal. */
    function handleEsc(e) {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEsc)

    return () => document.removeEventListener('keydown', handleEsc)

  }, [onClose])

  /* Estructura del modal con overlay y contenido interno. */
  return (
    <div className="gu-modal-overlay" onClick={onClose}>
      <div className="gu-modal" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

/* Componente principal de la página Gestión de Usuarios. */
function GestionUsuarios() {

  /* Guarda la pestaña actualmente seleccionada (Personal o Alumnos). */
  const [pestana, setPestana] = useState('personal')

  /* Lista del personal del kiosco. */
  const [personal, setPersonal] = useState([])

  /* Lista de alumnos registrados. */
  const [alumnos, setAlumnos] = useState([])

  /* Texto ingresado en el buscador. */
  const [busqueda, setBusqueda] = useState('')

  /* Filtro por rol del personal. */
  const [filtroRol, setFiltroRol] = useState('')

  /* Filtro por estado del usuario. */
  const [filtroEstado, setFiltroEstado] = useState('')

  /* Filtro por curso para los alumnos. */
  const [filtroCurso, setFiltroCurso] = useState('')

  /* Indica si el modal de alta o edición está abierto. */
  const [modalAbierto, setModalAbierto] = useState(false)

  /* Usuario actualmente seleccionado para editar. */
  const [editando, setEditando] = useState(null)

  /* Usuario seleccionado para eliminar. */
  const [eliminando, setEliminando] = useState(null)

  /* Datos del formulario de alta o edición. */
  const [form, setForm] = useState(FORM_VACIO)

  /* Guarda los mensajes de error de validación del formulario. */
  const [errores, setErrores] = useState({})

  /* Usuario eliminado recientemente (para la opción de deshacer). */
  const [eliminado, setEliminado] = useState(null)

  /* Indica si se está activando o desactivando un usuario del personal. */
  const [toggleandoPersonal, setToggleandoPersonal] = useState(null)

  /* Indica si se está activando o desactivando un alumno. */
  const [toggleandoAlumno, setToggleandoAlumno] = useState(null)
  /* Indica si se está eliminando un alumno. */
  const [eliminandoAlumno, setEliminandoAlumno] = useState(null)
  /* Indica si se está reseteando el PIN de un alumno. */
  const [errorEliminarAlumno, setErrorEliminarAlumno] = useState('')
  const [reseteandoPin, setReseteandoPin] = useState(null)
  const [pinForm, setPinForm] = useState({ pin: '', confirmar: '' })
  const [pinErrores, setPinErrores] = useState({})

  /* Referencia utilizada para controlar el tiempo de duración del toast. */
  const toastTimeout = useRef(null)

    // Lista oficial de cursos de la ET 29 (T.M. + T.T. + T.N.)
  const CURSOS_OFICIALES = [
  '1°1°', '1°2°', '1°3°', '1°4°', '1°5°', '1°6°', '1°7°', '1°9°', '1°10°',
  '2°1°', '2°2°', '2°3°', '2°4°', '2°5°', '2°6°', '2°7°', '2°8°', '2°9°',
  '3°1°', '3°2°', '3°3°', '3°4°', '3°5°', '3°6°', '3°7°',
  '4°1°', '4°2°', '4°3°', '4°4°', '4°5°', '4°6°', '4°7°', '4°8°',
  '5°1°', '5°2°', '5°3°', '5°4°', '5°5°', '5°6°', '5°7°', '5°8°',
  '6°1°', '6°2°', '6°3°', '6°4°', '6°5°', '6°6°', '6°7°',
]

  /* Obtiene una lista de cursos únicos para llenar el selector de filtros. */
  const cursosUnicos = CURSOS_OFICIALES

  /* Al cargar la página obtiene el listado del personal desde la API. */
  useEffect(() => {

    authFetch(`${API_BASE_URL}/usuarios/`)
      .then(response => response.json())
      .then(data => {

        /* Convierte los datos recibidos al formato utilizado por el frontend. */
        const formateados = data.map(u => ({
          id: u.id_usuario,
          nombre: u.nombre,
          apellido: u.apellido,
          usuario: u.usuario,
          rol: u.rol,
          estado: u.activo ? 'Activo' : 'Inactivo'
        }))

        /* Guarda la información en el estado del componente. */
        setPersonal(formateados)

      })
      .catch(error => console.error(error))

  }, [])

  /* Obtiene el listado de alumnos desde la API al iniciar la página. */
  useEffect(() => {

    authFetch(`${API_BASE_URL}/alumnos/`)
      .then(response => response.json())
      .then(data => {

        /* Convierte la información recibida al formato utilizado por la interfaz. */
        const formateados = data.map(a => ({
          id: a.id_alumno,
          nombre: a.nombre,
          apellido: a.apellido,
          usuario: a.usuario,
          curso: a.curso,
          estado: a.activo ? 'Activo' : 'Inactivo'
        }))

        setAlumnos(formateados)

      })
      .catch(error => console.error(error))

  }, [])

  /* Filtra el listado del personal según búsqueda, rol y estado. */
  function filtrarPersonal(lista) {

    return lista.filter((u) => {

      const texto = `${u.nombre} ${u.apellido} ${u.usuario}`.toLowerCase()

      return (
        texto.includes(busqueda.toLowerCase()) &&
        (filtroRol ? u.rol === filtroRol : true) &&
        (filtroEstado ? u.estado === filtroEstado : true)
      )

    })
  }

  /* Filtra el listado de alumnos según búsqueda, curso y estado. */
  function filtrarAlumnos(lista) {

    return lista.filter((a) => {

      const texto = `${a.nombre} ${a.apellido} ${a.usuario}`.toLowerCase()

      return (
        texto.includes(busqueda.toLowerCase()) &&
        (filtroEstado ? a.estado === filtroEstado : true) &&
        (filtroCurso ? a.curso === filtroCurso : true)
      )

    })
  }

  /* Abre el modal para crear un nuevo usuario. */
  function abrirAgregar() {
    setEditando(null)
    setForm(FORM_VACIO)
    setErrores({})
    setModalAbierto(true)
  }

  /* Abre el modal cargando los datos del usuario seleccionado para editarlo. */
  function abrirEditar(u) {

    setEditando(u)

    setForm({
      nombre: u.nombre,
      apellido: u.apellido,
      usuario: u.usuario,
      contrasena: '',
      confirmar: ''
    })

    setErrores({})
    setModalAbierto(true)
  }

  /* Cierra el modal y restablece todos los valores del formulario. */
  function cerrarModal() {
    setModalAbierto(false)
    setEditando(null)
    setForm(FORM_VACIO)
    setErrores({})
  }

  /* Actualiza el estado del formulario cuando el usuario escribe en un campo. */
  function handleChange(e) {

    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value
    }))

    /* Limpia el mensaje de error del campo modificado. */
    setErrores((prev) => ({
      ...prev,
      [name]: ''
    }))
  }

  /* Verifica que todos los datos obligatorios sean correctos antes de guardar. */
  function validar() {

    const err = {}

    if (!form.nombre.trim())
      err.nombre = 'El nombre es obligatorio.'

    if (!form.apellido.trim())
      err.apellido = 'El apellido es obligatorio.'

    if (!form.usuario.trim())
      err.usuario = 'El usuario es obligatorio.'

    /* La contraseña solo es obligatoria cuando se crea un usuario nuevo. */
    if (!editando) {

      if (!form.contrasena)
        err.contrasena = 'La contraseña es obligatoria.'
      else if (form.contrasena.length < 6)
        err.contrasena = 'Mínimo 6 caracteres.'
    }

    /* Comprueba que ambas contraseñas coincidan. */
    if (form.contrasena && form.contrasena !== form.confirmar)
      err.confirmar = 'Las contraseñas no coinciden.'

    return err
  }

  /* Guarda un nuevo usuario o actualiza uno existente en la base de datos. */
  async function handleGuardar() {

    /* Primero valida todos los campos del formulario. */
    const err = validar()

    if (Object.keys(err).length > 0) {
      setErrores(err)
      return
    }

    /* Construye el objeto que será enviado al backend. */
    const payload = {
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      usuario: form.usuario.trim(),
    }

    /* Solo envía la contraseña cuando el usuario escribió una nueva. */
    if (form.contrasena)
      payload.password = form.contrasena

    try {

      /* Si existe un usuario en edición se actualiza. */
      if (editando) {

        const response = await api.put(`usuarios/editar/${editando.id}/`, payload)

        setPersonal(prev =>
          prev.map(u =>
            u.id === editando.id
              ? {
                  ...u,
                  nombre: response.data.nombre,
                  apellido: response.data.apellido,
                  usuario: response.data.usuario
                }
              : u
          )
        )

      } else {

        /* Si no existe, se crea un nuevo usuario. */
        const response = await api.post("usuarios/crear/", payload)

        setPersonal(prev => [
          ...prev,
          {
            id: response.data.id_usuario,
            nombre: response.data.nombre,
            apellido: response.data.apellido,
            usuario: response.data.usuario,
            rol: response.data.rol,
            estado: 'Activo',
          }
        ])
      }

      /* Cierra el formulario luego de guardar correctamente. */
      cerrarModal()

    } catch (error) {

      console.error(error)

      /* Muestra un mensaje de error si la operación falla. */
      setErrores({
        usuario: 'No se pudo guardar el usuario. Revisá los datos.'
      })
    }
  }

/* ── Operaciones de Eliminación y Control de Estados ───────────────────────── */

/* handleEliminar: Envía una petición DELETE al backend de Django para remover 
   físicamente el usuario del Personal. Si la llamada es exitosa, lo quita del estado 
   local para actualizar la lista en pantalla inmediatamente y cierra el modal. */
async function handleEliminar(u) {
  try {
    await api.delete(`usuarios/eliminar/${u.id}/`)
    setPersonal(prev => prev.filter(p => p.id !== u.id))
    setEliminando(null)
  } catch (error) {
    console.error(error)
  }
}

/* handleToggleEstadoPersonal: activa/desactiva a un usuario del personal contra la API real,
   igual que ya hacemos con productos y (cuando lo conectemos) con alumnos. */
async function handleToggleEstadoPersonal(u) {
  const activandoNuevo = u.estado !== 'Activo' // true si hoy está Inactivo y lo vamos a activar

  try {
    await api.put(`usuarios/activo/${u.id}/`, { activo: activandoNuevo })

    setPersonal(prev =>
      prev.map(p => p.id === u.id ? { ...p, estado: activandoNuevo ? 'Activo' : 'Inactivo' } : p)
    )
  } catch (error) {
    console.error(error)
  }
}

/* handleToggleEstadoAlumno: activa/desactiva a un alumno contra la API real. */
async function handleToggleEstadoAlumno(a) {
  const activandoNuevo = a.estado !== 'Activo'

  try {
    await api.put(`alumnos/activo/${a.id}/`, { activo: activandoNuevo })
    setAlumnos(prev =>
      prev.map(x => x.id === a.id ? { ...x, estado: activandoNuevo ? 'Activo' : 'Inactivo' } : x)
    )
  } catch (error) {
    console.error(error)
  }
}

/* handleEliminarAlumno: borra definitivamente. Si tiene pedidos asociados, el backend
   devuelve 409 con el motivo — lo mostramos en el modal en vez de fallar en silencio. */
async function handleEliminarAlumno(a) {
  try {
    await api.delete(`alumnos/eliminar/${a.id}/`)
    setAlumnos(prev => prev.filter(x => x.id !== a.id))
    setEliminandoAlumno(null)
    setErrorEliminarAlumno('')
  } catch (error) {
    setErrorEliminarAlumno(error.response?.data?.error || 'No se pudo eliminar el alumno.')
  }
}

/* validarPin / handleResetearPin: la Encargada le asigna una contraseña nueva al alumno. */
function validarPin() {
  const err = {}
  if (!pinForm.pin || pinForm.pin.length < 4) err.pin = 'Mínimo 4 caracteres.'
  if (pinForm.pin !== pinForm.confirmar) err.confirmar = 'No coinciden.'
  return err
}

async function handleResetearPin() {
  const err = validarPin()
  if (Object.keys(err).length > 0) {
    setPinErrores(err)
    return
  }

  try {
    await api.put(`alumnos/resetear-pin/${reseteandoPin.id}/`, { pin: pinForm.pin })
    cerrarModalPin()
  } catch (error) {
    console.error(error)
    setPinErrores({ pin: 'No se pudo actualizar la contraseña.' })
  }
}

function cerrarModalPin() {
  setReseteandoPin(null)
  setPinForm({ pin: '', confirmar: '' })
  setPinErrores({})
}

/* handleDeshacer: Permite revertir de forma local la eliminación de un usuario 
   reinsertándolo en el array local si la encargada pulsa el botón en el Toast 
   antes de que termine el temporizador activo (clearTimeout). */
function handleDeshacer() {
  if (!eliminado) return
  setPersonal((prev) => [...prev, eliminado])
  setEliminado(null)
  clearTimeout(toastTimeout.current) // Detiene la desaparición automática de la notificación
}

/* cambiarPestana: Controla la navegación del módulo. Al cambiar de sección, limpia todos 
   los filtros aplicados y el buscador para evitar que los criterios de una pestaña bloqueen la otra. */
function cambiarPestana(p) {
  setPestana(p)
  setBusqueda('')
  setFiltroRol('')
  setFiltroEstado('')
  setFiltroCurso('')
}

/* ── Aplicación de Filtros sobre los Listados Originales ───────────────────── */
const personalFiltrado = filtrarPersonal(personal).sort((a, b) => {
  if (a.rol === b.rol) return 0
  return a.rol === 'Encargada' ? -1 : 1
})
const alumnosFiltrados = filtrarAlumnos(alumnos).sort((a, b) =>
  `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`)
)

/* ── Renderizado del Módulo Principal ───────────────────────────────────────── */
return (
  <div style={{ display: 'flex' }}>
    {/* Menú de navegación lateral de la encargada */}
    <NavbarEncargada />

    <main className="gestion-usuarios">

      <div className="gu-header">
        <h1 className="gu-titulo">Gestión de Usuarios</h1>
        {pestana === 'personal' && (
          <button className="gu-btn-agregar" onClick={abrirAgregar}>+ Agregar Ayudante</button>
        )}
      </div>

      {/* Pestañas: Alternan las vistas principales y muestran contadores en tiempo real (length) */}
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

      {/* Barra de Filtros y Búsqueda: Se adapta según la pestaña que esté activa */}
      <div className="gu-barra">
        <div className="gu-buscador">
          <img src={iconBuscador} alt="Buscar" className="gu-buscador-icono" />
          <input
            type="text"
            name="busqueda-gestion-usuarios"
            placeholder="Buscar por nombre o usuario..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            autoComplete="off"
            data-lpignore="true"
            data-1p-ignore="true"
          />
        </div>

        {/* Filtro específico de Roles para el Personal del Buffet */}
        {pestana === 'personal' && (
          <select className="gu-select" value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)}>
            <option value="">▼ Rol</option>
            <option value="Encargada">Encargada</option>
            <option value="Ayudante">Ayudante</option>
          </select>
        )}

        {/* Filtro específico de Cursos (extraídos sin duplicados) para los Alumnos */}
        {pestana === 'alumnos' && (
          <select className="gu-select" value={filtroCurso} onChange={(e) => setFiltroCurso(e.target.value)}>
            <option value="">▼ Curso</option>
            {cursosUnicos.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        )}

        {/* Filtro común de Estado */}
        <select className="gu-select" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
          <option value="">▼ Estado</option>
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
        </select>
      </div>

      {/* ── renderTabla: Personal del buffet ── */}
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
                  className={`gu-btn-toggle ${u.estado === 'Activo' ? 'gu-btn-toggle--activo' : 'gu-btn-toggle--inactivo'} ${u.rol === 'Encargada' ? 'gu-btn--disabled' : ''}`}
                  onClick={() => u.rol !== 'Encargada' && setToggleandoPersonal(u)}
                  title={u.rol === 'Encargada' ? 'Las Encargadas no se pueden desactivar' : (u.estado === 'Activo' ? 'Desactivar' : 'Activar')}
                  disabled={u.rol === 'Encargada'}
                >
                  {u.estado === 'Activo' ? 'Desactivar' : 'Activar'}
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

      {/* ── renderTabla: Alumnos ── */}
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
                  <button className="gu-btn gu-btn--editar" onClick={() => setReseteandoPin(a)} title="Restablecer contraseña">
                    <img src={iconEditar} alt="Restablecer contraseña" />
                  </button>
                  <button
                    className={`gu-btn-toggle ${a.estado === 'Activo' ? 'gu-btn-toggle--activo' : 'gu-btn-toggle--inactivo'}`}
                    onClick={() => setToggleandoAlumno(a)}
                  >
                    {a.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                  </button>
                  <button className="gu-btn gu-btn--eliminar" onClick={() => setEliminandoAlumno(a)} title="Eliminar">
                    <img src={iconEliminar} alt="Eliminar" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </main>

    {/* ── Diálogo Modal de Formulario (Creación y Edición) ── */}
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

          {/* Campo informativo: Sólo se permite agregar cuentas con el rol de Ayudante */}
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

    {/* ── Modal de Confirmación de Borrado Físico ── */}
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

    {/* ── Modal de Confirmación de Activación/Desactivación ── */}
    {toggleandoPersonal && (
      <ModalWrapper onClose={() => setToggleandoPersonal(null)}>
        <div className="gu-modal--confirm">
          <p className="gu-confirm-texto">
            {toggleandoPersonal.estado === 'Activo'
              ? <>¿Estás segura que querés desactivar a <strong>{toggleandoPersonal.nombre} {toggleandoPersonal.apellido}</strong>? No va a poder iniciar sesión hasta que lo reactives.</>
              : <>¿Reactivar a <strong>{toggleandoPersonal.nombre} {toggleandoPersonal.apellido}</strong>? Va a poder volver a iniciar sesión.</>
            }
          </p>
          <div className="gu-modal-botones">
            <button className="gu-modal-btn gu-modal-btn--cancelar" onClick={() => setToggleandoPersonal(null)}>
              Cancelar
            </button>
            <button
              className="gu-modal-btn gu-modal-btn--guardar"
              onClick={() => { handleToggleEstadoPersonal(toggleandoPersonal); setToggleandoPersonal(null) }}
            >
              {toggleandoPersonal.estado === 'Activo' ? 'Sí, desactivar' : 'Sí, reactivar'}
            </button>
          </div>
        </div>
      </ModalWrapper>
    )}

    {/* ── Modal confirmar desactivar/activar Alumno ── */}
{toggleandoAlumno && (
  <ModalWrapper onClose={() => setToggleandoAlumno(null)}>
    <div className="gu-modal--confirm">
      <p className="gu-confirm-texto">
        {toggleandoAlumno.estado === 'Activo'
          ? <>¿Estás segura que querés desactivar a <strong>{toggleandoAlumno.nombre} {toggleandoAlumno.apellido}</strong>? No va a poder iniciar sesión hasta que lo reactives.</>
          : <>¿Reactivar a <strong>{toggleandoAlumno.nombre} {toggleandoAlumno.apellido}</strong>? Va a poder volver a iniciar sesión.</>
        }
      </p>
      <div className="gu-modal-botones">
        <button className="gu-modal-btn gu-modal-btn--cancelar" onClick={() => setToggleandoAlumno(null)}>Cancelar</button>
        <button
          className="gu-modal-btn gu-modal-btn--guardar"
          onClick={() => { handleToggleEstadoAlumno(toggleandoAlumno); setToggleandoAlumno(null) }}
        >
          {toggleandoAlumno.estado === 'Activo' ? 'Sí, desactivar' : 'Sí, reactivar'}
        </button>
      </div>
    </div>
  </ModalWrapper>
)}

{/* ── Modal confirmar eliminar Alumno ── */}
{eliminandoAlumno && (
  <ModalWrapper onClose={() => { setEliminandoAlumno(null); setErrorEliminarAlumno('') }}>
    <div className="gu-modal--confirm">
      <p className="gu-confirm-texto">
        ¿Estás segura que querés eliminar a <strong>{eliminandoAlumno.nombre} {eliminandoAlumno.apellido}</strong>?
      </p>
      {errorEliminarAlumno && <p className="gu-error">{errorEliminarAlumno}</p>}
      <div className="gu-modal-botones">
        <button className="gu-modal-btn gu-modal-btn--cancelar" onClick={() => { setEliminandoAlumno(null); setErrorEliminarAlumno('') }}>Cancelar</button>
        <button className="gu-modal-btn gu-modal-btn--eliminar" onClick={() => handleEliminarAlumno(eliminandoAlumno)}>Confirmar</button>
      </div>
    </div>
  </ModalWrapper>
)}

{/* ── Modal restablecer contraseña de Alumno ── */}
{reseteandoPin && (
  <ModalWrapper onClose={cerrarModalPin}>
    <button className="gu-modal-cerrar" onClick={cerrarModalPin}>✕</button>
    <h2 className="gu-modal-titulo">Restablecer contraseña de {reseteandoPin.nombre} {reseteandoPin.apellido}</h2>
    <div className="gu-modal-grid">
      <div className="gu-modal-campo">
        <label>Nueva Contraseña *</label>
        <input type="password" placeholder="••••••••" value={pinForm.pin}
          onChange={(e) => setPinForm(prev => ({ ...prev, pin: e.target.value }))} />
        {pinErrores.pin && <span className="gu-error">{pinErrores.pin}</span>}
      </div>
      <div className="gu-modal-campo">
        <label>Confirmar Contraseña *</label>
        <input type="password" placeholder="••••••••" value={pinForm.confirmar}
          onChange={(e) => setPinForm(prev => ({ ...prev, confirmar: e.target.value }))} />
        {pinErrores.confirmar && <span className="gu-error">{pinErrores.confirmar}</span>}
      </div>
    </div>
    <div className="gu-modal-botones">
      <button className="gu-modal-btn gu-modal-btn--cancelar" onClick={cerrarModalPin}>Cancelar</button>
      <button className="gu-modal-btn gu-modal-btn--guardar" onClick={handleResetearPin}>Guardar</button>
    </div>
  </ModalWrapper>
)}

{/* ── Toast deshacer ── */}
      {/* Mensaje flotante temporal (Toast) que aparece tras eliminar un usuario.
          Ofrece la opción de revertir la acción (Deshacer) de manera inmediata antes de que se limpie el estado. */}
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