/* Este archivo contiene el código de la página GestionProveedores.
   Permite a la encargada llevar un control exhaustivo de los proveedores del buffet:
   administrar la lista de contactos, agendar los días de visita, registrar compras (deudas) 
   y pagos realizados, y calcular saldos de forma automática para evitar deudas vencidas. */

import { useState, useEffect, useRef } from 'react'
import NavbarEncargada from '../components/NavbarEncargada'
import iconBuscador from '../assets/icons/BuscadorBoton.png'
import iconEditar   from '../assets/icons/EditarBoton.png'
import iconEliminar from '../assets/icons/EliminarBoton.png'
import iconCheck    from '../assets/icons/SimboloCheck.png'
import iconAviso    from '../assets/icons/Aviso.png'
import '../styles/GestionProveedores.css'

/* ── Datos iniciales mockeados (para pruebas locales antes de conectar la API) ── */

/* Listado inicial de proveedores con su información de contacto rápida */
const PROVEEDORES_INICIALES = [
  { id: 1, nombre: 'Panadería La Espiga',         telefono: '1156781234', diasVisita: 'Lunes, Viernes'   },
  { id: 2, nombre: 'Baggio Jugos S.A.',            telefono: '1167890123', diasVisita: 'Martes, Jueves'  },
  { id: 3, nombre: 'Guaymallen S.A.',              telefono: '1123456789', diasVisita: 'Lunes'            },
  { id: 4, nombre: 'Distribuidora La Continental', telefono: '1145678901', diasVisita: 'Lunes, Miércoles' },
]

/* Registro histórico de compras que se le hicieron a los proveedores */
const COMPRAS_INICIALES = [
  { id: 1, idProveedor: 1, descripcion: 'Medialuna x150, Empanada x80',                         fecha: '04/05/2026', monto: 15000 },
  { id: 2, idProveedor: 2, descripcion: 'Jugo Baggio x200',                                     fecha: '05/05/2026', monto: 12500 },
  { id: 3, idProveedor: 1, descripcion: 'Medialuna c/JyQ x80',                                  fecha: '05/05/2026', monto: 20000 },
  { id: 4, idProveedor: 4, descripcion: 'Saladix Jamón x100, Nikitos Papas Fritas x100',        fecha: '07/05/2026', monto: 18000 },
]

/* Registro de pagos que la encargada le fue entregando a cada proveedor */
const PAGOS_INICIALES = [
  { id: 1, idProveedor: 1, monto: 15000, fecha: '04/05/2026' },
  { id: 2, idProveedor: 2, monto: 12500, fecha: '05/05/2026' },
  { id: 3, idProveedor: 1, monto: 20000, fecha: '05/05/2026' },
  { id: 4, idProveedor: 4, monto: 10000, fecha: '07/05/2026' },
]

/* Estructuras vacías para inicializar o resetear los formularios limpios */
const FORM_PROV_VACIO = { nombre: '', telefono: '', diasVisita: '' }
const FORM_COMP_VACIO = { idProveedor: '', descripcion: '', fecha: '', monto: '' }
const FORM_PAGO_VACIO = { idProveedor: '', monto: '', fecha: '' }

/* ── Funciones de Utilidad ─────────────────────────────────────────────────── */

/* calcularSaldo: Filtra y suma todas las compras y todos los pagos de un proveedor
   específico para obtener el estado de cuenta y la deuda pendiente. */
function calcularSaldo(idProveedor, compras, pagos) {
  // Filtra las compras de este proveedor y suma sus montos usando reduce
  const totalComp = compras.filter((c) => c.idProveedor === idProveedor).reduce((s, c) => s + c.monto, 0)
  // Filtra los pagos de este proveedor y suma sus montos
  const totalPag  = pagos.filter((p)   => p.idProveedor === idProveedor).reduce((s, p) => s + p.monto, 0)
  // La deuda es la diferencia. Si dio negativo por algún motivo, se fuerza a 0 usando Math.max
  return { totalComp, totalPag, deuda: Math.max(0, totalComp - totalPag) }
}

/* ── Componentes Secundarios y Maquetación ─────────────────────────────────── */

/* ModalWrapper: Estructura contenedora genérica para los modales del sitio.
   Escucha el teclado para cerrarse con la tecla 'Escape' y evita que los clics dentro de la caja
   se propaguen cerrando el modal por accidente (stopPropagation). */
