// Este archivo es el punto de entrada de la aplicación React. Se encarga de montar el componente raíz 
// (App) dentro del contenedor HTML (div#root) definido en index.html. También importa los estilos 
// globales del proyecto.
// React es resumidamente una biblioteca de JavaScript para construir interfaces de usuario. 
// Vite es un bundler que permite desarrollar aplicaciones web modernas con recarga rápida y soporte 
// para módulos ES.
// Un bundler es una herramienta que toma todos los archivos de un proyecto (JavaScript, CSS, 
// imágenes, etc.) y los combina en un solo archivo o en varios archivos optimizados para que el navegador
//  pueda cargarlos más rápido. Vite es un bundler moderno que permite desarrollar aplicaciones web con 
// recarga rápida y soporte para módulos ES.

//Importa React y ReactDOM para renderizar la aplicación en el navegador
import { StrictMode } from 'react' // StrictMode es un componente de React que ayuda a detectar problemas potenciales en la aplicación durante el desarrollo. No afecta el comportamiento de la app en producción.
import { createRoot } from 'react-dom/client' // createRoot es una función de ReactDOM que crea un "root" (raíz) para la aplicación
import App from './App.jsx' // Importa el componente raíz de la aplicación, que contiene todas las rutas y vistas de la app
import './styles/global.css' // Estilos globales del proyecto: paleta de colores, tipografía Lexend y variables CSS compartidas

// Punto de entrada de la aplicación: monta el componente App dentro del div#root de index.html
createRoot(document.getElementById('root')).render(
  <StrictMode> {/* Modo estricto de React: ayuda a detectar errores comunes durante el desarrollo */}
    <App />
  </StrictMode>,
)

// Aclaración. react-dom es una biblioteca que permite renderizar componentes de React en el DOM del navegador. createRoot es una función que crea un "root" (raíz) para la aplicación, y render es un método que renderiza el componente App dentro del contenedor HTML (div#root) definido en index.html.