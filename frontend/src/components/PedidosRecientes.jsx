import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axiosClient'
import '../styles/PanelAdministracion.css'

const ESTADO_CLASE = {
  pendiente: 'pedido-estado--pendiente',
  listo:     'pedido-estado--listo',
  entregado: 'pedido-estado--entregado',
}

const ESTADO_LABEL = {
  pendiente: 'Pendiente',
  listo:     'Listo',
  entregado: 'Entregado',
}

function PedidosRecientes() {
  const navigate = useNavigate()
  const [pedidos, setPedidos] = useState([])

  useEffect(() => {
    api.get('pedidos/')
      .then(response => {
        const ordenados = [...response.data]
          .sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion))
          .slice(0, 5)
        setPedidos(ordenados)
      })
      .catch(error => console.error(error))
  }, [])

  return (
    <div className="pedidos-card">
      <h2 className="pedidos-titulo">Pedidos recientes</h2>
      <div className="pedidos-lista">
        {pedidos.length === 0 && <p>No hay pedidos todavía.</p>}
        {pedidos.map((p) => (
          <div key={p.id_pedido} className="pedidos-fila">
            <div className="pedidos-info">
              <span className="pedidos-alumno">{p.alumno}</span>
              <span className="pedidos-detalle">
                {p.productos.length} {p.productos.length === 1 ? 'ítem' : 'ítems'} - {p.horario_retiro} hs
              </span>
            </div>
            <span className={`pedido-estado ${ESTADO_CLASE[p.estado] ?? ''}`}>
              {ESTADO_LABEL[p.estado] ?? p.estado}
            </span>
          </div>
        ))}
      </div>
      <button className="pedidos-ver-todos" onClick={() => navigate('/admin/pedidos')}>
        Ver todos →
      </button>
    </div>
  )
}

export default PedidosRecientes