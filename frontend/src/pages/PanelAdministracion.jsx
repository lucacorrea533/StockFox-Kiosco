import { useState, useEffect } from 'react'
import NavbarEncargada from '../components/NavbarEncargada'
import MetricaCard from '../components/MetricaCard'
import AlertasStock from '../components/AlertasStock'
import PedidosRecientes from '../components/PedidosRecientes'
import GraficoVentas from '../components/GraficoVentas'
import '../styles/PanelAdministracion.css'
import api from '../api/axiosClient'

function getSaludo() {
  const hora = new Date().getHours()
  if (hora >= 6 && hora < 12)  return 'Buen día'
  if (hora >= 12 && hora < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

function PanelAdministracion() {
  const [periodoActivo, setPeriodoActivo] = useState('Sem')
  const [metricas, setMetricas] = useState({
    totalVendidoHoy: 0,
    ventasDelDia: 0,
    pedidosPendientes: 0,
  })

  useEffect(() => {
    api.get('informes/resumen-ventas/?periodo=dia')
      .then(response => {
        setMetricas(prev => ({
          ...prev,
          totalVendidoHoy: Number(response.data.total_vendido),
          ventasDelDia: response.data.cantidad_ventas,
        }))
      })
      .catch(error => console.error(error))

    api.get('pedidos/')
      .then(response => {
        const pendientes = response.data.filter(p => p.estado === 'pendiente').length
        setMetricas(prev => ({ ...prev, pedidosPendientes: pendientes }))
      })
      .catch(error => console.error(error))
  }, [])

  const METRICAS = [
    { label: 'Total vendido hoy',  valor: `$${metricas.totalVendidoHoy.toLocaleString('es-AR')}`, grande: true },
    { label: 'Ventas del día',     valor: String(metricas.ventasDelDia).padStart(2, '0') },
    { label: 'Pedidos Pendientes', valor: String(metricas.pedidosPendientes).padStart(2, '0') },
  ]

  return (
    <div className="pa-layout">
      <NavbarEncargada />

      <main className="pa-main">

        <h1 className="pa-saludo">{getSaludo()}, Encargada</h1>

        <section className="pa-seccion">
          <h2 className="pa-subtitulo">Métricas del Día</h2>
          <div className="pa-metricas">
            {METRICAS.map((m) => (
              <MetricaCard key={m.label} label={m.label} valor={m.valor} grande={m.grande} />
            ))}
          </div>
        </section>

        <div className="pa-fila-doble">
          <AlertasStock />
          <PedidosRecientes />
        </div>

        <section className="pa-seccion">
          <h2 className="pa-subtitulo">Ventas de la semana</h2>
          <GraficoVentas
            periodoActivo={periodoActivo}
            onCambiarPeriodo={setPeriodoActivo}
          />
        </section>

      </main>
    </div>
  )
}

export default PanelAdministracion