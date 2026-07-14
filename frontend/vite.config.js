// Configuración de Vite: activa el plugin de React para que el proyecto compile y tenga recarga en 
// caliente (HMR)
import { defineConfig } from 'vite' // Importa la función defineConfig de Vite para definir la 
// configuración del proyecto
import react from '@vitejs/plugin-react' // Importa el plugin de React para Vite, que permite compilar y 
// recargar la app de React en caliente (HMR)

//El plugin significa que Vite puede procesar archivos JSX y TSX, y también habilita la recarga en 
// caliente (HMR) para una mejor experiencia de desarrollo.
// La recarga en caliente permite que los cambios en el código se reflejen inmediatamente en la app 
// sin necesidad de recargar la página completa, lo que mejora la productividad del desarrollador.

// https://vite.dev/config/
// Ese enlace es la documentación oficial de Vite, donde se puede encontrar información detallada sobre la
// configuración y las opciones disponibles para personalizar el comportamiento del proyecto.
export default defineConfig({
  plugins: [react()],
})