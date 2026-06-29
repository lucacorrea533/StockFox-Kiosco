// Este archivo contiene el componente de pedidos recientes en el panel de administración.

import { useNavigate } from 'react-router-dom'
import '../styles/PanelAdministracion.css'

// Datos de ejemplo
const PEDIDOS_RECIENTES = [
  { id: 1, alumno: 'Nombre de cliente', items: 2, hora: '10:35 hs', estado: 'Pendiente' },
  { id: 2, alumno: 'Nombre de cliente', items: 1, hora: '14:50 hs', estado: 'Entregado' },
]

const ESTADO_CLASE = {
  Pendiente: 'pedido-estado--pendiente',
  Listo:     'pedido-estado--listo',
  Entregado: 'pedido-estado--entregado',
}

function PedidosRecientes() {
  const navigate = useNavigate()

  return (
    <div className="pedidos-card">
      <h2 className="pedidos-titulo">Pedidos recientes</h2>
      <div className="pedidos-lista">
        {PEDIDOS_RECIENTES.map((p) => (
          <div key={p.id} className="pedidos-fila">
            <div className="pedidos-info">
              <span className="pedidos-alumno">{p.alumno}</span>
              <span className="pedidos-detalle">
                {p.items} {p.items === 1 ? 'ítem' : 'ítems'} - {p.hora}
              </span>
            </div>
            <span className={`pedido-estado ${ESTADO_CLASE[p.estado] ?? ''}`}>
              {p.estado}
            </span>
          </div>
        ))}
      </div>
      <button
        className="pedidos-ver-todos"
        onClick={() => navigate('/admin/pedidos')}
      >
        Ver todos →
      </button>
    </div>
  )
}

export default PedidosRecientes