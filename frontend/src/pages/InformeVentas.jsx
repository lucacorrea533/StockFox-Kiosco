// Este archivo representa la página de Informe de Ventas para la encargada.
import { useState, useRef } from 'react'
import NavbarEncargada from '../components/NavbarEncargada'
import GraficoBarras from '../components/GraficoBarras'
import GraficoTorta from '../components/GraficoTorta'
import iconTotalVendido from '../assets/icons/SimboloTotalVendido.png'
import iconCantVentas   from '../assets/icons/PedidosBoton.png'
import iconGanancia     from '../assets/icons/FlechadeEstadisticas.png'
import iconVentasDia    from '../assets/icons/InformesBoton.png'
import iconPorCategoria from '../assets/icons/SimboloPorcentaje.png'
import iconRanking      from '../assets/icons/Productomásvendido.png'
import iconGasto        from '../assets/icons/RegistrodeGasto.png'
import iconEliminar from '../assets/icons/EliminarBoton.png'
import '../styles/InformeVentas.css'

const PERIODOS = ['Día', 'Semana', 'Mes']

const DATOS_POR_PERIODO = {
  'Día': {
    barras: [
      { dia: '8hs',  valor: 1200 },
      { dia: '9hs',  valor: 3400 },
      { dia: '10hs', valor: 5800 },
      { dia: '11hs', valor: 4200 },
      { dia: '12hs', valor: 7800 },
    ],
    torta: [
      { label: 'Bocados',   porcentaje: 40, color: '#5c2d0a' },
      { label: 'Bebidas',   porcentaje: 30, color: '#bf5902' },
      { label: 'Alfajores', porcentaje: 20, color: '#e8813a' },
      { label: 'Otros',     porcentaje: 10, color: '#ffaa6f' },
    ],
    top: [
      { pos: 1, nombre: 'Medialuna',               unidades: 38 },
      { pos: 2, nombre: 'Café Mediano',             unidades: 27 },
      { pos: 3, nombre: 'Alfajor Guaymallen Negro', unidades: 21 },
      { pos: 4, nombre: 'Torta Frita',              unidades: 18 },
      { pos: 5, nombre: 'Coca Cola 600ml',          unidades: 14 },
    ],
  },
  'Semana': {
    barras: [
      { dia: 'Lun', valor: 3200 },
      { dia: 'Mar', valor: 6800 },
      { dia: 'Mie', valor: 2900 },
      { dia: 'Jue', valor: 7200 },
      { dia: 'Vie', valor: 4100 },
    ],
    torta: [
      { label: 'Alfajores', porcentaje: 30, color: '#5c2d0a' },
      { label: 'Bebidas',   porcentaje: 28, color: '#bf5902' },
      { label: 'Bocados',   porcentaje: 22, color: '#e8813a' },
      { label: 'Otros',     porcentaje: 20, color: '#ffaa6f' },
    ],
    top: [
      { pos: 1, nombre: 'Alfajor Guaymallen Negro', unidades: 142 },
      { pos: 2, nombre: 'Medialuna',                unidades: 110 },
      { pos: 3, nombre: 'Coca Cola 600ml',          unidades: 85  },
      { pos: 4, nombre: 'Café Mediano',             unidades: 63  },
      { pos: 5, nombre: 'Saladix Jamón',            unidades: 42  },
    ],
  },
  'Mes': {
    barras: [
      { dia: 'Sem 1', valor: 28000 },
      { dia: 'Sem 2', valor: 34000 },
      { dia: 'Sem 3', valor: 41000 },
      { dia: 'Sem 4', valor: 38000 },
    ],
    torta: [
      { label: 'Bocados',   porcentaje: 35, color: '#5c2d0a' },
      { label: 'Alfajores', porcentaje: 28, color: '#bf5902' },
      { label: 'Bebidas',   porcentaje: 25, color: '#e8813a' },
      { label: 'Otros',     porcentaje: 12, color: '#ffaa6f' },
    ],
    top: [
      { pos: 1, nombre: 'Alfajor Guaymallen Negro', unidades: 580 },
      { pos: 2, nombre: 'Medialuna',                unidades: 430 },
      { pos: 3, nombre: 'Torta Frita',              unidades: 310 },
      { pos: 4, nombre: 'Coca Cola 600ml',          unidades: 290 },
      { pos: 5, nombre: 'Café Mediano',             unidades: 240 },
    ],
  },
}

