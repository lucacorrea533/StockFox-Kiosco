// React Router - Sirve para manejar el enrutamiento entre las diferentes vistas
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Vistas Generales
import Principal from './pages/Principal'
import Login from './pages/Login'
import Registro from './pages/Registro'

// Vistas Alumno
import Catalogo from './pages/Catalogo'
import PedidoAnticipado from './pages/PedidoAnticipado'
import MisPedidos from './pages/MisPedidos'

// Vistas Encargada
import PanelAdministracion from './pages/PanelAdministracion'
import GestionProductos from './pages/GestionProductos'
import VentasPresenciales from './pages/VentasPresenciales'
import InformeVentas from './pages/InformeVentas'
import GestionProveedores from './pages/GestionProveedores'
import PedidosAlumnos from './pages/PedidosAlumnos'
import GestionUsuarios from './pages/GestionUsuarios'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Vistas Generales */}
        <Route path="/" element={<Principal />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        {/* Vistas Alumno */}
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/pedido-anticipado" element={<PedidoAnticipado />} />
        <Route path="/mis-pedidos" element={<MisPedidos />} />

        {/* Vistas Encargada */}
        <Route path="/admin" element={<PanelAdministracion />} />
        <Route path="/admin/productos" element={<GestionProductos />} />
        <Route path="/admin/ventas" element={<VentasPresenciales />} />
        <Route path="/admin/informes" element={<InformeVentas />} />
        <Route path="/admin/proveedores" element={<GestionProveedores />} />
        <Route path="/admin/pedidos" element={<PedidosAlumnos />} />
        <Route path="/admin/usuarios" element={<GestionUsuarios />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App