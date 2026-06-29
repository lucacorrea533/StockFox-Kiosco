// Este archivo contiene el componente de alertas de stock en el panel de administración.

import { useNavigate } from 'react-router-dom'
import iconAdvertencia from '../assets/icons/Advertencia.png'
import '../styles/PanelAdministracion.css'

const ALERTAS_STOCK = [
  { id: 1, nombre: 'Medialunas', stock: 0 },
  { id: 2, nombre: 'Coca Cola',  stock: 1 },
]

function AlertasStock() {
  const navigate = useNavigate()

  return (
    <div className="alertas-card">
      <div className="alertas-header">
        <span className="alertas-titulo">Stock bajo</span>
        <span className="alertas-badge">{ALERTAS_STOCK.length} productos</span>
      </div>
      <div className="alertas-lista">
        {ALERTAS_STOCK.map((a) => (
          <div key={a.id} className="alertas-fila">
            <div className="alertas-nombre-wrap">
              <img src={iconAdvertencia} alt="Advertencia" className="alertas-icono" />
              <span className="alertas-nombre">{a.nombre}</span>
            </div>
            <span className={`alertas-stock ${a.stock === 0 ? 'alertas-stock--cero' : ''}`}>
              Stock: {a.stock}
            </span>
          </div>
        ))}
      </div>
      <button className="alertas-ver-todos" onClick={() => navigate('/admin/productos')}>
        Ver todos →
      </button>
    </div>
  )
}

export default AlertasStock