// Este archivo configura un cliente de Axios para realizar solicitudes HTTP a la API del backend.
// Axios es una biblioteca popular para realizar solicitudes HTTP en JavaScript, y proporciona una 
// interfaz más sencilla y poderosa que la función nativa `fetch`.

// Se crea una instancia de Axios con la URL base de la API del backend, que en este caso es
// "http://

// Importa la biblioteca Axios para realizar solicitudes HTTP
import axios from "axios"

// Se crea una instancia de Axios con la URL base de la API del backend, que en este caso es
// "http://
//http://127.0.0.1:8000/api/". Esto significa que todas las solicitudes realizadas a través de esta 
// instancia de Axios se enviarán a esa URL base, y solo se necesitará especificar el endpoint relativo 
// en cada solicitud.
const api = axios.create({ baseURL: "http://127.0.0.1:8000/api/" }) 

// Se agrega un interceptor de solicitudes a la instancia de Axios. Un interceptor es una función que se
// ejecuta antes de que se envíe una solicitud HTTP. En este caso, el interceptor agrega un encabezado 
// de autorización (Authorization) a cada solicitud si hay un token de acceso (access token) almacenado 
// en el almacenamiento local del navegador (localStorage).
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api

// Este archivo ayuda a centralizar y estandarizar la forma en que se realizan las solicitudes HTTP a la
// API del backend en la aplicación, evitando la necesidad de repetir el mismo código de configuración 
// en múltiples lugares. Se puede usar en varios componentes de la aplicación para realizar solicitudes 
// HTTP a la API del backend, como obtener datos, enviar formularios, actualizar información, etc.

// Se puede utilizar en componentes que necesitan interactuar con la API del backend, como en la
// página de inicio, donde se obtiene la lista de productos, o en la página de perfil, donde se obtiene 
// la información del usuario autenticado.