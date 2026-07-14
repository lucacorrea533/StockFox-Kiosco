// Hooks de React: useState para manejar estado local, useEffect para efectos secundarios (llamada a la API)
import { useState, useEffect } from 'react'
// Hook de react-router-dom para poder redirigir al usuario a otra ruta mediante código
import { useNavigate } from 'react-router-dom'
// Cliente de axios configurado para hacer las peticiones al backend
import api from '../api/axiosClient'
// Estilos compartidos con el Panel de Administración
import '../styles/PanelAdministracion.css'

// Mapeo entre el estado del pedido y la clase CSS que le corresponde (para el color/estilo del badge)
const ESTADO_CLASE = {
  pendiente: 'pedido-estado--pendiente',
  listo:     'pedido-estado--listo',
  entregado: 'pedido-estado--entregado',
}

// Mapeo entre el estado del pedido (valor interno) y el texto que se muestra en pantalla
const ESTADO_LABEL = {
  pendiente: 'Pendiente',
  listo:     'Listo',
  entregado: 'Entregado',
}

// Componente que muestra los últimos 5 pedidos realizados, ordenados del más reciente al más antiguo
function PedidosRecientes() {
  // Hook para poder navegar programáticamente a otra vista (por ejemplo, al hacer click en "Ver todos")
  const navigate = useNavigate()
  // Estado que guarda el array de pedidos recientes traídos desde el backend
  const [pedidos, setPedidos] = useState([])

  // Efecto que se ejecuta una sola vez al montar el componente, para traer los pedidos desde el backend
  useEffect(() => {
    api.get('pedidos/')
      .then(response => {
        // Ordenamos los pedidos del más reciente al más antiguo y nos quedamos solo con los primeros 5
        const ordenados = [...response.data]
          .sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion))
          .slice(0, 5)
        setPedidos(ordenados)
      })
      .catch(error => console.error(error)) // Si hay un error, lo mostramos en consola
  }, [])

  return (
    <div className="pedidos-card">
      <h2 className="pedidos-titulo">Pedidos recientes</h2>
      <div className="pedidos-lista">
        {/* Si no hay pedidos, mostramos un mensaje indicándolo */}
        {pedidos.length === 0 && <p>No hay pedidos todavía.</p>}
        {/* Recorremos cada pedido y mostramos su información en una fila */}
        {pedidos.map((p) => (
          <div key={p.id_pedido} className="pedidos-fila">
            <div className="pedidos-info">
              <span className="pedidos-alumno">{p.alumno}</span>
              {/* Cantidad de ítems (con singular/plural correcto) y horario de retiro */}
              <span className="pedidos-detalle">
                {p.productos.length} {p.productos.length === 1 ? 'ítem' : 'ítems'} - {p.horario_retiro} hs
              </span>
            </div>
            {/* Badge de estado del pedido, con clase y texto según el estado actual */}
            <span className={`pedido-estado ${ESTADO_CLASE[p.estado] ?? ''}`}>
              {ESTADO_LABEL[p.estado] ?? p.estado}
            </span>
          </div>
        ))}
      </div>
      {/* Botón que redirige a la vista completa de gestión de pedidos */}
      <button className="pedidos-ver-todos" onClick={() => navigate('/admin/pedidos')}>
        Ver todos →
      </button>
    </div>
  )
}

export default PedidosRecientes