// Este archivo representa el componente de gráfico de torta para mostrar los datos de ventas.

// Estilos compartidos con la vista de Informe de Ventas
import '../styles/InformeVentas.css'

// Componente que dibuja un gráfico de torta (dona) a partir de un array de datos con porcentajes
function GraficoTorta({ datos }) {
  // Construir los segmentos SVG con stroke-dasharray
  const radio      = 40 // Radio del círculo del gráfico
  const cx         = 60 // Coordenada X del centro
  const cy         = 60 // Coordenada Y del centro
  const circunf    = 2 * Math.PI * radio // Circunferencia total del círculo (longitud del borde)
  let acumulado    = 0 // Acumulador que lleva el largo ya "dibujado" de segmentos anteriores

  // Por cada dato, calculamos cuánto del círculo (en longitud de borde) le corresponde dibujar,
  // y el offset necesario para que empiece justo donde terminó el segmento anterior
  const segmentos = datos.map((d) => {
    const largo   = (d.porcentaje / 100) * circunf // Longitud de este segmento proporcional a su porcentaje
    const offset  = circunf - acumulado // Desplazamiento para ubicar el segmento en su posición correcta
    acumulado    += largo // Sumamos el largo de este segmento al acumulado para el próximo
    return { ...d, largo, offset }
  })

  return (
    <div className="gt-contenedor">
      {/* Torta SVG */}
      <svg width="120" height="120" viewBox="0 0 120 120" className="gt-svg">
        {/* Dibujamos un círculo por cada segmento, usando stroke-dasharray para simular las "porciones" */}
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
            // Rotamos -90 grados para que el gráfico arranque desde arriba (posición 12 en punto)
            style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }}
          />
        ))}
      </svg>

      {/* Leyenda: lista con el color, nombre y porcentaje de cada segmento */}
      <div className="gt-leyenda">
        {datos.map((d, i) => (
          <div key={i} className="gt-leyenda-item">
            {/* Punto de color que identifica visualmente el segmento */}
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