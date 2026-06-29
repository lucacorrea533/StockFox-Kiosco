// Este archivo contiene el componente de métricas en el panel de administración.

import '../styles/PanelAdministracion.css'

function MetricaCard({ label, valor, grande }) {
  return (
    <div className="metrica-card">
      <span className="metrica-label">{label}</span>
      <span className={`metrica-valor ${grande ? 'metrica-valor--grande' : ''}`}>
        {valor}
      </span>
    </div>
  )
}

export default MetricaCard