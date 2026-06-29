/* Este archivo contiene el código de la página GestionProveedores, que permite gestionar proveedores, registrar compras y pagos, y visualizar saldos adeudados. */

import { useState, useEffect, useRef } from 'react'
import NavbarEncargada from '../components/NavbarEncargada'
import iconBuscador from '../assets/icons/BuscadorBoton.png'
import iconEditar   from '../assets/icons/EditarBoton.png'
import iconEliminar from '../assets/icons/EliminarBoton.png'
import iconCheck    from '../assets/icons/SimboloCheck.png'
import iconAviso    from '../assets/icons/Aviso.png'
import '../styles/GestionProveedores.css'

const PROVEEDORES_INICIALES = [
  { id: 1, nombre: 'Panadería La Espiga',         telefono: '1156781234', diasVisita: 'Lunes, Viernes'   },
  { id: 2, nombre: 'Baggio Jugos S.A.',            telefono: '1167890123', diasVisita: 'Martes, Jueves'  },
  { id: 3, nombre: 'Guaymallen S.A.',              telefono: '1123456789', diasVisita: 'Lunes'            },
  { id: 4, nombre: 'Distribuidora La Continental', telefono: '1145678901', diasVisita: 'Lunes, Miércoles' },
]

const COMPRAS_INICIALES = [
  { id: 1, idProveedor: 1, descripcion: 'Medialuna x150, Empanada x80',                         fecha: '04/05/2026', monto: 15000 },
  { id: 2, idProveedor: 2, descripcion: 'Jugo Baggio x200',                                     fecha: '05/05/2026', monto: 12500 },
  { id: 3, idProveedor: 1, descripcion: 'Medialuna c/JyQ x80',                                  fecha: '05/05/2026', monto: 20000 },
  { id: 4, idProveedor: 4, descripcion: 'Saladix Jamón x100, Nikitos Papas Fritas x100',        fecha: '07/05/2026', monto: 18000 },
]

const PAGOS_INICIALES = [
  { id: 1, idProveedor: 1, monto: 15000, fecha: '04/05/2026' },
  { id: 2, idProveedor: 2, monto: 12500, fecha: '05/05/2026' },
  { id: 3, idProveedor: 1, monto: 20000, fecha: '05/05/2026' },
  { id: 4, idProveedor: 4, monto: 10000, fecha: '07/05/2026' },
]

const FORM_PROV_VACIO = { nombre: '', telefono: '', diasVisita: '' }
const FORM_COMP_VACIO = { idProveedor: '', descripcion: '', fecha: '', monto: '' }
const FORM_PAGO_VACIO = { idProveedor: '', monto: '', fecha: '' }

function calcularSaldo(idProveedor, compras, pagos) {
  const totalComp = compras.filter((c) => c.idProveedor === idProveedor).reduce((s, c) => s + c.monto, 0)
  const totalPag  = pagos.filter((p)   => p.idProveedor === idProveedor).reduce((s, p) => s + p.monto, 0)
  return { totalComp, totalPag, deuda: Math.max(0, totalComp - totalPag) }
}

