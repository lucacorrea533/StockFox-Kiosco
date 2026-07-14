/* Este componente permite cargar un menú del día con nombre, precio especial y descripción breve. El menú se guarda en el backend (tabla MENU_DIA) y se muestra a los alumnos en el catálogo. Solo puede existir un menú activo a la vez. */

// Hooks de React: useState para manejar estado local, useEffect para efectos secundarios (carga inicial de datos)
import { useState, useEffect } from 'react'
// Ícono del botón de editar
import iconEditar   from '../assets/icons/EditarBoton.png'
// Ícono del botón de eliminar
import iconEliminar from '../assets/icons/EliminarBoton.png'
// Estilos compartidos con la vista de Gestión de Productos
import '../styles/GestionProductos.css'
// Cliente de axios configurado para hacer las peticiones al backend
import api from '../api/axiosClient'

// Objeto que representa el estado "vacío" del formulario, usado para inicializar o resetear
const MENU_VACIO = {
  nombre:         '',
  precioEspecial: '',
  descripcion:    '',
}

// Separador usado para combinar nombre y descripción en un solo campo de texto al guardar en el backend
const SEPARADOR = ' — '

// Componente que permite ver, crear, editar y eliminar el menú del día activo
function MenuDelDia() {
  // Estado con los datos del menú del día actualmente activo (null si no hay ninguno cargado)
  const [menuActivo, setMenuActivo]         = useState(null)
  // Estado que indica si todavía se está cargando la información inicial desde el backend
  const [cargando, setCargando]             = useState(true)
  // Estado que controla si se muestra el formulario de carga/edición
  const [mostrarForm, setMostrarForm]       = useState(false)
  // Estado que controla si se muestra el modal de confirmación antes de eliminar
  const [confirmarEliminar, setConfirmarEliminar] = useState(false)
  // Estado con los valores actuales del formulario
  const [form, setForm]                     = useState(MENU_VACIO)
  // Estado con los mensajes de error de validación, uno por campo
  const [errores, setErrores]               = useState({})
  // Estado booleano que indica si se acaba de guardar correctamente (para mostrar el mensaje "✓ Guardado")
  const [guardado, setGuardado]             = useState(false)

  // Efecto que se ejecuta una sola vez al montar el componente, para traer el menú del día actual (si existe)
  useEffect(() => {
    api.get('menu-dia/actual/')
      .then(response => {
        const data = response.data
        // Si el backend no devuelve datos, significa que no hay ningún menú activo
        if (!data) {
          setMenuActivo(null)
          return
        }
        // El backend guarda nombre y descripción combinados en un solo campo; acá los separamos de nuevo
        const [nombre, descripcion] = data.descripcion.split(SEPARADOR)
        setMenuActivo({
          id_menu: data.id_menu,
          nombre: nombre || data.descripcion, // Si no se pudo separar, usamos la descripción completa como nombre
          descripcion: descripcion || '',
          precioEspecial: Number(data.precio),
          fecha: new Date(data.fecha).toLocaleDateString('es-AR'),
        })
      })
      .catch(error => console.error(error)) // Si hay error, lo mostramos en consola
      .finally(() => setCargando(false)) // Termina la carga, haya salido bien o mal
  }, [])

  // Maneja los cambios en los inputs del formulario (nombre, precio, descripción)
  function handleChange(e) {
    const { name, value } = e.target
    // Actualizamos únicamente el campo correspondiente, manteniendo el resto del form igual
    setForm((prev) => ({ ...prev, [name]: value }))
    // Limpiamos el error de ese campo en particular, ya que el usuario lo está corrigiendo
    setErrores((prev) => ({ ...prev, [name]: '' }))
  }

  // Valida los campos obligatorios del formulario y devuelve un objeto con los errores encontrados
  function validar() {
    const nuevosErrores = {}
    if (!form.nombre.trim())
      nuevosErrores.nombre = 'Ingresá el nombre de la comida.'
    if (!form.precioEspecial || form.precioEspecial <= 0)
      nuevosErrores.precioEspecial = 'Ingresá un precio válido.'
    return nuevosErrores
  }

  // Función asincrónica que guarda el menú del día (ya sea uno nuevo o una edición) en el backend
  async function handleGuardar() {
    // Primero validamos los campos
    const erroresEncontrados = validar()
    // Si hay algún error, lo mostramos en pantalla y cortamos la ejecución (no se guarda nada)
    if (Object.keys(erroresEncontrados).length > 0) {
      setErrores(erroresEncontrados)
      return
    }

    // Combinamos nombre y descripción en un solo string, separados por el SEPARADOR definido arriba
    // (solo se agrega el separador y la descripción si esta última no está vacía)
    const descripcionCombinada = form.descripcion.trim()
      ? `${form.nombre.trim()}${SEPARADOR}${form.descripcion.trim()}`
      : form.nombre.trim()

    try {
      // Enviamos los datos al backend para guardar el menú del día
      const response = await api.post('menu-dia/guardar/', {
        descripcion: descripcionCombinada,
        precio: Number(form.precioEspecial),
      })

      // Actualizamos el estado local con la respuesta del backend (ya con el id generado, fecha, etc.)
      setMenuActivo({
        id_menu: response.data.id_menu,
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        precioEspecial: Number(response.data.precio),
        fecha: new Date(response.data.fecha).toLocaleDateString('es-AR'),
      })

      // Cerramos el formulario y lo reseteamos
      setMostrarForm(false)
      setForm(MENU_VACIO)
      // Mostramos el mensaje de "Guardado" y lo ocultamos automáticamente después de 2.5 segundos
      setGuardado(true)
      setTimeout(() => setGuardado(false), 2500)

    } catch (error) {
      console.error(error)
      alert('No se pudo guardar el menú del día.')
    }
  }

  // Abre el formulario en modo edición, precargando los datos del menú activo
  function abrirEdicion() {
    setForm({
      nombre:         menuActivo.nombre,
      precioEspecial: menuActivo.precioEspecial,
      descripcion:    menuActivo.descripcion,
    })
    setMostrarForm(true)
  }

  // Función asincrónica que elimina el menú del día actual en el backend, tras la confirmación del usuario
  async function confirmarYEliminar() {
    try {
      await api.delete('menu-dia/eliminar/')
      // Si se elimina correctamente, limpiamos todo el estado relacionado
      setMenuActivo(null)
      setMostrarForm(false)
      setForm(MENU_VACIO)
      setConfirmarEliminar(false)
    } catch (error) {
      console.error(error)
      alert('No se pudo eliminar el menú del día.')
    }
  }

  // Cancela la carga/edición del formulario, cerrándolo y limpiando los datos ingresados
  function cancelarForm() {
    setMostrarForm(false)
    setForm(MENU_VACIO)
    setErrores({})
  }

  // Mientras se está cargando la información inicial, no renderizamos nada
  if (cargando) return null

  return (
    <section className="mdd-section">

      {/* Encabezado de la sección: título + indicador de guardado exitoso */}
      <div className="mdd-header">
        <h2 className="mdd-titulo">
          <span className="mdd-estrella">☆</span> Menú del Día
        </h2>
        {guardado && <span className="mdd-guardado-ok">✓ Guardado</span>}
      </div>

      {/* Si no hay menú activo y el formulario no está abierto, mostramos el estado vacío con botón para agregar */}
      {!menuActivo && !mostrarForm && (
        <div className="mdd-vacio">
          <p className="mdd-vacio-texto">No hay menú del día cargado todavía.</p>
          <button className="mdd-btn-nuevo" onClick={() => setMostrarForm(true)}>
            + Agregar Menú del Día
          </button>
        </div>
      )}

      {/* Si hay un menú activo y el formulario no está abierto, mostramos la tarjeta con su información */}
      {menuActivo && !mostrarForm && (
        <div className="mdd-card">
          <div className="mdd-card-info">
            <span className="mdd-card-nombre">{menuActivo.nombre}</span>
            {/* La descripción es opcional, solo se muestra si existe */}
            {menuActivo.descripcion && (
              <span className="mdd-card-desc">{menuActivo.descripcion}</span>
            )}
            <span className="mdd-card-fecha">Cargado el {menuActivo.fecha}</span>
          </div>
          {/* Precio especial formateado con separador de miles en formato argentino */}
          <div className="mdd-card-precio">
            ${Number(menuActivo.precioEspecial).toLocaleString('es-AR')}
          </div>
          {/* Botones de acción: editar y eliminar el menú */}
          <div className="mdd-card-acciones">
            <button className="tp-btn tp-btn--editar" onClick={abrirEdicion} title="Editar menú">
              <img src={iconEditar} alt="Editar" className="tp-btn-icono" />
            </button>
            <button className="tp-btn tp-btn--eliminar" onClick={() => setConfirmarEliminar(true)} title="Eliminar menú">
              <img src={iconEliminar} alt="Eliminar" className="tp-btn-icono" />
            </button>
          </div>
        </div>
      )}

      {/* Formulario de carga/edición, solo visible cuando mostrarForm es true */}
      {mostrarForm && (
        <div className="mdd-controles">
          {/* Campo: nombre de la comida */}
          <div className="mdd-campo">
            <label className="mdd-label">Menú del día *</label>
            <input
              className="mdd-input"
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Ej: Milanesa con papas fritas"
            />
            {errores.nombre && <span className="mdd-error">{errores.nombre}</span>}
          </div>

          {/* Campo: precio especial, con símbolo $ */}
          <div className="mdd-campo">
            <label className="mdd-label">Precio especial *</label>
            <div className="mdd-precio-wrapper">
              <span className="mdd-precio-simbolo">$</span>
              <input
                className="mdd-precio-input"
                type="number"
                name="precioEspecial"
                value={form.precioEspecial}
                onChange={handleChange}
                placeholder="0"
                min="0"
              />
            </div>
            {errores.precioEspecial && <span className="mdd-error">{errores.precioEspecial}</span>}
          </div>

          {/* Campo: descripción breve (opcional), ocupa todo el ancho del formulario */}
          <div className="mdd-campo mdd-campo--full">
            <label className="mdd-label">Descripción breve</label>
            <input
              className="mdd-input"
              type="text"
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Descripción o promoción (opcional)"
            />
          </div>

          {/* Botones de acción del formulario: cancelar o guardar (el texto cambia según si es alta o edición) */}
          <div className="mdd-form-botones mdd-campo--full">
            <button className="mdd-btn-cancelar" onClick={cancelarForm}>Cancelar</button>
            <button className="mdd-btn-guardar"  onClick={handleGuardar}>
              {menuActivo ? 'Guardar cambios' : 'Agregar Menú del Día'}
            </button>
          </div>
        </div>
      )}

      {/* Modal de confirmación antes de eliminar el menú del día */}
      {confirmarEliminar && (
        <div className="modal-overlay">
          <div className="modal-caja">
            <p className="modal-texto">
              ¿Estás seguro que querés eliminar el menú del día <strong>"{menuActivo?.nombre}"</strong>?
            </p>
            <div className="modal-botones">
              <button className="modal-btn modal-btn--no" onClick={() => setConfirmarEliminar(false)}>
                No
              </button>
              <button className="modal-btn modal-btn--si" onClick={confirmarYEliminar}>
                Sí
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  )
}

export default MenuDelDia