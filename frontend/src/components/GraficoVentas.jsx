/* Este archivo contiene el componente de gráfico de ventas en el panel de administración. */

import '../styles/PanelAdministracion.css'

const PERIODOS = ['Dia', 'Sem', 'Mes']

const DATOS_POR_PERIODO = {
  Dia: [
    { dia: '8hs',  valor: 1200 },
    { dia: '9hs',  valor: 3400 },
    { dia: '10hs', valor: 5800 },
    { dia: '11hs', valor: 4200 },
    { dia: '12hs', valor: 7800 },
  ],
  Sem: [
    { dia: 'Lun', valor: 4200 },
    { dia: 'Mar', valor: 3800 },
    { dia: 'Mie', valor: 3500 },
    { dia: 'Jue', valor: 7800 },
    { dia: 'Vie', valor: 5100 },
  ],
  Mes: [
    { dia: 'Sem 1', valor: 28000 },
    { dia: 'Sem 2', valor: 34000 },
    { dia: 'Sem 3', valor: 41000 },
    { dia: 'Sem 4', valor: 38000 },
  ],
}

function GraficoVentas({ periodoActivo, onCambiarPeriodo }) {
  const datos    = DATOS_POR_PERIODO[periodoActivo]
  const maxBarra = Math.max(...datos.map((d) => d.valor))
  const MAX_VALOR = periodoActivo === 'Mes' ? 50000 : 10000

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
          <span>{periodoActivo === 'Mes' ? '50k' : '10k'}</span>
          <span>{periodoActivo === 'Mes' ? '25k' : '5k'}</span>
          <span>{periodoActivo === 'Mes' ? '10k' : '1k'}</span>
        </div>

        <div className="grafico-barras">
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