const FORM_GASTO_VACIO = { concepto: '', monto: '', fecha: '' }

function InformeVentas() {
  const [periodoActivo, setPeriodoActivo] = useState('Semana')
  const [gastos, setGastos]               = useState([])
  const [formGasto, setFormGasto]         = useState(FORM_GASTO_VACIO)
  const [errorGasto, setErrorGasto]       = useState('')
  const [toast, setToast]                 = useState(null)
  const toastRef                          = useRef(null)

  const datosActivos = DATOS_POR_PERIODO[periodoActivo]
  const MAX_UNIDADES = Math.max(...datosActivos.top.map((p) => p.unidades))

  const totalGastos  = gastos.reduce((acc, g) => acc + Number(g.monto), 0)
  const gananciaNeta = 0 - totalGastos

  function handleFormChange(e) {
    const { name, value } = e.target
    setFormGasto((prev) => ({ ...prev, [name]: value }))
    setErrorGasto('')
  }

  function handleAgregarGasto() {
    if (!formGasto.concepto.trim())                       { setErrorGasto('Ingresá un concepto.'); return }
    if (!formGasto.monto || Number(formGasto.monto) <= 0) { setErrorGasto('Ingresá un monto válido.'); return }
    if (!formGasto.fecha)                                 { setErrorGasto('Ingresá una fecha.'); return }
    setGastos((prev) => [...prev, { ...formGasto, id: Date.now() }])
    setFormGasto(FORM_GASTO_VACIO)
  }

  function handleEliminarGasto(gasto) {
    if (toastRef.current) clearTimeout(toastRef.current)
    setGastos((prev) => prev.filter((g) => g.id !== gasto.id))
    const timeoutId = setTimeout(() => {
      setToast(null)
      toastRef.current = null
    }, 5000)
    toastRef.current = timeoutId
    setToast({ gasto, timeoutId })
  }

  function handleDeshacer() {
    if (!toast) return
    clearTimeout(toastRef.current)
    setGastos((prev) => [...prev, toast.gasto])
    setToast(null)
    toastRef.current = null
  }

  return (
    <div className="iv-layout">
      <NavbarEncargada />

      <main className="iv-main">
        <h1 className="iv-titulo">Informe de Ventas</h1>

        {/* ── Selector de período ── */}
        <div className="iv-periodo">
          <span className="iv-periodo-label">Período:</span>
          {PERIODOS.map((p) => (
            <button
              key={p}
              className={`iv-periodo-btn ${periodoActivo === p ? 'iv-periodo-btn--activo' : ''}`}
              onClick={() => setPeriodoActivo(p)}
            >
              {p}
            </button>
          ))}
        </div>

        {/* ── Métricas ── */}
        <div className="iv-metricas">
          <div className="iv-metrica-card">
            <div className="iv-metrica-header">
              <img src={iconTotalVendido} alt="" className="iv-metrica-icono" />
              <span className="iv-metrica-label">Total Vendido</span>
            </div>
            <span className="iv-metrica-valor">$ 00.000</span>
          </div>
          <div className="iv-metrica-card">
            <div className="iv-metrica-header">
              <img src={iconCantVentas} alt="" className="iv-metrica-icono" />
              <span className="iv-metrica-label">Cant. de ventas</span>
            </div>
            <span className="iv-metrica-valor">00</span>
          </div>
          <div className="iv-metrica-card">
            <div className="iv-metrica-header">
              <img src={iconGanancia} alt="" className="iv-metrica-icono" />
              <span className="iv-metrica-label">Ganancia neta</span>
            </div>
            <span className="iv-metrica-valor">$ 00.000</span>
          </div>
        </div>
        <p className="iv-metrica-subtitulo">Ganancia neta = Ingresos – Gastos</p>

        {/* ── Gráficos ── */}
        <div className="iv-graficos">
          <div className="iv-grafico-card">
            <div className="iv-card-header">
              <img src={iconVentasDia} alt="" className="iv-card-icono" />
              <h2 className="iv-card-titulo">Ventas por día</h2>
            </div>
            <GraficoBarras datos={datosActivos.barras} />
          </div>
          <div className="iv-grafico-card">
            <div className="iv-card-header">
              <img src={iconPorCategoria} alt="" className="iv-card-icono" />
              <h2 className="iv-card-titulo">Productos más vendidos</h2>
            </div>
            <GraficoTorta datos={datosActivos.torta} />
          </div>
        </div>

        {/* ── Ranking productos ── */}
        <div className="iv-top-card">
          <div className="iv-card-header">
            <img src={iconRanking} alt="" className="iv-card-icono" />
            <h2 className="iv-card-titulo">Ranking de productos más vendidos</h2>
          </div>
          <div className="iv-top-lista">
            {datosActivos.top.map((p) => (
              <div key={p.pos} className="iv-top-fila">
                <span className="iv-top-pos">{p.pos}</span>
                <div className="iv-top-centro">
                  <span className="iv-top-nombre">{p.nombre}</span>
                  <div className="iv-top-barra-wrap">
                    <div
                      className="iv-top-barra-fill"
                      style={{ width: `${(p.unidades / MAX_UNIDADES) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="iv-top-unidades">{p.unidades} uds</span>
              </div>
            ))}
          </div>
          <p className="iv-top-subtitulo">Top 5 ordenados por cantidad vendida</p>
        </div>

        {/* ── Registrar Gasto ── */}
        <div className="iv-gasto-card">
          <div className="iv-card-header">
            <img src={iconGasto} alt="" className="iv-card-icono" />
            <h2 className="iv-card-titulo">Registrar gasto operativo</h2>
          </div>
          <div className="iv-gasto-form">
            <div className="iv-gasto-campo">
              <label className="iv-gasto-label">Concepto</label>
              <input
                className="iv-gasto-input"
                type="text"
                name="concepto"
                placeholder="Ej: Gas cocina"
                value={formGasto.concepto}
                onChange={handleFormChange}
              />
            </div>
            <div className="iv-gasto-campo">
              <label className="iv-gasto-label">Monto</label>
              <input
                className="iv-gasto-input"
                type="number"
                name="monto"
                placeholder="$0.000"
                min="0"
                value={formGasto.monto}
                onChange={handleFormChange}
              />
            </div>
            <div className="iv-gasto-campo">
              <label className="iv-gasto-label">Fecha</label>
              <input
                className="iv-gasto-input"
                type="date"
                name="fecha"
                value={formGasto.fecha}
                onChange={handleFormChange}
              />
            </div>
            <button className="iv-gasto-btn" onClick={handleAgregarGasto}>
              + Agregar gasto
            </button>
          </div>
          {errorGasto && <p className="iv-gasto-error">{errorGasto}</p>}

          {gastos.length > 0 && (
            <div className="iv-gastos-lista">
              {gastos.map((g) => (
                <div key={g.id} className="iv-gastos-fila">
                  <span>{g.concepto}</span>
                  <span>{g.fecha}</span>
                  <span>${Number(g.monto).toLocaleString('es-AR')}</span>
                  <button
                    className="iv-gasto-eliminar"
                    onClick={() => handleEliminarGasto(g)}
                    title="Eliminar gasto"
                  >
                    <img src={iconEliminar} alt="Eliminar" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Ganancia Neta ── */}
        <div className="iv-neta-card">
          <span className="iv-neta-label">Ganancia Neta</span>
          <span className="iv-neta-valor">
            $ {gananciaNeta.toLocaleString('es-AR')}
          </span>
        </div>

      </main>

      {/* ── Toast deshacer ── */}
      {toast && (
        <div className="iv-toast">
          <span>Gasto eliminado.</span>
          <button className="iv-toast-btn" onClick={handleDeshacer}>Deshacer</button>
        </div>
      )}
    </div>
  )
}

export default InformeVentas