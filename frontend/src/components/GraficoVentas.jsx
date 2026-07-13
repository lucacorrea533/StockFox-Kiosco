import { useState, useEffect } from 'react'
import '../styles/PanelAdministracion.css'
import api from '../api/axiosClient'

const PERIODOS = ['Dia', 'Sem', 'Mes']

const PERIODO_BACKEND = {
  Dia: 'dia',
  Sem: 'semana',
  Mes: 'mes',
}

function GraficoVentas({ periodoActivo, onCambiarPeriodo }) {
  const [datos, setDatos]       = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    setCargando(true)
    api.get(`informes/resumen-ventas/?periodo=${PERIODO_BACKEND[periodoActivo]}`)
      .then(response => setDatos(response.data.barras || []))
      .catch(error => console.error(error))
      .finally(() => setCargando(false))
  }, [periodoActivo])

  const maxBarra  = datos.length ? Math.max(...datos.map((d) => d.valor)) : 0
  const MAX_VALOR = maxBarra > 0 ? maxBarra * 1.15 : 1

  return (
    <div className="grafico-card">
      <div className="grafico-header">
        <span className="grafico-titulo">Ingresos</span>
        <div className="grafico-periodos">
          {PERIODOS.map((p) => (
            <button
              key={p}
              className={`grafico-periodo-btn ${periodoActivo === p ? 'grafico-periodo-btn--activo' : ''}`}
              onClick={() => onCambiarPeriodo(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grafico-cuerpo">
        <div className="grafico-eje-y">
          <span>${Math.round(MAX_VALOR).toLocaleString('es-AR')}</span>
          <span>${Math.round(MAX_VALOR / 2).toLocaleString('es-AR')}</span>
          <span>$0</span>
        </div>

        <div className="grafico-barras">
          {!cargando && datos.length === 0 && (
            <p className="grafico-vacio">Sin ventas registradas en este período.</p>
          )}
          {datos.map((d) => {
            const altura = Math.max(8, (d.valor / MAX_VALOR) * 100)
            const esMax  = d.valor === maxBarra
            return (
              <div key={d.dia} className="grafico-barra-col">
                <div className="grafico-barra-wrap">
                  <div
                    className={`grafico-barra ${esMax ? 'grafico-barra--activa' : ''}`}
                    style={{ height: `${altura}%` }}
                  />
                </div>
                <span className="grafico-dia">{d.dia}</span>
              </div>
            )
          })}
        </div>
      </div>

      <p className="grafico-subtitulo">Gráfico de barras — Ingresos por día</p>
    </div>
  )
}

export default GraficoVentas