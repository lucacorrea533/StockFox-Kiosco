// Este archivo representa el componente de gráfico de barras para mostrar los datos de ventas.

import '../styles/InformeVentas.css'

function GraficoBarras({ datos }) {
  const maxBarra  = Math.max(...datos.map((d) => d.valor))
  const MAX_VALOR = maxBarra <= 10000 ? 10000 : maxBarra <= 50000 ? 50000 : 100000

  const etiquetas = MAX_VALOR === 10000  ? ['10k', '5k', '1k']
                  : MAX_VALOR === 50000  ? ['50k', '25k', '10k']
                  :                        ['100k', '50k', '10k']

  return (
    <div className="gb-cuerpo">
      <div className="gb-eje-y">
        {etiquetas.map((e) => <span key={e}>{e}</span>)}
      </div>
      <div className="gb-barras">
        {datos.map((d) => {
          const altura = Math.max(8, (d.valor / MAX_VALOR) * 100)
          const esMax  = d.valor === maxBarra
          return (
            <div key={d.dia} className="gb-col">
              <div className="gb-wrap">
                <div
                  className={`gb-barra ${esMax ? 'gb-barra--activa' : ''}`}
                  style={{ height: `${altura}%` }}
                />
              </div>
              <span className="gb-dia">{d.dia}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default GraficoBarras