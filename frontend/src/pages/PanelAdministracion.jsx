/* Este archivo representa la página principal del Panel de Administración para la encargada.
   Actúa como un dashboard central que despliega un saludo dinámico, métricas operativas clave en tiempo real
   (total vendido hoy, volumen de ventas y pedidos pendientes), alertas de stock crítico, los últimos pedidos
   y gráficos de tendencias de ventas semanales. */

import { useState, useEffect } from 'react'
import NavbarEncargada from '../components/NavbarEncargada'
import MetricaCard from '../components/MetricaCard'
import AlertasStock from '../components/AlertasStock'
import PedidosRecientes from '../components/PedidosRecientes'
import GraficoVentas from '../components/GraficoVentas'
import '../styles/PanelAdministracion.css'
import api from '../api/axiosClient'

/* getSaludo: Función auxiliar para determinar de manera dinámica el saludo inicial
   en base a la hora de sistema del dispositivo cliente. */
function getSaludo() {
  const hora = new Date().getHours()
  if (hora >= 6 && hora < 12)  return 'Buen día'
  if (hora >= 12 && hora < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

function PanelAdministracion() {
  /* ── Estados del Dashboard ─────────────────────────────────────────────────────────── */
  const [periodoActivo, setPeriodoActivo] = useState('Dia')
  
  /* metricas: Datos financieros y operativos globales recuperados de la API de Django */
  const [metricas, setMetricas] = useState({
    totalVendidoHoy: 0,
    ventasDelDia: 0,
    pedidosPendientes: 0,
  })

  /* ── Efecto (useEffect) para Carga de Datos en Tiempo Real ─────────────────────────── */
  useEffect(() => {
    /* Petición 1: Consume el resumen de ventas del día actual desde el endpoint analítico */
    api.get('informes/resumen-ventas/?periodo=dia')
      .then(response => {
        setMetricas(prev => ({
          ...prev,
          totalVendidoHoy: Number(response.data.total_vendido),
          ventasDelDia: response.data.cantidad_ventas,
        }))
      })
      .catch(error => console.error('Error al traer ventas del día:', error))

    /* Petición 2: Consume todos los pedidos del buffet, filtrando localmente aquellos
       cuyo estado sea "pendiente" para determinar el volumen de trabajo en cola */
    api.get('pedidos/')
      .then(response => {
        const pendientes = response.data.filter(p => p.estado === 'pendiente').length
        setMetricas(prev => ({ ...prev, pedidosPendientes: pendientes }))
      })
      .catch(error => console.error('Error al traer pedidos pendientes:', error))
  }, [])

  /* ── Configuración de Renderizado de Tarjetas (Métricas) ───────────────────────────── */
  /* Estructuramos en un array los objetos de métricas listos para mapear en la UI,
     aplicando formatos locales ($ para moneda y pads para asegurar dos dígitos visuales) */
  const METRICAS = [
    { label: 'Total vendido hoy',  valor: `$${metricas.totalVendidoHoy.toLocaleString('es-AR')}`, grande: true },
    { label: 'Ventas del día',     valor: String(metricas.ventasDelDia).padStart(2, '0') },
    { label: 'Pedidos Pendientes', valor: String(metricas.pedidosPendientes).padStart(2, '0') },
  ]

  /* ── Renderizado Principal del Dashboard ────────────────────────────────────────────── */
  return (
    <div className="pa-layout">
      {/* Menú de navegación lateral */}
      <NavbarEncargada />

      <main className="pa-main">

        {/* Mensaje de bienvenida dinámico personalizado */}
        <h1 className="pa-saludo">{getSaludo()}, Encargada</h1>

        {/* ── Sección: Tarjetas de Métricas Rápidas ── */}
        <section className="pa-seccion">
          <h2 className="pa-subtitulo">Métricas del Día</h2>
          <div className="pa-metricas">
            {METRICAS.map((m) => (
              <MetricaCard key={m.label} label={m.label} valor={m.valor} grande={m.grande} />
            ))}
          </div>
        </section>

        {/* ── Sección: Fila Doble de Alertas de Stock y Pedidos Recientes ── */}
        <div className="pa-fila-doble">
          {/* Muestra aquellos productos que están por debajo del stock mínimo */}
          <AlertasStock />
          
          {/* Listado en tiempo real con las últimas órdenes registradas en el buffet */}
          <PedidosRecientes />
        </div>

        {/* ── Sección: Gráfico de Tendencia de Ventas Semanales ── */}
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