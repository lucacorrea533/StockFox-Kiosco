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
import { authFetch } from "../api/authFetch"
import { useEffect } from 'react'

const PERIODOS = ['Día', 'Semana', 'Mes']



const FORM_GASTO_VACIO = { concepto: '', monto: '', fecha: '' }

function InformeVentas() {
  const [periodoActivo, setPeriodoActivo] = useState('Día')
  const [gastos, setGastos]               = useState([])
  const [resumen, setResumen]             = useState({
    total_vendido: 0, cantidad_ventas: 0, ganancia_neta: 0, barras: [], torta: [], top: []
  })
  const [formGasto, setFormGasto]         = useState(FORM_GASTO_VACIO)
  const [errorGasto, setErrorGasto]       = useState('')
  const [toast, setToast]                 = useState(null)
  const toastRef                          = useRef(null)

  useEffect(() => {
    const periodoParam = periodoActivo === 'Día' ? 'dia' : periodoActivo === 'Mes' ? 'mes' : 'semana'
    authFetch(`http://127.0.0.1:8000/api/informes/resumen-ventas/?periodo=${periodoParam}`)
      .then(response => response.json())
      .then(data => setResumen(data))
      .catch(error => console.error(error))
  }, [periodoActivo])

  useEffect(() => {
    authFetch("http://127.0.0.1:8000/api/gastos/")
      .then(response => response.json())
      .then(data => {
        const formateados = data.map(g => ({
          id: g.id_gasto,
          concepto: g.descripcion,
          monto: Number(g.monto),
          fecha: g.fecha,
          categoria: g.categoria
        }))
        setGastos(formateados)
      })
      .catch(error => console.error(error))
  }, [])

  const MAX_UNIDADES = Math.max(...resumen.top.map((p) => p.unidades), 1)

  const gananciaNeta = resumen.ganancia_neta

  function handleFormChange(e) {
    const { name, value } = e.target
    setFormGasto((prev) => ({ ...prev, [name]: value }))
    setErrorGasto('')
  }

async function handleAgregarGasto() {
  if (!formGasto.concepto.trim())                       { setErrorGasto('Ingresá un concepto.'); return }
  if (!formGasto.monto || Number(formGasto.monto) <= 0) { setErrorGasto('Ingresá un monto válido.'); return }
  if (!formGasto.fecha)                                 { setErrorGasto('Ingresá una fecha.'); return }

  try {
    const respuesta = await authFetch("http://127.0.0.1:8000/api/gastos/crear/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        descripcion: formGasto.concepto.trim(),
        monto: Number(formGasto.monto),
        fecha: formGasto.fecha,
        categoria: null
      })
    })
    const datos = await respuesta.json()
    if (!respuesta.ok) { setErrorGasto('No se pudo guardar el gasto.'); return }

    setGastos(prev => [...prev, {
      id: datos.id_gasto, concepto: datos.descripcion, monto: Number(datos.monto), fecha: datos.fecha
    }])
    setFormGasto(FORM_GASTO_VACIO)
  } catch (error) {
    setErrorGasto('No se pudo conectar con el servidor.')
  }
}

async function handleEliminarGasto(gasto) {
  try {
    await authFetch(`http://127.0.0.1:8000/api/gastos/eliminar/${gasto.id}/`, { method: "DELETE" })
    setGastos(prev => prev.filter(g => g.id !== gasto.id))
  } catch (error) {
    console.error(error)
  }
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
            <span className="iv-metrica-valor">${Number(resumen.total_vendido).toLocaleString('es-AR')}</span>
          </div>
          <div className="iv-metrica-card">
            <div className="iv-metrica-header">
              <img src={iconCantVentas} alt="" className="iv-metrica-icono" />
              <span className="iv-metrica-label">Cant. de ventas</span>
            </div>
            <span className="iv-metrica-valor">{resumen.cantidad_ventas}</span>
          </div>
          <div className="iv-metrica-card">
            <div className="iv-metrica-header">
              <img src={iconGanancia} alt="" className="iv-metrica-icono" />
              <span className="iv-metrica-label">Ganancia neta</span>
            </div>
            <span className="iv-metrica-valor">${Number(resumen.ganancia_neta).toLocaleString('es-AR')}</span>
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
            <GraficoBarras datos={resumen.barras} />
          </div>
          <div className="iv-grafico-card">
            <div className="iv-card-header">
              <img src={iconPorCategoria} alt="" className="iv-card-icono" />
              <h2 className="iv-card-titulo">Productos más vendidos</h2>
            </div>
            <GraficoTorta datos={resumen.torta} />
          </div>
        </div>

        {/* ── Ranking productos ── */}
        <div className="iv-top-card">
          <div className="iv-card-header">
            <img src={iconRanking} alt="" className="iv-card-icono" />
            <h2 className="iv-card-titulo">Ranking de productos más vendidos</h2>
          </div>
          <div className="iv-top-lista">
            {resumen.top.map((p) => (
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