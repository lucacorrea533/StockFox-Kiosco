import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import iconAdvertencia from '../assets/icons/Advertencia.png'
import '../styles/PanelAdministracion.css'
import { authFetch } from '../api/authFetch'

function AlertasStock() {
  const navigate = useNavigate()
  const [alertas, setAlertas] = useState([])

  useEffect(() => {
    authFetch("http://127.0.0.1:8000/api/productos/stock-bajo/")
      .then(response => response.json())
      .then(data => setAlertas(data))
      .catch(error => console.error(error))
  }, [])

  return (
    <div className="alertas-card">
      <div className="alertas-header">
        <span className="alertas-titulo">Stock bajo</span>
        <span className="alertas-badge">{alertas.length} productos</span>
      </div>
      <div className="alertas-lista">
        {alertas.length === 0 && (
          <p className="alertas-vacio">Todo el stock está en orden.</p>
        )}
        {alertas.map((a) => (
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