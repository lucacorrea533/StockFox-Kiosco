/* Este componente permite cargar un menú del día con nombre, precio especial y descripción breve. El menú se guarda en localStorage para persistencia. Se pueden editar o eliminar los datos cargados. */
import { useState, useEffect } from 'react'
import iconEditar   from '../assets/icons/EditarBoton.png'
import iconEliminar from '../assets/icons/EliminarBoton.png'
import '../styles/GestionProductos.css'

const MENU_VACIO = {
  nombre:         '',
  precioEspecial: '',
  descripcion:    '',
}

function cargarMenuGuardado() {
  try {
    const guardado = localStorage.getItem('menuDelDia')
    return guardado ? JSON.parse(guardado) : null
  } catch {
    return null
  }
}

function MenuDelDia() {
  const [menuActivo, setMenuActivo]         = useState(cargarMenuGuardado)
  const [mostrarForm, setMostrarForm]       = useState(false)
  const [confirmarEliminar, setConfirmarEliminar] = useState(false)
  const [form, setForm]                     = useState(MENU_VACIO)
  const [errores, setErrores]               = useState({})
  const [guardado, setGuardado]             = useState(false)

  useEffect(() => {
    if (menuActivo) {
      localStorage.setItem('menuDelDia', JSON.stringify(menuActivo))
    } else {
      localStorage.removeItem('menuDelDia')
    }
  }, [menuActivo])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrores((prev) => ({ ...prev, [name]: '' }))
  }

  function validar() {
    const nuevosErrores = {}
    if (!form.nombre.trim())
      nuevosErrores.nombre = 'Ingresá el nombre de la comida.'
    if (!form.precioEspecial || form.precioEspecial <= 0)
      nuevosErrores.precioEspecial = 'Ingresá un precio válido.'
    return nuevosErrores
  }

  function handleGuardar() {
    const erroresEncontrados = validar()
    if (Object.keys(erroresEncontrados).length > 0) {
      setErrores(erroresEncontrados)
      return
    }
    const nuevoMenu = {
      nombre:         form.nombre.trim(),
      precioEspecial: Number(form.precioEspecial),
      descripcion:    form.descripcion.trim(),
      fecha:          new Date().toLocaleDateString('es-AR'),
    }
    setMenuActivo(nuevoMenu)
    setMostrarForm(false)
    setForm(MENU_VACIO)
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2500)
  }

  function abrirEdicion() {
    setForm({
      nombre:         menuActivo.nombre,
      precioEspecial: menuActivo.precioEspecial,
      descripcion:    menuActivo.descripcion,
    })
    setMostrarForm(true)
  }

  function confirmarYEliminar() {
    setMenuActivo(null)
    setMostrarForm(false)
    setForm(MENU_VACIO)
    setConfirmarEliminar(false)
  }

  function cancelarForm() {
    setMostrarForm(false)
    setForm(MENU_VACIO)
    setErrores({})
  }

  return (
    <section className="mdd-section">

      <div className="mdd-header">
        <h2 className="mdd-titulo">
          <span className="mdd-estrella">☆</span> Menú del Día
        </h2>
        {guardado && <span className="mdd-guardado-ok">✓ Guardado</span>}
      </div>

      {/* Sin menú cargado */}
      {!menuActivo && !mostrarForm && (
        <div className="mdd-vacio">
          <p className="mdd-vacio-texto">No hay menú del día cargado todavía.</p>
          <button className="mdd-btn-nuevo" onClick={() => setMostrarForm(true)}>
            + Agregar Menú del Día
          </button>
        </div>
      )}

      {/* Tarjeta menú activo */}
      {menuActivo && !mostrarForm && (
        <div className="mdd-card">
          <div className="mdd-card-info">
            <span className="mdd-card-nombre">{menuActivo.nombre}</span>
            {menuActivo.descripcion && (
              <span className="mdd-card-desc">{menuActivo.descripcion}</span>
            )}
            <span className="mdd-card-fecha">Cargado el {menuActivo.fecha}</span>
          </div>
          <div className="mdd-card-precio">
            ${Number(menuActivo.precioEspecial).toLocaleString('es-AR')}
          </div>
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

      {/* Formulario agregar / editar */}
      {mostrarForm && (
        <div className="mdd-controles">

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

          <div className="mdd-form-botones mdd-campo--full">
            <button className="mdd-btn-cancelar" onClick={cancelarForm}>Cancelar</button>
            <button className="mdd-btn-guardar"  onClick={handleGuardar}>
              {menuActivo ? 'Guardar cambios' : 'Agregar Menú del Día'}
            </button>
          </div>

        </div>
      )}

      {/* Modal confirmación eliminar */}
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