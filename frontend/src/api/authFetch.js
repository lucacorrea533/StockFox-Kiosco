// Esta función `authFetch` es una envoltura personalizada alrededor de la función `fetch` nativa de 
// JavaScript. Su propósito principal es simplificar el proceso de realizar solicitudes HTTP a un 
// servidor que requiere autenticación mediante un token de acceso (access token) almacenado en el 
// almacenamiento local del navegador (localStorage).

// En nuestro caso, el token de acceso se obtiene del almacenamiento local utilizando 
// `localStorage.getItem('access')`.


// La función `authFetch` toma dos parámetros: `url` y `options`. El parámetro `url` es la URL a la que 
// se realizará la solicitud HTTP, mientras que `options` es un objeto opcional que puede contener 
// configuraciones adicionales para la solicitud, como el método HTTP (GET, POST, etc.), encabezados 
// personalizados, cuerpo de la solicitud, etc.
export async function authFetch(url, options = {}) {
  const token = localStorage.getItem('access')
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "Authorization": token ? `Bearer ${token}` : ""
    }
  })
}

// Basicamente, este aarchivo ayuda a centralizar y estandarizar la forma en que se realizan las 
// solicitudes HTTP autenticadas en la aplicación, evitando la necesidad de repetir el mismo código 
// de autenticación en múltiples

// Se usa en varios componentes de la aplicación para realizar solicitudes HTTP autenticadas.
// por ejemplo, se puede utilizar en componentes que necesitan obtener datos del servidor, enviar
// formularios, actualizar información, etc., siempre que se requiera autenticación mediante un token 
// de acceso. Como en la pagina de inicio, donde se obtiene la lista de productos, o en la pagina de 
// perfil, donde se obtiene la información del usuario autenticado.