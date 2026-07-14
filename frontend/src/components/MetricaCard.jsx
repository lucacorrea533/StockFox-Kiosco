// Este archivo contiene el componente de métricas en el panel de administración.

// Estilos compartidos con el Panel de Administración
import '../styles/PanelAdministracion.css'

// Componente simple que muestra una tarjeta con una etiqueta y un valor (ej: "Ventas del día: $5000")
// La prop "grande" permite mostrar el valor con una tipografía más destacada
function MetricaCard({ label, valor, grande }) {
  return (
    <div className="metrica-card">
      <span className="metrica-label">{label}</span>
      {/* El valor se muestra más grande si la prop "grande" es true */}
      <span className={`metrica-valor ${grande ? 'metrica-valor--grande' : ''}`}>
        {valor}
      </span>
    </div>
  )
}

export default MetricaCard