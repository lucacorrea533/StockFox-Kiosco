# El archivo auth.py s eenecarga de la seguridad del sistema. Protege la API.
# Verifica la identidad del usuario mediante un token JWT y controla qué acciones puede realizar según su rol

# Importación de herramientas necesarias para el funcionamiento del archivo.
import jwt # Permite leer y verificar los tokens JWT 
# El token es la "credencial digital" que muestra que un usuario ya inició sesión
from functools import wraps # Utilizado al crear decoradores, tiene la función de conservar la información original de la función que estmaos protegiendo.
from rest_framework.response import Response # Nos permite devolver respuestas en formato JSON 
from rest_framework import status # Contiene los códigos HTTP (200, 401, 403, 404)

from django.conf import settings # Permite acceder a la configuración del proyecto. 
# Aquí se utiliza para obtener la SECRET_KEY, necesaria para comprobar que un token sea auténtico 

def verificar_token(request): # Función encargada de comprobar si el usuario envió un token válido
    
    auth = request.headers.get("Authorization") # Obtiene el contenido del header Authorization que envía el frontend

    if not auth: # Si no existe el header, no hay token. No está autenticado
        return None

    if not auth.startswith("Bearer "):# Verifica que el token tenga el formato Bearer (que comience con la palabra Bearer)
        # Bearer: Formato estándar para enviar un token JWT 
        return None

    token = auth.split(" ")[1] # Elimina la palabra Bearer y conserva únicamente el token

    try:
        # Decodifica el token utilizando la SECRET_KEY
        # Se comprueba que el token no fue modificado, que realmente haya sido generado por el sistema y si sigue siendo válido
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=["HS256"]
        )

        return payload # Si todo está correcto. Devuelve la información almacenada en el token (id_usuario, tipo y rol)
    # Manejo de errores:
    except jwt.ExpiredSignatureError:
        return None # Si el token expiró devuelve None
    except jwt.InvalidTokenError:
        return None # Si el token es inválido devuelve
    


def login_requerido(view): # Decorador que protege una vista para que solo puedan acceder usuarios con token válido

    @wraps(view) # Conserva el nombre y propiedades de la función original
    
    def wrapper(request, *args, **kwargs):

        payload = verificar_token(request)# Llama a la función anterior y verifica que el usuario tenga un token válido

        if payload is None:

            return Response(
                {"error": "Token inválido o inexistente."},
                status=status.HTTP_401_UNAUTHORIZED
            ) # Si no existe un token vpalido devuelve un error 401 Unauthorized

        request.usuario = payload # Guarda la información del usuario dentro de la solicitud para usarla en la vista

        return view(request, *args, **kwargs) # Ejecuta la vista original

    return wrapper

def solo_encargada(view): # Decorador que verifica que el usuario sea la Encargada 

    @wraps(view)
    def wrapper(request, *args, **kwargs):

        usuario = request.usuario # Obtiene los datos del usuario autenticado
         # Verifica que sea un usuario del personal
        if usuario["tipo"] != "usuario": # Verifica el tipo, comprueba que quien acceda sea un miembro del personal
            return Response(
                {"error": "No autorizado."},
                status=status.HTTP_403_FORBIDDEN # De no ser el caso devuelve un 403 Forbidden 
            )
        # Verifica que el rol sea Encargada
        if usuario["rol"] != "Encargada": # Si el usuario es distinto a encargada 
            return Response(
                {"error": "Solo la encargada puede realizar esta acción."},
                status=status.HTTP_403_FORBIDDEN # Devuelve un error 304 Forbidden
            )
        # Si cumple todas las condiciones, permite acceder a la vista
        return view(request, *args, **kwargs)

    return wrapper


def roles_permitidos(*roles): # Decorador que permite indicar uno o varios roles autorizados 
    
    def decorator(view): # Recibe uno o varios roles permitidos

        @wraps(view)
        def wrapper(request, *args, **kwargs):

            usuario = request.usuario # Obtiene el usuario autenticado

            # Verifica que sea un usuario del personal
            if usuario["tipo"] != "usuario":
                return Response(
                    {"error": "No autorizado."},
                    status=status.HTTP_403_FORBIDDEN # Sino devuelve error 403 Forbidden
                )

            # Comprueba que el rol esté entre los permitidos
            if usuario["rol"] not in roles:
                return Response(
                    {"error": "No tiene permisos para realizar esta acción."},
                    status=status.HTTP_403_FORBIDDEN # Sino devuelve error 403 Forbidden
                )
            # Ejecuta la vista si tiene permisos
            return view(request, *args, **kwargs)

        return wrapper

    return decorator


def solo_alumno(view): # Decorador que protege rutas destinadas únicamente a los alumnos

    @wraps(view)
    def wrapper(request, *args, **kwargs):
        # Verifica que el usuario autenticado sea un alumno
        if request.usuario["tipo"] != "alumno":
            return Response(
                {"error": "Solo los alumnos pueden acceder."},
                status=status.HTTP_403_FORBIDDEN # De lo contrario devuelve un 403
            )
        # Permite ejecutar la vista si cumple las condiciones 
        return view(request, *args, **kwargs)

    return wrapper