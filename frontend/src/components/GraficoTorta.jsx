// Este archivo representa el componente de gráfico de torta para mostrar los datos de ventas.

import '../styles/InformeVentas.css'

function GraficoTorta({ datos }) {
  // Construir los segmentos SVG con stroke-dasharray
  const radio      = 40
  const cx         = 60
  const cy         = 60
  const circunf    = 2 * Math.PI * radio
  let acumulado    = 0

  const segmentos = datos.map((d) => {
    const largo   = (d.porcentaje / 100) * circunf
    const offset  = circunf - acumulado
    acumulado    += largo
    return { ...d, largo, offset }
  })

  return (
    <div className="gt-contenedor">
      {/* Torta SVG */}
      <svg width="120" height="120" viewBox="0 0 120 120" className="gt-svg">
        {segmentos.map((s, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={radio}
            fill="none"
            stroke={s.color}
            strokeWidth="20"
            strokeDasharray={`${s.largo} ${circunf}`}
            strokeDashoffset={s.offset}
            style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }}
          />
        ))}
      </svg>

      {/* Leyenda */}
      <div className="gt-leyenda">
        {datos.map((d, i) => (
          <div key={i} className="gt-leyenda-item">
            <span className="gt-leyenda-dot" style={{ background: d.color }} />
            <span className="gt-leyenda-texto">
              {d.label} ({d.porcentaje}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default GraficoTorta