/* Este archivo contiene el código de la página PedidosAlumnos.
   Permite a la encargada monitorear y gestionar los pedidos realizados por los alumnos,
   filtrar por estado (HU-11) o curso, buscar por nombre, actualizar estados con feedback
   inmediato desde el mismo badge de Estado (HU-12, sin columna de Acción redundante),
   archivar pedidos automáticamente al marcarlos "Entregado", y deshacer cambios erróneos
   desde un Toast. Los archivados viven en una sección aparte, compacta, con borrado manual
   por ítem y limpieza automática pasadas 24hs. */

import { useState, useRef, useEffect } from 'react'
import api from '../api/axiosClient'
import NavbarEncargada from '../components/NavbarEncargada'
import iconBuscador from '../assets/icons/BuscadorBoton.png'
import iconReloj from '../assets/icons/Reloj.png'
import '../styles/PedidosAlumnos.css'

/* Lista fija de los 48 cursos de la ET 29 (turno mañana, tarde y noche
   combinados) */
const CURSOS_ET29 = [
  '1°1°', '1°2°', '1°3°', '1°4°', '1°5°', '1°6°', '1°7°', '1°9°', '1°10°',
  '2°1°', '2°2°', '2°3°', '2°4°', '2°5°', '2°6°', '2°7°', '2°8°', '2°9°',
  '3°1°', '3°2°', '3°3°', '3°4°', '3°5°', '3°6°', '3°7°',
  '4°1°', '4°2°', '4°3°', '4°4°', '4°5°', '4°6°', '4°7°', '4°8°',
  '5°1°', '5°2°', '5°3°', '5°4°', '5°5°', '5°6°', '5°7°', '5°8°',
  '6°1°', '6°2°', '6°3°', '6°4°', '6°5°', '6°6°', '6°7°',
]

/* Lista de estados válidos del ciclo de vida de un pedido, en orden de prioridad */
const ESTADOS = ['pendiente', 'en_preparacion', 'listo', 'entregado']

/* Mapeo para mostrar etiquetas de estados capitalizadas de manera amigable */
const LABEL = {
  pendiente:      'Pendiente',
  en_preparacion: 'En Preparación',
  listo:          'Listo',
  entregado:      'Entregado',
}

const ARCHIVADOS_KEY = 'pedidos_archivados'
const HORAS_ANTES_DE_BORRAR = 24 // Los archivados se limpian solos pasado este tiempo

/* ── Funciones Auxiliares para Persistencia Local ───────────────────────────── */
/* A diferencia de v1, ahora no guardamos solo los IDs archivados: guardamos
   { id: fechaISOEnQueSeArchivó }, para poder calcular después cuáles ya
   pasaron las 24hs y borrarlos solos sin intervención de la encargada. */

