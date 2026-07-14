/* Este archivo contiene el código de la página PedidosAlumnos.
   Permite a la encargada monitorear y gestionar los pedidos realizados por los alumnos,
   filtrar por estado (HU-11) o curso, buscar por nombre, actualizar estados con feedback inmediato (HU-12),
   archivar pedidos completados de manera persistente (localStorage) y deshacer cambios erróneos desde un Toast. */

import { useState, useRef, useEffect } from 'react'
import api from '../api/axiosClient'
import NavbarEncargada from '../components/NavbarEncargada'
import iconBuscador from '../assets/icons/BuscadorBoton.png'
import iconReloj from '../assets/icons/Reloj.png'
import '../styles/PedidosAlumnos.css'

/* Lista de estados válidos del ciclo de vida de un pedido */
const ESTADOS = ['pendiente', 'listo', 'entregado']

/* Mapeo para mostrar etiquetas de estados capitalizadas de manera amigable */
const LABEL = {
  pendiente:  'Pendiente',
  listo:      'Listo',
  entregado:  'Entregado',
}

const ARCHIVADOS_KEY = 'pedidos_archivados'

/* ── Funciones Auxiliares para Persistencia Local ───────────────────────────── */

/* cargarArchivadosLocal: Recupera los IDs de los pedidos archivados guardados en el equipo local */
function cargarArchivadosLocal() {
  try {
    const raw = localStorage.getItem(ARCHIVADOS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/* guardarArchivadosLocal: Guarda de manera persistente la lista de IDs archivados */
function guardarArchivadosLocal(ids) {
  localStorage.setItem(ARCHIVADOS_KEY, JSON.stringify(ids))
}

/* ── Componente Principal ─────────────────────────────────────────────────── */
function PedidosAlumnos() {
  /* ── Estados del Panel de Gestión ────────────────────────────────────────── */
  const [pedidos, setPedidos]                       = useState([])
  const [filtroEstado, setFiltroEstado]             = useState('todos')
  const [filtroCurso, setFiltroCurso]               = useState('')
  const [busqueda, setBusqueda]                     = useState('')
  const [verArchivados, setVerArchivados]           = useState(false)
  
  /* pedidoActualizando: Almacena el ID del pedido que está transmitiendo datos con el backend.
     Previene dobles clicks y acciones concurrentes bloqueando el select correspondiente. */
  const [pedidoActualizando, setPedidoActualizando] = useState(null)

  /* Toast + Undo: Permite visualizar notificaciones flotantes temporales y deshacer la última acción */
  const [toast, setToast]                           = useState(null) // { id, alumno, estadoNuevo, estadoAnterior }
  const toastRef                                    = useRef(null)

  /* ── Recuperación Inicial de Pedidos ───────────────────────────────────────── */
  useEffect(() => {
    api.get("pedidos/")
      .then(response => {
        const archivados = cargarArchivadosLocal()
        
        // Mapeamos las propiedades devueltas de Django e inyectamos la propiedad booleana 'archivado'
        const pedidosBackend = response.data.map(pedido => ({
          id: pedido.id_pedido,
          alumno: pedido.alumno,
          curso: pedido.curso,
          horario: pedido.horario_retiro,
          total: Number(pedido.total),
          estado: pedido.estado,
          archivado: archivados.includes(pedido.id_pedido),
          productos: pedido.productos
        }))
        setPedidos(pedidosBackend)
      })
      .catch(error => {
        console.error("Error al cargar pedidos:", error)
      })
  }, [])

  /* ── Formateo de UI y Operaciones del Lado del Cliente ────────────────────── */
  
  /* hoy: Obtiene la fecha del día actual en un formato formal argentino */
  const hoy = new Date().toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  /* cursosUnicos: Extrae y ordena alfabéticamente los cursos representados en los pedidos para el selector */
  const cursosUnicos = [...new Set(pedidos.map((p) => p.curso))].sort()

  /* conteos: Mide la cantidad de pedidos activos de cada categoría (excluyendo los archivados) */
  const conteos = {
    todos:     pedidos.filter((p) => !p.archivado).length,
    pendiente: pedidos.filter((p) => p.estado === 'pendiente' && !p.archivado).length,
    listo:     pedidos.filter((p) => p.estado === 'listo' && !p.archivado).length,
    entregado: pedidos.filter((p) => p.estado === 'entregado' && !p.archivado).length,
  }

  /* filtrados: Aplica en cascada los filtros de estado, curso, búsqueda y archivado;
     luego los ordena cronológicamente por su horario de retiro asignado */
  const filtrados = pedidos
    .filter((p) => {
      if (!verArchivados && p.archivado) return false
      if (filtroEstado !== 'todos' && p.estado !== filtroEstado) return false
      if (filtroCurso && p.curso !== filtroCurso) return false
      if (busqueda && !p.alumno.toLowerCase().includes(busqueda.toLowerCase())) return false
      return true
    })
    .sort((a, b) => a.horario.localeCompare(b.horario))

  /* ── Controladores de Eventos del Ciclo de Vida del Pedido ────────────────── */

  /* cambiarEstado (HU-12): Actualiza en la base de datos de Django y reactivamente en el estado local 
     el estado del pedido de un alumno, guardando los datos necesarios para permitir el "Deshacer" posterior. */
  async function cambiarEstado(id, nuevoEstado) {
    const pedido = pedidos.find((p) => p.id === id)
    if (!pedido || pedido.estado === nuevoEstado) return

    setPedidoActualizando(id) // Bloquea la interacción visual de esta fila
    const estadoAnterior = pedido.estado

    try {
      await api.put(`pedidos/estado/${id}/`, { estado: nuevoEstado })

      setPedidos(prev =>
        prev.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p)
      )

      // Si había otra notificación de deshacer en pantalla, la limpiamos primero
      if (toastRef.current) clearTimeout(toastRef.current)

      setToast({
        id,
        alumno: pedido.alumno,
        estadoNuevo: nuevoEstado,
        estadoAnterior
      })

      // El Toast desaparecerá de manera automática pasados los 5 segundos
      toastRef.current = setTimeout(() => {
        setToast(null)
      }, 5000)

    } catch (error) {
      console.error("Error al actualizar el estado:", error)
      alert("No se pudo actualizar el estado del pedido.")
    } finally {
      setPedidoActualizando(null) // Libera el bloqueo del elemento
    }
  }

  /* deshacer: Revierte la transición de estado devolviendo el pedido a su estado original */
  async function deshacer() {
    if (!toast) return

    setPedidoActualizando(toast.id)

    try {
      await api.put(`pedidos/estado/${toast.id}/`, { estado: toast.estadoAnterior })

      setPedidos(prev =>
        prev.map(p => p.id === toast.id ? { ...p, estado: toast.estadoAnterior } : p)
      )

      clearTimeout(toastRef.current)
      setToast(null)
    } catch (error) {
      console.error("Error al deshacer cambio de estado:", error)
      alert("No se pudo deshacer el cambio de estado.")
    } finally {
      setPedidoActualizando(null)
    }
  }

  /* archivar: Agrega de manera persistente el ID del pedido a localStorage para removerlo del flujo activo */
  function archivar(id) {
    const archivados = cargarArchivadosLocal()
    if (!archivados.includes(id)) {
      guardarArchivadosLocal([...archivados, id])
    }

    setPedidos((prev) =>
      prev.map((p) => p.id === id ? { ...p, archivado: true } : p)
    )
  }

  const cantArchivados = pedidos.filter((p) => p.archivado).length

  /* ── Renderizado del Panel ─────────────────────────────────────────────────────────── */
  return (
    <div style={{ display: 'flex' }}>
      {/* Menú de navegación lateral */}
      <NavbarEncargada />

      <main className="pedidos-panel">

        {/* Encabezado Principal */}
        <div className="pp-header">
          <h1 className="pp-titulo">Panel de Pedidos de Alumnos</h1>
          <span className="pp-fecha">Hoy — {hoy}</span>
        </div>

        {/* Botones de Filtro Tipo "Pills" (HU-11): Muestran el conteo de pedidos activos en tiempo real */}
        <div className="pp-filtros-estado">
          {[
            { key: 'todos',     label: 'Todos'     },
            { key: 'pendiente', label: 'Pendiente' },
            { key: 'listo',     label: 'Listo'     },
            { key: 'entregado', label: 'Entregado' },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`pp-pill pp-pill--${key} ${filtroEstado === key ? 'pp-pill--activa' : ''}`}
              onClick={() => setFiltroEstado(key)}
            >
              {label}
              {conteos[key] > 0 && <span className="pp-pill-count">{conteos[key]}</span>}
            </button>
          ))}
        </div>

        {/* Barra de Búsqueda de Alumnos y Filtrado por Cursos */}
        <div className="pp-barra">
          <select className="pp-select" value={filtroCurso} onChange={(e) => setFiltroCurso(e.target.value)}>
            <option value="">▼ Todos los cursos</option>
            {cursosUnicos.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="pp-buscador">
            <img src={iconBuscador} alt="Buscar" className="pp-buscador-icono" />
            <input
              type="text"
              placeholder="Buscar alumno..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        {/* Tabla Principal de Pedidos */}
        <div className="pp-tabla-wrapper">
          <div className="pp-encabezado">
            <span>Alumno</span>
            <span>Curso</span>
            <span>Productos Pedidos</span>
            <span>Retiro</span>
            <span>Total</span>
            <span>Estado</span>
            <span>Acción</span>
          </div>

          {filtrados.length === 0 ? (
            <p className="pp-vacia">No hay pedidos con ese criterio.</p>
          ) : (
            filtrados.map((p) => (
              <div
                key={p.id}
                className={`pp-fila ${p.estado === 'entregado' ? 'pp-fila--entregado' : ''} ${p.archivado ? 'pp-fila--archivado' : ''}`}
              >
                {/* Nombre de Alumno y Curso */}
                <span className="pp-alumno">{p.alumno}</span>
                <span className="pp-curso-tag">{p.curso}</span>
                
                {/* Detalle de Productos e Unidades Pedidas */}
                <div className="pp-productos">
                  {p.productos.map((pr, i) => (
                    <span key={i} className="pp-prod">• {pr.nombre} x{pr.cantidad}</span>
                  ))}
                </div>

                {/* Horario estimado de Retiro */}
                <span className="pp-horario">
                  <img src={iconReloj} alt="Hora" className="pp-reloj-icon" />
                  {p.horario} hs
                </span>

                {/* Importe Total en Formato de Moneda de Argentina */}
                <span className="pp-total">${p.total.toLocaleString('es-AR')}</span>

                {/* Badge Visual del Estado Actualizado */}
                <span className={`pp-badge pp-badge--${p.estado}`}>
                  {LABEL[p.estado]}
                </span>

                {/* Selector de Cambios de Estado y Botón para Archivar */}
                <div className="pp-accion">
                  {!p.archivado && (
                    <select
                      className={`pp-estado-select pp-estado-select--${p.estado}`}
                      value={pedidoActualizando === p.id ? "" : p.estado}
                      disabled={pedidoActualizando === p.id}
                      onChange={(e) => cambiarEstado(p.id, e.target.value)}
                    >
                      {pedidoActualizando === p.id && (
                        <option value="">Cambiando...</option>
                      )}

                      {!pedidoActualizando &&
                        ESTADOS.map(est => (
                          <option key={est} value={est}>
                            {LABEL[est]}
                          </option>
                        ))
                      }
                    </select>
                  )}
                  {/* Se permite archivar el pedido una vez que el mismo ha sido 'entregado' */}
                  {p.estado === 'entregado' && !p.archivado && (
                    <button className="pp-btn-archivar" onClick={() => archivar(p.id)}>
                      Archivar
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Acceso e Interruptor de Visibilidad de Pedidos Históricos Archivados */}
        {cantArchivados > 0 && (
          <button className="pp-btn-ver-archivados" onClick={() => setVerArchivados((v) => !v)}>
            {verArchivados ? 'Ocultar archivados' : `Ver archivados (${cantArchivados})`}
          </button>
        )}

      </main>

      {/* Toast Flotante con Soporte para "Deshacer" la Operación */}
      {toast && (
        <div className="pp-toast">
          <span>
            ✓ <strong>{toast.alumno}</strong> → <strong>{LABEL[toast.estadoNuevo]}</strong>
          </span>
          <button className="pp-toast-btn" onClick={deshacer}>Deshacer</button>
        </div>
      )}

    </div>
  )
}

export default PedidosAlumnos