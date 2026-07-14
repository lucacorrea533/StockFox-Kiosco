// Hooks de React: useState para manejar estado local, useEffect para efectos secundarios (llamadas a la API)
import { useState, useEffect } from 'react'
// Estilos compartidos con el Panel de Administración
import '../styles/PanelAdministracion.css'
// Cliente de axios configurado (con la URL base y headers necesarios) para hacer las peticiones al backend
import api from '../api/axiosClient'

// Lista de períodos disponibles para el filtro (se muestran como texto en los botones)
const PERIODOS = ['Dia', 'Sem', 'Mes']

// Mapeo entre el texto mostrado en pantalla y el valor que espera el backend en la URL
const PERIODO_BACKEND = {
  Dia: 'dia',
  Sem: 'semana',
  Mes: 'mes',
}

// Componente que muestra el gráfico de ingresos por ventas, con selector de período (Día/Semana/Mes)
// Recibe el período activo y una función para cambiarlo, ambos controlados por el componente padre
function GraficoVentas({ periodoActivo, onCambiarPeriodo }) {
  // Estado que guarda los datos de las barras (día + valor) traídos desde el backend
  const [datos, setDatos]       = useState([])
  // Estado que indica si la información todavía se está cargando
  const [cargando, setCargando] = useState(true)

  // Efecto que se ejecuta cada vez que cambia el período activo, para volver a pedir los datos correspondientes
  useEffect(() => {
    setCargando(true) // Marcamos que empezó la carga
    // Pedimos al backend el resumen de ventas según el período seleccionado
    api.get(`informes/resumen-ventas/?periodo=${PERIODO_BACKEND[periodoActivo]}`)
      .then(response => setDatos(response.data.barras || [])) // Guardamos las barras recibidas (o array vacío si no vienen)
      .catch(error => console.error(error)) // Si hay error, lo mostramos en consola
      .finally(() => setCargando(false)) // Terminó la carga, haya salido bien o mal
  }, [periodoActivo])

  // Buscamos el valor más alto entre las barras actuales, para saber cuál es la "máxima"
  const maxBarra  = datos.length ? Math.max(...datos.map((d) => d.valor)) : 0
  // Definimos el valor máximo del eje Y con un margen extra del 15% (o 1 si no hay datos, para evitar división por cero)
  const MAX_VALOR = maxBarra > 0 ? maxBarra * 1.15 : 1

  return (
    <div className="grafico-card">
      {/* Encabezado: título del gráfico y botones para elegir el período */}
      <div className="grafico-header">
        <span className="grafico-titulo">Ingresos</span>
        <div className="grafico-periodos">
          {/* Recorremos los períodos disponibles para generar un botón por cada uno */}
          {PERIODOS.map((p) => (
            <button
              key={p}
              // Resaltamos el botón del período que está actualmente activo
              className={`grafico-periodo-btn ${periodoActivo === p ? 'grafico-periodo-btn--activo' : ''}`}
              onClick={() => onCambiarPeriodo(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Cuerpo del gráfico: eje Y + barras */}
      <div className="grafico-cuerpo">
        {/* Eje Y con tres referencias: valor máximo, la mitad, y cero */}
        <div className="grafico-eje-y">
          <span>${Math.round(MAX_VALOR).toLocaleString('es-AR')}</span>
          <span>${Math.round(MAX_VALOR / 2).toLocaleString('es-AR')}</span>
          <span>$0</span>
        </div>

        {/* Contenedor de las barras del gráfico */}
        <div className="grafico-barras">
          {/* Si ya terminó de cargar y no hay datos, mostramos un mensaje indicándolo */}
          {!cargando && datos.length === 0 && (
            <p className="grafico-vacio">Sin ventas registradas en este período.</p>
          )}
          {/* Recorremos cada dato para dibujar su barra correspondiente */}
          {datos.map((d) => {
            // Calculamos la altura de la barra en porcentaje, con un mínimo de 8% para que siempre se vea
            const altura = Math.max(8, (d.valor / MAX_VALOR) * 100)
            // Marcamos si esta es la barra con el valor más alto, para resaltarla
            const esMax  = d.valor === maxBarra
            return (
              <div key={d.dia} className="grafico-barra-col">
                <div className="grafico-barra-wrap">
                  <div
                    className={`grafico-barra ${esMax ? 'grafico-barra--activa' : ''}`}
                    style={{ height: `${altura}%` }}
                  />
                </div>
                {/* Etiqueta del día debajo de cada barra */}
                <span className="grafico-dia">{d.dia}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Subtítulo descriptivo debajo del gráfico */}
      <p className="grafico-subtitulo">Gráfico de barras — Ingresos por día</p>
    </div>
  )
}

export default GraficoVentas