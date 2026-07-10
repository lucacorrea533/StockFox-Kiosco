// Este archivo define la estructura de rutas de la aplicación y qué componente se renderiza en cada ruta. Es el punto de entrada para la navegación entre vistas.
// import realiza la importación de módulos y componentes necesarios para la aplicación. En este caso, se importan los componentes de React Router y las vistas de la aplicación.

// React Router - Sirve para manejar el enrutamiento entre las diferentes vistas
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Vistas Generales
import Principal from './pages/Principal'
import Login from './pages/Login'
import Registro from './pages/Registro'

// Vistas Alumno
import Catalogo from './pages/Catalogo'
import MisPedidos from './pages/MisPedidos'

// Vistas Encargada
import PanelAdministracion from './pages/PanelAdministracion'
import GestionProductos from './pages/GestionProductos'
import VentasPresenciales from './pages/VentasPresenciales'
import InformeVentas from './pages/InformeVentas'
import GestionProveedores from './pages/GestionProveedores'
import PedidosAlumnos from './pages/PedidosAlumnos'
import GestionUsuarios from './pages/GestionUsuarios'

// Componente raíz: define todas las rutas (URLs) de la aplicación y qué vista se muestra en cada una
// Cada <Route> define una ruta específica y el componente que se renderiza cuando el usuario navega a esa ruta.
// Esta función es el punto de entrada de la aplicación y se encarga de manejar la navegación entre las diferentes vistas sin recargar la página.
function App() {
  return (
    // Envuelve toda la app para habilitar la navegación por URL sin recargar la página
    <BrowserRouter>
      <Routes>

        {/* Vistas Generales - accesibles para cualquier visitante, sin login */}
        <Route path="/" element={<Principal />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        {/* Vistas Alumno - catálogo para pedir productos y seguimiento de sus pedidos */}
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/mis-pedidos" element={<MisPedidos />} />

        {/* Vistas Encargada - panel administrativo con gestión de stock, ventas, proveedores, pedidos y usuarios */}
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