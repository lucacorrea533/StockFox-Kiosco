// Este archivo contiene el componente de panel de administración para la encargada del kiosco.

import { useState } from 'react'
import NavbarEncargada from '../components/NavbarEncargada'
import MetricaCard from '../components/MetricaCard'
import AlertasStock from '../components/AlertasStock'
import PedidosRecientes from '../components/PedidosRecientes'
import GraficoVentas from '../components/GraficoVentas'
import '../styles/PanelAdministracion.css'

/* Funcion para determinar el saludo según la hora del día */
function getSaludo() {
  const hora = new Date().getHours()
  if (hora >= 6 && hora < 12)  return 'Buen día'
  if (hora >= 12 && hora < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

const METRICAS = [
  { label: 'Total vendido hoy',  valor: '$00.000', grande: true },
  { label: 'Ventas del día',     valor: '00' },
  { label: 'Pedidos Pendientes', valor: '00' },
]

function PanelAdministracion() {
  const [periodoActivo, setPeriodoActivo] = useState('Sem')

  return (
    <div className="pa-layout">
      <NavbarEncargada />

      <main className="pa-main">

        <h1 className="pa-saludo">{getSaludo()}, Encargada</h1>

        {/* ── Métricas del día ── */}
        <section className="pa-seccion">
          <h2 className="pa-subtitulo">Métricas del Día</h2>
          <div className="pa-metricas">
            {METRICAS.map((m) => (
              <MetricaCard key={m.label} label={m.label} valor={m.valor} grande={m.grande} />
            ))}
          </div>
        </section>

        {/* ── Alertas + Pedidos recientes ── */}
        <div className="pa-fila-doble">
          <AlertasStock />
          <PedidosRecientes />
        </div>

        {/* ── Gráfico ventas semanales ── */}
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