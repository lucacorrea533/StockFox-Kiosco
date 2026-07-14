/* Este archivo representa la página de Informe de Ventas para la encargada.
   Permite visualizar el total vendido, la cantidad de transacciones, calcular la ganancia neta
   restando los gastos operativos cargados y mostrar analíticas visuales mediante gráficos y un ranking. */

import { useState, useRef, useEffect } from 'react'
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
import iconEliminar     from '../assets/icons/EliminarBoton.png'
import '../styles/InformeVentas.css'
import { authFetch } from "../api/authFetch"
import { API_BASE_URL } from '../api/config'

/* Constante con los periodos de tiempo disponibles para segmentar la información */
const PERIODOS = ['Día', 'Semana', 'Mes']

/* Estructura inicial limpia para el formulario de registro de nuevos gastos */
const FORM_GASTO_VACIO = { concepto: '', monto: '', fecha: '' }

function InformeVentas() {
  /* ── Estados de Control y Reportes ─────────────────────────────────────────────────── */
  const [periodoActivo, setPeriodoActivo] = useState('Día')
  const [gastos, setGastos]               = useState([])
  
  /* resumen: Almacena los resultados analíticos provistos por el endpoint de Django */
  const [resumen, setResumen]             = useState({
    total_vendido: 0, 
    cantidad_ventas: 0, 
    ganancia_neta: 0, 
    barras: [], 
    torta: [], 
    top: []
  })
  
  const [formGasto, setFormGasto]         = useState(FORM_GASTO_VACIO)
  const [errorGasto, setErrorGasto]       = useState('')
  const [toast, setToast]                 = useState(null)
  const toastRef                          = useRef(null)

  /* ── Efectos (useEffect) para Consumo de Endpoints ──────────────────────────────────── */

  /* Primer useEffect: Trae el resumen de ventas filtrado por el período seleccionado (Día, Semana, Mes) */
  useEffect(() => {
    // Mapeamos el periodo amigable de la UI al formato de parámetro esperado por la API
    const periodoParam = periodoActivo === 'Día' ? 'dia' : periodoActivo === 'Mes' ? 'mes' : 'semana'
    authFetch(`${API_BASE_URL}/informes/resumen-ventas/?periodo=${periodoParam}`)
      .then(response => response.json())
      .then(data => setResumen(data))
      .catch(error => console.error(error))
  }, [periodoActivo])

  /* Segundo useEffect: Obtiene todos los gastos registrados del buffet */
  useEffect(() => {
    authFetch(`${API_BASE_URL}/gastos/`)
      .then(response => response.json())
      .then(data => {
        // Mapeamos los campos del backend (descripcion, id_gasto) a propiedades más directas en el cliente
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

  /* ── Constantes y Cálculos Derivados ──────────────────────────────────────────────── */
  
  /* MAX_UNIDADES: Se utiliza para calcular de forma proporcional el porcentaje de la barra 
     en el ranking visual de productos, garantizando que el producto estrella ocupe el 100% de la barra. */
  const MAX_UNIDADES = Math.max(...resumen.top.map((p) => p.unidades), 1)

  const gananciaNeta = resumen.ganancia_neta

  /* ── Manejo de Formularios y Acciones de Gastos ───────────────────────────────────── */

  /* handleFormChange: Escucha los inputs del formulario de gastos y limpia mensajes de error */
  function handleFormChange(e) {
    const { name, value } = e.target
    setFormGasto((prev) => ({ ...prev, [name]: value }))
    setErrorGasto('')
  }

  /* handleAgregarGasto: Valida los campos locales y envía la petición POST para registrar un gasto operativo */
  async function handleAgregarGasto() {
    if (!formGasto.concepto.trim())                       { setErrorGasto('Ingresá un concepto.'); return }
    if (!formGasto.monto || Number(formGasto.monto) <= 0) { setErrorGasto('Ingresá un monto válido.'); return }
    if (!formGasto.fecha)                                 { setErrorGasto('Ingresá una fecha.'); return }

    try {
      const respuesta = await authFetch(`${API_BASE_URL}/gastos/crear/`, {
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

      // Agregamos el nuevo gasto guardado al estado local para actualizar el listado reactivamente
      setGastos(prev => [...prev, {
        id: datos.id_gasto, 
        concepto: datos.descripcion, 
        monto: Number(datos.monto), 
        fecha: datos.fecha
      }])
      setFormGasto(FORM_GASTO_VACIO)
    } catch (error) {
      setErrorGasto('No se pudo conectar con el servidor.')
    }
  }

  /* handleEliminarGasto: Realiza la llamada DELETE a la API para eliminar físicamente un gasto */
  async function handleEliminarGasto(gasto) {
    try {
      await authFetch(`${API_BASE_URL}/gastos/eliminar/${gasto.id}/`, { method: "DELETE" })
      setGastos(prev => prev.filter(g => g.id !== gasto.id))
      
      // Seteamos el Toast para dar un feedback visual de que el elemento fue removido
      setToast({ gasto })
      
      // Limpiamos temporizadores previos si los hubiera y configuramos la expiración automática del toast
      if (toastRef.current) clearTimeout(toastRef.current)
      toastRef.current = setTimeout(() => setToast(null), 5000)
    } catch (error) {
      console.error(error)
    }
  }

  /* handleDeshacer: Permite recuperar localmente el gasto eliminado antes de que se limpie el Toast */
  function handleDeshacer() {
    if (!toast) return
    clearTimeout(toastRef.current)
    setGastos((prev) => [...prev, toast.gasto])
    setToast(null)
    toastRef.current = null
  }

  /* ── Renderizado del Módulo de Informes ────────────────────────────────────────────── */
  return (
    <div className="iv-layout">
      {/* Menú de navegación lateral */}
      <NavbarEncargada />

      <main className="iv-main">
        <h1 className="iv-titulo">Informe de Ventas</h1>

        {/* ── Selector de Períodos de Reporte ── */}
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

        {/* ── Tarjetas de Métricas Clave ── */}
        <div className="iv-metricas">
          {/* Total Vendido */}
          <div className="iv-metrica-card">
            <div className="iv-metrica-header">
              <img src={iconTotalVendido} alt="" className="iv-metrica-icono" />
              <span className="iv-metrica-label">Total Vendido</span>
            </div>
            <span className="iv-metrica-valor">${Number(resumen.total_vendido).toLocaleString('es-AR')}</span>
          </div>
          
          {/* Cantidad de Ventas */}
          <div className="iv-metrica-card">
            <div className="iv-metrica-header">
              <img src={iconCantVentas} alt="" className="iv-metrica-icono" />
              <span className="iv-metrica-label">Cant. de ventas</span>
            </div>
            <span className="iv-metrica-valor">{resumen.cantidad_ventas}</span>
          </div>

          {/* Ganancia Neta */}
          <div className="iv-metrica-card">
            <div className="iv-metrica-header">
              <img src={iconGanancia} alt="" className="iv-metrica-icono" />
              <span className="iv-metrica-label">Ganancia neta</span>
            </div>
            <span className="iv-metrica-valor">${Number(resumen.ganancia_neta).toLocaleString('es-AR')}</span>
          </div>
        </div>
        <p className="iv-metrica-subtitulo">Ganancia neta = Ingresos – Gastos</p>

        {/* ── Sección de Gráficos Analíticos ── */}
        <div className="iv-graficos">
          {/* Ventas representadas en un Gráfico de Barras */}
          <div className="iv-grafico-card">
            <div className="iv-card-header">
              <img src={iconVentasDia} alt="" className="iv-card-icono" />
              <h2 className="iv-card-titulo">Ventas por día</h2>
            </div>
            <GraficoBarras datos={resumen.barras} />
          </div>

          {/* Composición de categorías en un Gráfico de Torta */}
          <div className="iv-grafico-card">
            <div className="iv-card-header">
              <img src={iconPorCategoria} alt="" className="iv-card-icono" />
              <h2 className="iv-card-titulo">Productos más vendidos</h2>
            </div>
            <GraficoTorta datos={resumen.torta} />
          </div>
        </div>

        {/* ── Ranking de los Productos Más Vendidos (Top 5) ── */}
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
                    {/* Calcula dinámicamente el ancho proporcional de la barra del ranking */}
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

        {/* ── Formulario de Registro de Gastos Operativos ── */}
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

          {/* Listado interactivo de gastos cargados */}
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

        {/* ── Bloque Final de Visualización de Ganancia Neta ── */}
        <div className="iv-neta-card">
          <span className="iv-neta-label">Ganancia Neta</span>
          <span className="iv-neta-valor">
            $ {gananciaNeta.toLocaleString('es-AR')}
          </span>
        </div>

      </main>

      {/* ── Toast Informativo para Deshacer Eliminación de Gasto ── */}
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