function ModalWrapper({ onClose, children, ancho = 480 }) {
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    // Limpieza del evento global al desmontar el componente para evitar fugas de memoria
    return () => document.removeEventListener('keydown', fn)
  }, [onClose])

  return (
    <div className="gp-overlay" onClick={onClose}>
      <div className="gp-modal" style={{ width: ancho }} onClick={(e) => e.stopPropagation()}>
        <button className="gp-modal-cerrar" onClick={onClose}>✕</button>
        {children}
      </div>
    </div>
  )
}

/* SaldoCard: Tarjeta de saldo individual que muestra de un vistazo rápido si el proveedor
   está al día ("Saldado") o si tiene pagos pendientes, dando la opción directa de saldar todo. */
function SaldoCard({ prov, compras, pagos, onSaldar }) {
  const [abierto, setAbierto] = useState(false)
  // Obtenemos los números del estado de cuenta de este proveedor
  const { totalComp, totalPag, deuda } = calcularSaldo(prov.id, compras, pagos)
  const saldado = deuda === 0

  return (
    <div className={`gp-saldo-card ${saldado ? 'gp-saldo-card--saldado' : 'gp-saldo-card--debe'}`}>
      <p className="gp-saldo-nombre">{prov.nombre}</p>
      {/* toLocaleString('es-AR') formatea los números con separadores de miles adecuados */}
      <p className="gp-saldo-linea">Compras: ${totalComp.toLocaleString('es-AR')}</p>
      <p className="gp-saldo-linea">Pagos:   ${totalPag.toLocaleString('es-AR')}</p>
      <div className="gp-saldo-footer">
        {saldado ? (
          <>
            <img src={iconCheck} alt="Saldado" className="gp-saldo-icono" />
            <span className="gp-saldo-valor gp-saldo-valor--ok">$0 — Saldado</span>
          </>
        ) : (
          <div style={{ width: '100%' }}>
            <div className="gp-saldo-footer">
              <img src={iconAviso} alt="Debe" className="gp-saldo-icono" />
              <span className="gp-saldo-valor gp-saldo-valor--debe">
                Debe: ${deuda.toLocaleString('es-AR')}
              </span>
            </div>
            <button
              className="gp-btn-saldar"
              onClick={() => { setAbierto(false); onSaldar(prov.id, deuda) }}
            >
              ✓ Marcar como saldado
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* BadgePago: Etiqueta interactiva dentro de la tabla de compras. 
   Al hacer clic, despliega un popover flotante con el desglose detallado de la cuenta del proveedor. */
function BadgePago({ compra, compras, pagos, proveedores }) {
  const [abierto, setAbierto] = useState(false)
  const ref = useRef(null)
  const { totalComp, totalPag, deuda } = calcularSaldo(compra.idProveedor, compras, pagos)
  const pagado = deuda === 0
  const prov   = proveedores.find((p) => p.id === compra.idProveedor)

  /* Efecto para cerrar el popover si se hace clic afuera del mismo */
  useEffect(() => {
    if (!abierto) return
    function handleClick(e) { 
      // Si el clic fue afuera del wrapper contenedor, cerramos el popover
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false) 
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [abierto])

  return (
    <div className="gp-badge-wrapper" ref={ref}>
      <span
        className={`gp-badge-pago ${pagado ? 'gp-badge-pago--pagado' : 'gp-badge-pago--parcial'}`}
        onClick={() => setAbierto((v) => !v)}
        title="Ver desglose"
      >
        {pagado ? 'Pagado' : 'Parcial'}
      </span>

      {/* Popover con desglose matemático de la cuenta del proveedor */}
      {abierto && (
        <div className="gp-badge-popover">
          <p className="gp-popover-titulo">{prov?.nombre ?? '—'}</p>
          <p className="gp-popover-linea">Total compras: <strong>${totalComp.toLocaleString('es-AR')}</strong></p>
          <p className="gp-popover-linea">Total pagado:  <strong>${totalPag.toLocaleString('es-AR')}</strong></p>
          <hr className="gp-popover-sep" />
          {pagado ? (
            <p className="gp-popover-ok">✓ Sin deuda pendiente</p>
          ) : (
            <p className="gp-popover-debe">Deuda: <strong>${deuda.toLocaleString('es-AR')}</strong></p>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Componente Principal ─────────────────────────────────────────────────── */
export default function GestionProveedores() {
  /* pestana: Controla si estamos viendo la sección 'proveedores' o 'compras' */
  const [pestana,      setPestana]      = useState('proveedores')
  
  /* Estados que contienen los listados principales del módulo */
  const [proveedores,  setProveedores]  = useState(PROVEEDORES_INICIALES)
  const [compras,      setCompras]      = useState(COMPRAS_INICIALES)
  const [pagos,        setPagos]        = useState(PAGOS_INICIALES)
  
  /* busqueda: Texto que ingresa la encargada para filtrar el listado de proveedores */
  const [busqueda,     setBusqueda]     = useState('')

  /* Estados de control para la visibilidad de ventanas modales */
  const [modalProv,    setModalProv]    = useState(false)
  const [editandoProv, setEditandoProv] = useState(null) // Guarda el objeto proveedor si estamos editando, o null si estamos creando
  const [elimProv,     setElimProv]     = useState(null)     // Almacena el proveedor seleccionado para confirmar su eliminación
  const [modalComp,    setModalComp]    = useState(false)
  const [modalPago,    setModalPago]    = useState(false)

  /* Estados para controlar los inputs de los formularios de carga */
  const [formProv, setFormProv] = useState(FORM_PROV_VACIO)
  const [errProv,  setErrProv]  = useState({}) // Almacena mensajes de validación para el formulario de proveedor
  const [formComp, setFormComp] = useState(FORM_COMP_VACIO)
  const [errComp,  setErrComp]  = useState({}) // Mensajes de validación de compras
  const [formPago, setFormPago] = useState(FORM_PAGO_VACIO)
  const [errPago,  setErrPago]  = useState({}) // Mensajes de validación de pagos

  /* Estados para las notificaciones flotantes (Toasts) de éxito y la acción de "Deshacer" */
  const [toast, setToast]  = useState(null)
  const [undoSaldar, setUndoSaldar] = useState(null) // Guarda datos del pago generado al saldar para poder revertirlo
  const toastRef = useRef(null)

  /* dispararToast: Muestra una alerta flotante de éxito y la borra automáticamente después de 3.5 segundos */
  function dispararToast(msg) {
    if (toastRef.current) clearTimeout(toastRef.current)
    setToast(msg)
    toastRef.current = setTimeout(() => setToast(null), 3500)
  }

  /* Filtro de proveedores en tiempo real por Nombre, Teléfono o Días de visita */
  const provFiltrados = proveedores.filter((p) =>
    `${p.nombre} ${p.telefono} ${p.diasVisita}`.toLowerCase().includes(busqueda.toLowerCase())
  )

  /* ── CRUD Proveedores ─────────────────────────────────────────────────── */
  
  /* Abre el modal de proveedores en modo creación, limpiando inputs y errores antiguos */
  function abrirAgregarProv()   { setEditandoProv(null); setFormProv(FORM_PROV_VACIO); setErrProv({}); setModalProv(true) }
  
  /* Abre el modal de proveedores cargando los campos del proveedor elegido para editar */
  function abrirEditarProv(p)   { setEditandoProv(p); setFormProv({ nombre: p.nombre, telefono: p.telefono, diasVisita: p.diasVisita }); setErrProv({}); setModalProv(true) }
  
  /* Restablece el formulario al cerrar el modal de proveedores */
  function cerrarModalProv()    { setModalProv(false); setEditandoProv(null); setFormProv(FORM_PROV_VACIO); setErrProv({}) }

  /* Valida que los campos obligatorios del proveedor no estén vacíos */
  function validarProv() {
    const err = {}
    if (!formProv.nombre.trim())     err.nombre     = 'El nombre es obligatorio.'
    if (!formProv.telefono.trim())   err.telefono   = 'El teléfono es obligatorio.'
    if (!formProv.diasVisita.trim()) err.diasVisita = 'Los días de visita son obligatorios.'
    return err
  }

  /* Crea un nuevo proveedor o guarda las modificaciones del existente en el estado */
  function guardarProv() {
    const err = validarProv(); if (Object.keys(err).length > 0) { setErrProv(err); return }
    if (editandoProv) {
      // Actualización en el estado local buscando por id
      setProveedores((prev) => prev.map((p) => p.id === editandoProv.id ? { ...p, ...formProv } : p))
      dispararToast('Proveedor actualizado.')
    } else {
      // Creación con ID único temporal usando Date.now()
      setProveedores((prev) => [...prev, { id: Date.now(), ...formProv }])
      dispararToast('Proveedor agregado.')
    }
    cerrarModalProv()
  }

  /* Elimina el proveedor seleccionado y limpia en cascada todas sus compras y pagos relacionados */
  function eliminarProv() {
    setProveedores((prev) => prev.filter((p) => p.id !== elimProv.id))
    setCompras((prev) => prev.filter((c) => c.idProveedor !== elimProv.id))
    setPagos((prev)   => prev.filter((pa) => pa.idProveedor !== elimProv.id))
    dispararToast(`"${elimProv.nombre}" eliminado.`)
    setElimProv(null)
  }

  /* ── Registrar Compra ─────────────────────────────────────────────────── */
  function cerrarModalComp() { setModalComp(false); setFormComp(FORM_COMP_VACIO); setErrComp({}) }

  /* Valida los campos del formulario de registro de compras */
  function validarComp() {
    const err = {}
    if (!formComp.idProveedor)         err.idProveedor = 'Seleccioná un proveedor.'
    if (!formComp.descripcion.trim())  err.descripcion = 'Ingresá los productos.'
    if (!formComp.fecha)               err.fecha       = 'La fecha es obligatoria.'
    if (!formComp.monto || formComp.monto <= 0) err.monto = 'Ingresá un monto válido.'
    return err
  }

  /* Agrega una nueva compra al historial local */
  function guardarComp() {
    const err = validarComp(); if (Object.keys(err).length > 0) { setErrComp(err); return }
    setCompras((prev) => [...prev, {
      id: Date.now(), idProveedor: Number(formComp.idProveedor),
      descripcion: formComp.descripcion.trim(), fecha: formComp.fecha, monto: Number(formComp.monto),
    }])
    dispararToast('Compra registrada. Saldo actualizado.')
    cerrarModalComp()
  }

  /* ── Registrar Pago ───────────────────────────────────────────────────── */
  function cerrarModalPago() { setModalPago(false); setFormPago(FORM_PAGO_VACIO); setErrPago({}) }

  /* Valida los campos del formulario de registro de pagos */
  function validarPago() {
    const err = {}
    if (!formPago.idProveedor)        err.idProveedor = 'Seleccioná un proveedor.'
    if (!formPago.monto || formPago.monto <= 0) err.monto = 'Ingresá un monto válido.'
    if (!formPago.fecha)              err.fecha       = 'La fecha es obligatoria.'
    return err
  }

  /* Agrega un nuevo pago realizado al proveedor en el historial local */
  function guardarPago() {
    const err = validarPago(); if (Object.keys(err).length > 0) { setErrPago(err); return }
    setPagos((prev) => [...prev, {
      id: Date.now(), idProveedor: Number(formPago.idProveedor),
      monto: Number(formPago.monto), fecha: formPago.fecha,
    }])
    dispararToast('Pago registrado. Deuda actualizada.')
    cerrarModalPago()
  }

  /* ── Marcar como saldado (Simula un pago por el valor exacto de la deuda restante) ── */
  function saldarProveedor(idProveedor, deuda) {
    const hoy   = new Date().toLocaleDateString('es-AR')
    const pagoId = Date.now()
    const prov   = proveedores.find((p) => p.id === idProveedor)
    // Agrega el pago exacto para saldar la deuda
    setPagos((prev) => [...prev, { id: pagoId, idProveedor, monto: deuda, fecha: hoy }])

    // Dispara la notificación interactiva de "Deshacer" por 5 segundos
    if (toastRef.current) clearTimeout(toastRef.current)
    setUndoSaldar({ pagoId, nombre: prov?.nombre ?? '' })
    toastRef.current = setTimeout(() => setUndoSaldar(null), 5000)
  }

  /* Elimina el pago ficticio de saldo para restaurar la deuda que tenía el proveedor anteriormente */
  function deshacerSaldar() {
    if (!undoSaldar) return
    setPagos((prev) => prev.filter((p) => p.id !== undoSaldar.pagoId))
    clearTimeout(toastRef.current)
    setUndoSaldar(null)
  }

  /* ── Renderizado del Componente ─────────────────────────────────────────── */
  return (
    <div style={{ display: 'flex' }}>
      {/* Barra de navegación de la encargada */}
      <NavbarEncargada />

      <main className="gestion-proveedores">
        <h1 className="gp-titulo">Proveedores y Compras</h1>

        {/* Pestañas de Navegación: Cambian la sección activa entre Proveedores y Compras */}
        <div className="gp-pestanas">
          <button className={`gp-pestana ${pestana === 'proveedores' ? 'gp-pestana--activa' : ''}`} onClick={() => setPestana('proveedores')}>Proveedores</button>
          <button className={`gp-pestana ${pestana === 'compras'     ? 'gp-pestana--activa' : ''}`} onClick={() => setPestana('compras')}>Compras</button>
        </div>

        {/* ══ MÓDULO DE PROVEEDORES ══ */}
        {pestana === 'proveedores' && (
          <>
            <section className="gp-seccion">
              <div className="gp-seccion-header">
                <h2 className="gp-seccion-titulo">Listado de Proveedores</h2>
                <button className="gp-btn-agregar" onClick={abrirAgregarProv}>+ Agregar Proveedor</button>
              </div>

              {/* Caja del buscador por texto */}
              <div className="gp-buscador-wrapper">
                <img src={iconBuscador} alt="Buscar" className="gp-buscador-icono" />
                <input type="text" placeholder="Buscar por nombre, teléfono o días de visita..."
                  value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="gp-buscador-input" />
              </div>

              {/* Tabla de Proveedores */}
              <div className="gp-tabla-wrapper">
                <div className="gp-tabla-enc gp-tabla-enc--prov">
                  <span>Nombre</span><span>Teléfono</span><span>Días de Visita</span><span>Acciones</span>
                </div>
                {provFiltrados.length === 0 ? (
                  <p className="gp-vacia">No hay proveedores con ese criterio.</p>
                ) : provFiltrados.map((prov) => (
                  <div key={prov.id} className="gp-tabla-fila gp-tabla-fila--prov">
                    <span className="gp-prov-nombre">{prov.nombre}</span>
                    <span>{prov.telefono}</span>
                    <span>{prov.diasVisita}</span>
                    <div className="gp-acciones">
                      <button className="gp-btn gp-btn--editar"   onClick={() => abrirEditarProv(prov)} title="Editar"><img src={iconEditar}   alt="Editar"   /></button>
                      <button className="gp-btn gp-btn--eliminar" onClick={() => setElimProv(prov)}     title="Eliminar"><img src={iconEliminar} alt="Eliminar" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Grid de Saldos de Proveedores */}
            <section className="gp-seccion">
              <h2 className="gp-seccion-titulo">Saldo adeudado por proveedor</h2>
              <p className="gp-seccion-nota">El saldo se actualiza automáticamente al registrar compras o pagos.</p>
              <div className="gp-saldo-grid">
                {proveedores.map((prov) => (
                  <SaldoCard key={prov.id} prov={prov} compras={compras} pagos={pagos} onSaldar={saldarProveedor} />
                ))}
              </div>
            </section>
          </>
        )}

        {/* ══ MÓDULO DE COMPRAS ══ */}
        {pestana === 'compras' && (
          <>
            <section className="gp-seccion">
              <div className="gp-seccion-header">
                <h2 className="gp-seccion-titulo">Historial de Compras</h2>
                <div className="gp-seccion-header-acciones">
                  <button className="gp-btn-agregar gp-btn-agregar--secundario" onClick={() => { setFormPago(FORM_PAGO_VACIO); setErrPago({}); setModalPago(true) }}>+ Registrar Pago</button>
                  <button className="gp-btn-agregar"                            onClick={() => { setFormComp(FORM_COMP_VACIO); setErrComp({}); setModalComp(true) }}>+ Registrar Compra</button>
                </div>
              </div>

              {/* Tabla de Historial de Compras */}
              <div className="gp-tabla-wrapper">
                <div className="gp-tabla-enc gp-tabla-enc--compras">
                  <span>Proveedor</span><span>Productos</span><span>Fecha</span><span>Monto Total</span><span>Pago</span>
                </div>
                {compras.length === 0 ? (
                  <p className="gp-vacia">No hay compras registradas todavía.</p>
                ) : compras.map((c) => {
                  const prov = proveedores.find((p) => p.id === c.idProveedor)
                  return (
                    <div key={c.id} className="gp-tabla-fila gp-tabla-fila--compras">
                      <span className="gp-prov-nombre">{prov?.nombre ?? '—'}</span>
                      <span className="gp-comp-desc">{c.descripcion}</span>
                      <span>{c.fecha}</span>
                      <span className="gp-comp-monto">${c.monto.toLocaleString('es-AR')}</span>
                      {/* Badge con popover interactivo */}
                      <BadgePago compra={c} compras={compras} pagos={pagos} proveedores={proveedores} />
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Grid inferior de control de saldos */}
            <section className="gp-seccion">
              <h2 className="gp-seccion-titulo">Saldo adeudado por proveedor</h2>
              <p className="gp-seccion-nota">El saldo se actualiza automáticamente al registrar compras o pagos.</p>
              <div className="gp-saldo-grid">
                {proveedores.map((prov) => (
                  <SaldoCard key={prov.id} prov={prov} compras={compras} pagos={pagos} onSaldar={saldarProveedor} />
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      {/* ── Modal Agregar/Editar Proveedor ── */}
      {modalProv && (
        <ModalWrapper onClose={cerrarModalProv}>
          <h2 className="gp-modal-titulo">{editandoProv ? 'Editar Proveedor' : 'Agregar Proveedor'}</h2>
          <div className="gp-modal-grid">
            <div className="gp-modal-campo gp-campo-full">
              <label>Nombre *</label>
              <input type="text" placeholder="Nombre del proveedor" value={formProv.nombre}
                onChange={(e) => { setFormProv((p) => ({ ...p, nombre: e.target.value })); setErrProv((p) => ({ ...p, nombre: '' })) }} />
              {errProv.nombre && <span className="gp-error">{errProv.nombre}</span>}
            </div>
            <div className="gp-modal-campo">
              <label>Teléfono *</label>
              <input type="text" placeholder="Número de contacto" value={formProv.telefono}
                onChange={(e) => { setFormProv((p) => ({ ...p, telefono: e.target.value })); setErrProv((p) => ({ ...p, telefono: '' })) }} />
              {errProv.telefono && <span className="gp-error">{errProv.telefono}</span>}
            </div>
            <div className="gp-modal-campo">
              <label>Días de Visita *</label>
              <input type="text" placeholder="Ej: Lunes, Miércoles" value={formProv.diasVisita}
                onChange={(e) => { setFormProv((p) => ({ ...p, diasVisita: e.target.value })); setErrProv((p) => ({ ...p, diasVisita: '' })) }} />
              {errProv.diasVisita && <span className="gp-error">{errProv.diasVisita}</span>}
            </div>
          </div>
          <div className="gp-modal-botones">
            <button className="gp-modal-btn gp-modal-btn--cancelar" onClick={cerrarModalProv}>Cancelar</button>
            <button className="gp-modal-btn gp-modal-btn--guardar"  onClick={guardarProv}>Guardar</button>
          </div>
        </ModalWrapper>
      )}

      {/* ── Modal de Confirmación para Eliminar Proveedor ── */}
      {elimProv && (
        <ModalWrapper onClose={() => setElimProv(null)} ancho={380}>
          <div className="gp-confirm-body">
            <p className="gp-confirm-texto">
              ¿Estás segura de que querés eliminar a <strong>{elimProv.nombre}</strong>?
              También se eliminarán sus compras y pagos asociados.
            </p>
            <div className="gp-modal-botones">
              <button className="gp-modal-btn gp-modal-btn--cancelar" onClick={() => setElimProv(null)}>Cancelar</button>
              <button className="gp-modal-btn gp-modal-btn--eliminar" onClick={eliminarProv}>Confirmar</button>
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* ── Modal Registrar Compra ── */}
      {modalComp && (
        <ModalWrapper onClose={cerrarModalComp}>
          <h2 className="gp-modal-titulo">Registrar Compra</h2>
          <div className="gp-modal-grid">
            <div className="gp-modal-campo gp-campo-full">
              <label>Proveedor *</label>
              <select value={formComp.idProveedor} onChange={(e) => { setFormComp((p) => ({ ...p, idProveedor: e.target.value })); setErrComp((p) => ({ ...p, idProveedor: '' })) }}>
                <option value="">Seleccionar proveedor</option>
                {proveedores.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
              {errComp.idProveedor && <span className="gp-error">{errComp.idProveedor}</span>}
            </div>
            <div className="gp-modal-campo gp-campo-full">
              <label>Productos *</label>
              <input type="text" placeholder="Ej: Medialuna x150, Empanada x80" value={formComp.descripcion}
                onChange={(e) => { setFormComp((p) => ({ ...p, descripcion: e.target.value })); setErrComp((p) => ({ ...p, descripcion: '' })) }} />
              {errComp.descripcion && <span className="gp-error">{errComp.descripcion}</span>}
            </div>
            <div className="gp-modal-campo">
              <label>Fecha *</label>
              <input type="date" value={formComp.fecha} onChange={(e) => { setFormComp((p) => ({ ...p, fecha: e.target.value })); setErrComp((p) => ({ ...p, fecha: '' })) }} />
              {errComp.fecha && <span className="gp-error">{errComp.fecha}</span>}
            </div>
            <div className="gp-modal-campo">
              <label>Monto Total *</label>
              <div className="gp-precio-wrapper">
                <span className="gp-precio-simbolo">$</span>
                <input type="number" min="0" placeholder="0" value={formComp.monto}
                  onChange={(e) => { setFormComp((p) => ({ ...p, monto: e.target.value })); setErrComp((p) => ({ ...p, monto: '' })) }} />
              </div>
              {errComp.monto && <span className="gp-error">{errComp.monto}</span>}
            </div>
          </div>
          <div className="gp-modal-botones">
            <button className="gp-modal-btn gp-modal-btn--cancelar" onClick={cerrarModalComp}>Cancelar</button>
            <button className="gp-modal-btn gp-modal-btn--guardar"  onClick={guardarComp}>Guardar</button>
          </div>
        </ModalWrapper>
      )}

      {/* ── Modal Registrar Pago ── */}
      {modalPago && (
        <ModalWrapper onClose={cerrarModalPago}>
          <h2 className="gp-modal-titulo">Registrar Pago</h2>
          <div className="gp-modal-grid">
            <div className="gp-modal-campo gp-campo-full">
              <label>Proveedor *</label>
              <select value={formPago.idProveedor} onChange={(e) => { setFormPago((p) => ({ ...p, idProveedor: e.target.value })); setErrPago((p) => ({ ...p, idProveedor: '' })) }}>
                <option value="">Seleccionar proveedor</option>
                {/* Mostramos también el estado de cuenta y deuda del proveedor en las opciones de selección */}
                {proveedores.map((prov) => {
                  const { deuda } = calcularSaldo(prov.id, compras, pagos)
                  return <option key={prov.id} value={prov.id}>{prov.nombre}{deuda > 0 ? ` — Debe $${deuda.toLocaleString('es-AR')}` : ' — Saldado'}</option>
                })}
              </select>
              {errPago.idProveedor && <span className="gp-error">{errPago.idProveedor}</span>}
            </div>
            <div className="gp-modal-campo">
              <label>Monto *</label>
              <div className="gp-precio-wrapper">
                <span className="gp-precio-simbolo">$</span>
                <input type="number" min="0" placeholder="0" value={formPago.monto}
                  onChange={(e) => { setFormPago((p) => ({ ...p, monto: e.target.value })); setErrPago((p) => ({ ...p, monto: '' })) }} />
              </div>
              {errPago.monto && <span className="gp-error">{errPago.monto}</span>}
            </div>
            <div className="gp-modal-campo">
              <label>Fecha *</label>
              <input type="date" value={formPago.fecha} onChange={(e) => { setFormPago((p) => ({ ...p, fecha: e.target.value })); setErrPago((p) => ({ ...p, fecha: '' })) }} />
              {errPago.fecha && <span className="gp-error">{errPago.fecha}</span>}
            </div>
          </div>
          <div className="gp-modal-botones">
            <button className="gp-modal-btn gp-modal-btn--cancelar" onClick={cerrarModalPago}>Cancelar</button>
            <button className="gp-modal-btn gp-modal-btn--guardar"  onClick={guardarPago}>Guardar</button>
          </div>
        </ModalWrapper>
      )}

      {/* Alerta flotante estándar de éxito */}
      {toast && <div className="gp-toast">{toast}</div>}

      {/* Alerta flotante interactiva de "Deshacer" al saldar un proveedor de forma rápida */}
      {undoSaldar && (
        <div className="gp-toast">
          <span>"{undoSaldar.nombre}" marcado como saldado</span>
          <button className="gp-toast-btn" onClick={deshacerSaldar}>Deshacer</button>
        </div>
      )}
    </div>
  )
}