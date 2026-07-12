/* Este archivo contiene el código de la página PedidosAlumnos, que muestra la lista de pedidos de los alumnos y permite filtrarlos, cambiar su estado y archivarlos. */

import { useState, useRef, useEffect } from 'react'

import axios from 'axios'

import NavbarEncargada from '../components/NavbarEncargada'

import iconBuscador  from '../assets/icons/BuscadorBoton.png'
import iconReloj     from '../assets/icons/Reloj.png'

import '../styles/PedidosAlumnos.css'


const ESTADOS = ['pendiente', 'listo', 'entregado']

const LABEL = {
  pendiente:      'Pendiente',
  listo:          'Listo',
  entregado:      'Entregado',
}

// ── Componente ─────────────────────────────────────────────────────────────
function PedidosAlumnos() {
  const [pedidos, setPedidos] = useState([])
  const [filtroEstado,  setFiltroEstado]  = useState('todos')
  const [filtroCurso,   setFiltroCurso]   = useState('')
  const [busqueda,      setBusqueda]      = useState('')
  const [verArchivados, setVerArchivados] = useState(false)
  const [pedidoActualizando, setPedidoActualizando] = useState(null)

  // Toast + undo
  const [toast,      setToast]      = useState(null) // { alumno, estadoNuevo, id, estadoAnterior }
  const toastRef = useRef(null)

  useEffect(() => {

    axios
        .get("http://127.0.0.1:8000/api/pedidos/")
        .then(response => {

            const pedidosBackend = response.data.map(pedido => ({

                id: pedido.id_pedido,

                alumno: pedido.alumno,

                curso: pedido.curso,

                horario: pedido.horario_retiro,

                total: Number(pedido.total),

                estado: pedido.estado,

                archivado: false,

                productos: pedido.productos

            }))

            setPedidos(pedidosBackend)

            console.log(response.data)

        })

        .catch(error => {

            console.error(error)

        })

}, [])

  const hoy = new Date().toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const cursosUnicos = [...new Set(pedidos.map((p) => p.curso))].sort()

  const conteos = {
    todos:          pedidos.filter((p) => !p.archivado).length,
    pendiente:      pedidos.filter((p) => p.estado === 'pendiente'      && !p.archivado).length,
    listo:          pedidos.filter((p) => p.estado === 'listo'          && !p.archivado).length,
    entregado:      pedidos.filter((p) => p.estado === 'entregado'      && !p.archivado).length,
  }

  const filtrados = pedidos
    .filter((p) => {
      if (!verArchivados && p.archivado) return false
      if (filtroEstado !== 'todos' && p.estado !== filtroEstado) return false
      if (filtroCurso && p.curso !== filtroCurso) return false
      if (busqueda && !p.alumno.toLowerCase().includes(busqueda.toLowerCase())) return false
      return true
    })
    .sort((a, b) => a.horario.localeCompare(b.horario))

  // Cambio de estado directo desde el select (HU-12)
  async function cambiarEstado(id, nuevoEstado) {

  const pedido = pedidos.find((p) => p.id === id)

  if (!pedido || pedido.estado === nuevoEstado) return

  setPedidoActualizando(id)

  const estadoAnterior = pedido.estado

  try {

    await axios.put(

      `http://127.0.0.1:8000/api/pedidos/estado/${id}/`,

      {
        estado: nuevoEstado
      }

    )

    setPedidos(prev =>

      prev.map(p =>

        p.id === id
          ? { ...p, estado: nuevoEstado }
          : p

      )

    )

    if (toastRef.current) {

      clearTimeout(toastRef.current)

    }

    setToast({

      id,

      alumno: pedido.alumno,

      estadoNuevo: nuevoEstado,

      estadoAnterior

    })

    toastRef.current = setTimeout(() => {

      setToast(null)

    }, 5000)

  }

  catch(error) {

    console.error(error)

    alert("No se pudo actualizar el estado del pedido.")

  }
  
  finally {

    setPedidoActualizando(null)

}

}

  async function deshacer() {

    if (!toast) return

    setPedidoActualizando(toast.id)

    try {

        await axios.put(

            `http://127.0.0.1:8000/api/pedidos/estado/${toast.id}/`,

            {
                estado: toast.estadoAnterior
            }

        )

        setPedidos(prev =>

            prev.map(p =>

                p.id === toast.id
                    ? { ...p, estado: toast.estadoAnterior }
                    : p

            )

        )

        clearTimeout(toastRef.current)

        setToast(null)

    }

    catch (error) {

        console.error(error)

        alert("No se pudo deshacer el cambio de estado.")

    }

    finally {

    setPedidoActualizando(null)

}

}

  function archivar(id) {
    setPedidos((prev) => prev.map((p) => p.id === id ? { ...p, archivado: true } : p))
  }

  const cantArchivados = pedidos.filter((p) => p.archivado).length

  return (
    <div style={{ display: 'flex' }}>
      <NavbarEncargada />

      <main className="pedidos-panel">

        {/* Encabezado */}
        <div className="pp-header">
          <h1 className="pp-titulo">Panel de Pedidos de Alumnos</h1>
          <span className="pp-fecha">Hoy — {hoy}</span>
        </div>

        {/* Pills de filtro (HU-11) */}
        <div className="pp-filtros-estado">
          {[
            { key: 'todos',          label: 'Todos'          },
            { key: 'pendiente',      label: 'Pendiente'      },
            { key: 'listo',          label: 'Listo'          },
            { key: 'entregado',      label: 'Entregado'      },
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

        {/* Barra filtros */}
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

        {/* Tabla */}
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
                <span className="pp-alumno">{p.alumno}</span>
                <span className="pp-curso-tag">{p.curso}</span>
                <div className="pp-productos">
                  {p.productos.map((pr, i) => (
                    <span key={i} className="pp-prod">• {pr.nombre} x{pr.cantidad}</span>
                  ))}
                </div>
                <span className="pp-horario">
                  <img src={iconReloj} alt="Hora" className="pp-reloj-icon" />
                  {p.horario} hs
                </span>
                <span className="pp-total">${p.total.toLocaleString('es-AR')}</span>

                {/* Badge de estado — CSS puro, sin PNG */}
                <span className={`pp-badge pp-badge--${p.estado}`}>
                  {LABEL[p.estado]}
                </span>

                {/* Acción: select directo de estado + archivar */}
                <div className="pp-accion">
                  {!p.archivado && (
                    <select
                        className={`pp-estado-select pp-estado-select--${p.estado}`}
                        value={pedidoActualizando === p.id ? "" : p.estado}
                        disabled={pedidoActualizando === p.id}
                        onChange={(e) => cambiarEstado(p.id, e.target.value)}
                    >

                        {pedidoActualizando === p.id && (
                            <option value="">
                                Cambiando...
                            </option>
                        )}

                        {!pedidoActualizando &&
                            ESTADOS.map(est => (
                                <option
                                    key={est}
                                    value={est}
                                >
                                    {LABEL[est]}
                                </option>
                            ))
                        }

                    </select>
                  )}
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

        {cantArchivados > 0 && (
          <button className="pp-btn-ver-archivados" onClick={() => setVerArchivados((v) => !v)}>
            {verArchivados ? 'Ocultar archivados' : `Ver archivados (${cantArchivados})`}
          </button>
        )}

      </main>

      {/* Toast con undo */}
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