/* cargarArchivadosLocal: Recupera el mapa {id: fechaArchivado} guardado en el equipo local */
function cargarArchivadosLocal() {
  try {
    const raw = localStorage.getItem(ARCHIVADOS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

/* guardarArchivadosLocal: Guarda de manera persistente el mapa de archivados */
function guardarArchivadosLocal(mapa) {
  localStorage.setItem(ARCHIVADOS_KEY, JSON.stringify(mapa))
}

/* limpiarArchivadosVencidos: Devuelve el mapa sin las entradas que ya superaron
   las 24hs archivadas, y persiste esa limpieza en localStorage */
function limpiarArchivadosVencidos(mapa) {
  const ahora = Date.now()
  const limpio = {}

  for (const [id, fechaISO] of Object.entries(mapa)) {
    const horasPasadas = (ahora - new Date(fechaISO).getTime()) / (1000 * 60 * 60)
    if (horasPasadas < HORAS_ANTES_DE_BORRAR) limpio[id] = fechaISO
  }

  guardarArchivadosLocal(limpio)
  return limpio
}

/* ── Componente Principal ─────────────────────────────────────────────────── */
function PedidosAlumnos() {
  /* ── Estados del Panel de Gestión ────────────────────────────────────────── */
  const [mostrarArchivados, setMostrarArchivados] = useState(true)
  const [pedidos, setPedidos]           = useState([])
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroCurso, setFiltroCurso]   = useState('')
  const [busqueda, setBusqueda]         = useState('')

  /* pedidoActualizando: Almacena el ID del pedido que está transmitiendo datos con el backend.
     Previene dobles clicks y acciones concurrentes bloqueando el select correspondiente. */
  const [pedidoActualizando, setPedidoActualizando] = useState(null)

  /* Toast + Undo: Permite visualizar notificaciones flotantes temporales y deshacer la última acción */
  const [toast, setToast] = useState(null) // { id, alumno, estadoNuevo, estadoAnterior, seArchivo }
  const toastRef          = useRef(null)

  /* ── Recuperación Inicial de Pedidos ───────────────────────────────────────── */
  useEffect(() => {
    api.get("pedidos/")
      .then(response => {
        const archivados = limpiarArchivadosVencidos(cargarArchivadosLocal())
        let archivadosModificado = false

        const pedidosBackend = response.data.map(pedido => {
          const yaRegistradoComoArchivado = pedido.id_pedido in archivados
          // Si el backend ya lo tiene como "entregado" pero este dispositivo
          // todavía no lo había registrado como archivado (por ejemplo, la
          // primera carga después de este cambio, o se entregó desde otra
          // compu), lo consideramos archivado igual y arrancamos su cuenta
          // regresiva de 24hs recién ahora.
          const archivadoAhora = yaRegistradoComoArchivado || pedido.estado === 'entregado'

          if (archivadoAhora && !yaRegistradoComoArchivado) {
            archivados[pedido.id_pedido] = new Date().toISOString()
            archivadosModificado = true
          }

          return {
            id: pedido.id_pedido,
            alumno: pedido.alumno,
            curso: pedido.curso,
            horario: pedido.horario_retiro,
            total: Number(pedido.total),
            estado: pedido.estado,
            archivado: archivadoAhora,
            productos: pedido.productos
          }
        })

        if (archivadosModificado) guardarArchivadosLocal(archivados)
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

  /* activos: Pedidos que todavía no se archivaron (es decir, que no llegaron a "Entregado" o
     se deshizo esa transición). Es la lista que se muestra en la tabla principal. */
  const activos = pedidos.filter((p) => !p.archivado)

  /* archivados: Pedidos ya entregados y archivados, para la sección aparte de abajo */
  const archivados = pedidos.filter((p) => p.archivado)

  /* conteos: Mide la cantidad de pedidos activos de cada categoría (los archivados no cuentan,
     porque ya salieron del flujo de trabajo activo) */
  const conteos = {
    todos:          activos.length,
    pendiente:      activos.filter((p) => p.estado === 'pendiente').length,
    en_preparacion: activos.filter((p) => p.estado === 'en_preparacion').length,
    listo:          activos.filter((p) => p.estado === 'listo').length,
  }

  /* filtrados: Aplica en cascada los filtros de estado, curso y búsqueda sobre los pedidos
     activos; luego los ordena cronológicamente por su horario de retiro asignado */
  const filtrados = activos
    .filter((p) => {
      if (filtroEstado !== 'todos' && p.estado !== filtroEstado) return false
      if (filtroCurso && p.curso !== filtroCurso) return false
      if (busqueda && !p.alumno.toLowerCase().includes(busqueda.toLowerCase())) return false
      return true
    })
    .sort((a, b) => a.horario.localeCompare(b.horario))

  /* ── Controladores de Eventos del Ciclo de Vida del Pedido ────────────────── */

  /* cambiarEstado (HU-12): Actualiza en la base de datos de Django y reactivamente en el estado
     local el estado del pedido de un alumno. Si el nuevo estado es "entregado", el pedido se
     archiva automáticamente en el mismo momento (ya no hace falta un botón aparte), guardando
     los datos necesarios para permitir el "Deshacer" posterior (incluyendo desarchivar, si
     corresponde). */
  async function cambiarEstado(id, nuevoEstado) {
    const pedido = pedidos.find((p) => p.id === id)
    if (!pedido || pedido.estado === nuevoEstado) return

    setPedidoActualizando(id) // Bloquea la interacción visual de esta fila
    const estadoAnterior = pedido.estado
    const seArchiva = nuevoEstado === 'entregado'

    try {
      await api.put(`pedidos/estado/${id}/`, { estado: nuevoEstado })

      setPedidos(prev =>
        prev.map(p => p.id === id ? { ...p, estado: nuevoEstado, archivado: seArchiva } : p)
      )

      // Si el pedido pasó a "entregado", queda archivado también en localStorage con la fecha actual
      if (seArchiva) {
        const archivadosActuales = cargarArchivadosLocal()
        archivadosActuales[id] = new Date().toISOString()
        guardarArchivadosLocal(archivadosActuales)
      }

      // Si había otra notificación de deshacer en pantalla, la limpiamos primero
      if (toastRef.current) clearTimeout(toastRef.current)

      setToast({
        id,
        alumno: pedido.alumno,
        estadoNuevo: nuevoEstado,
        estadoAnterior,
        seArchivo: seArchiva,
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

  /* deshacer: Revierte la transición de estado devolviendo el pedido a su estado original.
     Si esa transición lo había archivado, también lo desarchiva y lo saca de localStorage. */
  async function deshacer() {
    if (!toast) return

    setPedidoActualizando(toast.id)

    try {
      await api.put(`pedidos/estado/${toast.id}/`, { estado: toast.estadoAnterior })

      setPedidos(prev =>
        prev.map(p => p.id === toast.id ? { ...p, estado: toast.estadoAnterior, archivado: false } : p)
      )

      if (toast.seArchivo) {
        const archivadosActuales = cargarArchivadosLocal()
        delete archivadosActuales[toast.id]
        guardarArchivadosLocal(archivadosActuales)
      }

      clearTimeout(toastRef.current)
      setToast(null)
    } catch (error) {
      console.error("Error al deshacer cambio de estado:", error)
      alert("No se pudo deshacer el cambio de estado.")
    } finally {
      setPedidoActualizando(null)
    }
  }

  /* borrarArchivado: Elimina un pedido de la sección de archivados de manera manual (la "×"),
     sin esperar a que se cumplan las 24hs automáticas */
  function borrarArchivado(id) {
    const archivadosActuales = cargarArchivadosLocal()
    delete archivadosActuales[id]
    guardarArchivadosLocal(archivadosActuales)

    setPedidos((prev) => prev.filter((p) => p.id !== id))
  }

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

        {/* Botones de Filtro Tipo "Pills": ya no incluye "Entregado", porque esos pedidos
            se archivan solos y dejan de formar parte del flujo de trabajo activo */}
        <div className="pp-filtros-estado">
          {[
            { key: 'todos',          label: 'Todos'          },
            { key: 'pendiente',      label: 'Pendiente'      },
            { key: 'en_preparacion', label: 'En Preparación' },
            { key: 'listo',          label: 'Listo'          },
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
          {CURSOS_ET29.map((c) => <option key={c} value={c}>{c}</option>)}
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

        {/* Tabla Principal de Pedidos: la columna "Estado" ahora ES el control de acción,
            no hay una columna aparte para eso — el select viene coloreado según el estado
            actual, mismo patrón visual que antes tenía el badge de solo lectura */}
        <div className="pp-tabla-wrapper">
          <div className="pp-encabezado">
            <span>Alumno</span>
            <span>Curso</span>
            <span>Productos Pedidos</span>
            <span>Retiro</span>
            <span>Total</span>
            <span>Estado</span>
          </div>

          {filtrados.length === 0 ? (
            <p className="pp-vacia">No hay pedidos con ese criterio.</p>
          ) : (
            filtrados.map((p) => (
              <div key={p.id} className="pp-fila">
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

                {/* Selector de Estado: único control, coloreado según el estado actual.
                    Elegir "Entregado" acá mismo dispara el archivado automático. */}
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
              </div>
            ))
          )}
        </div>

        {/* Sección de Archivados: compacta, aparte de la tabla principal, con borrado manual
            por ítem. Los que llevan más de 24hs archivados ya se limpiaron solos al cargar
            la página (ver limpiarArchivadosVencidos). */}
        {archivados.length > 0 && (
          <section className="pp-archivados-panel">
            <button
              className="pp-archivados-header"
              onClick={() => setMostrarArchivados((v) => !v)}
            >
              <span className="pp-archivados-titulo">
                Archivados ({archivados.length})
                <span className="pp-archivados-nota">Se eliminan solos a las 24hs</span>
              </span>
              <span className={`pp-archivados-flecha ${mostrarArchivados ? 'pp-archivados-flecha--abierta' : ''}`}>▾</span>
            </button>

            {mostrarArchivados && (
              <div className="pp-archivados-lista">
                {archivados.map((p) => (
                  <div key={p.id} className="pp-archivado-fila">
                    <span className="pp-archivado-alumno">{p.alumno}</span>
                    <span className="pp-archivado-detalle">{p.curso} · ${p.total.toLocaleString('es-AR')} · {p.horario} hs</span>
                    <button
                      className="pp-archivado-borrar"
                      onClick={() => borrarArchivado(p.id)}
                      title="Eliminar del historial"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

      </main>

      {/* Toast Flotante con Soporte para "Deshacer" la Operación */}
      {toast && (
        <div className="pp-toast">
          <span>
            ✓ <strong>{toast.alumno}</strong> → <strong>{LABEL[toast.estadoNuevo]}</strong>
            {toast.seArchivo && ' (archivado)'}
          </span>
          <button className="pp-toast-btn" onClick={deshacer}>Deshacer</button>
        </div>
      )}

    </div>
  )
}

export default PedidosAlumnos