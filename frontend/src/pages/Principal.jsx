/* Este archivo es la página principal, donde se muestra una foto de la escuela, el logo del kiosco y botones para iniciar sesión o registrarse. Es la primera impresión que los usuarios tendrán al ingresar al sitio, por lo que se busca transmitir una imagen amigable y profesional. Además, se incluye un enlace para que los alumnos puedan crear su cuenta directamente desde esta página. */

/* Importes de React y React Router, así como imágenes y estilos necesarios para la página principal */
import { Link } from 'react-router-dom'
import logoKiosco from '../assets/logos/RecoKiosco.png'
import logoEscuela from '../assets/logos/E.T.29.png'
import fondoEscuela from '../assets/images/fondos/Escuela-Fondo.png'
import '../styles/Principal.css'

// Página Principal del sitio, con foto de la escuela, logo del kiosco, y botones para iniciar sesión o registrarse.
function Principal() {
  return (
    <div className="principal-wrapper"> {/* Contenedor principal de la página, dividido en dos mitades: superior con la foto y botones, e inferior con el nombre y logo de la escuela */ }

      {/* Mitad Superior — Foto de la escuela con el logo, la frase y los botones de acceso */}
      <div
        className="principal-hero"
        style={{ backgroundImage: `url(${fondoEscuela})` }}
      >
        <img src={logoKiosco} alt="RecoKiosco" className="principal-logo-kiosco" />
        <p className="principal-frase">Tu kiosco escolar, en un solo lugar.</p>

        <div className="principal-botones">
          <Link to="/login" className="btn-primario">Iniciar Sesión</Link>
          <Link to="/registro" className="btn-secundario">Registrarse</Link>
        </div>

        <p className="principal-aclaracion">
          ¿Sos alumno? <Link to="/registro">Creá tu cuenta acá</Link>
        </p>
      </div>

      {/* Mitad Inferior — Zona naranja con el nombre y logo de la escuela */}
      <div className="principal-footer">
        <div className="principal-footer-texto">
          <p className="principal-footer-nombre">E.T. 29 D.E. 06</p>
          <p className="principal-footer-sub">Reconquista de Buenos Aires</p>
          <br />
          <p className="principal-footer-sub">Escuela Técnica — Buenos Aires</p>
        </div>
        <img src={logoEscuela} alt="Logo E.T. 29" className="principal-logo-escuela" />
      </div>

    </div>
  )
}

export default Principal