function ModalWrapper({ onClose, children, ancho = 480 }) {
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
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

// Tarjeta de saldo con popover de desglose
function SaldoCard({ prov, compras, pagos, onSaldar }) {
  const [abierto, setAbierto] = useState(false)
  const { totalComp, totalPag, deuda } = calcularSaldo(prov.id, compras, pagos)
  const saldado = deuda === 0

  return (
    <div className={`gp-saldo-card ${saldado ? 'gp-saldo-card--saldado' : 'gp-saldo-card--debe'}`}>
      <p className="gp-saldo-nombre">{prov.nombre}</p>
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

// Badge de pago en historial de compras con popover de desglose
function BadgePago({ compra, compras, pagos, proveedores }) {
  const [abierto, setAbierto] = useState(false)
  const ref = useRef(null)
  const { totalComp, totalPag, deuda } = calcularSaldo(compra.idProveedor, compras, pagos)
  const pagado = deuda === 0
  const prov   = proveedores.find((p) => p.id === compra.idProveedor)

  useEffect(() => {
    if (!abierto) return
    function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) setAbierto(false) }
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

export default function GestionProveedores() {
  const [pestana,      setPestana]      = useState('proveedores')
  const [proveedores,  setProveedores]  = useState(PROVEEDORES_INICIALES)
  const [compras,      setCompras]      = useState(COMPRAS_INICIALES)
  const [pagos,        setPagos]        = useState(PAGOS_INICIALES)
  const [busqueda,     setBusqueda]     = useState('')

  const [modalProv,    setModalProv]    = useState(false)
  const [editandoProv, setEditandoProv] = useState(null)
  const [elimProv,     setElimProv]     = useState(null)
  const [modalComp,    setModalComp]    = useState(false)
  const [modalPago,    setModalPago]    = useState(false)

  const [formProv, setFormProv] = useState(FORM_PROV_VACIO)
  const [errProv,  setErrProv]  = useState({})
  const [formComp, setFormComp] = useState(FORM_COMP_VACIO)
  const [errComp,  setErrComp]  = useState({})
  const [formPago, setFormPago] = useState(FORM_PAGO_VACIO)
  const [errPago,  setErrPago]  = useState({})

  const [toast, setToast]  = useState(null)
  const [undoSaldar, setUndoSaldar] = useState(null)
  const toastRef = useRef(null)

  function dispararToast(msg) {
    if (toastRef.current) clearTimeout(toastRef.current)
    setToast(msg)
    toastRef.current = setTimeout(() => setToast(null), 3500)
  }

  const provFiltrados = proveedores.filter((p) =>
    `${p.nombre} ${p.telefono} ${p.diasVisita}`.toLowerCase().includes(busqueda.toLowerCase())
  )

  // ── CRUD Proveedores ───────────────────────────────────────────────────
  function abrirAgregarProv()   { setEditandoProv(null); setFormProv(FORM_PROV_VACIO); setErrProv({}); setModalProv(true) }
  function abrirEditarProv(p)   { setEditandoProv(p); setFormProv({ nombre: p.nombre, telefono: p.telefono, diasVisita: p.diasVisita }); setErrProv({}); setModalProv(true) }
  function cerrarModalProv()    { setModalProv(false); setEditandoProv(null); setFormProv(FORM_PROV_VACIO); setErrProv({}) }

  function validarProv() {
    const err = {}
    if (!formProv.nombre.trim())     err.nombre     = 'El nombre es obligatorio.'
    if (!formProv.telefono.trim())   err.telefono   = 'El teléfono es obligatorio.'
    if (!formProv.diasVisita.trim()) err.diasVisita = 'Los días de visita son obligatorios.'
    return err
  }

  function guardarProv() {
    const err = validarProv(); if (Object.keys(err).length > 0) { setErrProv(err); return }
    if (editandoProv) {
      setProveedores((prev) => prev.map((p) => p.id === editandoProv.id ? { ...p, ...formProv } : p))
      dispararToast('Proveedor actualizado.')
    } else {
      setProveedores((prev) => [...prev, { id: Date.now(), ...formProv }])
      dispararToast('Proveedor agregado.')
    }
    cerrarModalProv()
  }

  function eliminarProv() {
    setProveedores((prev) => prev.filter((p) => p.id !== elimProv.id))
    setCompras((prev) => prev.filter((c) => c.idProveedor !== elimProv.id))
    setPagos((prev)   => prev.filter((pa) => pa.idProveedor !== elimProv.id))
    dispararToast(`"${elimProv.nombre}" eliminado.`)
    setElimProv(null)
  }

  // ── Registrar Compra ───────────────────────────────────────────────────
  function cerrarModalComp() { setModalComp(false); setFormComp(FORM_COMP_VACIO); setErrComp({}) }

  function validarComp() {
    const err = {}
    if (!formComp.idProveedor)         err.idProveedor = 'Seleccioná un proveedor.'
    if (!formComp.descripcion.trim())  err.descripcion = 'Ingresá los productos.'
    if (!formComp.fecha)               err.fecha       = 'La fecha es obligatoria.'
    if (!formComp.monto || formComp.monto <= 0) err.monto = 'Ingresá un monto válido.'
    return err
  }

  function guardarComp() {
    const err = validarComp(); if (Object.keys(err).length > 0) { setErrComp(err); return }
    setCompras((prev) => [...prev, {
      id: Date.now(), idProveedor: Number(formComp.idProveedor),
      descripcion: formComp.descripcion.trim(), fecha: formComp.fecha, monto: Number(formComp.monto),
    }])
    dispararToast('Compra registrada. Saldo actualizado.')
    cerrarModalComp()
  }

  // ── Registrar Pago ─────────────────────────────────────────────────────
  function cerrarModalPago() { setModalPago(false); setFormPago(FORM_PAGO_VACIO); setErrPago({}) }

  function validarPago() {
    const err = {}
    if (!formPago.idProveedor)        err.idProveedor = 'Seleccioná un proveedor.'
    if (!formPago.monto || formPago.monto <= 0) err.monto = 'Ingresá un monto válido.'
    if (!formPago.fecha)              err.fecha       = 'La fecha es obligatoria.'
    return err
  }

  function guardarPago() {
    const err = validarPago(); if (Object.keys(err).length > 0) { setErrPago(err); return }
    setPagos((prev) => [...prev, {
      id: Date.now(), idProveedor: Number(formPago.idProveedor),
      monto: Number(formPago.monto), fecha: formPago.fecha,
    }])
    dispararToast('Pago registrado. Deuda actualizada.')
    cerrarModalPago()
  }

  // ── Marcar como saldado (crea un pago igual a la deuda restante) ───────
function saldarProveedor(idProveedor, deuda) {
  const hoy   = new Date().toLocaleDateString('es-AR')
  const pagoId = Date.now()
  const prov   = proveedores.find((p) => p.id === idProveedor)
  setPagos((prev) => [...prev, { id: pagoId, idProveedor, monto: deuda, fecha: hoy }])

  if (toastRef.current) clearTimeout(toastRef.current)
  setUndoSaldar({ pagoId, nombre: prov?.nombre ?? '' })
  toastRef.current = setTimeout(() => setUndoSaldar(null), 5000)
}

function deshacerSaldar() {
  if (!undoSaldar) return
  setPagos((prev) => prev.filter((p) => p.id !== undoSaldar.pagoId))
  clearTimeout(toastRef.current)
  setUndoSaldar(null)
}

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex' }}>
      <NavbarEncargada />

      <main className="gestion-proveedores">
        <h1 className="gp-titulo">Proveedores y Compras</h1>

        <div className="gp-pestanas">
          <button className={`gp-pestana ${pestana === 'proveedores' ? 'gp-pestana--activa' : ''}`} onClick={() => setPestana('proveedores')}>Proveedores</button>
          <button className={`gp-pestana ${pestana === 'compras'     ? 'gp-pestana--activa' : ''}`} onClick={() => setPestana('compras')}>Compras</button>
        </div>

        {/* ══ PROVEEDORES ══ */}
        {pestana === 'proveedores' && (
          <>
            <section className="gp-seccion">
              <div className="gp-seccion-header">
                <h2 className="gp-seccion-titulo">Listado de Proveedores</h2>
                <button className="gp-btn-agregar" onClick={abrirAgregarProv}>+ Agregar Proveedor</button>
              </div>

              <div className="gp-buscador-wrapper">
                <img src={iconBuscador} alt="Buscar" className="gp-buscador-icono" />
                <input type="text" placeholder="Buscar por nombre, teléfono o días de visita..."
                  value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="gp-buscador-input" />
              </div>

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

        {/* ══ COMPRAS ══ */}
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
                      <BadgePago compra={c} compras={compras} pagos={pagos} proveedores={proveedores} />
                    </div>
                  )
                })}
              </div>
            </section>

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

      {/* ── Modal Proveedor ── */}
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

      {/* ── Modal Eliminar ── */}
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

      {/* ── Modal Compra ── */}
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

      {/* ── Modal Pago ── */}
      {modalPago && (
        <ModalWrapper onClose={cerrarModalPago}>
          <h2 className="gp-modal-titulo">Registrar Pago</h2>
          <div className="gp-modal-grid">
            <div className="gp-modal-campo gp-campo-full">
              <label>Proveedor *</label>
              <select value={formPago.idProveedor} onChange={(e) => { setFormPago((p) => ({ ...p, idProveedor: e.target.value })); setErrPago((p) => ({ ...p, idProveedor: '' })) }}>
                <option value="">Seleccionar proveedor</option>
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

      {toast && <div className="gp-toast">{toast}</div>}

      {undoSaldar && (
        <div className="gp-toast">
          <span>"{undoSaldar.nombre}" marcado como saldado</span>
          <button className="gp-toast-btn" onClick={deshacerSaldar}>Deshacer</button>
        </div>
      )}
    </div>
  )
}