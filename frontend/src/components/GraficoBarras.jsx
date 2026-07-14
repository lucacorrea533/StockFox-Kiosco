// Este archivo representa el componente de gráfico de barras para mostrar los datos de ventas.

// Estilos compartidos con la vista de Informe de Ventas
import '../styles/InformeVentas.css'

// Componente que dibuja un gráfico de barras genérico a partir de un array de datos (día + valor)
function GraficoBarras({ datos }) {
  // Buscamos el valor más alto entre todos los datos, para saber qué barra es la "máxima"
  const maxBarra  = Math.max(...datos.map((d) => d.valor))
  // Definimos la escala del eje Y según qué tan grande es el valor máximo (10k, 50k o 100k)
  const MAX_VALOR = maxBarra <= 10000 ? 10000 : maxBarra <= 50000 ? 50000 : 100000

  // Según la escala elegida, armamos las etiquetas que se muestran en el eje Y
  const etiquetas = MAX_VALOR === 10000  ? ['10k', '5k', '1k']
                  : MAX_VALOR === 50000  ? ['50k', '25k', '10k']
                  :                        ['100k', '50k', '10k']

  return (
    <div className="gb-cuerpo">
      {/* Eje Y: muestra las etiquetas de referencia (escala de valores) */}
      <div className="gb-eje-y">
        {etiquetas.map((e) => <span key={e}>{e}</span>)}
      </div>

      {/* Contenedor de todas las barras */}
      <div className="gb-barras">
        {/* Recorremos cada dato para dibujar una columna (barra) por cada uno */}
        {datos.map((d) => {
          // Calculamos la altura de la barra en porcentaje, con un mínimo de 8% para que siempre sea visible
          const altura = Math.max(8, (d.valor / MAX_VALOR) * 100)
          // Marcamos si esta barra es la de valor máximo, para resaltarla visualmente
          const esMax  = d.valor === maxBarra
          return (
            <div key={d.dia} className="gb-col">
              {/* Contenedor que envuelve la barra (define el alto máximo disponible) */}
              <div className="gb-wrap">
                {/* Barra en sí, con altura dinámica según el valor y clase extra si es la máxima */}
                <div
                  className={`gb-barra ${esMax ? 'gb-barra--activa' : ''}`}
                  style={{ height: `${altura}%` }}
                />
              </div>
              {/* Etiqueta del día debajo de la barra */}
              <span className="gb-dia">{d.dia}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default GraficoBarras